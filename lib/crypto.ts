import { prisma } from '@/lib/db';

export const CRYPTO_COINS_FALLBACK = [
  { symbol: 'BTC', id: 'bitcoin',   name: 'Bitcoin',   color: '#f7931a' },
  { symbol: 'ETH', id: 'ethereum',  name: 'Ethereum',  color: '#627eea' },
  { symbol: 'SOL', id: 'solana',    name: 'Solana',    color: '#14f195' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin',  color: '#e84142' },
] as const;

export type CoinData = {
  symbol: string;
  id: string;       // coincapId
  name: string;
  color: string;
  isActive?: boolean;
};

/** Fetch all coins from DB, falling back to hardcoded data on error */
export async function getCoins(): Promise<CoinData[]> {
  try {
    const coins = await prisma.coin.findMany({
      orderBy: { symbol: 'asc' },
    });
    return coins.map((c) => ({
      symbol: c.symbol,
      id: c.coincapId,
      name: c.name,
      color: c.color,
      isActive: c.isActive,
    }));
  } catch (err) {
    console.warn('[crypto] DB unavailable, using fallback coins:', err);
    return [...CRYPTO_COINS_FALLBACK].map((c) => ({ ...c }));
  }
}

/** Fetch only active coins */
export async function getActiveCoins(): Promise<CoinData[]> {
  try {
    const coins = await prisma.coin.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' },
    });
    return coins.map((c) => ({
      symbol: c.symbol,
      id: c.coincapId,
      name: c.name,
      color: c.color,
      isActive: c.isActive,
    }));
  } catch (err) {
    console.warn('[crypto] DB unavailable, using fallback coins:', err);
    return [...CRYPTO_COINS_FALLBACK].map((c) => ({ ...c }));
  }
}
