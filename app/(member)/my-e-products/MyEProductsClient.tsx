"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, ArrowRight, PlaySquare, 
  LayoutTemplate, CheckCircle2, Sparkles, Clock, Layers, ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

export default function MyEProductsClient() {
  const router = useRouter(); 
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const res = await apiFetch('/my-e-products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();
        
        if (res.ok && json.success) {
          setPurchases(json.data);
        } else {
          toast.error('Gagal mengambil data produk.');
        }
      } catch (error) {
        toast.error('Terjadi kesalahan jaringan.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  const getProductBadge = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('video') || t.includes('rekaman')) return { icon: <PlaySquare size={12} />, label: 'Video Course', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (t.includes('template') || t.includes('cv')) return { icon: <LayoutTemplate size={12} />, label: 'Template', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { icon: <FileText size={12} />, label: 'E-Book', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
  };

  if (loading) {
    return (
      <div className="w-full relative z-10">
        <div className="mb-12 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-4"></div>
          <div className="h-5 w-96 bg-slate-200 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 md:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-3 md:p-4 rounded-[1.5rem] border border-slate-100 shadow-sm animate-pulse flex flex-row items-stretch w-full">
              <div className="rounded-[1rem] bg-slate-100 w-[100px] sm:w-[130px] min-h-[160px] shrink-0" />
              <div className="flex flex-col flex-1 pl-4 py-2 min-w-0">
                <div className="h-3 bg-slate-200 rounded-full w-1/3 mb-3" />
                <div className="h-4 bg-slate-200 rounded-full w-full mb-2" />
                <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-4" />
                <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <div className="h-10 bg-slate-200 rounded-xl w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-10 pb-20">
      
      {/* BACKGROUND MESH GLOW */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply"></div>

      {/* HEADER SECTION */}
      <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-5 shadow-sm">
            <Sparkles size={14} className="text-amber-500" /> Aset Premium
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            Koleksi Digital Anda
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed font-medium max-w-xl">
            Ruang belajar pintar Anda. Akses dan pelajari seluruh materi, e-book, serta template premium yang telah Anda miliki selamanya.
          </p>
        </div>
        
        {purchases.length > 0 && (
          <div className="shrink-0 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {purchases.length} Aset Terbuka
          </div>
        )}
      </div>

      {/* EMPTY STATE */}
      {purchases.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
          className="relative bg-white border-2 border-dashed border-slate-300 hover:border-amber-300 rounded-[2rem] p-12 md:p-24 flex flex-col items-center justify-center text-center transition-colors group shadow-sm">
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-50/30 rounded-[2rem] -z-10"></div>
          
          <div className="w-24 h-24 bg-slate-50 text-amber-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 border border-slate-100 relative">
             <Layers size={36} strokeWidth={2} />
             <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-2 rounded-xl shadow-lg transform rotate-12">
               <Sparkles size={16} />
             </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Koleksi Masih Kosong</h3>
          <p className="text-slate-500 mb-10 max-w-md text-sm md:text-base leading-relaxed font-medium">
            Mulai investasi pada karir Anda. Jelajahi dan kumpulkan berbagai materi eksklusif dari katalog Amania.
          </p>
          <Link href="/e-products" className="px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 text-white rounded-2xl text-sm font-black transition-all duration-300 shadow-lg shadow-amber-900/20 active:scale-95 flex items-center gap-2.5">
            Eksplorasi Katalog <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        /* GRID PRODUK (HORIZONTAL STYLE) */
        <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 md:gap-8">
          <AnimatePresence mode="popLayout">
            {purchases.map((purchase, index) => {
              const product = purchase.product;
              if (!product) return null;
              
              const badge = getProductBadge(product.title);

              return (
                <motion.div 
                  key={purchase.id} 
                  layout 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.05, 0.3) } }} 
                  exit={{ opacity: 0, scale: 0.95 }} 
                  className="relative group h-full"
                >
                  {/* GLOW EFFECT BACKGROUND */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500/0 via-amber-500/0 to-orange-400/0 group-hover:from-indigo-500/10 group-hover:via-amber-500/10 group-hover:to-orange-400/10 rounded-[2rem] blur-xl transition-all duration-700 ease-out z-0"></div>

                  <div className="relative z-10 flex flex-row items-stretch h-full w-full bg-white p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[1.75rem] border border-slate-100 shadow-sm group-hover:border-amber-200 transition-all duration-500 cursor-pointer overflow-hidden"
                       onClick={() => router.push(`/my-e-products/${product.slug}`)}>
                    
                    {/* --- LEFT: Cover Image with Adaptive Height --- */}
                    <div className="relative w-[100px] sm:w-[130px] min-h-[150px] shrink-0 rounded-[1rem] sm:rounded-[1.25rem] overflow-hidden bg-slate-900 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] group-hover:shadow-[8px_0_25px_-5px_rgba(245,158,11,0.25)] transition-shadow duration-500">
                      {product.cover_image ? (
                        <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                          <FileText size={32} />
                        </div>
                      )}
                      
                      {/* 3D Book Spine Effect */}
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-white/40 to-transparent mix-blend-overlay z-10 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/5 to-transparent opacity-60 transition-opacity duration-300 z-10" />

                      {/* Status Badges Overlays */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                          <CheckCircle2 size={10} strokeWidth={3} /> Lunas
                        </span>
                      </div>
                      
                      {/* Tipe Dokumen */}
                      <div className="absolute bottom-2 left-2 z-20">
                         <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                           {badge.icon} {badge.label}
                         </span>
                      </div>
                    </div>

                    {/* --- RIGHT: Konten & Aksi --- */}
                    <div className="flex flex-col flex-1 min-w-0 pl-3 sm:pl-5 py-0.5 justify-between relative h-full">
                      
                      {/* Arrow Hint */}
                      <div className="absolute top-1 right-1 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-amber-500 hidden sm:block">
                        <ChevronRight size={18} strokeWidth={2.5} />
                      </div>

                      <div>
                        {/* Kategori */}
                        <div className="flex items-center gap-2 mb-2 pr-6">
                           <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                             <p className="text-[9px] sm:text-[10px] text-amber-800 font-black uppercase tracking-widest truncate max-w-[100px]">{product.category?.name || 'Umum'}</p>
                           </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-[14px] sm:text-[16px] md:text-[17px] font-black text-slate-900 line-clamp-2 leading-[1.3] group-hover:text-orange-700 transition-colors mb-2 pr-4" title={product.title}>
                          {product.title}
                        </h3>

                        {/* Info Author & Tanggal (Mobile Stacked) */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-medium text-slate-500 mb-3 pr-2">
                           <span className="truncate">By <strong className="text-slate-700">{product.author?.name || 'Amania Official'}</strong></span>
                           <span className="hidden sm:inline-block w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                           <span className="flex items-center gap-1 shrink-0 text-slate-400">
                             <Clock size={10} className="shrink-0" /> 
                             {new Date(purchase.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                        </div>
                      </div>
                      
                      {/* --- Area Bawah (Tombol Buka) --- */}
                      <div className="mt-auto w-full pt-3 border-t border-slate-100">
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(`/my-e-products/${product.slug}`); }}
                          className="w-full py-2.5 rounded-xl font-black text-white text-[11px] sm:text-xs bg-gradient-to-r from-orange-600 to-amber-800 hover:from-orange-700 hover:to-amber-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-amber-900/20 group/btn"
                        >
                          <Layers size={14} className="shrink-0 group-hover/btn:rotate-12 transition-transform" /> 
                          <span>Akses Materi</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

    </div>
  );
}