import { Metadata } from 'next';
import { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Daftar Program | Amania Checkout',
  description: 'Amankan kursi Anda sekarang. Pilih opsi tiket Anda dan bergabunglah dengan program unggulan Amania Nusantara.',
  robots: { index: false, follow: false }, 
};

export default function CheckoutPage() {
  return (
    // 🔥 Suspense wajib digunakan untuk menahan proses baca URL Parameter 🔥
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <span className="text-sm font-medium text-slate-500">Mempersiapkan jalur aman Amania...</span>
      </div>
    }>
      <CheckoutClient />
    </Suspense>
  );
}