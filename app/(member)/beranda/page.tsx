import { Metadata } from 'next';
import BerandaClient from './BerandaClient';

// 🔥 ADVANCED SEO MAXIMIZED: Dominasi Halaman 1 Google 🔥
export const metadata: Metadata = {
  title: 'Beranda Portal Pembelajaran | Amania',
  description: 'Tingkatkan karir IT Anda bersama Amania. Eksplorasi kelas bootcamp terbaru, baca wawasan teknologi terkini, dan pantau progres belajar Anda di satu portal terpadu.',
  keywords: [
    'belajar online amania', 'portal edukasi amania', 'kelas it amania', 
    'bootcamp coding indonesia', 'kursus programming bersertifikat', 
    'platform belajar IT terbaik', 'amania bootcamp', 'artikel teknologi'
  ],
  
  alternates: {
    canonical: 'https://amania.id/beranda',
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  openGraph: {
    title: 'Portal Pembelajaran Terpadu | Amania',
    description: 'Eksplorasi kelas terbaru, artikel menarik, dan pantau peringkat belajar Anda di ekosistem Amania.',
    url: 'https://amania.id/beranda',
    siteName: 'Amania Indonesia',
    type: 'website',
    images: [
      {
        url: 'https://amania.id/og-beranda.jpg', 
        width: 1200,
        height: 630,
        alt: 'Amania Learning Portal',
      },
    ],
    locale: 'id_ID',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Portal Pembelajaran | Amania',
    description: 'Eksplorasi kelas dan wawasan IT terbaru bersama Amania.',
    images: ['https://amania.id/og-beranda.jpg'],
  },
};

export default function BerandaPage() {
  // 🔥 ADVANCED SEO: JSON-LD SCHEMA MARKUP UNTUK WEB PAGE 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Portal Belajar Amania",
    "description": "Portal utama eksplorasi event, bootcamp IT, artikel, dan aktivitas member Amania.",
    "url": "https://amania.id/beranda",
    "publisher": {
      "@type": "Organization",
      "name": "Amania",
      "url": "https://amania.id",
      "logo": {
        "@type": "ImageObject",
        "url": "https://amania.id/logo-amania.png" // 🔥 Logo Diperbarui
      }
    }
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <BerandaClient />
    </>
  );
}