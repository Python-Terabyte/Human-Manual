import type { NextConfig } from 'next';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load root .env.local so NEXT_PUBLIC_* vars are available in the monorepo
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow Firebase OAuth popups to communicate back to the opener
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.humanmanual.app' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'i.giphy.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
