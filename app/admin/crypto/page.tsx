import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getActiveCoins } from '@/lib/crypto';
import { CryptoAdminClient } from './CryptoAdminClient';

export const metadata: Metadata = {
  title: 'Crypto Monitor (Admin)',
};

export default async function AdminCryptoPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const coins = await getActiveCoins();
  return <CryptoAdminClient coins={coins} />;
}
