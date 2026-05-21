"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect ke halaman learn baru di (learn) route group
export default function LearnRedirect() {
 const params = useParams();
 const router = useRouter();
 const slug = params.slug as string;

 useEffect(() => {
 router.replace(`/learn/${slug}`);
 }, [slug, router]);

 return (
 <div className="min-h-[60vh] flex items-center justify-center">
 <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Redirecting...</p>
 </div>
 );
}
