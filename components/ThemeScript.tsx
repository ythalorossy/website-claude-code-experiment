'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
    // Set cookie for server-side reading (30 day expiry)
    document.cookie = `theme=${theme};path=/;max-age=${60 * 60 * 24 * 30}`;
  }, []);

  return null;
}
