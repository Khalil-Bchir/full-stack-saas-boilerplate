import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@saas-boilerplate/ui'],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
