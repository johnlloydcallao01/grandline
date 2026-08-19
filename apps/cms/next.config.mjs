import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['cms-dev.grandlinemaritime.com'],
  output: 'standalone',
  serverExternalPackages: ['@react-pdf/renderer', '@payloadcms/db-postgres'],
  // Cap build workers to keep memory within the available RAM. Next defaults
  // this to os.cpus().length - 1, which spawns one worker per core and can
  // exhaust memory on machines with many cores but limited RAM.
  experimental: {
    cpus: 4,
  },
  // Redirect root path to admin
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: false,
      },
    ]
  },
  // Security headers and CORS configuration
  async headers() {
    return [
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,PATCH,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization,X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  // Enable Turbopack (Next.js 16 default)
  // turbopack: {},
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
