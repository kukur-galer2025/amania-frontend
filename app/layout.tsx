import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // 🔥 Wajib di-import untuk Midtrans
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduTech Amania | Premium Learning",
  description: "Platform edukasi teknologi modern.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning di <html> untuk aman dari ekstensi lain
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      
      {/* 🔥 Tambahkan suppressHydrationWarning JUGA di <body> untuk membungkam ekstensi Demoway 🔥 */}
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {children}

        {/* ============================================================== */}
        {/* 🔥 SCRIPT MIDTRANS SNAP (CLIENT KEY LANGSUNG DITEMPEL) 🔥 */}
        {/* ============================================================== */}
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key="Mid-client-6bq6Hq6Kdmy3ETeL" 
          strategy="lazyOnload"
        />
      </body>
      
    </html>
  );
}