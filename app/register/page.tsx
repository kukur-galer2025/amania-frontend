import { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import RegisterClient from './RegisterClient';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru | Amania Nusantara',
  description: 'Buat akun Amania secara gratis dan mulai perjalanan karir teknologi Anda. Akses ratusan bootcamp, webinar, dan masterclass berkualitas langsung dari praktisi industri.',
  keywords: [
    'daftar amania', 
    'buat akun amania', 
    'registrasi bootcamp', 
    'belajar coding gratis', 
    'kursus IT online', 
    'belajar programming', 
    'amania indonesia', 
    'sertifikasi IT',
    'bootcamp programming'
  ],
  authors: [{ name: 'Amania Team' }],
  creator: 'Amania Nusantara',
  publisher: 'Amania Nusantara',
  alternates: {
    canonical: 'https://amania.id/register', 
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Mulai Karir Teknologimu | Daftar Akun Amania',
    description: 'Bergabung dengan ribuan siswa lainnya. Tingkatkan skill IT kamu dengan akses ke berbagai bootcamp dan sertifikasi resmi Amania.',
    url: 'https://amania.id/register',
    siteName: 'Amania Nusantara',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://amania.id/images/og-register.jpg', 
        width: 1200,
        height: 630,
        alt: 'Amania Registration Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daftar Akun Baru | Amania Nusantara',
    description: 'Buat akun gratis sekarang dan akses ribuan materi belajar programming dan IT.',
    images: ['https://amania.id/images/og-register.jpg'],
  },
};

export default function RegisterPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Daftar Akun Amania",
    "description": "Halaman pendaftaran resmi platform edukasi Amania.",
    "url": "https://amania.id/register",
    "publisher": {
      "@type": "Organization",
      "name": "Amania",
      "logo": "https://amania.id/logo-amania.png"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GoogleOAuthProvider clientId={clientId}>
        <RegisterClient />
      </GoogleOAuthProvider>
    </>
  );
}