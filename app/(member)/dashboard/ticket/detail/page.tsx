import { Metadata } from 'next';
import ETicketClient from './ETicketClient';

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
    // Lempar slug langsung ke komponen client
    <ETicketClient slug={resolvedParams.slug} />
  );
}