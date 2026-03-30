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

export interface UseCryptoPricesReturn {
  prices: Record<string, CryptoPrice>;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnect: () => void;
}

const POLL_INTERVAL = 30000; // 30 seconds
const MAX_HISTORY_POINTS = 100;

export function useCryptoPrices(
  coinIds: string[],
  coins: CoinData[]
): UseCryptoPricesReturn {
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
  coinsRef.current = coins;
  const lastPriceRef = useRef<Record<string, number>>({});

  const fetchPrices = useCallback(async () => {
    if (coinIds.length === 0) return;

    try {
      const ids = coinIds.join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const now = Date.now();

      setPrices((prev) => {
        const next = { ...prev };
        const currentCoins = coinsRef.current;

        currentCoins.forEach(({ symbol, id }) => {
          const coinData = data[id];
          if (!coinData) return;

          const newPrice = coinData.usd ?? 0;
          const change24h = coinData.usd_24h_change;

          // Only add to history if price actually changed
          const lastPrice = lastPriceRef.current[symbol];
          if (lastPrice !== newPrice) {
            lastPriceRef.current[symbol] = newPrice;
            const current = next[symbol];
            next[symbol] = {
              ...current,
              price: newPrice,
              change24h: change24h ?? current.change24h,
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
  }, [coinIds]);

  const reconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL);
  }, [fetchPrices]);

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchPrices]);

  return { prices, isConnected, isReconnecting, error, reconnect };
}
