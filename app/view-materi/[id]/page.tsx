"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import { safeStorage } from '@/app/utils/safeStorage';
import { useParams } from 'next/navigation';

export default function ViewMateriIdPage() {
  const params = useParams();
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        if (!id) return;
        
        const token = safeStorage.getItem('token');
        if (!token) {
          throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
        }

        const res = await apiFetch(`/my-e-products/materials/${id}/download-url`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Gagal mendapatkan tautan materi.");
        }

        const data = await res.json();
        if (data.success && data.url) {
          setUrl(data.url);
        } else {
          throw new Error("Tautan materi tidak tersedia.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat materi.");
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [id]);

  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-500 font-medium text-sm md:text-base px-6 text-center">
        Akses ditolak: {error}
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
      {url && (
        <iframe
          src={url}
          className="w-full h-full border-none relative z-20"
          onLoad={() => setLoading(false)}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
        />
      )}
    </div>
  );
}
