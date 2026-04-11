import { Metadata } from 'next';
import KebijakanPrivasiClient from './KebijakanPrivasiClient';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi | Amania',
  description: 'Kebijakan Privasi dan perlindungan data pengguna platform Amania',
};

export default function KebijakanPrivasiPage() {
  return <KebijakanPrivasiClient />;
}