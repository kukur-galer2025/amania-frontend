import { Metadata } from 'next';
import { Suspense } from 'react';
import EProductDetailClient from './EProductDetailClient';
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
    title: `${titleSlug} | Produk Digital Amania`,
    description: 'Informasi lengkap, harga, dan pendaftaran akses E-Book, Template, atau Modul Premium di platform Amania.',
    openGraph: {
      title: `${titleSlug} | Produk Digital Amania`,
      description: 'Investasi skill digital dengan koleksi produk digital terbaik dari Amania.',
      type: 'website',
    }
  };
}

export default async function EProductDetailPage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] gap-5">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Memuat Detail Produk...</span>
      </div>
    }>
      {/* 🔥 Meneruskan parameter slug ke komponen client 🔥 */}
      <EProductDetailClient slug={resolvedParams.slug} />
    </Suspense>
  );
}