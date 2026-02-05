'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, Sparkles, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const { user, userData, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && userData) {
      // Check if onboarding is completed
      if (!userData.onboarding_completed) {
        router.push('/onboarding');
      } else {
        router.push('/student');
      }
    }
  }, [user, userData, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast.success('स्वागत है! Welcome!');
    } catch (error: any) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
            <GraduationCap className="w-16 h-16 text-white" />
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Stady
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
            सरकारी नौकरी की तैयारी का
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            सबसे बेहतरीन Platform
          </p>
        </div>

        {/* Service Message */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white">
                हमारी सेवाएं
              </h2>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  सरकारी नौकरी Forms की Live Updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  AI-Powered Study Assistant
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Student Community & Groups
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Smart Notifications & Reminders
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-6 py-4 rounded-xl font-semibold shadow-xl border-2 border-gray-200 dark:border-gray-600 transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <Chrome className="w-6 h-6 text-blue-500" />
          Google से Login करें
        </button>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Login करके आप हमारे Terms & Conditions से सहमत हैं
        </p>
      </div>
    </div>
  );
}