'use client';

import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { CoinPriceCard } from '@/components/crypto/CoinPriceCard';
import { CryptoChart } from '@/components/crypto/CryptoChart';
import { CoinData } from '@/lib/crypto';

interface CryptoClientProps {
  coins: CoinData[];
}

export function CryptoClient({ coins }: CryptoClientProps) {
  const coinIds = coins.map((c) => c.id);
  const { prices, isConnected, error: pricesError } = useCryptoWebSocket(coinIds, coins);
  const { history, isLoading, error: historyError } = useCryptoHistory(coins);

  const error = pricesError || historyError;

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Live Crypto Prices</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time cryptocurrency prices powered by WebSocket
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error.message || 'Connection error'}
          </div>
        )}

        {/* Price Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coins.map(({ symbol, name, color }) => (
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
            coins={coins.map(({ symbol, color }) => ({ symbol, color }))}
          />
        )}
      </div>
    </div>
  );
}
