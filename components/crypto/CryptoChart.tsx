'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PricePoint {
  time: number;
  price: number;
}

interface CoinConfig {
  symbol: string;
  color: string;
}

interface CryptoChartProps {
  history: Record<string, PricePoint[]>;
  liveData: Record<string, { priceHistory: PricePoint[] } | undefined>;
  coins: CoinConfig[];
}

export function CryptoChart({ history, liveData, coins }: CryptoChartProps) {
  const chartData = useMemo(() => {
    // Merge history with live data
    const allPoints: Record<number, Record<string, number>> = {};

    // Add history points
    coins.forEach(({ symbol }) => {
      const historyPoints = history[symbol] || [];
      const livePoints = liveData[symbol]?.priceHistory || [];

      [...historyPoints, ...livePoints].forEach(({ time, price }) => {
        const roundedTime = Math.floor(time / 1000 / 60) * 60; // Round to minute
        if (!allPoints[roundedTime]) allPoints[roundedTime] = {};
        allPoints[roundedTime][symbol] = price;
      });
    });

    return Object.entries(allPoints)
      .map(([time, prices]) => ({
        time: parseInt(time) * 1000,
        ...prices,
      }))
      .sort((a, b) => a.time - b.time)
      .slice(-50); // Last 50 data points for performance
  }, [history, liveData, coins]);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${(price / 1000).toFixed(1)}k`;
    if (price >= 1) return `$${price.toFixed(0)}`;
    return `$${price.toFixed(4)}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        Loading chart data...
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900 p-4">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="time"
            tickFormatter={formatTime}
            stroke="#666"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatPrice}
            stroke="#666"
            fontSize={10}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            labelFormatter={formatTime}
            formatter={(value: number) => [formatPrice(value), '']}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => <span style={{ color: '#e0e0e0' }}>{value}</span>}
          />
          {coins.map(({ symbol, color }) => (
            <Line
              key={symbol}
              type="monotone"
              dataKey={symbol}
              stroke={color}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}