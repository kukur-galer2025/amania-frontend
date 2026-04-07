import { Metadata } from 'next';
import { Suspense } from 'react';
import EditArticleClient from './EditArticleClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edit Artikel | Admin Panel Amania',
  robots: { index: false, follow: false }, 
};

export default function EditArticlePage() {
  return (
    // 🔥 Suspense wajib digunakan saat ada useSearchParams di Client Component 🔥
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Editor...</span>
      </div>
    }>
      <EditArticleClient />
    </Suspense>
  );
}