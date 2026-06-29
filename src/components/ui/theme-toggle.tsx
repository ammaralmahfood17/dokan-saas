'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'dark' | 'light';

const STORAGE_KEY = 'dokan-theme';

/**
 * Theme toggle — persists to localStorage under `dokan-theme`.
 * Default follows the OS/browser prefers-color-scheme setting.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Respect stored preference, then fall back to system preference
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial: Theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : systemDark ? 'dark' : 'light';

    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  // Prevent hydration flash — invisible placeholder until mounted
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="تبديل الثيم"
        className="w-9 h-9 rounded-full border border-sidebar-border bg-sidebar-accent"
        tabIndex={-1}
        style={{ visibility: 'hidden' }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'تفعيل الثيم الفاتح' : 'تفعيل الثيم الداكن'}
      className={cn(
        'w-9 h-9 rounded-full border transition-all duration-200',
        'flex items-center justify-center',
        'active:scale-95 select-none touch-manipulation',
        theme === 'dark'
          ? 'border-sidebar-border bg-sidebar-accent text-warning hover:bg-sidebar-accent/80'
          : 'border-border bg-secondary text-warning hover:bg-muted',
      )}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
