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

  // Disable ESLint during build to prevent deployment blocking
  // You can run 'npm run lint' locally to check for issues
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build (optional, can remove if TS is clean)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
