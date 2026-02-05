'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center',
        'w-11 h-11 rounded-full',
        'glass border border-border/50',
        'transition-all duration-300 ease-out',
        'hover:scale-105 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'shadow-sm'
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={cn(
            'absolute inset-0 w-6 h-6',
            'transition-all duration-300',
            theme === 'light'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-90 scale-0 opacity-0'
          )}
          style={{ color: 'rgb(255, 204, 0)' }}
        />
        <Moon
          className={cn(
            'absolute inset-0 w-6 h-6',
            'transition-all duration-300',
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : '-rotate-90 scale-0 opacity-0'
          )}
          style={{ color: 'rgb(0, 122, 255)' }}
        />
      </div>
    </button>
  );
}
