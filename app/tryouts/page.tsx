import { Metadata } from 'next';
import TryoutLandingClient from './TryoutLandingClient';

export const metadata: Metadata = {
  // Title yang eye-catching untuk SEO
  title: 'Pusat Simulasi Tryout SKD CPNS & Kedinasan 2026 | Amania',
  
  // Meta description informatif dengan keyword yang kuat
  description: 'Tembus Passing Grade SKD CPNS dan Kedinasan dengan mudah. Sistem evaluasi Computer Assisted Test (CAT) dari Amania dirancang persis dengan standar BKN. Dapatkan analisis nilai real-time, pembahasan super cepat, dan pemeringkatan nasional.',
  
  // Keyword SEO Lanjutan
  keywords: [
    'tryout skd cpns 2026', 
    'simulasi skd kedinasan', 
    'tryout cpns gratis', 
    'cat bkn simulasi', 
    'latihan soal twk tiu tkp', 
    'passing grade cpns',
    'bimbel kedinasan online', 
    'aplikasi tryout terbaik',
    'amania tryout skd'
  ],
  authors: [{ name: 'Amania Nusantara' }],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://amania.id/tryouts' },
  
  // Optimasi Sharing ke Social Media (Facebook, WhatsApp, Twitter)
  openGraph: {
    title: 'Pusat Simulasi Tryout SKD CPNS & Kedinasan 2026 | Amania',
    description: 'Sistem evaluasi CBT standar BKN. Dapatkan analisis nilai real-time, ranking nasional, & pembahasan materi cepat.',
    url: 'https://amania.id/tryouts',
    siteName: 'Amania Nusantara',
    images: [{ 
      url: 'https://amania.id/og-tryout.jpg', // Pastikan kamu membuat file og-tryout.jpg di folder public
      width: 1200, 
      height: 630, 
      alt: 'Amania Evaluation Center Preview' 
    }],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulasi Tryout SKD CPNS 2026 | Amania',
    description: 'Latihan soal berstandar BKN dengan CAT system.',
    images: ['https://amania.id/og-tryout.jpg'],
  }
};

export default function TryoutsLandingPage() {
  // Schema JSON-LD untuk WebSite dan Organization (Sangat disukai Google Search Console)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://amania.id/tryouts/#website",
        "name": "Amania Evaluation Center",
        "url": "https://amania.id/tryouts",
        "description": "Platform simulasi tryout SKD CPNS dan Kedinasan berbasis Computer Assisted Test (CAT) terbaik di Indonesia.",
        "publisher": {
          "@id": "https://amania.id/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://amania.id/tryouts/katalog?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://amania.id/#organization",
        "name": "Amania Nusantara",
        "url": "https://amania.id",
        "logo": {
          "@type": "ImageObject",
          "url": "https://amania.id/logo.png" // URL logo official kamu
        }
      }
    ]
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <TryoutLandingClient />
    </>
  );
}