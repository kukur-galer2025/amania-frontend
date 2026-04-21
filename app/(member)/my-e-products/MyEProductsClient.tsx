"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, DownloadCloud, Search, ArrowRight, PlaySquare, LayoutTemplate, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

export default function MyEProductsClient() {
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

  const handleAccessProduct = (filePath: string) => {
    if (!filePath) {
      toast.error('File materi belum tersedia. Silakan hubungi admin.');
      return;
    }
    if (filePath.startsWith('http')) {
      window.open(filePath, '_blank');
    } else {
      window.open(`${STORAGE_URL}/${filePath}`, '_blank');
    }
  };

  const getProductBadge = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('video') || t.includes('rekaman')) return { icon: <PlaySquare size={12} />, label: 'Video Course', color: 'text-rose-600 bg-rose-50 border-rose-100' };
    if (t.includes('template') || t.includes('cv')) return { icon: <LayoutTemplate size={12} />, label: 'Template', color: 'text-amber-600 bg-amber-50 border-amber-100' };
    return { icon: <FileText size={12} />, label: 'E-Book', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
  };

  // 🔥 SKELETON LOADER (Mewah & Profesional) 🔥
  if (loading) {
    return (
      <div className="w-full relative z-10">
        <div className="mb-12 animate-pulse">
          <div className="h-10 w-64 bg-slate-200 rounded-lg mb-4"></div>
          <div className="h-5 w-96 bg-slate-200 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
              <div className="w-full aspect-[4/3] bg-slate-200 rounded-2xl mb-4"></div>
              <div className="px-3 pb-3">
                <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded-md mb-6"></div>
                <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-10">
      
      {/* BACKGROUND MESH GLOW (Memberi kesan premium) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[80px] -z-10 pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[80px] -z-10 pointer-events-none mix-blend-multiply"></div>

      {/* HEADER SECTION */}
      <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-4 shadow-sm">
            <Sparkles size={14} className="animate-pulse" /> Akses Eksklusif
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 tracking-tight mb-3">
            Koleksi Digital Anda
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
            Ruang kerja pintar Anda. Kelola dan akses seluruh modul, rekaman, dan template premium yang telah Anda miliki.
          </p>
        </div>
        
        {purchases.length > 0 && (
          <div className="shrink-0 flex items-center gap-2.5 text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-md border border-slate-200/60 px-5 py-2.5 rounded-2xl shadow-sm">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            {purchases.length} Aset Digital
          </div>
        )}
      </div>

      {/* EMPTY STATE - Dash Border & Floating Icon */}
      {purchases.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
          className="relative bg-white/50 backdrop-blur-xl border-2 border-dashed border-slate-300 hover:border-indigo-300 rounded-[2rem] p-12 md:p-24 flex flex-col items-center justify-center text-center transition-colors group">
          
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50/30 rounded-[2rem] -z-10"></div>
          
          <div className="w-24 h-24 bg-white text-indigo-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/10 group-hover:-translate-y-2 transition-transform duration-500 border border-slate-100 relative">
             <Search size={36} strokeWidth={1.5} />
             <div className="absolute -top-3 -right-3 bg-rose-500 text-white p-1.5 rounded-xl shadow-lg transform rotate-12">
               <Sparkles size={16} />
             </div>
          </div>
          
          <h3 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Belum Ada Aset Digital</h3>
          <p className="text-slate-500 mb-10 max-w-lg text-sm md:text-base leading-relaxed font-medium">
            Koleksi Anda masih kosong. Investasikan waktu Anda dengan mempelajari materi eksklusif dari katalog premium kami.
          </p>
          <Link href="/e-products" className="px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-indigo-600/30 active:scale-95 flex items-center gap-2.5">
            Eksplorasi Katalog <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        /* GRID PRODUK - Bento Widget Style */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {purchases.map((purchase, index) => {
            const product = purchase.product;
            if (!product) return null;
            
            const badge = getProductBadge(product.title);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                key={purchase.id} 
                className="group bg-white p-2 rounded-[1.5rem] border border-slate-200/80 hover:border-indigo-200 flex flex-col hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
              >
                {/* IMAGE AREA (Inner Padding Style) */}
                <div className="w-full aspect-[4/3] bg-slate-100 relative rounded-2xl overflow-hidden mb-4">
                  {product.cover_image ? (
                    <img 
                      src={`${STORAGE_URL}/${product.cover_image}`} 
                      alt={product.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                      <FileText size={36} strokeWidth={1} />
                    </div>
                  )}

                  {/* Gradient Overlay for Text Contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80"></div>

                  {/* Status Lunas (Top Right) */}
                  <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 border border-white/20">
                    <CheckCircle2 size={10} /> Lunas
                  </div>

                  {/* Category Badge (Bottom Left, on image) */}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wide flex items-center gap-1.5 border border-white/30 shadow-lg">
                      {badge.icon} {badge.label}
                    </span>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="px-3 pb-3 flex flex-col flex-1">
                  <h3 className="font-extrabold text-slate-900 text-[15px] leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-5">
                    <span className="text-[11px] font-semibold text-slate-500">
                      By {product.author?.name || 'Amania Official'}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={10} /> {new Date(purchase.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    <button 
                      onClick={() => handleAccessProduct(product.file_path)}
                      className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-indigo-500/30 active:scale-95 group/btn"
                    >
                      Buka Materi <ArrowRight size={14} className="text-slate-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}