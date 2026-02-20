import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fix workspace root detection warning when multiple lockfiles exist
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
