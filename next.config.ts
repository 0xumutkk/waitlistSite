import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self' https://auth.privy.io https://*.privy.io",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://auth.privy.io https://*.privy.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://auth.privy.io https://api.privy.io https://*.privy.io https://*.privy.systems https://explorer-api.walletconnect.com https://*.walletconnect.com wss://*.walletconnect.com https://*.walletconnect.org wss://*.walletconnect.org https://*.supabase.co https://api.x.com https://api.twitter.com https://pbs.twimg.com https://*.twimg.com",
  "frame-src 'self' https://auth.privy.io https://*.privy.io https://twitter.com https://x.com https://*.twitter.com https://*.x.com",
  "child-src 'self' https://auth.privy.io https://*.privy.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "form-action 'self' https://auth.privy.io https://*.privy.io",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
