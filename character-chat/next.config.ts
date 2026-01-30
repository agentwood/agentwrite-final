import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'thiswaifudoesnotexist.net',
      },
      {
        protocol: 'https',
        hostname: 'generated.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
      {
        protocol: 'https',
        hostname: 'i.waifu.pics',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Enable static page generation where possible
  // Enable static page generation where possible
  // Output standalone removed to debug InvariantError
  // Experimental features disabled to fix build InvariantError
  experimental: {},
  // Output file tracing excludes to reduce bundle size
  outputFileTracingExcludes: {
    '*': [
      './node_modules/@swc/core/**/*',
      './node_modules/esbuild/**/*',
      './node_modules/better-sqlite3/**/*',
      './node_modules/@napi-rs/**/*',
      './node_modules/canvas/**/*',
      './node_modules/playwright-core/**/*',
      '**/*.map',
      '**/*.md',
      '**/*.test.js',
      '**/*.test.ts',
      // Exclude large static assets and model directories from the server bundle
      './runpod-chatterbox/**/*',
      './runpod-f5-tts/**/*',
      './runpod-fastmaya/**/*',
      './runpod-fishspeech/**/*',
      './tts/**/*',
      './public/voice-samples/**/*',
      './public/characters/**/*',
      './public/avatars/**/*',
      './public/videos/**/*',
      './public/models/**/*',
      './public/voices/**/*',
      './public/reference_audio/**/*',
      './extracted-voices/**/*',
      './free-generated-voices/**/*',
    ],
  },
  // ISR (Incremental Static Regeneration) for programmatic pages
  // This allows us to generate pages at build time and regenerate on-demand
  // Configure revalidation times per route as needed
  // Header for better caching and security
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/runpod-f5-tts/**',
        '**/runpod-fishspeech/**',
        '**/venv/**',
        '**/node_modules/**',
        '**/.git/**',
      ],
    };
    return config;
  },
};

export default nextConfig;
