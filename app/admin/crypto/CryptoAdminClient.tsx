'use client';

import { useState } from 'react';
import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { CoinPriceCard } from '@/components/crypto/CoinPriceCard';
import { CryptoChart } from '@/components/crypto/CryptoChart';
import { Button } from '@/components/ui/Button';
import { CRYPTO_COINS } from '@/lib/crypto';

export function CryptoAdminClient() {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(['BTC', 'ETH', 'SOL', 'DOGE']);
  const { prices, isConnected, isReconnecting, error, reconnect } = useCryptoWebSocket();
  const { history, isLoading, refresh } = useCryptoHistory();

  const toggleCoin = (symbol: string) => {
    setSelectedCoins((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const selectedCoinsConfig = CRYPTO_COINS.filter(({ symbol }) => selectedCoins.includes(symbol));

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Crypto Monitor</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Admin dashboard</p>
        </header>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-emerald-500' : isReconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>

          <Button onClick={reconnect} size="sm" variant="outline">
            Reconnect
          </Button>

          <Button onClick={refresh} size="sm" variant="outline">
            Refresh History
          </Button>

          <div className="ml-auto flex gap-2">
            {CRYPTO_COINS.map(({ symbol }) => (
              <label key={symbol} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCoins.includes(symbol)}
                  onChange={() => toggleCoin(symbol)}
                  className="rounded"
                />
                {symbol}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error.message}
          </div>
        )}

        {/* Price Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectedCoinsConfig.map(({ symbol, name, color }) => (
            <CoinPriceCard
              key={symbol}
              symbol={symbol}
              name={name}
              price={prices[symbol]?.price || 0}
              color={color}
            />
          ))}
        </div>

        {/* Chart */}
        {!isLoading && (
          <CryptoChart
            history={history}
            liveData={prices}
            coins={selectedCoinsConfig.map(({ symbol, color }) => ({ symbol, color }))}
          />
        )}
      </div>
    </div>
  );
}
