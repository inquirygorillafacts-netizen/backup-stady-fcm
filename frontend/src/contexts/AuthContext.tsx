'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import axios from 'axios';

interface UserData {
  id: string;
  email: string;
  name: string;
  photo: string | null;
  roles: string[];
  onboarding_completed: boolean;
  phone: string | null;
  preferences: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_URL = `${BACKEND_URL}/api`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for dummy user in localStorage
  useEffect(() => {
    const dummyUser = localStorage.getItem('dummyUser');
    if (dummyUser) {
      const parsed = JSON.parse(dummyUser);
      setUser(parsed as any);
      setUserData(parsed.userData);
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    // Dummy authentication - bypass Firebase
    const dummyUser = {
      uid: 'dummy-user-' + Date.now(),
      email: 'student@stady.com',
      displayName: 'Demo Student',
      photoURL: null,
      userData: {
        id: 'dummy-user-' + Date.now(),
        email: 'student@stady.com',
        name: 'Demo Student',
        photo: null,
        roles: ['student'],
        onboarding_completed: false,
        phone: null,
        preferences: {}
      }
    };
    
    localStorage.setItem('dummyUser', JSON.stringify(dummyUser));
    setUser(dummyUser as any);
    setUserData(dummyUser.userData);
  };

  const signOut = async () => {
    localStorage.removeItem('dummyUser');
    setUser(null);
    setUserData(null);
  };

  const refreshUserData = async () => {
    const dummyUser = localStorage.getItem('dummyUser');
    if (dummyUser) {
      const parsed = JSON.parse(dummyUser);
      setUserData(parsed.userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signOut, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}