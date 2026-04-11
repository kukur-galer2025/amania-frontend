"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ArrowRight, BookOpen, 
  FileQuestion, Clock, CheckCircle2, AlertCircle, Sparkles, Filter, Package, Flame
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

export default function KatalogClient() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: 'all', slug: 'all', name: 'Semua' }]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resTryout, resCat] = await Promise.all([
          apiFetch('/tryout/skd/katalog'),
          apiFetch('/tryout/skd/categories-list') 
        ]);
        
        const jsonTryout = await resTryout.json();
        const jsonCat = await resCat.json();
        
        if (jsonTryout.success) setTryouts(jsonTryout.data);
        if (jsonCat.success) {
          setCategories([{ id: 'all', slug: 'all', name: 'Semua' }, ...jsonCat.data]);
        }
      } catch (err) { 
        console.error("Gagal fetch data katalog:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const filtered = tryouts.filter(t => {
    const mSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const mCat = activeCategory === 'all' || t.skd_tryout_category_id?.toString() === activeCategory.toString();
    return mSearch && mCat;
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getCategoryTheme = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('cpns')) return 'bg-sky-50 text-sky-600 border-sky-100';
    if (s.includes('dinas')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s.includes('bumn')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  };

  return (
    <div className="w-full relative bg-[#F8FAFC] min-h-screen pb-24 selection:bg-indigo-500 selection:text-white">
      
      {/* Glow Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* HEADER HALAMAN */}
        <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-white shadow-xl shadow-indigo-100/50 text-indigo-600 mb-6 border border-indigo-50"
          >
            <Package size={32} strokeWidth={2.5} />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Katalog <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500">Pilihan Juara</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-500 font-medium text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto px-4">
            Investasikan waktu Anda pada materi terbaik. Setiap soal disusun berdasarkan update terbaru dan standar tingkat kesulitan seleksi nasional.
          </motion.p>
        </div>

        {/* FILTER & SEARCH BAR (Sticky) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
          className="flex flex-col md:flex-row gap-4 mb-12 sticky top-[64px] lg:top-[80px] z-30 bg-[#F8FAFC]/90 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0 border-b sm:border-none border-slate-200/50"
        >
          {/* Search Bar */}
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} strokeWidth={2.5} />
            <input 
              type="text" 
              placeholder="Cari simulasi tryout..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 hover:border-indigo-200 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none shadow-sm placeholder:text-slate-400"
            />
          </div>

          {/* Dinamis Tab Categories */}
          <div className="overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <div className="flex items-center gap-2 min-w-max bg-white p-2 rounded-2xl border-2 border-slate-200 shadow-sm">
              <div className="px-3 flex items-center justify-center text-slate-400 border-r border-slate-100 mr-1"><Filter size={18} strokeWidth={2.5} /></div>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id.toString())}
                  className={`px-5 md:px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    activeCategory === cat.id.toString()
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/30' 
                    : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* GRID KATALOG */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[420px] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8 flex flex-col">
                <div className="w-1/3 h-6 bg-slate-100 rounded-lg mb-6 animate-pulse" />
                <div className="w-full h-8 bg-slate-100 rounded-xl mb-4 animate-pulse" />
                <div className="w-2/3 h-8 bg-slate-100 rounded-xl mb-8 animate-pulse" />
                <div className="space-y-4 mb-auto">
                  <div className="w-full h-4 bg-slate-50 rounded-full animate-pulse" />
                  <div className="w-full h-4 bg-slate-50 rounded-full animate-pulse" />
                </div>
                <div className="mt-8 border-t border-slate-50 pt-6 flex justify-between items-center">
                  <div className="w-1/2 h-8 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence>
              {filtered.map((item, idx) => {
                const isDiscount = item.discount_price !== null && Number(item.discount_price) < Number(item.price);
                const activePrice = isDiscount ? item.discount_price : item.price;
                const isFree = Number(activePrice) === 0;
                
                return (
                  <motion.div 
                    layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: idx * 0.05 }}
                    key={item.id}
                    className="group bg-white rounded-[2.5rem] p-6 sm:p-8 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col relative"
                  >
                    {/* Badge HOTS */}
                    {item.is_hots && (
                      <div className="absolute -top-3 left-8 px-4 py-1.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg shadow-rose-500/30 transform group-hover:-translate-y-1 transition-transform z-10">
                        <Flame size={12} className="fill-white" /> Soal HOTS
                      </div>
                    )}

                    <div className="mb-6 flex justify-between items-start mt-2">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getCategoryTheme(item.category?.slug || '')}`}>
                        {item.category?.name || 'Umum'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                        <Clock size={14} /> {item.duration_minutes}m
                      </div>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-6 group-hover:text-indigo-600 transition-colors line-clamp-3">
                      {item.title}
                    </h3>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-600">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0"><FileQuestion size={18}/></div>
                        <span>{item.questions_count || 110} Soal Standar BKN</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-slate-600">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 size={18}/></div>
                        <span>Pemeringkatan Nasional</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        {isFree ? (
                          <p className="text-3xl font-black text-emerald-500 tracking-tight">GRATIS</p>
                        ) : (
                          <div className="flex flex-col">
                            {isDiscount && (
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-bold text-slate-400 line-through decoration-rose-400 decoration-2">
                                  {formatRupiah(item.price)}
                                </span>
                                <span className="bg-rose-100 text-rose-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">Diskon</span>
                              </div>
                            )}
                            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                              {formatRupiah(activePrice)}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        href={`/tryouts/katalog/${item.slug}`}
                        className="w-14 h-14 shrink-0 rounded-[18px] flex items-center justify-center bg-slate-900 hover:bg-indigo-600 text-white transition-all duration-300 shadow-xl active:scale-95 group-hover:rotate-[-5deg]"
                      >
                        <ArrowRight size={26} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 px-4">
            <AlertCircle size={48} className="text-slate-300 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Tidak Ada Tryout</h3>
            <p className="text-slate-500 font-medium text-sm sm:text-base max-w-sm mb-8">Maaf, simulasi yang Anda cari belum tersedia di kategori ini.</p>
            <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all flex items-center gap-2">
              <Search size={18} /> Tampilkan Semua Paket
            </button>
          </motion.div>
        )}

        {/* CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-24 relative overflow-hidden bg-slate-950 rounded-[3rem] text-white p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-10 max-w-6xl mx-auto"
        >
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none" />
          <div className="relative z-10 flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
              <Sparkles size={14} className="fill-amber-400" /> Akses Premium
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">Amankan NIP Anda <br className="hidden md:block"/>Sekarang Juga!</h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto md:mx-0">Berhenti membuang waktu. Dapatkan akses ke seluruh database soal simulasi kami dan rasakan atmosfir ujian sungguhan.</p>
          </div>
          <button className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center justify-center gap-3 shrink-0">
            Daftar Paket Bundling <ArrowRight size={18} />
          </button>
        </motion.div>

      </div>
    </div>
  );
}