import { Metadata } from 'next';
import MyEProductDetailClient from './MyEProductDetailClient';

export const metadata: Metadata = {
  title: 'Ruang Kelas Digital | Amania',
  description: 'Akses materi dan aset digital premium Anda di Amania.',
};

// 🔥 PERBAIKAN: params sekarang harus berupa Promise dan di-await (Next.js 15+)
export default async function MyEProductViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <MyEProductDetailClient slug={resolvedParams.slug} />;
}