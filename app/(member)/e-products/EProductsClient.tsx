"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, PackageSearch, ChevronRight, ChevronLeft, Flame, Sparkles, BookOpen, ArrowRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru Rilis' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Harga Terendah' },
  { value: 'priciest',  label: 'Harga Tertinggi' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={12} 
          className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'} 
        />
      ))}
    </span>
  );
}

export default function EProductsClient() {
  const [products,    setProducts]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('newest');
  const [sortOpen,    setSortOpen]    = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all'|'free'|'paid'>('all');

  const sortRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  // Efek Paraks untuk Hero Section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    (async () => {
      try {
        // Ambil token dari localStorage jika user sudah login
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res  = await apiFetch('/e-products', { headers });
        const json = await res.json();
        if (res.ok && json.success) setProducts(json.data);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Ambil 6 buku rating tertinggi / terpopuler untuk Carousel
  const featuredProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (parseFloat(b.reviews_avg_rating) || 0) - (parseFloat(a.reviews_avg_rating) || 0))
      .slice(0, 6);
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (priceFilter === 'free') list = list.filter(p => p.price === 0);
    if (priceFilter === 'paid') list = list.filter(p => p.price > 0);
    
    if (sort === 'top_rated') list.sort((a,b) => (parseFloat(b.reviews_avg_rating)||0) - (parseFloat(a.reviews_avg_rating)||0));
    else if (sort === 'cheapest') list.sort((a,b) => a.price - b.price);
    else if (sort === 'priciest') list.sort((a,b) => b.price - a.price);
    else list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return list;
  }, [products, search, sort, priceFilter]);

  const formatRupiah = (price: number) =>
    price === 0 ? 'Gratis'
    : new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(price);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300; 
      carouselRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="font-sans bg-white min-h-screen pb-24 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* ════════ 1. HERO SECTION (IMERSIVE LIBRARY BACKGROUND) ════════ */}
      <section ref={heroRef} className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 border-b border-slate-800 bg-slate-950">
        
        {/* Gambar Latar Perpustakaan dengan Efek Paraks */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=cover"
            alt="Majestic Library"
            className="w-full h-full object-cover opacity-40"
          />
          {/* Overlay Gradien Gelap untuk Keterbacaan Teks */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-slate-950 z-10"></div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center text-center">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(79,70,229,0.2)]">
            <Sparkles size={14} className="text-amber-400" /> Pustaka Digital Premium Amania
          </motion.div>
          
          <motion.h1 style={{ y: textY }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-6xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8 max-w-5xl drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
            Pintu Menuju <br />
            Pengetahuan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Tanpa Batas.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-xl text-slate-200 font-medium max-w-3xl leading-relaxed mb-12 drop-shadow">
            Temukan ribuan koleksi eksklusif e-book, modul praktis, dan template profesional yang dirancang khusus oleh para ahli untuk mengakselerasi pertumbuhan karier dan bisnis Anda.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <button onClick={scrollToCatalog} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl font-bold text-lg transition-all shadow-[0_10px_30px_rgba(79,70,229,0.5)] hover:shadow-[0_15px_40px_rgba(79,70,229,0.7)] active:scale-95 flex items-center justify-center gap-2.5 group">
              <Search size={20} /> Mulai Eksplorasi <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link href="/events" className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-lg backdrop-blur-sm transition-all active:scale-95 flex items-center justify-center gap-2.5">
              <BookOpen size={20} /> Lihat Kelas Live
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ════════ 2. CAROUSEL BUKU TERPOPULER ════════ */}
      <section className="bg-slate-50 pt-10 pb-12 border-b border-slate-200 relative -mt-8 rounded-t-3xl z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Koleksi Terpopuler</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">E-Book & Modul pilihan dengan rating tertinggi minggu ini.</p>
            </div>
            
            <div className="hidden md:flex gap-2">
              <button onClick={() => scrollCarousel('left')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm">
                <ChevronLeft size={22} />
              </button>
              <button onClick={() => scrollCarousel('right')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors shadow-sm">
                <ChevronRight size={22} />
              </button>
            </div>
          </div>

          {!loading && featuredProducts.length > 0 ? (
            <div className="relative -mx-4 sm:mx-0">
              <div 
                ref={carouselRef}
                className="flex overflow-x-auto gap-4 md:gap-6 px-4 sm:px-0 pb-6 pt-2 snap-x snap-mandatory hide-scroll-bar scroll-smooth"
              >
                {featuredProducts.map((prod) => {
                  const isFree = prod.price === 0;
                  const avgRating = parseFloat(prod.reviews_avg_rating) || 0;
                  const isPurchased = prod.is_purchased === true;

                  return (
                    <Link key={`feat-${prod.id}`} href={`/e-products/${prod.slug}`} className="snap-start shrink-0 w-[140px] sm:w-[160px] md:w-[180px] group flex flex-col h-full">
                      
                      {/* 🔥 KUNCI MATI COVER BUKU (ANTI MELAR) 🔥 */}
                      <div 
                        className="relative w-full bg-slate-200 rounded-lg shadow-[0_8px_16px_rgba(0,0,0,0.08)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] group-hover:-translate-y-1.5 transition-all duration-300 overflow-hidden border border-slate-200/80 mb-3 block"
                        style={{ aspectRatio: '2 / 3' }}
                      >
                        {prod.cover_image ? (
                          <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${prod.cover_image}`} alt={prod.title} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <FileText size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                        {/* Badges Ovelays */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {isPurchased ? (
                            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <CheckCircle2 size={10} /> Dimiliki
                            </span>
                          ) : (
                            isFree && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">Gratis</span>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                      </div>

                      <div className="flex flex-col flex-1 px-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate mb-1" title={prod.author?.name}>
                          {prod.author?.name || 'Amania Official'}
                        </p>
                        <h3 className="text-sm md:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2" title={prod.title}>
                          {prod.title}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                          {isPurchased ? (
                            <p className="text-sm md:text-base font-black tracking-tight text-indigo-600">Akses Buka</p>
                          ) : (
                            <p className={`text-sm md:text-base font-black tracking-tight ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>{formatRupiah(prod.price)}</p>
                          )}
                          {avgRating > 0 && (
                            <div className="flex items-center gap-0.5">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-bold text-slate-700">{avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </Link>
                  );
                })}
                <div className="shrink-0 w-2 sm:w-4 snap-end"></div>
              </div>
            </div>
          ) : (
             <div className="flex gap-4 overflow-hidden px-4 sm:px-0 pt-2 pb-6">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className="shrink-0 w-[140px] sm:w-[160px] md:w-[180px] bg-slate-200 rounded-lg animate-pulse" style={{ aspectRatio: '2 / 3' }}></div>
               ))}
             </div>
          )}
        </div>
      </section>

      {/* ════════ 3. TOOLBAR PENCARIAN & FILTER ════════ */}
      <div id="katalog-section" className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm pt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <div className="relative w-full md:w-[350px] lg:w-[400px] shrink-0">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none text-sm font-medium text-slate-900 placeholder:text-slate-500"
                placeholder="Cari judul buku, modul, atau penulis..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto hide-scroll-bar pb-1 md:pb-0">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
                {[
                  { val: 'all',  label: 'Semua',    icon: <SlidersHorizontal size={14} /> },
                  { val: 'free', label: 'Gratis',   icon: <Gift size={14} /> },
                  { val: 'paid', label: 'Premium',  icon: <Tag size={14} /> },
                ].map(({ val, label, icon }) => (
                  <button key={val} onClick={() => setPriceFilter(val as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${priceFilter === val ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900 border border-transparent'}`}>
                    {icon} <span className="hidden sm:block">{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative shrink-0" ref={sortRef}>
                <button onClick={() => setSortOpen(o => !o)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <span className="hidden sm:inline">Urutkan:</span> {currentSort.label} <ChevronDown size={14} className={`text-slate-400 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -5 }} transition={{ duration: 0.15 }} className="absolute right-0 top-[calc(100%+8px)] w-48 bg-white border border-slate-200 rounded-lg shadow-xl p-1.5 z-50 origin-top-right">
                      {SORT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${sort === o.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
                          {o.label} {sort === o.value && <Check size={14} strokeWidth={2.5} className="text-indigo-600" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ════════ 4. GRID SEMUA KATALOG BUKU ════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Semua Koleksi</h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{filtered.length} Publikasi</span>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
            <PackageSearch size={48} className="text-slate-300 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Buku Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 font-medium">Coba gunakan kata kunci lain atau ubah filter pencarian Anda.</p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
            <AnimatePresence mode="popLayout">
              {filtered.map(product => {
                const isFree    = product.price === 0;
                const avgRating = parseFloat(product.reviews_avg_rating) || 0;
                const isHot     = avgRating >= 4.5 && (product.reviews_count || 0) >= 1;
                const isPurchased = product.is_purchased === true;
                
                return (
                  <motion.div key={product.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                    <Link href={`/e-products/${product.slug}`} className="group flex flex-col h-full">
                      
                      {/* 🔥 KUNCI MATI COVER BUKU BAWAH (NATIVE CSS ASPECT RATIO) 🔥 */}
                      <div className="relative w-full bg-slate-100 rounded-lg shadow-sm border border-slate-200/80 group-hover:shadow-[0_8px_16px_rgba(0,0,0,0.1)] group-hover:-translate-y-1.5 transition-all duration-300 overflow-hidden mb-3 block" style={{ aspectRatio: '2 / 3' }}>
                        {product.cover_image ? (
                          <img src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.cover_image}`} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-300"><FileText size={40} strokeWidth={1} /></div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>

                        {/* Badges Overlays */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          {isPurchased ? (
                            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <CheckCircle2 size={10} /> Dimiliki
                            </span>
                          ) : (
                            <>
                              {isFree && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm">Gratis</span>}
                              {isHot && !isFree && <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1"><Flame size={10} /> Hot</span>}
                            </>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"></div>
                      </div>

                      <div className="flex flex-col flex-1 px-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate mb-1" title={product.author?.name}>{product.author?.name || 'Amania Official'}</p>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2" title={product.title}>{product.title}</h3>
                        <div className="mt-auto flex items-end justify-between gap-2">
                          {isPurchased ? (
                            <p className="text-[15px] font-black tracking-tight text-indigo-600">Akses Buka</p>
                          ) : (
                            <p className={`text-[15px] font-black tracking-tight ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>{formatRupiah(product.price)}</p>
                          )}
                          
                          {avgRating > 0 && (
                            <div className="flex items-center gap-0.5 shrink-0">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-bold text-slate-700">{avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

      </div>

      <style jsx global>{`
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}