import { Metadata } from 'next';
import TentangKamiClient from './TentangKamiClient';

export const metadata: Metadata = {
  title: 'Tentang Kami | Amania',
  description: 'Amania adalah platform edukasi digital komprehensif yang menyediakan layanan kelas webinar, artikel wawasan, dan penjualan e-product premium terbaik di Indonesia.',
  keywords: [
    'tentang amania', 
    'platform edukasi amania',
    'webinar amania', 
    'e-product amania', 
    'artikel edukasi',
    'platform belajar profesional',
    'pembelajaran digital'
  ],
  alternates: { canonical: 'https://amania.id/tentang-kami' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Tentang Amania - Solusi Edukasi Digital',
    description: 'Menyediakan ekosistem pembelajaran modern melalui Webinar, E-Product, dan Jurnal Wawasan untuk kemajuan karir Anda.',
    url: 'https://amania.id/tentang-kami',
    siteName: 'Amania Indonesia',
    type: 'website', 
    images: [
      {
        url: 'https://amania.id/logo-amania.png',
        width: 800,
        height: 600,
        alt: 'Amania Logo',
      }
    ],
  }
};

export default function TentangKamiPage() {
  // 🔥 SEO ADVANCED: Skema Organisasi & Layanan Tanpa Tryout 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://amania.id/tentang-kami",
    "mainEntity": {
      "@type": "Organization",
      "name": "Amania",
      "url": "https://amania.id",
      "logo": "https://amania.id/logo-amania.png",
      "description": "Platform edukasi teknologi yang menyediakan layanan kelas webinar, wawasan industri, dan penjualan e-product premium.",
      "sameAs": [
        "https://www.instagram.com/amania.id"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Layanan Edukasi Amania",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Katalog Event & Webinar"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "E-Product Premium"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Artikel & Wawasan"
            }
          }
        ]
      }
    }
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <TentangKamiClient />
    </>
  );
}