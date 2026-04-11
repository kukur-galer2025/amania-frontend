import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 KITA HAPUS output: 'export' KARENA SUDAH PAKAI VPS 🔥
  
  trailingSlash: true, 

  // Image optimization bisa tetap mati jika spek VPS rendah, 
  // atau nyalakan jika ingin performa gambar lebih kencang
  images: {
    unoptimized: true,
  },
};

export default nextConfig;