import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@encreasl/ui"],

  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Environment variables configuration
  env: {
    // Custom environment variables that should be available at build time
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Public runtime configuration (deprecated in favor of NEXT_PUBLIC_ prefix)
  publicRuntimeConfig: {
    // These will be available on both server and client
    appName: process.env.NEXT_PUBLIC_APP_NAME,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
  },

  // Server runtime configuration
  serverRuntimeConfig: {
    // These will only be available on the server side
    // Add server-only environment variables here if needed
  },

  // Proxy API requests to avoid CORS during development
  async rewrites() {
    return [
      {
        source: '/api/cms/:path*',
        destination: 'https://grandline-cms.vercel.app/api/:path*',
      },
    ];
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  turbopack: {
    resolveAlias: {
      "@/*": "./src/*",
    },
  },

  // Experimental features for better environment variable handling
  experimental: {
    // Enable environment variable validation
    typedRoutes: true,
  },
};

export default nextConfig;
