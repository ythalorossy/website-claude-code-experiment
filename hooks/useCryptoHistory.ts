import { useState, useEffect, useCallback } from 'react';
import { CoinData } from '@/lib/crypto';

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

async function fetchHistory(coins: CoinData[]): Promise<Record<string, PricePoint[]>> {
  const results: Record<string, PricePoint[]> = {};

  const settled = await Promise.allSettled(
    coins.map(async (coin) => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=1`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${coin.id} history`);
      const data = await response.json();
      results[coin.symbol] = data.prices.map(([time, price]: [number, number]) => ({
        time,
        price,
      }));
    })
  );

  const failures = settled.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    const failedCoins = failures
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => r.reason?.message || 'Unknown error');
    console.warn(`Failed to fetch history for some coins: ${failedCoins.join(', ')}`);
  }

  return results;
}

export function useCryptoHistory(coins: CoinData[]): UseCryptoHistoryReturn {
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (coins.length === 0) {
      setHistory({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(coins);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load history'));
    } finally {
      setIsLoading(false);
    }
  }, [coins]);

  useEffect(() => {
    load();
  }, [load]);

  return { history, isLoading, error, refresh: load };
}
