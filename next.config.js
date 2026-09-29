/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'oaidalleapiprodscus.blob.core.windows.net'],
  },
};

module.exports = nextConfig;
