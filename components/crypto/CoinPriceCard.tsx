'use client';

import { useEffect, useRef } from 'react';

interface CoinPriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h?: number;
  color: string;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
}

export function CoinPriceCard({ symbol, name, price, change24h, color }: CoinPriceCardProps) {
  const prevPriceRef = useRef(price);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevPriceRef.current !== price && cardRef.current) {
      const isUp = price > prevPriceRef.current;
      cardRef.current.style.boxShadow = isUp
        ? '0 0 12px rgba(34, 197, 94, 0.5)'
        : '0 0 12px rgba(239, 68, 68, 0.5)';
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.boxShadow = '';
      }, 500);
    }
    prevPriceRef.current = price;
  }, [price]);

  const isPositive = change24h !== undefined ? change24h >= 0 : true;
  const changeColor = isPositive ? 'text-emerald-500' : 'text-red-500';
  const changePrefix = isPositive ? '+' : '';

  return (
    <div
      ref={cardRef}
      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-slate-900"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <div className="text-sm text-gray-500 dark:text-gray-400">{symbol}</div>
      <div className="mt-1 text-xl font-bold" style={{ color }}>
        {price > 0 ? formatPrice(price) : '—'}
      </div>
      {change24h !== undefined && (
        <div className={`mt-1 text-sm ${changeColor}`}>
          {changePrefix}{change24h.toFixed(2)}%
        </div>
      )}
    </div>
  );
}
