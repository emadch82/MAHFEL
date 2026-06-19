import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'soha-sima.ir' },
      { protocol: 'https', hostname: 'dl.soha-sima.ir' },
      { protocol: 'https', hostname: '*.soha-sima.ir' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
      { protocol: 'https', hostname: 'aparat.com' },
      { protocol: 'https', hostname: 'i.aparat.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
