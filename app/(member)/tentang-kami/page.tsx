import { Metadata } from 'next';
import TentangKamiClient from './TentangKamiClient';

export const metadata: Metadata = {
  title: 'Tentang Kami & Tim Manajemen | Amania',
  description: 'Kenali Amania lebih dekat. Platform edukasi teknologi inovatif yang dipimpin oleh Dr. Ir. Nurul Hidayat, S.Pt. M.Kom selaku CEO, dan dikelola oleh Prima Dzaky Hibatulloh.',
  keywords: [
    'tentang amania', 
    'Dr. Ir. Nurul Hidayat CEO Amania',
    'Prima Dzaky Hibatulloh', 
    'mahasiswa informatika unsoed', 
    'manajemen amania', 
    'platform belajar IT indonesia',
    'Prima Dzaky Hibatulloh Unsoed',
    'Prima Dzaky Hibatulloh Amania'
  ],
  alternates: { canonical: 'https://amania.id/tentang-kami' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Tentang Amania & Tim Manajemen',
    description: 'Platform edukasi teknologi inovatif yang dipimpin oleh Dr. Ir. Nurul Hidayat dan Prima Dzaky Hibatulloh untuk kemajuan literasi digital.',
    url: 'https://amania.id/tentang-kami',
    siteName: 'Amania Indonesia',
    type: 'profile', 
    images: [
      {
        url: 'https://amania.id/logo-amania.png',
        width: 800,
        height: 600,
        alt: 'Amania Logo',
      }
    ],
  }
};

export default function TentangKamiPage() {
  // 🔥 SEO ADVANCED: Skema Relasi Organisasi & Person 🔥
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://amania.id/tentang-kami",
    "mainEntity": {
      "@type": "Organization",
      "name": "Amania",
      "url": "https://amania.id",
      "logo": "https://amania.id/logo-amania.png",
      "description": "Platform edukasi teknologi yang dirancang untuk kemajuan literasi digital di Indonesia.",
      "founder": [
        {
          "@type": "Person",
          "name": "Dr. Ir. Nurul Hidayat, S.Pt. M.Kom",
          "jobTitle": "Chief Executive Officer (CEO)",
          "worksFor": {
            "@type": "Organization",
            "name": "Amania"
          },
          "sameAs": [
             "https://id.linkedin.com/in/nurul-hidayat-example" 
          ],
          "image": "https://amania.id/images/nurul-hidayat.jpg",
          "description": "CEO dari Amania, memimpin visi dan misi strategis perusahaan dalam memajukan teknologi edukasi."
        }
      ],
      "employee": [
        {
          "@type": "Person",
          "name": "Prima Dzaky Hibatulloh",
          "jobTitle": "Manager & Software Developer",
          "email": "primadzakyhibatulloh@gmail.com",
          "worksFor": {
            "@type": "Organization",
            "name": "Amania"
          },
          "knowsAbout": ["Web Development", "Software Engineering", "Education Technology", "Management", "Laravel", "React"],
          "sameAs": [
            "https://github.com/primadzakyhibatulloh",
            "https://www.instagram.com/hibatulloh._/"
          ],
          "alumniOf": {
            "@type": "CollegeOrUniversity",
            "name": "Universitas Jenderal Soedirman",
            "alternateName": "Unsoed",
            "sameAs": "https://unsoed.ac.id/"
          },
          "image": "https://amania.id/images/prima-dzaky.jpg",
          "description": "Manager dan Software Developer di Amania. Mahasiswa S1 Informatika di Universitas Jenderal Soedirman yang berfokus pada pengembangan ekosistem digital Amania."
        }
      ]
    }
  };

  return (
    <>
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <TentangKamiClient />
    </>
  );
}