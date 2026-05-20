import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Belajar Kursus | Amania',
  description: 'Halaman belajar kursus online Amania',
};

// Layout minimal full-screen untuk halaman belajar kursus
// Tidak menggunakan sidebar member agar pengalaman belajar lebih immersive
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
