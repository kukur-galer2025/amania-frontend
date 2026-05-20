import { Metadata } from 'next';
import CoursesClient from './CoursesClient';

export const metadata: Metadata = {
  title: 'Kursus Online | Amania',
  description: 'Temukan kursus online terbaik di Amania. Belajar langsung dari para ahli dengan video berkualitas tinggi. Mulai tingkatkan skill Anda hari ini!',
  openGraph: {
    title: 'Kursus Online | Amania',
    description: 'Katalog kursus online premium dari Amania. Video berkualitas, akses selamanya.',
    type: 'website',
  }
};

export default function CoursesPage() {
  return <CoursesClient />;
}
