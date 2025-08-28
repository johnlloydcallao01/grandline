import type { NextConfig } from "next";

// Next.js automatically loads .env files in the following order:
// 1. .env.local (always loaded, should be gitignored)
// 2. .env.development (loaded when NODE_ENV is development)
// 3. .env (always loaded)
// No need for manual dotenv configuration
const nextConfig: NextConfig = {
  transpilePackages: [
    "@encreasl/ui",
    "@encreasl/auth",
    "@encreasl/env",
    "@payloadcms/ui",
    "@payloadcms/richtext-lexical",
    "payload"
  ],

  // Next.js automatically exposes NEXT_PUBLIC_ environment variables to the client
  // No need to explicitly define them in the env object

  turbopack: {
    resolveAlias: {
      "@/*": "./src/*",
    },
  },

  // Admin-specific security headers
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
        ],
      },
    ];
  },



  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Experimental features for better environment variable handling
  experimental: {
    // Enable environment variable validation
    typedRoutes: false,
  },
};

export default nextConfig;
