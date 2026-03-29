import { Metadata } from 'next';
import { CryptoClient } from './CryptoClient';

export const metadata: Metadata = {
  title: 'Crypto Prices',
  description: 'Live cryptocurrency prices and charts',
};

export default function CryptoPage() {
  return <CryptoClient />;
}
