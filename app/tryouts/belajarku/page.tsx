import { Metadata } from 'next';
import BelajarkuClient from './BelajarkuClient';

export const metadata: Metadata = {
  title: 'Dashboard Belajarku | Amania Evaluation',
  description: 'Akses dan kerjakan paket tryout SKD CPNS & Kedinasan yang telah kamu beli.',
  // Tambahkan ini agar Google tidak meng-index halaman ini
  robots: {
    index: false,
    follow: false,
  }
};

export default function BelajarkuPage() {
  return <BelajarkuClient />;
}