'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppLockScreen } from '@/components/AppLockScreen';

interface AppLockContextType {
  isLocked: boolean;
  setLock: (pin: string) => void;
  removeLock: () => void;
  lockApp: () => void;
  hasPin: boolean;
}

const AppLockContext = createContext<AppLockContextType | undefined>(undefined);

export function AppLockProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    const pin = localStorage.getItem('appLockPin');
    if (pin) {
      setHasPin(true);
      setIsLocked(true);
    }
  }, []);

  const setLock = (pin: string) => {
    localStorage.setItem('appLockPin', pin);
    setHasPin(true);
  };

  const removeLock = () => {
    localStorage.removeItem('appLockPin');
    setHasPin(false);
    setIsLocked(false);
  };

  const lockApp = () => {
    if (hasPin) {
      setIsLocked(true);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  if (isLocked && hasPin) {
    return <AppLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <AppLockContext.Provider value={{ isLocked, setLock, removeLock, lockApp, hasPin }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within AppLockProvider');
  }
  return context;
}