import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@saas-boilerplate/ui'],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
