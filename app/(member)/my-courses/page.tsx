import { Metadata } from 'next';
import MyCoursesClient from './MyCoursesClient';

export const metadata: Metadata = {
 title: 'Kursus Saya | Amania',
 description: 'Lihat dan lanjutkan kursus online yang sudah Anda miliki di Amania.',
};

export default function MyCoursesPage() {
 return <MyCoursesClient />;
}
