import { Metadata } from 'next';
import CommunityClient from './CommunityClient';

// 🔥 ADVANCED SEO: Optimasi Keyword & OpenGraph 🔥
export const metadata: Metadata = {
  title: 'Komunitas & Pusat Bantuan | Amania',
  description: 'Bergabunglah dengan grup diskusi Amania, perluas jejaring profesional Anda di bidang teknologi, dan hubungi Admin Pusat untuk dukungan langsung.',
  keywords: [
    'komunitas belajar amania', 'grup whatsapp amania', 'bantuan admin amania', 
    'networking IT indonesia', 'belajar coding bersama', 'forum diskusi teknologi'
  ],
  
  alternates: {
    canonical: 'https://amania.id/community',
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
    title: 'Komunitas & Dukungan | Amania',
    description: 'Jangan belajar sendirian! Bergabunglah dengan grup eksklusif Amania dan dapatkan bantuan teknis langsung dari Admin.',
    url: 'https://amania.id/community',
    siteName: 'Amania Indonesia',
    type: 'website',
    images: [
      {
        url: 'https://amania.id/og-community.jpg', // Opsional
        width: 1200,
        height: 630,
        alt: 'Amania Community & Support',
      },
    ],
    locale: 'id_ID',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Komunitas & Dukungan | Amania',
    description: 'Hubungi Admin Pusat Amania atau gabung ke grup diskusi IT terbesar sekarang.',
    images: ['https://amania.id/og-community.jpg'],
  },
};

export default function CommunityPage() {
  // 🔥 ADVANCED SEO: JSON-LD SCHEMA MARKUP UNTUK KONTAK/ORGANISASI 🔥
  // Ini membantu Google memunculkan Box "Customer Service" ketika orang mencari Amania
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Amania",
    "url": "https://amania.id",
    "logo": "https://amania.id/logo-amania.png", 
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+62-812-2718-132",
        "contactType": "customer support",
        "contactOption": "WhatsApp",
        "areaServed": "ID",
        "availableLanguage": "Indonesian"
      }
    ],
    "sameAs": [
      "https://chat.whatsapp.com/628122718132" 
    ]
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <CommunityClient />
    </>
  );
}