import { Metadata } from 'next';
import { Suspense } from 'react';
import EventDetailClient from './EventDetailClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Detail Program | Amania Nusantara',
  description: 'Informasi lengkap mengenai program event, masterclass, dan bootcamp di Amania.',
};

export default function EventDetailPage() {
  return (
    // 🔥 Suspense wajib karena kita akan membaca ?slug= dari URL 🔥
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Program...</span>
      </div>
    }>
      <EventDetailClient />
    </Suspense>
  );
}