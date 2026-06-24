import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true, 

  images: {
    // 🔥 Aktifkan optimisasi gambar Next.js 🔥
    unoptimized: false,
    
    // Domain yang diizinkan untuk optimisasi gambar
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.amania.id',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],

    // Format output yang dioptimasi
    formats: ['image/webp', 'image/avif'],

    // Ukuran gambar yang di-generate
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Cache gambar 30 hari
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;