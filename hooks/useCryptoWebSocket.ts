'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  priceHistory: { time: number; price: number }[];
}

export interface UseCryptoWebSocketReturn {
  prices: Record<string, CryptoPrice>;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnect: () => void;
}

const COINS = [
  { symbol: 'BTC', id: 'bitcoin', name: 'Bitcoin' },
  { symbol: 'ETH', id: 'ethereum', name: 'Ethereum' },
  { symbol: 'SOL', id: 'solana', name: 'Solana' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin' },
];

const WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,dogecoin';
const MAX_HISTORY_POINTS = 100;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useCryptoWebSocket(): UseCryptoWebSocketReturn {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>(() => {
    const initial: Record<string, CryptoPrice> = {};
    COINS.forEach(({ symbol, name }) => {
      initial[symbol] = { symbol, name, price: 0, change24h: 0, priceHistory: [] };
    });
    return initial;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isManualCloseRef = useRef(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      isManualCloseRef.current = false;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        // Debounce: only update state max once per second
        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) return;
        lastUpdateRef.current = now;

        const data = JSON.parse(event.data);

        setPrices((prev) => {
          const next = { ...prev };
          COINS.forEach(({ symbol, id }) => {
            const newPrice = parseFloat(data[id]);
            if (!isNaN(newPrice)) {
              const current = next[symbol];
              next[symbol] = {
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
      };

      ws.onerror = () => {
        setError(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        // Skip auto-reconnect if manually closed
        if (isManualCloseRef.current) return;

        // Exponential backoff reconnect
        const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttemptRef.current += 1;
        setIsReconnecting(true);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      isManualCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { prices, isConnected, isReconnecting, error, reconnect };
}