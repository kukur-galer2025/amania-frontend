import { Metadata } from 'next';
import ArticlesClient from './ArticlesClient';

// 🔥 ADVANCED SEO: Optimasi Keyword & Robots 🔥
export const metadata: Metadata = {
  title: 'Katalog Artikel & Berita | Amania',
  description: 'Eksplorasi wawasan, ide terbaru, dan tips edukasi terbaik yang ditulis oleh para ahli di platform Amania.',
  keywords: ['artikel edukasi', 'berita amania', 'tips belajar', 'tutorial coding', 'wawasan karir', 'teknologi'],
  
  alternates: {
    canonical: 'https://amania.id/articles',
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
    title: 'Katalog Artikel & Berita | Amania',
    description: 'Eksplorasi wawasan dan ide terbaru untuk membantu perjalanan belajarmu bersama Amania.',
    url: 'https://amania.id/articles',
    type: 'website',
    siteName: 'Amania Indonesia',
    images: [
      {
        url: 'https://amania.id/og-articles.jpg', 
        width: 1200,
        height: 630,
        alt: 'Amania Articles',
      },
    ],
    locale: 'id_ID',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Katalog Artikel & Berita | Amania',
    description: 'Eksplorasi wawasan dan ide terbaru untuk membantu perjalanan belajarmu bersama Amania.',
    images: ['https://amania.id/og-articles.jpg'],
  },
};

export default function ArticlesPage() {
  // 🔥 ADVANCED SEO: JSON-LD SCHEMA MARKUP UNTUK KATALOG 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "url": "https://amania.id/articles",
    "name": "Katalog Artikel Amania",
    "description": "Kumpulan artikel edukasi dan berita teknologi terbaru dari Amania."
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <ArticlesClient />
    </>
  );
}