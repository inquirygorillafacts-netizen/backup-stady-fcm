'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    label: 'होम',
  },
  {
    name: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
    label: 'जॉब्स',
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
    label: 'अलर्ट्स',
  },
  {
    name: 'Admin',
    href: '/admin',
    icon: Settings,
    label: 'सेटिंग्स',
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-bottom shadow-premium">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1',
                'transition-all duration-300 ease-out',
                'active:scale-95'
              )}
            >
              <div
                className={cn(
                  'relative flex items-center justify-center w-12 h-12 rounded-2xl',
                  'transition-all duration-300 ease-out',
                  isActive && 'scale-110'
                )}
                style={isActive ? {
                  backgroundColor: 'rgba(0, 122, 255, 0.15)',
                } : {}}
              >
                <Icon 
                  className="w-6 h-6 transition-all duration-300" 
                  style={isActive ? { color: 'rgb(0, 122, 255)' } : {}}
                />
              </div>
              <span 
                className={cn(
                  'text-xs font-medium transition-all duration-300',
                  !isActive && 'text-muted-foreground'
                )}
                style={isActive ? { color: 'rgb(0, 122, 255)' } : {}}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
