import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoins } from '@/lib/crypto';
import { CoinsAdminClient } from './CoinsAdminClient';

export const metadata: Metadata = {
  title: 'Manage Coins (Admin)',
};

export default async function AdminCoinsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const coins = await getCoins();
  return <CoinsAdminClient initialCoins={coins} />;
}
