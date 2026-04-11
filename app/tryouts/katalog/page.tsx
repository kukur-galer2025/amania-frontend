import { Metadata } from 'next';
import KatalogClient from './KatalogClient';

export const metadata: Metadata = {
  title: 'Katalog Paket Tryout SKD CPNS & Kedinasan 2026 | Amania',
  description: 'Pilih paket simulasi SKD terbaik. Tersedia paket mandiri dan bundling untuk CPNS, IPDN, STAN, dan Poltekim. Dilengkapi perankingan nasional dan pembahasan lengkap.',
  keywords: ['beli tryout cpns', 'paket skd kedinasan', 'tryout stan 2026', 'simulasi cat bkn online', 'amania evaluation'],
  alternates: { canonical: 'https://amania.id/tryouts/katalog' },
  openGraph: {
    title: 'Katalog Paket Tryout SKD CPNS & Kedinasan | Amania',
    description: 'Pusat simulasi ujian dengan sistem CBT standar BKN. Pilih paketmu sekarang!',
    url: 'https://amania.id/tryouts/katalog',
    type: 'website',
    images: [{ url: 'https://amania.id/og-katalog.jpg' }]
  }
};

export default function KatalogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Katalog Tryout SKD Amania Nusantara",
    "description": "Daftar paket simulasi ujian seleksi kompetensi dasar.",
    "url": "https://amania.id/tryouts/katalog",
    "breadcrumb": "Home > Tryouts > Katalog"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <KatalogClient />
    </>
  );
}