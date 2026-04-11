import { Metadata } from 'next';
import KatalogDetailClient from './KatalogDetailClient';

// Next.js 15+ menganggap params sebagai Promise
type Props = {
  params: Promise<{ slug: string }>;
};

// Fungsi generate Meta Tag dinamis
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 🔥 UNWRAP PARAMS DENGAN AWAIT 🔥
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const title = `Beli Paket ${slug.replace(/-/g, ' ').toUpperCase()} | Amania Evaluation`;
  const description = `Persiapkan ujianmu dengan simulasi ${slug.replace(/-/g, ' ')}. Tersedia sistem penilaian CAT standar BKN lengkap dengan pembahasan.`;

  return {
    title,
    description,
    alternates: { canonical: `https://amania.id/tryouts/katalog/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://amania.id/tryouts/katalog/${slug}`,
      type: 'website',
    }
  };
}

export default async function DetailKatalogPage({ params }: Props) {
  // 🔥 UNWRAP PARAMS DENGAN AWAIT 🔥
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Paket Simulasi ${slug.replace(/-/g, ' ')}`,
    "description": "Paket tryout CAT SKD dengan kualitas soal FR terbaru.",
    "brand": {
      "@type": "Brand",
      "name": "Amania Nusantara"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://amania.id/tryouts/katalog/${slug}`,
      "priceCurrency": "IDR",
      "price": "35000", 
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <KatalogDetailClient slug={slug} />
    </>
  );
}