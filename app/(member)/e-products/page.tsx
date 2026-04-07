import { Metadata } from 'next';
import EProductsClient from './EProductsClient';

export const metadata: Metadata = {
  title: 'Katalog E-Produk & Modul Premium | Amania',
  description: 'Temukan koleksi E-Book, Template Profesional, Video Modul, dan sumber daya digital unggulan lainnya di Amania. Sekali beli, akses selamanya!',
  openGraph: {
    title: 'Katalog E-Produk & Modul Premium | Amania',
    description: 'Investasi skill digital dengan koleksi produk digital terbaik dari Amania.',
    type: 'website',
  }
};

export default function EProductsPage() {
  return <EProductsClient />;
}