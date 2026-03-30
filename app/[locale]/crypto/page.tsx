import { Metadata } from 'next';
import { getActiveCoins } from '@/lib/crypto';
import { CryptoClient } from './CryptoClient';

export const metadata: Metadata = {
  title: 'Crypto Prices',
  description: 'Live cryptocurrency prices and charts',
};

export default async function CryptoPage() {
  const coins = await getActiveCoins();
  return <CryptoClient coins={coins} />;
}
