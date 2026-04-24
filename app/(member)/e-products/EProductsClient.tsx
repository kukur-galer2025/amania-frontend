"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, PackageSearch, ChevronRight, ChevronLeft, Flame, Sparkles, BookOpen,
  ArrowRight, CheckCircle2, Crown, Library, LayoutGrid, Layers, User, FilterX,
  BookMarked, ShoppingBag, ShieldCheck, DownloadCloud, Award
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru Dirilis' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Harga Terendah' },
  { value: 'priciest',  label: 'Harga Tertinggi' },
];

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col h-full bg-white p-3 rounded-[1.5rem] border border-slate-100 shadow-sm">
    <div className="rounded-[1.25rem] bg-slate-100 mb-4 w-full" style={{ aspectRatio: '2/3' }} />
    <div className="h-2.5 bg-slate-200 rounded-full w-1/3 mb-2.5" />
    <div className="h-4 bg-slate-200 rounded-full w-full mb-1.5" />
    <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-4" />
    <div className="h-5 bg-slate-200 rounded-full w-1/2 mt-auto" />
  </div>
);

export default function EProductsClient() {
  const [products,         setProducts]         = useState<any[]>([]);
  const [categories,       setCategories]       = useState<string[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  
  const [priceFilter,      setPriceFilter]      = useState<'all' | 'free'>('all');
  const [sort,             setSort]             = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [catOpen,          setCatOpen]          = useState(false);
  const [sortOpen,         setSortOpen]         = useState(false);

  const catRef      = useRef<HTMLDivElement>(null);
  const sortRef     = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const storageUrl  = process.env.NEXT_PUBLIC_STORAGE_URL || '';

  /* ─── Fetch Data ─── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const h: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') h['Authorization'] = `Bearer ${token}`;

        const [pRes, cRes] = await Promise.all([
          apiFetch('/e-products', { headers: h }),
          apiFetch('/e-product-categories'),
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();

        if (pRes.ok && pJson.success)  setProducts(pJson.data ?? []);
        if (cRes.ok && cJson.success && Array.isArray(cJson.data)) {
          setCategories(['Semua', ...cJson.data.map((c: any) => String(c.name)).filter(Boolean)]);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ─── Close Dropdowns on Click Outside ─── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ─── Derived Data ─── */
  const featured = useMemo(() =>
    [...products]
      .sort((a, b) => (parseFloat(b.reviews_avg_rating) || 0) - (parseFloat(a.reviews_avg_rating) || 0))
      .slice(0, 8),
    [products]
  );

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    
    if (priceFilter === 'free') list = list.filter(p => p.price === 0);
    
    if (selectedCategory !== 'Semua') list = list.filter(p => p.category?.name === selectedCategory);
    
    if      (sort === 'top_rated') list.sort((a, b) => (parseFloat(b.reviews_avg_rating)||0) - (parseFloat(a.reviews_avg_rating)||0));
    else if (sort === 'cheapest')  list.sort((a, b) => a.price - b.price);
    else if (sort === 'priciest')  list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return list;
  }, [products, search, sort, priceFilter, selectedCategory]);

  const formatRupiah = (n: number) =>
    n === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;
  const hasFilters  = search !== '' || priceFilter !== 'all' || selectedCategory !== 'Semua' || sort !== 'newest';

  const clearAll = () => { setSearch(''); setPriceFilter('all'); setSelectedCategory('Semua'); setSort('newest'); };

  const scrollCarousel = (dir: 'left' | 'right') =>
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -350 : 350, behavior: 'smooth' });

  const scrollToCatalog = () => {
    document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-slate-900 w-full flex flex-col relative overflow-x-hidden">
      
      {/* ══════════ 1. LUXURY HERO SECTION ══════════ */}
      <section className="relative w-full bg-[#0a0f1c] overflow-hidden rounded-b-[3rem] md:rounded-b-[4rem] shadow-2xl border-b border-indigo-900/50 pb-16 pt-10 md:pt-16 md:pb-24">
        
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity" 
            alt="Premium Library Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/90 via-[#0a0f1c]/80 to-[#0a0f1c]"></div>
          {/* Subtle Glowing Orbs */}
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
              <Crown size={14} className="text-amber-400" /> Edisi Premium
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] mb-6">
              Tingkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500">Skill Digital</span><br className="hidden md:block"/> Anda Hari Ini.
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-sm md:text-base font-medium max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Dapatkan akses eksklusif ke koleksi e-book, modul pembelajaran, dan template berkualitas industri yang disusun oleh para ahli Amania.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={scrollToCatalog} className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-black transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.5)] active:scale-95 shrink-0">
                <Search size={18} /> Eksplorasi Katalog
              </button>
              <Link href="/events" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold backdrop-blur-md transition-all active:scale-95 shrink-0">
                <BookOpen size={18} className="text-indigo-300" /> Lihat Kelas Live
              </Link>
            </motion.div>
          </div>

          {/* Stats Glass Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="w-full lg:w-5/12 grid grid-cols-2 gap-4">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-3 text-indigo-400">
                  <BookMarked size={24} />
               </div>
               <h3 className="text-4xl font-black text-white mb-1">{loading ? '-' : products.length}</h3>
               <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Total Produk</p>
             </div>
             
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-3 text-emerald-400">
                  <Gift size={24} />
               </div>
               <h3 className="text-4xl font-black text-white mb-1">{loading ? '-' : products.filter(p=>p.price===0).length}</h3>
               <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Akses Gratis</p>
             </div>

             <div className="col-span-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 flex items-center justify-center gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30">
                  <Award size={28} />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black text-white mb-1">{loading ? '-' : categories.length - 1} Topik Belajar</h3>
                  <p className="text-xs font-medium text-amber-200/80">Kategori materi terstruktur.</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges (Di bawah Hero) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
         <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 md:p-6 flex flex-wrap md:flex-nowrap items-center justify-center md:justify-between gap-6">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><DownloadCloud size={20}/></div>
              <div className="text-left"><p className="text-sm font-black text-slate-900">Akses Instan</p><p className="text-[10px] text-slate-500 font-medium">Bisa langsung diunduh</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><ShieldCheck size={20}/></div>
              <div className="text-left"><p className="text-sm font-black text-slate-900">Kualitas Terjamin</p><p className="text-[10px] text-slate-500 font-medium">Original & Legal</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><Star size={20}/></div>
              <div className="text-left"><p className="text-sm font-black text-slate-900">Rating Tinggi</p><p className="text-[10px] text-slate-500 font-medium">Diulas oleh komunitas</p></div>
            </div>
         </div>
      </div>

      {/* ══════════ 2. CAROUSEL TERPOPULER ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 w-full shrink-0">
        <div className="flex items-end justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <Flame size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 leading-none">Sedang Hangat</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium mt-2">Koleksi terpopuler incaran pengguna Amania.</p>
            </div>
          </div>
          <div className="flex gap-2">
            {(['left', 'right'] as const).map(dir => (
              <button key={dir} onClick={() => scrollCarousel(dir)} className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm active:scale-95">
                {dir === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[...Array(6)].map((_, i) => <div key={i} className="shrink-0 w-[160px] md:w-[200px]"><SkeletonCard /></div>)}
          </div>
        ) : (
          <div ref={carouselRef} className="flex gap-5 md:gap-6 overflow-x-auto pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar snap-x snap-mandatory scroll-smooth">
            {featured.map(prod => {
              const free  = prod.price === 0;
              const avg   = parseFloat(prod.reviews_avg_rating) || 0;
              const owned = prod.is_purchased === true;
              
              return (
                <Link key={`feat-${prod.id}`} href={`/e-products/${prod.slug}`} className="snap-start shrink-0 w-[160px] sm:w-[180px] md:w-[220px] group flex flex-col h-full bg-white p-3 md:p-4 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.1)] hover:-translate-y-2 transition-all duration-300">
                  <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-slate-100 mb-4" style={{ aspectRatio: '2/3' }}>
                    {prod.cover_image
                      ? <img src={`${storageUrl}/${prod.cover_image}`} alt={prod.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      : <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50"><FileText size={32} strokeWidth={1} /></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                      {owned ? (
                        <span className="flex items-center gap-1.5 bg-indigo-600/95 backdrop-blur-sm text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-sm"><CheckCircle2 size={12} /> Dimiliki</span>
                      ) : free ? (
                        <span className="flex items-center gap-1.5 bg-emerald-500/95 backdrop-blur-sm text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-sm"><Gift size={12} /> Gratis</span>
                      ) : (
                        <span className="flex items-center gap-1.5 bg-amber-400/95 backdrop-blur-sm text-amber-950 text-[10px] font-black uppercase px-3 py-1 rounded-lg shadow-sm"><ShoppingBag size={12} /> Premium</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[9px] md:text-[10px] text-indigo-500 font-bold uppercase tracking-wider truncate bg-indigo-50 px-2 py-0.5 rounded-md w-fit" title={prod.category?.name}>{prod.category?.name || 'Umum'}</p>
                       {avg > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star size={12} className="fill-amber-500" /> <span className="text-[11px] font-black">{avg.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-3" title={prod.title}>{prod.title}</h3>
                    <p className={`text-[15px] md:text-lg font-black mt-auto pt-3 border-t border-slate-100 ${owned ? 'text-indigo-600' : free ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {owned ? 'Akses Buka' : formatRupiah(prod.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
            <div className="shrink-0 w-2 sm:w-4 snap-end"></div>
          </div>
        )}
      </section>

      {/* ══════════ 3. STICKY FILTER TOOLBAR (DASHBOARD STYLE) ══════════ */}
      <div id="katalog-section" className="sticky top-[60px] md:top-[64px] z-[40] bg-white/95 backdrop-blur-xl border-y border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.06)] w-full py-4 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Luxury Search Input */}
            <div className="relative w-full md:max-w-md shrink-0">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Mau belajar apa hari ini?..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-10 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
              />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 bg-slate-200 hover:bg-rose-100 p-1.5 rounded-full transition-colors">
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
              
              {/* Filter Harga */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-[1rem] shrink-0 border border-slate-200/80 shadow-inner">
                {[
                  { val: 'all',  label: 'Semua',  Icon: LayoutGrid },
                  { val: 'free', label: 'Gratis', Icon: Gift },
                ].map(({ val, label, Icon }) => (
                  <button
                    key={val} onClick={() => setPriceFilter(val as any)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${priceFilter === val ? 'bg-white text-indigo-700 shadow-md border border-slate-200/50' : 'text-slate-500 hover:text-slate-800 border border-transparent'}`}
                  >
                    <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>

              {/* Kategori Dropdown */}
              {!loading && categories.length > 1 && (
                <div className="relative shrink-0" ref={catRef}>
                  <button
                    onClick={() => { setCatOpen(o => !o); setSortOpen(false); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[1rem] text-xs font-bold border transition-all shadow-sm whitespace-nowrap ${selectedCategory !== 'Semua' ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-500/10' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    <Layers size={16} className={selectedCategory !== 'Semua' ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className="hidden sm:inline">Topik:</span> 
                    <span className="truncate max-w-[120px]">{selectedCategory}</span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {catOpen && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute left-0 md:right-0 md:left-auto top-[calc(100%+8px)] w-64 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl overflow-hidden z-50 origin-top-left md:origin-top-right">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                          <Tag size={14} className="text-indigo-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Pilih Topik Belajar</span>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar flex flex-col gap-1">
                          {categories.map(cat => (
                            <button key={cat} onClick={() => { setSelectedCategory(cat); setCatOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors text-left ${selectedCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}>
                              <span className="truncate">{cat}</span>
                              {selectedCategory === cat && <Check size={16} strokeWidth={3} className="text-white shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Sort Dropdown */}
              <div className="relative shrink-0" ref={sortRef}>
                <button
                  onClick={() => { setSortOpen(o => !o); setCatOpen(false); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[1rem] text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap"
                >
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <span className="hidden sm:inline">Urutkan:</span>
                  <span>{currentSort.label}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {sortOpen && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white border border-slate-200 rounded-[1.5rem] shadow-2xl p-2 z-50 origin-top-right">
                      {SORT_OPTIONS.map(o => (
                        <button key={o.value} onClick={() => { setSort(o.value); setSortOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-colors ${sort === o.value ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}>
                          {o.label}
                          {sort === o.value && <Check size={16} strokeWidth={3} className="text-white shrink-0" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Active Filters Pills */}
          <AnimatePresence>
            {hasFilters && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex flex-wrap items-center gap-2 overflow-hidden border-t border-slate-100 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-2">Filter Aktif:</span>
                
                {selectedCategory !== 'Semua' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 shadow-sm shrink-0">
                    <Tag size={12} className="opacity-70" /> {selectedCategory}
                    <button onClick={() => setSelectedCategory('Semua')} className="hover:bg-indigo-200 p-0.5 rounded-sm transition-colors ml-1"><X size={14} /></button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-sm shrink-0">
                    <Gift size={12} className="opacity-70" /> Gratis
                    <button onClick={() => setPriceFilter('all')} className="hover:bg-emerald-200 p-0.5 rounded-sm transition-colors ml-1"><X size={14} /></button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm shrink-0">
                    <SlidersHorizontal size={12} className="opacity-70" /> {currentSort.label}
                    <button onClick={() => setSort('newest')} className="hover:bg-slate-200 p-0.5 rounded-sm transition-colors ml-1"><X size={14} /></button>
                  </span>
                )}
                <button onClick={clearAll} className="inline-flex items-center gap-1.5 ml-2 text-[11px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all shrink-0 shadow-sm">
                  <FilterX size={14} /> Reset Semua Filter
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ══════════ 4. GRID KATALOG UTAMA ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full flex-1">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-inner border border-indigo-200">
              <Library size={28} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-none mb-2">Jelajahi Pustaka</h2>
              <p className="text-xs md:text-sm text-slate-500 font-medium">Koleksi digital terbaik untuk akselerasi karir Anda.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 w-fit">
            <PackageSearch size={16} className="text-slate-400" />
            <span className="text-xs font-black text-slate-700">
              {loading ? 'Menghitung...' : `${filtered.length} Publikasi Ditemukan`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-300 shadow-sm">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
              <PackageSearch size={48} className="text-slate-300" strokeWidth={1} />
            </div>
            <p className="text-2xl font-black text-slate-800 mb-2">Pencarian Tidak Ditemukan</p>
            <p className="text-base text-slate-500 max-w-md mb-8">Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter dan kata kunci Anda.</p>
            <button onClick={clearAll} className="px-8 py-3.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
              Bersihkan Filter
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => {
                const free  = p.price === 0;
                const avg   = parseFloat(p.reviews_avg_rating) || 0;
                const isHot = avg >= 4.5 && (p.reviews_count || 0) >= 1;
                const owned = p.is_purchased === true;

                return (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.02, 0.2) } }} exit={{ opacity: 0, scale: 0.94 }}>
                    <Link href={`/e-products/${p.slug}`} className="group flex flex-col h-full w-full bg-white p-3 md:p-4 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.12)] hover:-translate-y-2 transition-all duration-300">

                      {/* Cover Buku */}
                      <div className="relative w-full rounded-[1.5rem] overflow-hidden bg-slate-100 mb-4" style={{ aspectRatio: '2/3' }}>
                        {p.cover_image
                          ? <img src={`${storageUrl}/${p.cover_image}`} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          : <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50"><FileText size={48} strokeWidth={1} /></div>
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Badges Overlays */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                          {owned ? (
                            <span className="flex items-center gap-1.5 bg-indigo-600/95 backdrop-blur-sm text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm">
                              <CheckCircle2 size={12} /> Dimiliki
                            </span>
                          ) : free ? (
                            <span className="flex items-center gap-1.5 bg-emerald-500/95 backdrop-blur-sm text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm">
                              <Gift size={12} /> Gratis
                            </span>
                          ) : isHot ? (
                            <span className="flex items-center gap-1.5 bg-amber-400/95 backdrop-blur-sm text-amber-950 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-sm">
                              <Flame size={12} /> Hot
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Info Buku */}
                      <div className="flex flex-col flex-1 px-1">
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest truncate bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg w-fit" title={p.category?.name}>{p.category?.name || 'Umum'}</p>
                           {avg > 0 && (
                            <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                              <Star size={12} className="fill-amber-500" /> <span className="text-[11px] font-black text-amber-700">{avg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-4" title={p.title}>
                          {p.title}
                        </h3>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Investasi</span>
                             <p className={`text-lg font-black tracking-tight ${owned ? 'text-indigo-600' : free ? 'text-emerald-600' : 'text-slate-900'}`}>
                               {owned ? 'Akses Buka' : formatRupiah(p.price)}
                             </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                             <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <style jsx global>{`
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
        
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}