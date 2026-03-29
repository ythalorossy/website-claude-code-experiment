'use client';

import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { CoinPriceCard } from '@/components/crypto/CoinPriceCard';
import { CryptoChart } from '@/components/crypto/CryptoChart';

const COINS = [
  { symbol: 'BTC', id: 'bitcoin', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'ETH', id: 'ethereum', name: 'Ethereum', color: '#627eea' },
  { symbol: 'SOL', id: 'solana', name: 'Solana', color: '#14f195' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin', color: '#e84142' },
];

export function CryptoClient() {
  const { prices, isConnected } = useCryptoWebSocket();
  const { history, isLoading } = useCryptoHistory();

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

        {/* Price Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COINS.map(({ symbol, name, color }) => (
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
            coins={COINS.map(({ symbol, color }) => ({ symbol, color }))}
          />
        )}
      </div>
    </div>
  );
}
