import { Metadata } from 'next';
import TransactionsClient from './TransactionsClient';

export const metadata: Metadata = {
  title: 'Riwayat Transaksi | Amania',
  description: 'Pantau seluruh riwayat pendaftaran dan pembayaran event Anda di ekosistem Amania.',
  robots: { index: false, follow: false }, // Mencegah Google mengindeks halaman privat
  alternates: { canonical: 'https://amania.id/transactions' },
  openGraph: {
    title: 'Riwayat Transaksi | Amania',
    description: 'Kelola tagihan dan riwayat pembayaran Anda.',
    url: 'https://amania.id/transactions',
    siteName: 'Amania Indonesia',
    type: 'website',
  }
};

export default function TransactionsPage() {
  return <TransactionsClient />;
}