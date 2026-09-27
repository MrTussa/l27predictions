import { withPayload } from '@payloadcms/next/withPayload'

const NEXT_PUBLIC_SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.31.180'],
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
      {
        hostname: 's3.twcstorage.ru',
        protocol: 'https',
      },
    ],
  },
  reactStrictMode: true,
  cacheComponents: true,
  experimental: {
    optimizePackageImports: ['three', 'recharts', 'lucide-react', '@tabler/icons-react'],
    // Nixpacks mounts .next/cache as a persistent BuildKit cache, and Turbopack
    // (build cache on by default since 16.3) replays module evaluations from it.
    // A build that once ran without a native binding — lightningcss before its
    // Linux package was pinned — cached that failed require, and every cached
    // build replayed it even after the package was installed. Clean builds
    // passed, cached ones failed. Builds are slower without it, but they
    // resolve native bindings from what is actually installed.
    turbopackFileSystemCacheForBuild: false,
  },
  async headers() {
    return [
      {
        source: '/((?!admin).*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // SVG-логотипы команд и флаги — статичные ресурсы, кэшируем на год
        source: '/api/media/file/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig)
