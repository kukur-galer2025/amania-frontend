"use client";

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function ViewMateriContent() {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const [loading, setLoading] = useState(true);

  // Validasi URL (Cegah celah Open Redirect/Phishing)
  const isValidUrl = url && (
    url.startsWith(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') || 
    url.startsWith('https://api.amania.id')
  );

  if (!isValidUrl) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-medium text-sm md:text-base">
        Akses ditolak: Tautan materi tidak valid atau tidak diizinkan.
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-white relative">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
          <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
          <p className="text-slate-600 font-medium tracking-wide">Memuat materi interaktif...</p>
        </div>
      )}
      <iframe
        src={url}
        className="w-full h-full border-none relative z-20"
        onLoad={() => setLoading(false)}
        allowFullScreen
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export default function ViewMateriPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    }>
      <ViewMateriContent />
    </Suspense>
  );
}
