import createNextIntlPlugin from 'next-intl/plugin';

// Explicit path so the plugin loads the correct request config (and locale/messages)
const withNextIntl = createNextIntlPlugin('./src/i18n/request.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
    root: "./", // Explicit path
  },
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com', // Replace with your specific CDN hostname
        port: '',
        pathname: '/**', // Allows all paths under this domain
      },
      {
        protocol: 'https',
        hostname: 'app.gfa-tech.com', // Replace with your specific CDN hostname
        port: '',
        pathname: '/**', // Allows all paths under this domain
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.gfa-tech.com',
        port: '',
        pathname: '/stp/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://app.gfa-tech.com/stp/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default withNextIntl(nextConfig);