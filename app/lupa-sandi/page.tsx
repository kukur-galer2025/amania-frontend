import { Metadata } from 'next';
import LupaSandiClient from './LupaSandiClient';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi | Amania Nusantara',
  description: 'Pulihkan akses ke akun Amania Nusantara Anda. Pilih opsi reset via email atau hubungi admin kami.',
  alternates: {
    canonical: 'https://amania.id/lupa-sandi',
  },
  robots: {
    index: false, 
    follow: true,
  }
};

export default function LupaSandiPage() {
  return <LupaSandiClient />;
}