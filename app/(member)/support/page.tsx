import { Metadata } from 'next';
import SupportClient from './SupportClient';

export const metadata: Metadata = {
  title: 'Pusat Bantuan & FAQ | Amania',
  description: 'Temukan jawaban atas pertanyaan seputar pembayaran event, akses sertifikat, dan kendala akun di Pusat Bantuan Amania.',
  keywords: ['bantuan amania', 'faq sertifikat amania', 'cara bayar event amania', 'kontak admin amania', 'customer service amania'],
  alternates: { canonical: 'https://amania.id/support' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Pusat Bantuan & FAQ | Amania',
    description: 'Butuh bantuan terkait kelas atau sertifikat? Cek FAQ kami atau hubungi Admin Pusat Amania.',
    url: 'https://amania.id/support',
    siteName: 'Amania Indonesia',
    type: 'website',
  }
};

export default function SupportPage() {
  // 🔥 ADVANCED SEO: FAQPage Schema Markup 🔥
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Berapa lama proses verifikasi pembayaran di Amania?",
        "acceptedAnswer": { "@type": "Answer", "text": "Proses verifikasi otomatis biasanya memakan waktu 1-5 menit. Jika manual, maksimal dalam 1x24 jam kerja." }
      },
      {
        "@type": "Question",
        "name": "Dimana saya bisa mengunduh sertifikat Amania?",
        "acceptedAnswer": { "@type": "Answer", "text": "Sertifikat akan muncul di menu 'E-Certificate' setelah Anda menyelesaikan acara dan mengisi absensi kehadiran." }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SupportClient />
    </>
  );
}