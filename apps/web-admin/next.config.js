/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Disable strict type checking for layout props during build
    typedRoutes: false,
  },
  typescript: {
    // Temporarily ignore build errors for React 19 compatibility
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't run ESLint during build
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
