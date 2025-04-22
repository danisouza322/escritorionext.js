/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:5000', '*.replit.dev', '*.repl.co', '*.replit.app'],
    },
  },
};

module.exports = nextConfig;
