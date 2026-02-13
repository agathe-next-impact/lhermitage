// Derive WordPress hostname from env vars (single source of truth: .env.local)
const wpHostname = (() => {
  try {
    const url = process.env.WP_GRAPHQL_URL || process.env.NEXT_PUBLIC_WP_API_URL
    if (url) return new URL(url).hostname
  } catch { /* ignore */ }
  return 'localhost'
})()

// Legacy domains (WP may still return image/link URLs with old domain during migration)
const wpLegacyHostnames = (process.env.WP_LEGACY_DOMAINS || '')
  .split(',').map(d => d.trim()).filter(Boolean)
  .filter(d => d !== wpHostname) // avoid duplicates with primary

// All WP hostnames for CSP headers
const allWpHostnames = [wpHostname, ...wpLegacyHostnames]

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TODO: Corriger les erreurs TypeScript et passer à false
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Primary WP domain + any legacy domains (for images still served from old host)
      ...allWpHostnames.map(host => ({
        protocol: 'https',
        hostname: host,
        pathname: '/wp-content/**',
      })),
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://unpkg.com",
              `img-src 'self' data: blob: ${allWpHostnames.map(h => `https://${h}`).join(' ')} https://*.wp.com https://secure.gravatar.com https://api.mapbox.com https://data.geopf.fr https://unpkg.com`,
              "font-src 'self'",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
              `connect-src 'self' ${allWpHostnames.map(h => `https://${h}`).join(' ')} https://api.mapbox.com https://api.panoramax.ign.fr https://data.geopf.fr`,
              "media-src 'self' https: blob:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig