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
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's.yimg.com', // Added for Yahoo images via NewsAPI
        port: '',
        pathname: '/**',
      },
      { // It's good practice to add common news image CDNs if you expect variety
        protocol: 'https',
        hostname: 'media.zenfs.com', // Specific subdomain from the error
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
