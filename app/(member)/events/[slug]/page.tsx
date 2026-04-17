import { Metadata } from 'next';
import { Suspense } from 'react';
import EventDetailClient from './EventDetailClient';
import { Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  
  const titleSlug = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  return {
    title: `${titleSlug} | Program Amania Nusantara`,
    description: 'Informasi lengkap mengenai program event, masterclass, dan bootcamp di Amania.',
    openGraph: {
      title: `${titleSlug} | Program Amania Nusantara`,
      description: 'Informasi lengkap mengenai program event, masterclass, dan bootcamp di Amania.',
      type: 'website',
    }
  };
}

export default async function EventDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Program...</span>
      </div>
    }>
      {/* 🔥 Meneruskan parameter slug ke komponen client 🔥 */}
      <EventDetailClient slug={resolvedParams.slug} />
    </Suspense>
  );
}