import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The Back/ project is API-only — no pages UI
  reactStrictMode: true,
  serverExternalPackages: ['sharp', 'postgres', 'bcryptjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;

