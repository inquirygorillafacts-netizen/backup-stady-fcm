'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { InstallButton } from '@/components/InstallButton';
import { 
  Home, 
  FileText, 
  MessageCircle, 
  User,
  Bot,
  LogOut,
  Menu,
  X,
  Crown,
  Heart
} from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

const STUDENT_NAV_ITEMS = [
  { icon: Home, label: 'Home', href: '/student' },
  { icon: FileText, label: 'Forms', href: '/student/forms' },
  { icon: Bot, label: 'AI Chat', href: '/student/ai' },
  { icon: MessageCircle, label: 'Groups', href: '/student/groups' },
  { icon: User, label: 'Profile', href: '/student/profile' },
];

export default function StudentLayout({ children }: { children: ReactNode }) {
  const { user, userData, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerExists, setOwnerExists] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    checkOwnerExists();
  }, []);

  const checkOwnerExists = async () => {
    try {
      // Check localStorage for any user with owner role
      const ownerExists = localStorage.getItem('ownerExists');
      setOwnerExists(ownerExists === 'true');
    } catch (error) {
      console.error('Error checking owner:', error);
    }
  };

  const handleClaimOwner = async () => {
    try {
      // Update dummy user to add owner role
      const dummyUser = localStorage.getItem('dummyUser');
      if (dummyUser) {
        const parsed = JSON.parse(dummyUser);
        if (!parsed.userData.roles.includes('owner')) {
          parsed.userData.roles.push('owner');
        }
        localStorage.setItem('dummyUser', JSON.stringify(parsed));
      }
      
      toast.success('Owner role claimed successfully! 👑');
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to claim owner role');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isOwner = userData?.roles?.includes('owner');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Stady</span>
            </div>
          </div>

          {/* Install Button */}
          <div className="px-4 pt-4">
            <InstallButton />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {STUDENT_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Claim Owner Button */}
            {!ownerExists && !isOwner && (
              <button
                onClick={handleClaimOwner}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Crown className="w-5 h-5" />
                Claim Owner Role
              </button>
            )}

            {/* Panel Switch (if owner) */}
            {isOwner && (
              <button
                onClick={() => router.push('/owner')}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <Crown className="w-5 h-5" />
                Switch to Owner
              </button>
            )}

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Stady</span>
          </div>
          <div className="flex items-center gap-2">
            <InstallButton />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <div
            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Navigation */}
              <nav className="flex-1 px-2 py-4 space-y-1 mt-16">
                {STUDENT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {!ownerExists && !isOwner && (
                  <button
                    onClick={handleClaimOwner}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-medium shadow-lg"
                  >
                    <Crown className="w-5 h-5" />
                    Claim Owner Role
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => router.push('/owner')}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    <Crown className="w-5 h-5" />
                    Switch to Owner
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-5 h-16">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}