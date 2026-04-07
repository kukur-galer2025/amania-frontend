import { Metadata } from 'next';
import { Suspense } from 'react';
import ReadArticleClient from './ReadArticleClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Artikel & Jurnal | Amania Nusantara',
  description: 'Baca artikel edukasi, tips karir, dan wawasan industri terbaru langsung dari para ahli di Amania.',
  robots: { index: true, follow: true },
};

export default function ReadArticlePage() {
  return (
    // 🔥 Suspense wajib digunakan untuk menahan proses baca URL Parameter 🔥
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium text-sm">Menyiapkan halaman...</p>
      </div>
    }>
      <ReadArticleClient />
    </Suspense>
  );
}