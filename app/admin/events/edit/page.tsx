import EditEventClient from './EditEventClient';

// 🔥 INI WAJIB AGAR TIDAK ERROR SAAT NPM RUN BUILD 🔥
export function generateStaticParams() {
  return [{ id: '1' }]; 
}

export default function EditEventPage() {
  return <EditEventClient />;
}