import { Metadata } from 'next';
import EventsClient from './EventsClient';

export const metadata: Metadata = {
  title: 'Katalog Program & Bootcamp | Amania',
  description: 'Eksplorasi daftar kelas online, webinar eksklusif, dan bootcamp intensif kami. Tingkatkan skill digital Anda bersama instruktur profesional Amania.',
  keywords: [
    'bootcamp amania', 'kelas online bersertifikat', 'belajar coding indonesia', 
    'webinar teknologi gratis', 'kursus pemrograman', 'amania bootcamp IT'
  ],
  alternates: {
    canonical: 'https://amania.id/events',
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
  openGraph: {
    title: 'Katalog Program & Bootcamp | Amania',
    description: 'Investasi terbaik adalah edukasi. Temukan kelas impian Anda di sini bersama Amania.',
    url: 'https://amania.id/events',
    type: 'website',
    siteName: 'Amania Indonesia',
    images: [
      {
        url: 'https://amania.id/og-events.jpg', 
        width: 1200,
        height: 630,
        alt: 'Katalog Event Amania',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Katalog Program & Bootcamp | Amania',
    description: 'Temukan kelas impian Anda di sini bersama Amania.',
    images: ['https://amania.id/og-events.jpg'],
  }
};

export default function EventsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "url": "https://amania.id/events",
    "name": "Katalog Kelas Amania",
    "description": "Daftar kelas dan bootcamp edukasi teknologi dari Amania."
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <EventsClient />
    </>
  );
}