"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, FileText, Link as LinkIcon, DownloadCloud, 
  Layers, CheckCircle2, PlayCircle, Loader2, BookOpen,
  ChevronRight, Share2, Info, Star, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';

export default function MyEProductDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await apiFetch(`/my-e-products/${slug}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();

        if (res.ok && json.success) {
          setProduct(json.data);
          if (json.data.materials && json.data.materials.length > 0) {
            setActiveMaterial(json.data.materials[0]);
          }
        } else {
          toast.error(json.message || 'Akses ditolak.');
          router.push('/my-e-products');
        }
      } catch (error) {
        toast.error('Gagal memuat ruang kelas.');
        router.push('/my-e-products');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [slug]);

  // 🔥 Fungsi Download Force via API Laravel 🔥
  const handleDownload = async () => {
    if (!activeMaterial) return;

    if (activeMaterial.type === 'link') {
      window.open(activeMaterial.link_url || activeMaterial.link, '_blank');
    } else {
      const tid = toast.loading("Menyiapkan file unduhan...");
      try {
        const res = await apiFetch(`/my-e-products/materials/${activeMaterial.id}/download`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal mengunduh file.");
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const ext = activeMaterial.file_path.split('.').pop();
        const safeTitle = activeMaterial.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.setAttribute('download', `Amania_${safeTitle}.${ext}`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("File berhasil diunduh ke perangkat!", { id: tid });
      } catch (error: any) {
        toast.error(error.message || "Gagal mengunduh file.", { id: tid });
      }
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center w-full">
      <div className="relative">
        <Loader2 size={56} className="animate-spin text-amber-600" />
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
        </motion.div>
      </div>
      <h2 className="text-slate-400 font-bold tracking-[0.2em] uppercase text-[10px] mt-6 animate-pulse">
        Membuka Brankas Digital...
      </h2>
    </div>
  );

  if (!product) return null;

  const activeIndex = product.materials?.findIndex((m: any) => m.id === activeMaterial?.id) ?? 0;

  return (
    <div className="max-w-[1600px] mx-auto w-full relative z-10 animate-in fade-in duration-700 pb-20">
      
      {/* ════ BACKGROUND GLOW ════ */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply"></div>
      
      {/* ════ 1. TOP NAVIGATION BAR ════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/my-e-products" className="group flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-900 border border-slate-200 rounded-xl transition-all duration-300 shadow-sm">
            <ArrowLeft size={18} className="text-slate-400 group-hover:text-white transition-colors" />
            <span className="text-sm font-bold text-slate-600 group-hover:text-white">Koleksi Saya</span>
          </Link>
          <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>
          <div className="min-w-0">
             <h1 className="text-lg md:text-xl font-black text-slate-900 truncate tracking-tight">{product.title}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3 self-end md:self-auto">
           <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">Akses Permanen</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ════ 2. MAIN CONTENT AREA (LEFT) ════ */}
        <div className="flex-1 w-full min-w-0">
          <AnimatePresence mode="wait">
            {activeMaterial ? (
              <motion.div 
                key={activeMaterial.id}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
              >
                {/* 2A. HEADER MATERI (Banner Style) */}
                <div className="relative w-full bg-slate-900 overflow-hidden pt-12 pb-12 px-6 md:px-12">
                   {/* Background Elements */}
                   <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/15 to-transparent opacity-50"></div>
                   <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-600/20 rounded-full blur-[80px]"></div>

                   <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                      {/* Product Cover Mini inside Viewer */}
                      <div className="w-32 h-44 md:w-40 md:h-56 shrink-0 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-2 border-white/10 group relative">
                         <img 
                          src={`${STORAGE_URL}/${product.cover_image}`} 
                          alt="cover" 
                          className="w-full h-full object-cover"
                         />
                         {/* 3D Book Spine */}
                         <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-white/30 to-transparent z-10" />
                      </div>

                      <div className="text-center md:text-left flex-1 min-w-0">
                         <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-lg border border-amber-500/20 mb-4">
                            {activeMaterial.type === 'link' ? <LinkIcon size={14}/> : <FileText size={14}/>}
                            <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Sedang Dipelajari</span>
                         </div>
                         <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-4 tracking-tight">
                            {activeMaterial.title}
                         </h2>
                         <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                               <Award size={14} className="text-amber-500" />
                               <span>Materi Eksklusif Amania</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                               <Star size={14} className="text-amber-400 fill-amber-400" />
                               <span>Premium Quality</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 2B. CONTENT ACTION CARD */}
                <div className="p-8 md:p-16 flex flex-col items-center justify-center text-center">
                   <div className="max-w-xl w-full">
                      <div className="w-16 h-1 bg-amber-100 rounded-full mx-auto mb-10"></div>
                      
                      {/* NAMA MATERI DITAMPILKAN DI SINI */}
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl mb-4 border border-amber-100">
                         <Layers size={16} />
                         <span className="text-xs md:text-sm font-black uppercase tracking-widest">
                           Materi {activeIndex + 1}
                         </span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 leading-tight">
                        {activeMaterial.title}
                      </h3>
                      
                      <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-10">
                        {activeMaterial.type === 'link' 
                          ? "Materi ini tersedia melalui tautan eksternal terverifikasi. Klik tombol di bawah untuk diarahkan ke ruang penyimpanan atau video pembelajaran secara aman."
                          : "File materi telah dioptimasi untuk perangkat Anda. Klik tombol di bawah untuk menyimpannya langsung ke memori Anda tanpa membukanya di browser."
                        }
                      </p>

                      <button 
                        onClick={handleDownload}
                        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-4 px-10 py-5 bg-slate-900 hover:bg-amber-600 text-white rounded-2xl font-black text-sm md:text-base transition-all duration-500 shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_35px_rgba(245,158,11,0.3)] active:scale-95 overflow-hidden"
                      >
                         <div className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
                         {activeMaterial.type === 'link' ? <PlayCircle size={22}/> : <DownloadCloud size={22}/>}
                         <span>{activeMaterial.type === 'link' ? "Buka Akses Tautan" : "Download File Sekarang"}</span>
                         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Security Trust Badge */}
                      <div className="mt-12 flex items-center justify-center gap-6 border-t border-slate-50 pt-8">
                         <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                               <Info size={14}/>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Aman</span>
                         </div>
                         <div className="flex flex-col items-center gap-1">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                               <Share2 size={14}/>
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Resmi</span>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-center shadow-sm">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <BookOpen size={40} className="text-slate-300" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900">Kurikulum Belum Tersedia</h3>
                 <p className="text-slate-500 mt-2 max-w-sm">Mohon maaf, admin belum mengunggah materi untuk produk ini. Silakan hubungi dukungan Amania.</p>
              </div>
            )}
          </AnimatePresence>

          {/* Copyright Info */}
          <div className="mt-8 p-5 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-4">
             <div className="shrink-0 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <Award size={18} />
             </div>
             <div>
                <p className="text-xs font-bold text-amber-900 mb-1">Hak Cipta Terlindungi</p>
                <p className="text-[10px] md:text-xs text-amber-800/70 leading-relaxed">
                   Setiap materi yang Anda akses merupakan hak milik intelektual Amania dan Kreator. Tindakan penggandaan atau penyebaran secara ilegal akan ditindaklanjuti secara hukum.
                </p>
             </div>
          </div>
        </div>

        {/* ════ 3. SIDEBAR KURIKULUM (RIGHT) ════ */}
        <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:sticky lg:top-24">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">
             
             {/* Sidebar Header with Cover */}
             <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col gap-4">
                 <div className="flex gap-4 items-center">
                   <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden shadow-md border border-white relative">
                     <img src={`${STORAGE_URL}/${product.cover_image}`} alt="cover" className="w-full h-full object-cover" />
                     <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/40 to-transparent z-10" />
                   </div>
                   <div>
                     <h3 className="font-black text-slate-900 text-sm leading-tight mb-1">Daftar Isi Materi</h3>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Layers size={12} className="text-amber-500" /> {product.materials?.length || 0} Konten Tersedia
                     </p>
                   </div>
                 </div>
             </div>

             {/* Playlist List */}
             <div className="p-3 max-h-[500px] md:max-h-[600px] overflow-y-auto custom-scrollbar space-y-2">
                {product.materials?.map((mat: any, index: number) => {
                  const isActive = activeMaterial?.id === mat.id;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setActiveMaterial(mat)}
                      className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 border ${
                        isActive 
                          ? 'bg-gradient-to-r from-orange-600 to-amber-700 border-amber-800 shadow-[0_10px_20px_rgba(245,158,11,0.2)] text-white' 
                          : 'bg-white border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`mt-0.5 shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                        isActive ? 'bg-white/20 border-white/20 text-white' : 'bg-slate-100 border-slate-100 text-slate-400'
                      }`}>
                        {mat.type === 'link' ? <LinkIcon size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <span className={`text-[9px] font-black uppercase tracking-[0.1em] ${isActive ? 'text-amber-200' : 'text-slate-400'}`}>
                              Materi {index + 1}
                           </span>
                           {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>}
                        </div>
                        <p className={`text-xs md:text-sm font-bold leading-snug line-clamp-2 ${isActive ? 'text-white' : 'text-slate-700'}`}>
                          {mat.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
             </div>

             {/* Sidebar Footer Info */}
             <div className="p-5 bg-slate-50/80 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aset Digital • Member Amania</p>
             </div>
           </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}