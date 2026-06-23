import { Metadata } from 'next';
import PromoClient from './PromoClient';

export const metadata: Metadata = {
  title: 'Promo & Penawaran | Amania',
  description: 'Dapatkan berbagai promo, diskon, dan penawaran menarik seputar layanan Amania.',
};

export default function PromoPage() {
  return <PromoClient />;
}
