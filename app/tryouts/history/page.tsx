import { Metadata } from 'next';
import HistoryClient from './HistoryClient';

export const metadata: Metadata = {
  title: 'Riwayat Transaksi | Amania Evaluation',
  description: 'Pantau riwayat transaksi pembelian paket tryout Anda.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function HistoryPage() {
  return <HistoryClient />;
}