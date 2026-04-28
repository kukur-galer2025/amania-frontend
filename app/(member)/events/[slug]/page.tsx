import { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import EventDetailClient from './EventDetailClient';
import { Loader2 } from 'lucide-react';

type Props = {
  params: Promise<{ slug: string }>
};

// 1. Generate Metadata untuk SEO & Share (berjalan di server)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  
  let titleSlug = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
    
  let description = 'Informasi lengkap mengenai program event, masterclass, dan bootcamp di Amania.';
  let imageUrl = '';

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

    const res = await fetch(`${apiUrl}/events/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        titleSlug = json.data.title || titleSlug;
        if (json.data.image) {
          imageUrl = `${storageUrl}/${json.data.image}`;
        }
      }
    }
  } catch (error) {
    console.error("Gagal memuat metadata event:", error);
  }

  const previousImages = (await parent).openGraph?.images || [];
  const finalImages = imageUrl ? [imageUrl] : previousImages;
  
  return {
    title: `${titleSlug} | Program Amania Nusantara`,
    description: description,
    openGraph: {
      title: `${titleSlug} | Program Amania Nusantara`,
      description: description,
      type: 'website',
      images: finalImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleSlug} | Program Amania Nusantara`,
      description: description,
      images: finalImages,
    }
  };
}

// 2. EXPORT DEFAULT WAJIB ADA DI SINI
export default async function EventDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Program...</span>
      </div>
    }>
      <EventDetailClient slug={resolvedParams.slug} />
    </Suspense>
  );
}