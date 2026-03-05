/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sanitize-html'],
  },
  typescript: {
    // ✅ TypeScript strict mode activé - Toutes les erreurs corrigées !
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignore ESLint pendant le build (vous pouvez toujours linter manuellement avec npm run lint)
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.hermitagelelab.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: 'wp-asso.com',
        pathname: '/wp-content/**',
      },
      {
        protocol: 'https',
        hostname: '*.wp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/avatar/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is needed in development for Next.js hot reloading
              // 'unsafe-inline' is needed for Framer Motion, GSAP, etc.
              // TODO: Use nonce-based CSP for better security in production
              isDev
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.gstatic.com"
                : "script-src 'self' 'unsafe-inline' https://www.youtube.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://admin.hermitagelelab.com https://wp-asso.com https://*.wp.com https://secure.gravatar.com https://data.geopf.fr https://i.ytimg.com",
              "font-src 'self' data:",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
              "connect-src 'self' https://admin.hermitagelelab.com https://wp-asso.com https://api.panoramax.ign.fr https://data.geopf.fr",
              "worker-src 'self' blob:",
              "media-src 'self' https: blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig