'use client';

import { useState, useEffect, startTransition } from 'react';
import { useSession } from 'next-auth/react';

interface ClapButtonProps {
  postId: string;
  initialClapCount: number;
  initialHasClapped: boolean;
}

export function ClapButton({ postId, initialClapCount, initialHasClapped }: ClapButtonProps) {
  const { data: session, status } = useSession();
  const [clapCount, setClapCount] = useState(initialClapCount);
  const [hasClapped, setHasClapped] = useState(initialHasClapped);
  const [isLoading, setIsLoading] = useState(false);

  const isLoggedIn = status === 'authenticated';
  const isLoadingSession = status === 'loading';

  async function handleClap() {
    if (!isLoggedIn || isLoading) return;

    setIsLoading(true);

    // Optimistic update
    startTransition(() => {
      setHasClapped(!hasClapped);
      setClapCount(hasClapped ? clapCount - 1 : clapCount + 1);
    });

    try {
      const response = await fetch('/api/claps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (!response.ok) {
        // Revert on error
        startTransition(() => {
          setHasClapped(hasClapped);
          setClapCount(clapCount);
        });
      }
    } catch {
      // Revert on error
      startTransition(() => {
        setHasClapped(hasClapped);
        setClapCount(clapCount);
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingSession) {
    return (
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-2xl">👏</span>
        <span>{initialClapCount}</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClap}
      disabled={!isLoggedIn || isLoading}
      className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-200 ${
        !isLoggedIn
          ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800'
          : hasClapped
          ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-lg shadow-brand-500/25'
          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
      title={!isLoggedIn ? 'Sign in to clap' : hasClapped ? 'You clapped!' : 'Clap for this post'}
    >
      <span className={`text-2xl transition-transform ${hasClapped ? 'scale-125' : ''}`}>
        👏
      </span>
      <span className="font-medium">{clapCount}</span>
      {!isLoggedIn && <span className="text-xs">(sign in to clap)</span>}
    </button>
  );
}
