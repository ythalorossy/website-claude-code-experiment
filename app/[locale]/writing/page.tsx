import { Metadata } from 'next';
import { getDevToArticles } from '@/lib/devto';
import { WritingClient } from '@/components/devto/WritingClient';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'My articles and technical writing on Dev.to',
};

export const revalidate = 3600;

export default async function WritingPage() {
  const articles = await getDevToArticles(30);
  return <WritingClient articles={articles} />;
}
