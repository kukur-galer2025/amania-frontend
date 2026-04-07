import { Metadata } from 'next';
import CertificatesClient from './CertificatesClient';

export const metadata: Metadata = {
  title: 'E-Certificate Saya | Amania',
  description: 'Akses dan unduh seluruh sertifikat kelulusan dari program masterclass dan bootcamp yang telah Anda selesaikan di ekosistem Amania.',
  robots: { 
    index: false, // Menjaga privasi pencapaian user dari indeks publik Google
    follow: false 
  },
  openGraph: {
    title: 'E-Certificate Saya | Amania',
    description: 'Pusat pencapaian dan sertifikat kelulusan Amania.',
    siteName: 'Amania Indonesia',
    type: 'website',
  }
};

export default function CertificatesPage() {
  return <CertificatesClient />;
}