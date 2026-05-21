import { Metadata } from 'next';
import { Suspense } from 'react';
import EProductDetailClient from './EProductDetailClient';
import { Loader2 } from 'lucide-react';

type Props = {
 params: Promise<{ slug: string }>
};

async function getProduct(slug: string) {
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
 const res = await fetch(`${API_URL}/e-products/${slug}`, {
 headers: { 'Accept': 'application/json' },
 next: { revalidate: 60 },
 });
 if (res.ok) {
 const json = await res.json();
 if (json.success) return json.data;
 }
 } catch {}
 return null;
}

function stripHtml(html: string) {
 return html
 .replace(/<[^>]+>/g, '')
 .replace(/&nbsp;/g, ' ')
 .replace(/&amp;/g, '&')
 .replace(/&lt;/g, '<')
 .replace(/&gt;/g, '>')
 .replace(/&quot;/g, '"')
 .replace(/&#39;/g,"'")
 .replace(/\s+/g, ' ')
 .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const resolvedParams = await params;
 const slug = resolvedParams?.slug || '';
 const product = await getProduct(slug);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 const titleSlug = slug
 .replace(/-/g, ' ')
 .replace(/\b\w/g, (char) => char.toUpperCase());

 const title = product?.title || titleSlug;
 const description = product?.description 
 ? stripHtml(product.description).substring(0, 160) + '...'
 : 'Informasi lengkap, harga, dan pendaftaran akses E-Book, Template, atau Modul Premium di platform Amania.';
 
 const imageUrl = product?.cover_image 
 ? `${STORAGE_URL}/${product.cover_image}` 
 : undefined;

 return {
 title: `${title} | Produk Digital Amania`,
 description,
 openGraph: {
 title: `${title} | Produk Digital Amania`,
 description,
 type: 'website',
 ...(imageUrl && {
 images: [
 {
 url: imageUrl,
 width: 1200,
 height: 630,
 alt: title,
 },
 ],
 }),
 },
 twitter: {
 card: imageUrl ? 'summary_large_image' : 'summary',
 title: `${title} | Produk Digital Amania`,
 description,
 ...(imageUrl && { images: [imageUrl] }),
 },
 };
}

export default async function EProductDetailPage({ params }: Props) {
 const resolvedParams = await params;

 return (
 <Suspense fallback={
 <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] dark:bg-[#0B1120] gap-5">
 <Loader2 size={32} className="animate-spin text-indigo-600"/>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Memuat Detail Produk...</span>
 </div>
 }>
 <EProductDetailClient slug={resolvedParams.slug} />
 </Suspense>
 );
}