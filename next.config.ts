import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Biarkan kosong atau tambahkan konfigurasi lain jika perlu.
  // Tidak perlu 'output: export' karena di VPS kita akan menjalankan Node.js server.
  
  // Opsional: trailingSlash bisa tetap dipakai jika kamu lebih suka URL berakhiran garis miring (contoh: /dashboard/)
  // trailingSlash: true, 
};

export default nextConfig;