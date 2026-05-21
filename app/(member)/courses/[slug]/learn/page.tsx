import LearnClient from './LearnClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 return {
 title: `Belajar: ${slug.replace(/-/g, ' ')} | Amania`,
 description: `Halaman belajar kursus ${slug.replace(/-/g, ' ')} di Amania.`,
 };
}

export default function LearnPage() {
 return <LearnClient />;
}
