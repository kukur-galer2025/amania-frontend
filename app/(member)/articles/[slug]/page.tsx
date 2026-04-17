import { Metadata } from 'next';
import { Suspense } from 'react';
import ReadArticleClient from './ReadArticleClient';
import { Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  
  // Mengubah slug (contoh: jadwal-dan-syarat) menjadi (Jadwal Dan Syarat)
  const titleSlug = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Huruf kapital di awal kata
  
  return {
    title: `${titleSlug} | Amania News`,
    description: 'Baca artikel edukasi, tips karir, dan wawasan industri terbaru langsung dari para ahli di Amania.',
    robots: { index: true, follow: true },
  };
}

export default async function ReadArticlePage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium text-sm">Menyiapkan halaman...</p>
      </div>
    }>
      <ReadArticleClient slug={resolvedParams.slug} />
    </Suspense>
  );
}