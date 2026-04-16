import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { GamesClient } from './components/GamesClient';

export const metadata: Metadata = {
  title: 'Games',
  description: 'Play our game projects',
};

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <GamesClient games={games} />;
}
