import { Metadata } from 'next';
import CalendarClient from './CalendarClient';

// 🔥 ADVANCED SEO MAXIMIZED: Akses Terbuka untuk Googlebot 🔥
export const metadata: Metadata = {
  title: 'Kalender Program & Event Bootcamp | Amania',
  description: 'Pantau jadwal kelas IT, webinar teknologi eksklusif, dan jadwal bootcamp Anda di Amania. Jangan lewatkan momen berharga untuk akselerasi karir digital Anda.',
  keywords: [
    'jadwal kelas amania', 'kalender bootcamp IT', 'jadwal webinar teknologi', 
    'event komunitas IT', 'agenda bootcamp online', 'kursus IT terbaru amania'
  ],
  
  alternates: {
    canonical: 'https://amania.id/calendar',
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
    title: 'Kalender Program & Event | Amania',
    description: 'Pantau seluruh jadwal kelas dan webinar IT Anda di satu kalender pintar Amania.',
    url: 'https://amania.id/calendar',
    siteName: 'Amania Indonesia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kalender Program & Event | Amania',
    description: 'Pantau seluruh jadwal kelas dan webinar teknologi Anda secara realtime.',
  }
};

export default function CalendarPage() {
  // 🔥 ADVANCED SEO: JSON-LD SCHEMA MARKUP 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Kalender Event Amania",
    "description": "Jadwal lengkap program masterclass, webinar teknologi, dan bootcamp yang diselenggarakan oleh Amania.",
    "url": "https://amania.id/calendar",
    "publisher": {
      "@type": "Organization",
      "name": "Amania",
      "url": "https://amania.id",
      "logo": {
        "@type": "ImageObject",
        "url": "https://amania.id/logo-amania.png" 
      }
    }
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <CalendarClient />
    </>
  );
}