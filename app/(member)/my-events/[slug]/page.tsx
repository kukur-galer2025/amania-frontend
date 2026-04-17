import { Metadata } from 'next';
import MyEventDetailClient from './MyEventDetailClient';

export const metadata: Metadata = {
  title: 'Ruang Kelas | Amania',
  description: 'Akses modul materi, video, dan link pertemuan program masterclass Amania.',
  robots: { 
    index: false, // ⚠️ Melindungi privasi kelas dari Google Search
    follow: false 
  }
};

export default function MyEventDetailPage({ params }: { params: { slug: string } }) {
  // 🔥 Meneruskan parameter slug (cth: "kelas-react-js") langsung ke Client Component
  return <MyEventDetailClient slug={params.slug} />;
}