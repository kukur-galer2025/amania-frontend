import { Metadata } from 'next';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoginClient from './LoginClient';

// ==========================================
// ADVANCED SEO CONFIGURATION: LOGIN AMANIA
// ==========================================
export const metadata: Metadata = {
  title: 'Masuk Akun | Amania Platform Pembelajaran',
  description: 'Masuk ke portal pembelajaran Amania. Lanjutkan progres belajar Anda, akses bootcamp eksklusif, dan tingkatkan karir IT Anda.',
  keywords: [
    'login amania', 
    'masuk akun amania', 
    'portal belajar IT', 
    'amania indonesia login',
    'akses bootcamp amania',
    'dashboard siswa amania'
  ],
  authors: [{ name: 'Amania Team' }],
  creator: 'Amania Indonesia',
  publisher: 'Amania Indonesia',
  alternates: {
    canonical: 'https://amania.id/login',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Selamat Datang Kembali | Amania',
    description: 'Lanjutkan perjalanan karir teknologi Anda. Masuk sekarang untuk mengakses ratusan materi IT eksklusif di Amania.',
    url: 'https://amania.id/login',
    siteName: 'Amania Indonesia',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://amania.id/images/og-login.jpg', 
        width: 1200,
        height: 630,
        alt: 'Amania Login Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Masuk Akun | Amania',
    description: 'Lanjutkan progres belajar IT Anda di portal Amania.',
    images: ['https://amania.id/images/og-login.jpg'],
  },
};

export default function LoginPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // 🔥 ADVANCED SEO: JSON-LD WebPage & Action 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Masuk ke Amania",
    "description": "Halaman login resmi platform edukasi Amania.",
    "url": "https://amania.id/login",
    "publisher": {
      "@type": "Organization",
      "name": "Amania",
      "logo": "https://amania.id/logo-amania.png"
    }
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <GoogleOAuthProvider clientId={clientId}>
        <LoginClient />
      </GoogleOAuthProvider>
    </>
  );
}