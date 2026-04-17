import { Metadata } from 'next';
import TryoutPlayClient from './TryoutPlayClient';

export const metadata: Metadata = {
  title: 'Sedang Ujian | Amania CAT',
  description: 'Sistem Simulasi Computer Assisted Test (CAT) Amania Nusantara.',
  robots: {
    index: false,
    follow: false
  }
};

// 🔥 PERBAIKAN: Ubah menjadi async function dan params menjadi Promise
export default async function TryoutPlayPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Bongkar (unwrap) promise dari params
  const resolvedParams = await params;
  
  // Melempar parameter slug yang sudah matang ke komponen Client
  return <TryoutPlayClient slug={resolvedParams.slug} />;
}