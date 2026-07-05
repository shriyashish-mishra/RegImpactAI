import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Deliberately scoped to headers with zero risk of breaking script/style/
  // font loading — this is clickjacking + MIME-sniffing + referrer hygiene,
  // not a full Content-Security-Policy (which would need real testing
  // against Next.js's inline hydration scripts before shipping).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Both lines defend against the same thing (an attacker embedding
          // this site — most importantly /admin/login — in an invisible
          // iframe to hijack clicks/input). X-Frame-Options for older
          // browsers, frame-ancestors for the modern equivalent.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ]
  },
}

export default nextConfig
