"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, Check,
  Star, PackageSearch, ArrowRight, CheckCircle2, Crown, Library, 
  FilterX, BookMarked, ShoppingBag, ShieldCheck, DownloadCloud, LayoutGrid, BookOpen, Award
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
  <div className="animate-pulse flex flex-col h-full bg-white p-2.5 md:p-3 rounded-[1.25rem] md:rounded-[1.5rem] border border-slate-100 shadow-sm">
    <div className="rounded-[1rem] md:rounded-[1.25rem] bg-slate-100 mb-3 md:mb-4 w-full" style={{ aspectRatio: '2/3' }} />
    <div className="h-2 md:h-2.5 bg-slate-200 rounded-full w-1/3 mb-2 md:mb-2.5" />
    <div className="h-3 md:h-4 bg-slate-200 rounded-full w-full mb-1 md:mb-1.5" />
    <div className="h-3 md:h-4 bg-slate-200 rounded-full w-3/4 mb-3 md:mb-4" />
    <div className="h-4 md:h-5 bg-slate-200 rounded-full w-1/2 mt-auto" />
  </div>
);

export default function EProductsClient() {
  const [products,          setProducts]          = useState<any[]>([]);
  const [categories,        setCategories]        = useState<string[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [search,            setSearch]            = useState('');
  
  const [priceFilter,       setPriceFilter]       = useState<'all' | 'free'>('all');
  const [sort,              setSort]              = useState('newest');
  const [selectedCategory,  setSelectedCategory]  = useState('Semua');
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

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

  /* ─── Derived Data ─── */
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

  const clearAll = () => { 
    setSearch(''); 
    setPriceFilter('all'); 
    setSelectedCategory('Semua'); 
    setSort('newest'); 
  };

  const scrollToCatalog = () => {
    document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="font-sans bg-[#F8FAFC] min-h-screen text-slate-900 w-full flex flex-col relative overflow-x-hidden">
      
      {/* ══════════ 1. LUXURY HERO SECTION ══════════ */}
      <section className="relative w-full bg-[#0a0f1c] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl border-b border-indigo-900/50 pb-12 pt-8 md:pt-16 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000" 
            className="w-full h-full object-cover opacity-15 mix-blend-luminosity" 
            alt="Premium Library Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/90 via-[#0a0f1c]/80 to-[#0a0f1c]"></div>
          <div className="absolute -top-24 -left-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/20 blur-[100px] md:blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-amber-500/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-10">
          <div className="w-full lg:w-1/2 text-center lg:text-left pt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 md:mb-6 shadow-sm">
              <Crown size={14} className="text-amber-400" /> Edisi Premium
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.15] md:leading-[1.1] mb-4 md:mb-6">
              Tingkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-500">Skill Digital</span><br className="hidden md:block"/> Anda Hari Ini.
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto lg:mx-0 mb-6 md:mb-8 leading-relaxed px-2 md:px-0">
              Dapatkan akses eksklusif ke koleksi e-book, modul pembelajaran, dan template berkualitas industri yang disusun oleh para ahli Amania.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 w-full sm:w-auto px-4 md:px-0">
              <button onClick={scrollToCatalog} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-black transition-all shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_12px_30px_rgba(79,70,229,0.5)] active:scale-95 shrink-0">
                <Search size={16} className="md:w-[18px] md:h-[18px]" /> Eksplorasi Katalog
              </button>
              <Link href="/events" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 md:px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold backdrop-blur-md transition-all active:scale-95 shrink-0">
                <BookOpen size={16} className="md:w-[18px] md:h-[18px] text-indigo-300" /> Lihat Kelas Live
              </Link>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="w-full sm:max-w-md lg:w-5/12 grid grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-indigo-400">
                  <BookMarked size={20} className="md:w-6 md:h-6" />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{loading ? '-' : products.length}</h3>
               <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Produk</p>
             </div>
             
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-emerald-400">
                  <Gift size={20} className="md:w-6 md:h-6" />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{loading ? '-' : products.filter(p=>p.price===0).length}</h3>
               <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Gratis</p>
             </div>

             <div className="col-span-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-xl border border-amber-500/20 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center justify-center gap-4 md:gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/30">
                  <Award size={20} className="md:w-[28px] md:h-[28px]" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-0.5 md:mb-1 truncate">{loading ? '-' : Math.max(0, categories.length - 1)} Topik Belajar</h3>
                  <p className="text-[10px] md:text-xs font-medium text-amber-200/80 truncate">Kategori materi terstruktur.</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges (Horizontal Scroll on Mobile) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
         <div className="bg-white rounded-[1rem] md:rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-3 md:p-6 flex overflow-x-auto custom-scrollbar md:flex-wrap md:justify-between items-center gap-4 md:gap-6 snap-x snap-mandatory">
            
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"><DownloadCloud size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 leading-none mb-1">Akses Instan</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Bisa langsung diunduh</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200 shrink-0"></div>
            
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600"><ShieldCheck size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 leading-none mb-1">Kualitas Terjamin</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Original & Legal</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200 shrink-0"></div>
            
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0 pr-4 md:pr-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><Star size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 leading-none mb-1">Rating Tinggi</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Diulas oleh komunitas</p></div>
            </div>
            
         </div>
      </div>

      {/* ══════════ 2. STICKY TOOLBAR & PENCARIAN ══════════ */}
      <div id="katalog-section" className="sticky top-[60px] md:top-[64px] z-[40] bg-white/95 backdrop-blur-xl border-y border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.06)] w-full py-3 md:py-4 transition-all mt-6 md:mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            
            <div className="relative w-full sm:flex-1 shrink-0">
              <Search size={16} className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-[18px] md:h-[18px]" />
              <input
                type="text"
                placeholder="Cari e-book, template, atau modul..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-10 text-xs md:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
              />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch('')} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 bg-slate-200 hover:bg-rose-100 p-1 md:p-1.5 rounded-full transition-colors">
                    <X size={12} className="md:w-3.5 md:h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm transition-all shadow-md active:scale-95"
              >
                <SlidersHorizontal size={14} className="md:w-[18px] md:h-[18px]" />
                <span>Filter & Urutkan</span>
                {hasFilters && (
                   <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-500 ml-1"></span>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {hasFilters && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex flex-wrap items-center gap-2 overflow-hidden border-t border-slate-100 pt-3 md:pt-4">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1 md:mr-2">Filter Aktif:</span>
                
                {selectedCategory !== 'Semua' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-indigo-50 text-indigo-700 text-[10px] md:text-xs font-bold border border-indigo-200 shadow-sm shrink-0">
                    <Tag size={10} className="md:w-3 md:h-3 opacity-70" /> {selectedCategory}
                    <button onClick={() => setSelectedCategory('Semua')} className="hover:bg-indigo-200 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-emerald-50 text-emerald-700 text-[10px] md:text-xs font-bold border border-emerald-200 shadow-sm shrink-0">
                    <Gift size={10} className="md:w-3 md:h-3 opacity-70" /> Gratis
                    <button onClick={() => setPriceFilter('all')} className="hover:bg-emerald-200 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-slate-100 text-slate-700 text-[10px] md:text-xs font-bold border border-slate-200 shadow-sm shrink-0">
                    <SlidersHorizontal size={10} className="md:w-3 md:h-3 opacity-70" /> {currentSort.label}
                    <button onClick={() => setSort('newest')} className="hover:bg-slate-200 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                <button onClick={clearAll} className="inline-flex items-center gap-1 md:gap-1.5 ml-1 md:ml-2 text-[10px] md:text-[11px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg transition-all shrink-0 shadow-sm">
                  <FilterX size={12} className="md:w-3.5 md:h-3.5" /> Reset Semua
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════ 3. GRID KATALOG UTAMA (LUXURY CARD) ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 md:mb-10 border-b border-slate-200 pb-4 md:pb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0 shadow-inner border border-indigo-200">
              <Library size={20} className="md:w-7 md:h-7 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-3xl font-black text-slate-900 leading-none mb-1 md:mb-2">Jelajahi Pustaka</h2>
              <p className="text-[10px] md:text-sm text-slate-500 font-medium">Koleksi digital terbaik untuk akselerasi karir.</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-100 rounded-lg md:rounded-xl border border-slate-200 w-fit shrink-0">
            <PackageSearch size={14} className="md:w-4 md:h-4 text-slate-400" />
            <span className="text-[10px] md:text-xs font-black text-slate-700">
              {loading ? 'Menghitung...' : `${filtered.length} Ditemukan`}
            </span>
          </div>
        </div>

        {loading ? (
          // GRID MOBILE: 2 Kolom, LAPTOP: 4/5 Kolom
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-16 md:py-24 bg-white rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-300 shadow-sm mx-2 md:mx-0">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-slate-100 shadow-inner">
              <PackageSearch size={32} className="md:w-12 md:h-12 text-slate-300" strokeWidth={1} />
            </div>
            <p className="text-lg md:text-2xl font-black text-slate-800 mb-1.5 md:mb-2">Pencarian Tidak Ditemukan</p>
            <p className="text-xs md:text-base text-slate-500 max-w-xs md:max-w-md mb-6 md:mb-8 px-4">Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter dan kata kunci Anda.</p>
            <button onClick={clearAll} className="px-6 md:px-8 py-2.5 md:py-3.5 bg-indigo-600 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
              Bersihkan Filter
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => {
                const free  = p.price === 0;
                const avg   = parseFloat(p.reviews_avg_rating) || 0;
                const owned = p.is_purchased === true;
                const originalPrice = p.price * 10;

                return (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.02, 0.2) } }} exit={{ opacity: 0, scale: 0.94 }}>
                    <Link href={`/e-products/${p.slug}`} className="group flex flex-col h-full w-full bg-white p-2.5 sm:p-3 md:p-4 rounded-[1.25rem] sm:rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.05)] md:shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_-10px_rgba(79,70,229,0.15)] hover:border-indigo-200 hover:-translate-y-1.5 md:hover:-translate-y-2 transition-all duration-500">

                      {/* Cover Buku */}
                      <div className="relative w-full rounded-[1rem] sm:rounded-[1.25rem] md:rounded-[1.5rem] overflow-hidden bg-slate-900 mb-3 md:mb-4 shadow-inner" style={{ aspectRatio: '2/3' }}>
                        {p.cover_image
                          ? <img src={`${storageUrl}/${p.cover_image}`} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                          : <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-100"><FileText size={32} className="md:w-12 md:h-12" strokeWidth={1} /></div>
                        }
                        {/* Luxury Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

                        {/* Badges Overlays */}
                        <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1.5 md:gap-2 z-10">
                          {owned ? (
                            <span className="flex items-center gap-1 md:gap-1.5 bg-indigo-600/95 backdrop-blur-md border border-indigo-400/50 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg shadow-xl">
                              <CheckCircle2 size={10} className="md:w-3 md:h-3" strokeWidth={2.5} /> <span className="hidden sm:inline">Dimiliki</span>
                            </span>
                          ) : free ? (
                            <span className="flex items-center gap-1 md:gap-1.5 bg-emerald-500/95 backdrop-blur-md border border-emerald-400/50 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg shadow-xl">
                              <Gift size={10} className="md:w-3 md:h-3" strokeWidth={2.5} /> <span className="hidden sm:inline">Gratis</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 md:gap-1.5 bg-gradient-to-r from-amber-400 to-orange-400 backdrop-blur-md border border-amber-300/50 text-amber-950 text-[8px] md:text-[10px] font-black uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg shadow-xl">
                              <Crown size={10} className="md:w-3 md:h-3" strokeWidth={2.5} /> <span className="hidden sm:inline">Premium</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Info Buku */}
                      <div className="flex flex-col flex-1 px-0.5 md:px-1.5">
                        <div className="flex items-center justify-between mb-2 md:mb-3 gap-1">
                           <p className="text-[8px] md:text-[10px] text-indigo-600 font-bold uppercase tracking-widest truncate bg-indigo-50 border border-indigo-100 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-[4px] md:rounded-md max-w-[65%]" title={p.category?.name}>{p.category?.name || 'Umum'}</p>
                           {avg > 0 && (
                            <div className="flex items-center gap-0.5 md:gap-1 text-amber-600 bg-amber-50 px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-[4px] md:rounded-md border border-amber-200/50 shrink-0">
                              <Star size={8} className="md:w-3 md:h-3 fill-amber-500" /> <span className="text-[9px] md:text-[11px] font-black mt-0.5">{avg.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <h3 className="text-[12px] sm:text-[14px] md:text-[17px] font-black text-slate-900 line-clamp-2 leading-[1.3] group-hover:text-indigo-600 transition-colors mb-3 md:mb-5" title={p.title}>
                          {p.title}
                        </h3>
                        
                        <div className="mt-auto pt-2.5 md:pt-4 border-t border-slate-100/80">
                          {/* Harga Coret Diskon 90% */}
                          {!owned && !free && (
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 md:mb-1.5 flex-wrap sm:flex-nowrap">
                              <span className="text-[9px] md:text-[11px] font-bold text-slate-400 line-through decoration-rose-500/50 truncate max-w-full">
                                {formatRupiah(originalPrice)}
                              </span>
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-1 md:px-1.5 py-0.5 rounded-[4px] md:rounded-md shrink-0">
                                90% OFF
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex flex-col min-w-0 pr-1">
                               <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 hidden sm:block">Investasi</span>
                               <p className={`text-[13px] sm:text-base md:text-xl font-black tracking-tight truncate w-full ${owned ? 'text-indigo-600' : free ? 'text-emerald-600' : 'text-slate-900'}`}>
                                 {owned ? 'Buka' : formatRupiah(p.price)}
                               </p>
                            </div>
                            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                               <ArrowRight size={12} className="sm:w-[14px] sm:h-[14px] md:w-4 md:h-4 group-hover:translate-x-0.5 transition-transform" />
                            </div>
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

      {/* ══════════ 4. MODAL FILTER (Mobile Optimized) ══════════ */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsFilterModalOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] z-10"
            >
              <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="md:w-5 md:h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-base md:text-lg">Filter & Urutkan</h3>
                </div>
                <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} /> Urutkan Berdasarkan
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                    {SORT_OPTIONS.map(o => (
                      <button 
                        key={o.value} 
                        onClick={() => setSort(o.value)}
                        className={`flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all ${sort === o.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                      >
                        {o.label}
                        {sort === o.value && <Check size={16} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid size={14} /> Tipe Akses
                  </h4>
                  <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3">
                    {[
                      { val: 'all',  label: 'Semua Produk' },
                      { val: 'free', label: 'Hanya Gratis' },
                    ].map(({ val, label }) => (
                      <button
                        key={val} 
                        onClick={() => setPriceFilter(val as any)}
                        className={`flex-1 px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all text-center sm:text-left ${priceFilter === val ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookMarked size={14} /> Topik Belajar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl border text-[11px] md:text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0">
                <button 
                  onClick={clearAll} 
                  className="flex-1 py-3 md:py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs md:text-sm transition-colors border border-rose-100"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)} 
                  className="flex-[2] py-3 md:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex justify-center items-center gap-2"
                >
                  Terapkan Filter
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 6px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
        
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}