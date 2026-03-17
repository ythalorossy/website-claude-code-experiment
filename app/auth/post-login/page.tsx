'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function PostLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    if (status === 'loading' || redirected.current) return;

    if (status === 'unauthenticated') {
      redirected.current = true;
      router.replace('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      redirected.current = true;

      // Add a small delay to ensure session is fully established
      setTimeout(() => {
        const role = (session.user as { role?: string })?.role || 'USER';
        const destination = role === 'ADMIN' ? '/admin' : '/';
        globalThis.location.href = destination;
      }, 500);
    }
  }, [status, session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Signing you in...</p>
        {session?.user && (
          <p className="text-sm text-gray-500 mt-2">Welcome, {(session.user as { name?: string }).name || (session.user as { email?: string }).email}!</p>
        )}
      </div>
    </div>
  );
}
