import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.thepetnest.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dm6g3jbka53hp.cloudfront.net',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
