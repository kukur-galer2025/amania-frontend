import { Metadata } from 'next';
import MyEventsClient from './MyEventsClient';

export const metadata: Metadata = {
  title: 'Kelas Saya | Amania',
  description: 'Akses semua program masterclass, webinar, dan bootcamp yang sedang Anda ikuti di ekosistem Amania.',
  robots: { 
    index: false, // ⚠️ PENTING: Melindungi privasi kelas user dari Google
    follow: false 
  },
  openGraph: {
    title: 'Kelas Saya | Amania',
    description: 'Pusat akses kelas dan pembelajaran Anda.',
    siteName: 'Amania Indonesia',
    type: 'website',
  }
};

export default function MyEventsPage() {
  return <MyEventsClient />;
}