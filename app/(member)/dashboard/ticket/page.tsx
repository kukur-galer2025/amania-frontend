import { Metadata } from 'next';
import TicketDashboardClient from './TicketDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard Tiket Saya | Amania',
  description: 'Kelola pendaftaran kelas, bootcamp, dan akses tiket elektronik Anda di ekosistem Amania.',
  // 🔥 Walaupun privat, kita pasang OpenGraph agar preview link di WA tetap elegan
  openGraph: {
    title: 'Dashboard Tiket Saya | Amania',
    description: 'Pusat kelola tiket dan akses kelas Amania Anda.',
    url: 'https://amania.id/dashboard/ticket',
    siteName: 'Amania Indonesia',
    type: 'website',
  },
  robots: { index: false, follow: false }, // Wajib false untuk privasi user
};

export default function DashboardTicketPage() {
  return <TicketDashboardClient />;
}