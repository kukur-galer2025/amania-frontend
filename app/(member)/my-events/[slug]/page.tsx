// Di file: app/my-events/[slug]/page.tsx
import React, { use } from 'react';
import MyEventDetailClient from './MyEventDetailClient';

export default function MyEventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // 🔥 SOLUSI BUG MUTER-MUTER: Gunakan React.use() untuk mengambil slug
  const resolvedParams = use(params);
  return <MyEventDetailClient slug={resolvedParams.slug} />;
}