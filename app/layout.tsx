import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduTech Amania | Premium Learning",
  description: "Platform edukasi teknologi modern.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning di <html> untuk aman dari intervensi ekstensi browser
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {children}
      </body>
      
    </html>
  );
}