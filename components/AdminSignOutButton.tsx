'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';

export function AdminSignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Link
      href="#"
      onClick={handleSignOut}
      className="block rounded px-4 py-2 text-center bg-gray-800 hover:bg-gray-700"
    >
      Sign Out
    </Link>
  );
}
