import { Metadata } from 'next';
import MyEProductsClient from './MyEProductsClient';

export const metadata: Metadata = {
  title: 'Koleksi E-Produk Saya | Amania',
  description: 'Akses semua produk digital premium yang telah Anda beli.',
};

export default function MyEProductsPage() {
  return <MyEProductsClient />;
}