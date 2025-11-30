/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production deployment
  compress: true,
  poweredByHeader: false,

  // Image optimization
  images: {
    formats: ['image/webp'],
  },

  // Enable static optimization where possible
  reactStrictMode: true,
};

module.exports = nextConfig;
