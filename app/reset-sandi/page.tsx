import { Metadata } from 'next';
import { Suspense } from 'react';
import ResetSandiClient from './ResetSandiClient';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Buat Kata Sandi Baru | Amania Nusantara',
  description: 'Masukkan kata sandi baru untuk akun Amania Anda.',
  robots: {
    index: false,
    follow: false,
  }
};

export default function ResetSandiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white text-indigo-600">
        <Loader2 size={40} className="animate-spin" />
      </div>
    }>
      <ResetSandiClient />
    </Suspense>
  );
}