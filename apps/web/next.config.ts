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
      {
        protocol: 'https',
        hostname: 'cms.grandlinemaritime.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Environment variables configuration (use NEXT_PUBLIC_ for client exposure)
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
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

  // Experimental features
  experimental: {
    
  },
  typedRoutes: true,
};

export default nextConfig;
