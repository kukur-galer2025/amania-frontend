import { Metadata } from 'next';
import SyaratKetentuanClient from './SyaratKetentuanClient';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan | Amania',
  description: 'Syarat dan Ketentuan layanan platform edukasi Amania',
};

export default function SyaratKetentuanPage() {
  return <SyaratKetentuanClient />;
}