import CourseDetailClient from './CourseDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return {
    title: `Kursus: ${slug.replace(/-/g, ' ')} | Amania`,
    description: `Pelajari ${slug.replace(/-/g, ' ')} di Amania. Kursus online berkualitas dengan video YouTube premium.`,
  };
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
