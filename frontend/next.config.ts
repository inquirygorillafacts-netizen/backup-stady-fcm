import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // PWA configuration (can be re-enabled after proper setup)
  // For production, use next-pwa with proper types
};

export default nextConfig;
