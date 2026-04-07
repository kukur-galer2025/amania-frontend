// app/page.tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Langsung arahkan ke login atau beranda member
  redirect('/beranda'); 
}