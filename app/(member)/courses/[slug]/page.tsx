import { Metadata } from 'next';
import CourseDetailClient from './CourseDetailClient';

type Props = {
 params: Promise<{ slug: string }>
};

async function getCourse(slug: string) {
 try {
 const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
 const res = await fetch(`${API_URL}/courses/${slug}`, {
 headers: { 'Accept': 'application/json' },
 next: { revalidate: 60 },
 });
 if (res.ok) {
 const json = await res.json();
 if (json.success) return json.data;
 }
 } catch {}
 return null;
}

function stripHtml(html: string) {
 return html
 .replace(/<[^>]+>/g, '')
 .replace(/&nbsp;/g, ' ')
 .replace(/&amp;/g, '&')
 .replace(/&lt;/g, '<')
 .replace(/&gt;/g, '>')
 .replace(/&quot;/g, '"')
 .replace(/&#39;/g,"'")
 .replace(/\s+/g, ' ')
 .trim();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const { slug } = await params;
 const course = await getCourse(slug);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 const title = course?.title || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
 const description = course?.description
 ? stripHtml(course.description).substring(0, 160) + '...'
 : `Pelajari ${slug.replace(/-/g, ' ')} di Amania. Kursus online berkualitas dengan video premium.`;

 const imageUrl = course?.thumbnail
 ? `${STORAGE_URL}/${course.thumbnail}`
 : undefined;

 const totalLessons = (course?.sections || []).reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);

 return {
 title: `${title} | Kursus Amania`,
 description,
 openGraph: {
 title: `🎓 ${title} | Kursus Amania`,
 description: `📚 ${course?.sections?.length || 0} Bab · ${totalLessons} Lesson · ⭐ ${course?.avg_rating || 0}/5 — ${description}`,
 type: 'website',
 ...(imageUrl && {
 images: [
 {
 url: imageUrl,
 width: 1200,
 height: 630,
 alt: title,
 },
 ],
 }),
 },
 twitter: {
 card: imageUrl ? 'summary_large_image' : 'summary',
 title: `🎓 ${title} | Kursus Amania`,
 description,
 ...(imageUrl && { images: [imageUrl] }),
 },
 };
}

export default function CourseDetailPage() {
 return <CourseDetailClient />;
}
