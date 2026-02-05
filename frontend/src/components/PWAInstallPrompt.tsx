'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const installed = localStorage.getItem('pwaInstalled') === 'true';
    if (installed) {
      setIsInstalled(true);
      return;
    }

    // Check last shown time (1 hour gap)
    const lastShown = localStorage.getItem('pwaPromptLastShown');
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    if (lastShown && parseInt(lastShown) > oneHourAgo) {
      return; // Don't show if shown less than 1 hour ago
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
        localStorage.setItem('pwaPromptLastShown', Date.now().toString());
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      localStorage.setItem('pwaInstalled', 'true');
      setShowPrompt(false);
      toast.success('App installed successfully! 🎉');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.error('Installation not available');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      localStorage.setItem('pwaInstalled', 'true');
      toast.success('Installing app... 🎉');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwaPromptLastShown', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform animate-scale-in">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <Smartphone className="w-16 h-16 mb-4 drop-shadow-lg" />
          <h2 className="text-2xl font-bold mb-2">Install Stady App</h2>
          <p className="text-blue-100">Get the best experience with our app</p>
        </div>

        {/* Benefits */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Instant Access</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">तुरंत खोलें बिना browser के</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">नए forms की instant updates</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Offline Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">बिना internet के भी काम करे</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Continue on Web
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Install Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}