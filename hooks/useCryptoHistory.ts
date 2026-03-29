'use client';

import { useState, useEffect, useCallback } from 'react';

export interface PricePoint {
  time: number;
  price: number;
}

export interface UseCryptoHistoryReturn {
  history: Record<string, PricePoint[]>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const COIN_IDS = ['bitcoin', 'ethereum', 'solana', 'dogecoin'];
const COIN_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  dogecoin: 'DOGE',
};

async function fetchHistory(): Promise<Record<string, PricePoint[]>> {
  const results: Record<string, PricePoint[]> = {};

  const settled = await Promise.allSettled(
    COIN_IDS.map(async (id) => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${id} history`);
      const data = await response.json();
      results[COIN_SYMBOLS[id]] = data.prices.map(([time, price]: [number, number]) => ({
        time,
        price,
      }));
    })
  );

  // Check for failures
  const failures = settled.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    const failedCoins = failures
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map(r => r.reason?.message || 'Unknown error');
    console.warn(`Failed to fetch history for some coins: ${failedCoins.join(', ')}`);
  }

  return results;
}

export function useCryptoHistory(): UseCryptoHistoryReturn {
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load history'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, []);

  return { history, isLoading, error, refresh: load };
}
