import { Metadata } from 'next';
import HistoryClient from '../history/HistoryClient';

export const metadata: Metadata = {
  title: 'History Nilai | Amania Evaluation',
  description: 'Pantau perkembangan belajarmu, lihat riwayat nilai, dan evaluasi hasil tryout kamu di sini.',
  // Tambahkan ini juga
  robots: {
    index: false,
    follow: false,
  }
};

export default function HistoryPage() {
  return <HistoryClient />;
}