import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 INI WAJIB UNTUK CPANEL SHARED HOSTING 🔥
  output: 'export',
  
  // 🔥 Mencegah error 404 pada Sidebar & Navigasi di cPanel
  // Akan menghasilkan struktur folder (contoh: /dashboard/index.html) 
  // alih-alih file tunggal (dashboard.html)
  trailingSlash: true, 

  // Mematikan image optimization karena fitur bawaan Next.js 
  // memerlukan server Node.js aktif, sedangkan cPanel hanya HTML statis
  images: {
    unoptimized: true,
  },
};

export default nextConfig;