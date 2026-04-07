import { Metadata } from 'next';
import LeaderboardClient from './LeaderboardClient';

export const metadata: Metadata = {
  title: 'Papan Peringkat (Leaderboard) | Amania',
  description: 'Pantau peringkat pembelajar terbaik di Amania. Berkompetisi, selesaikan program terbanyak, dan raih posisi puncak di Hall of Fame kami!',
  keywords: ['leaderboard amania', 'peringkat peserta amania', 'hall of fame amania', 'kompetisi coding', 'top siswa IT indonesia'],
  
  alternates: {
    canonical: 'https://amania.id/leaderboard',
  },
  
  openGraph: {
    title: 'Papan Peringkat (Leaderboard) | Amania',
    description: 'Siapa yang berada di posisi puncak bulan ini? Cek papan peringkat Amania dan lihat siapa saja pembelajar teraktif kami.',
    url: 'https://amania.id/leaderboard',
    siteName: 'Amania Indonesia',
    images: [
      {
        url: 'https://amania.id/og-leaderboard.jpg', 
        width: 1200,
        height: 630,
        alt: 'Amania Hall of Fame',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Papan Peringkat (Leaderboard) | Amania',
    description: 'Siapa yang berada di posisi puncak bulan ini? Cek papan peringkat Amania sekarang.',
    images: ['https://amania.id/og-leaderboard.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    },
  },
};

export default function LeaderboardPage() {
  // 🔥 ADVANCED SEO: JSON-LD SCHEMA (Item List Ranking) 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Papan Peringkat Amania",
    "description": "Daftar peringkat pembelajar terbaik dan teraktif di ekosistem Amania.",
    "url": "https://amania.id/leaderboard"
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <LeaderboardClient />
    </>
  );
}