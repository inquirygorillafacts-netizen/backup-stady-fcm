import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLockProvider } from '@/contexts/AppLockContext';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stady - सरकारी नौकरी Platform',
  description: 'Complete education platform for government job preparation',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Stady',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="light">
          <AppLockProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background">
                {children}
              </div>
              <PWAInstallPrompt />
              <Toaster position="top-center" richColors />
            </AuthProvider>
          </AppLockProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}