import { Metadata } from 'next';
import ProfilClient from './ProfilClient';

export const metadata: Metadata = {
  title: 'Pengaturan Profil | Amania',
  description: 'Kelola informasi pribadi, foto profil, dan keamanan akun Amania Anda.',
  robots: { index: false, follow: false }, // Jangan indeks profil pribadi pengguna
};

export default function ProfilPage() {
  return <ProfilClient />;
}