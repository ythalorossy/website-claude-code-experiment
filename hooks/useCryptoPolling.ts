'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CoinData } from '@/lib/crypto';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h?: number;
  priceHistory: { time: number; price: number }[];
}

export interface UseCryptoPollingReturn {
  prices: Record<string, CryptoPrice>;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnect: () => void;
}

const MAX_HISTORY_POINTS = 100;
const POLL_INTERVAL = 30000; // 30 seconds

export function useCryptoPolling(
  coinIds: string[],
  coins: CoinData[]
): UseCryptoPollingReturn {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>(() => {
    const initial: Record<string, CryptoPrice> = {};
    coins.forEach(({ symbol, name }) => {
      initial[symbol] = { symbol, name, price: 0, priceHistory: [] };
    });
    return initial;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const coinsRef = useRef(coins);
  const lastPriceRef = useRef<Record<string, number>>({});

  // Use ref for coinIds to avoid triggering re-fetch on change
  const coinIdsRef = useRef(coinIds);
  coinIdsRef.current = coinIds;

  const fetchPrices = useCallback(async () => {
    const ids = coinIdsRef.current;
    if (ids.length === 0) return;

    try {
      const response = await fetch(`/api/crypto/prices?ids=${ids.join(',')}`);

      if (!response.ok) {
        throw new Error(`Prices API error: ${response.status}`);
      }

      const data = await response.json();
      const now = Date.now();

      setPrices((prev) => {
        const next = { ...prev };

        ids.forEach((id) => {
          const coin = coinsRef.current.find((c) => c.id === id);
          if (!coin) return;

          const coinData = data[id];
          if (!coinData) return;

          const newPrice = coinData.usd ?? 0;

          // Only add to history if price actually changed
          const lastPrice = lastPriceRef.current[coin.symbol];
          if (lastPrice !== newPrice) {
            lastPriceRef.current[coin.symbol] = newPrice;
            const current = next[coin.symbol];
            next[coin.symbol] = {
              ...current,
              price: newPrice,
              priceHistory: [
                ...current.priceHistory.slice(-(MAX_HISTORY_POINTS - 1)),
                { time: now, price: newPrice },
              ],
            };
          }
        });

        return next;
      });

      setIsConnected(true);
      setIsReconnecting(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prices'));
      setIsConnected(false);
      setIsReconnecting(true);
    }
  }, []);

  const reconnect = useCallback(() => {
    fetchPrices();
  }, [fetchPrices]);

  useEffect(() => {
    // Initial fetch
    fetchPrices();

    // Set up interval
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - fetchPrices and interval are stable

  return { prices, isConnected, isReconnecting, error, reconnect };
}