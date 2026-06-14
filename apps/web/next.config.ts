import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mafia-night/shared'],
  turbopack: {},
};

export default nextConfig;
