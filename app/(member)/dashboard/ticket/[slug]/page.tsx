import { Metadata } from 'next';
import { Suspense } from 'react';
import ETicketClient from './ETicketClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'E-Ticket | Amania Member Area',
  description: 'Akses tiket elektronik resmi Amania Anda di sini. Simpan dan tunjukkan tiket ini saat acara berlangsung.',
  robots: { index: false, follow: false }, 
};

// 🔥 Tangkap parameter slug yang bersifat asinkron (Promise) di Next.js App Router terbaru 🔥
export default async function ETicketServerPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Tunggu URL selesai dibaca oleh server
  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 w-full">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="text-sm font-medium text-slate-500">Mempersiapkan E-Ticket...</span>
      </div>
    }>
      {/* Lempar slug langsung ke komponen client */}
      <ETicketClient slug={resolvedParams.slug} />
    </Suspense>
  );
}