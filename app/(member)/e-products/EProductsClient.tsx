"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  FileText, ArrowRight, PackageSearch, Search, X,
  SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, Sparkles, TrendingUp, LayoutGrid, List as ListIcon,
  UserCircle, Flame
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.1 } 
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20 },
  },
};

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Termurah' },
  { value: 'priciest',  label: 'Termahal' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={13} 
          className={s <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-200'} 
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
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await apiFetch('/e-products');
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
    price === 0 ? 'GRATIS'
    : new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(price);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <div className="font-sans text-slate-900 bg-slate-50/50 min-h-screen pb-24">
      
      {/* ════════ HERO SECTION ════════ */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-12 md:pt-16 px-4 pb-12 md:pb-16 text-center z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[140%] bg-[radial-gradient(circle,rgba(124,58,237,0.06)_0%,transparent_60%)] -z-10 pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[140%] bg-[radial-gradient(circle,rgba(14,165,233,0.06)_0%,transparent_60%)] -z-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
            <span className="inline-flex items-center gap-1.5 px-3.5 md:px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] md:text-[11px] font-extrabold uppercase tracking-widest mb-5 md:mb-6">
              <Sparkles size={12} className="text-indigo-500" /> Katalog Digital Premium
            </span>
          </motion.div>

          <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight text-slate-900 max-w-3xl mx-auto mb-4" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06, duration: .5 }}>
            Tingkatkan Keahlian Digitalmu <span className="bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent block sm:inline">Hari Ini.</span>
          </motion.h1>

          <motion.p className="text-[13px] sm:text-sm md:text-base font-medium text-slate-500 leading-relaxed max-w-xl mx-auto px-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .14, duration: .5 }}>
            Akses E-Book, Template, dan Modul eksklusif dari praktisi terbaik Amania. Investasi sekali, akses selamanya.
          </motion.p>

          {/* Stats Bar */}
          {!loading && products.length > 0 && (() => {
            const totalRev = products.reduce((s,p) => s + (p.reviews_count||0), 0);
            const withR    = products.filter(p => parseFloat(p.reviews_avg_rating) > 0);
            const avgAll   = withR.length > 0 ? (withR.reduce((s,p) => s + parseFloat(p.reviews_avg_rating), 0) / withR.length).toFixed(1) : null;

            return (
              <motion.div className="mt-8 md:mt-10 mx-auto flex flex-row items-center justify-center bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-lg shadow-indigo-500/5 overflow-hidden w-full max-w-[90%] sm:w-fit" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .28, duration: .5 }}>
                <div className="px-4 sm:px-8 py-4 text-center flex-1 sm:flex-none">
                  <p className="text-xl sm:text-2xl font-black text-indigo-600 mb-0.5 flex items-center justify-center gap-1">{products.length}</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Produk Pilihan</p>
                </div>
                {avgAll && (
                  <>
                    <div className="w-px h-10 sm:h-12 bg-slate-200 shrink-0" />
                    <div className="px-4 sm:px-8 py-4 text-center flex-1 sm:flex-none">
                      <p className="text-xl sm:text-2xl font-black text-indigo-600 mb-0.5 flex items-center justify-center gap-1">{avgAll} <Star size={16} className="fill-amber-500 text-amber-500 sm:w-[18px] sm:h-[18px]" /></p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Rating Global</p>
                    </div>
                  </>
                )}
                {totalRev > 0 && (
                  <>
                    <div className="w-px h-10 sm:h-12 bg-slate-200 shrink-0 hidden sm:block" />
                    <div className="px-4 sm:px-8 py-4 text-center hidden sm:block flex-none">
                      <p className="text-xl sm:text-2xl font-black text-indigo-600 mb-0.5 flex items-center justify-center gap-1">{totalRev.toLocaleString('id-ID')}</p>
                      <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ulasan Terverifikasi</p>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })()}
        </div>
      </section>

      {/* ════════ TOOLBAR STICKY ════════ */}
      <div className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-200/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
            
            {/* Search Bar - Full Width on Mobile */}
            <div className="relative w-full lg:max-w-md shrink-0">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="w-full pl-10 pr-10 py-2.5 md:py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-[13px] sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400"
                placeholder="Cari E-Book, Template, Modul…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }}
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full p-1 transition-colors"
                  >
                    <X size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Filter & Controls Row */}
            <div className="flex items-center justify-between w-full lg:w-auto gap-3">
              
              {/* Scrollable Filters (Aman digeser di HP) */}
              <div className="flex-1 overflow-x-auto scrollbar-hide pb-1 -mb-1 mask-fade-right">
                <div className="flex items-center gap-2 w-max pr-4 lg:pr-0">
                  
                  {/* Price Filter Group */}
                  <div className="flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl shrink-0">
                    {[
                      { val: 'all',  label: 'Semua',    icon: <SlidersHorizontal size={14} /> },
                      { val: 'free', label: 'Gratis',   icon: <Gift size={14} /> },
                      { val: 'paid', label: 'Berbayar', icon: <Tag size={14} /> },
                    ].map(({ val, label, icon }) => (
                      <button
                        key={val}
                        onClick={() => setPriceFilter(val as any)}
                        className="relative px-3.5 py-1.5 md:py-1.5 rounded-lg text-[12px] sm:text-[13px] font-bold transition-colors flex items-center gap-1.5"
                      >
                        {priceFilter === val && (
                          <motion.div
                            layoutId="activeFilterBg"
                            className="absolute inset-0 bg-white border border-slate-200/80 shadow-sm rounded-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className={`relative z-10 flex items-center gap-1.5 ${priceFilter === val ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                          {icon} <span>{label}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* View Toggles (Desktop Only) */}
                  <div className="hidden sm:flex items-center p-1 bg-slate-100/80 border border-slate-200 rounded-xl shrink-0">
                    {[
                      { mode: 'grid', icon: LayoutGrid },
                      { mode: 'list', icon: ListIcon }
                    ].map(({ mode, icon: Icon }) => (
                      <button 
                        key={mode}
                        onClick={() => setViewMode(mode as any)} 
                        className="relative p-1.5 rounded-lg transition-colors flex items-center justify-center"
                      >
                        {viewMode === mode && (
                          <motion.div
                            layoutId="activeViewBg"
                            className="absolute inset-0 bg-white border border-slate-200/80 shadow-sm rounded-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <Icon size={16} strokeWidth={2.5} className={`relative z-10 ${viewMode === mode ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`} />
                      </button>
                    ))}
                  </div>

                </div>
              </div>

              {/* Garis Pemisah Mobile */}
              <div className="w-px h-6 bg-slate-200 shrink-0 lg:hidden" />

              {/* Sort Dropdown (Fixed di Kanan, tidak ikut ter-scroll) */}
              <div className="relative shrink-0" ref={sortRef}>
                <button 
                  className="flex items-center gap-1.5 px-3 py-2 md:py-2 rounded-xl text-[12px] sm:text-[13px] font-bold bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                  onClick={() => setSortOpen(o => !o)}
                >
                  <TrendingUp size={14} className="text-indigo-500 hidden sm:block" />
                  <span className="truncate max-w-[70px] sm:max-w-none">{currentSort.label}</span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-1.5 z-50 origin-top-right"
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      {SORT_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          className={`w-full flex items-center justify-between px-3 py-2.5 md:py-2 rounded-lg text-[13px] font-bold transition-colors ${sort === o.value ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                          onClick={() => { setSort(o.value); setSortOpen(false); }}
                        >
                          {o.label}
                          {sort === o.value && <Check size={14} strokeWidth={3} className="text-indigo-600 shrink-0" />}
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

      {/* ════════ RESULT INFO BAR ════════ */}
      <AnimatePresence>
        {!loading && (
          <motion.div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center flex-wrap gap-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500">
              Menampilkan <strong className="text-indigo-600">{filtered.length}</strong> produk
            </span>
            {search && (
              <span className="text-[12px] sm:text-[13px] font-semibold text-slate-500">
                untuk <strong className="text-slate-900">&ldquo;{search}&rdquo;</strong>
              </span>
            )}
            {(search || priceFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setPriceFilter('all'); }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors ml-1 uppercase tracking-wide shrink-0"
              >
                <X size={12} /> Hapus Filter
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ MAIN CONTENT ════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <motion.div className="flex flex-col items-center justify-center text-center py-16 md:py-20 px-4 bg-white border border-dashed border-slate-300 rounded-[1.5rem] md:rounded-[2rem] mt-2 md:mt-4" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 md:mb-4 text-slate-400">
              <PackageSearch size={28} className="md:w-8 md:h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1 md:mb-2">Tidak Ada Hasil</h3>
            <p className="text-[13px] md:text-sm text-slate-500 max-w-xs md:max-w-sm leading-relaxed">Coba sesuaikan filter atau gunakan kata kunci pencarian yang berbeda untuk menemukan produk.</p>
          </motion.div>
        )}

        {/* Product Layout */}
        {!loading && filtered.length > 0 && (
          <motion.div
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            layout 
            className={viewMode === 'grid' ? "grid gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-4 md:gap-5"}
          >
            <AnimatePresence mode="popLayout">
              {filtered.map(product => {
                const isFree       = product.price === 0;
                const avgRating    = parseFloat(product.reviews_avg_rating) || 0;
                const totalRev     = product.reviews_count || 0;
                const hasRating    = avgRating > 0;
                const isBestseller = avgRating >= 4.5 && totalRev >= 1;

                return (
                  <motion.div
                    key={product.id}
                    variants={cardVariants}
                    layout 
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                    className={`group bg-white rounded-2xl md:rounded-[1.25rem] overflow-hidden border border-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200 hover:border-slate-300 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row items-stretch'}`}
                  >
                    {/* Card Image */}
                    <motion.div layout="position" className={`relative overflow-hidden bg-slate-100 shrink-0 ${viewMode === 'grid' ? 'w-full aspect-[16/10]' : 'w-full sm:w-[240px] lg:w-[280px] aspect-[16/10] sm:aspect-auto'}`}>
                      {product.cover_image ? (
                        <motion.img layout="position" src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center min-h-[140px] md:min-h-[160px]">
                          <FileText size={40} className="md:w-12 md:h-12 text-slate-300" strokeWidth={1} />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {isFree && (
                        <div className="absolute top-3 right-3 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 z-10">
                          Gratis
                        </div>
                      )}
                      {isBestseller && !isFree && (
                        <div className="absolute top-3 left-3 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30 z-10 flex items-center gap-1">
                          <Flame size={10} className="md:w-3 md:h-3 fill-white" /> Bestseller
                        </div>
                      )}
                    </motion.div>

                    {/* Card Body */}
                    <motion.div layout="position" className="p-4 md:p-5 flex flex-col flex-1 min-w-0">
                      
                      <div className="flex items-center gap-2 mb-2 md:mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] font-bold text-slate-500 shrink-0">
                          <UserCircle size={14} className="text-slate-400" />
                          <span className="truncate max-w-[100px]">{product.author?.name?.split(' ')[0] || 'Amania'}</span>
                        </div>
                        
                        {hasRating && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            <div className="flex items-center gap-1.5">
                              <StarRow rating={avgRating} />
                              <span className="text-[11px] md:text-[12px] font-black text-slate-700">{avgRating.toFixed(1)}</span>
                              <span className="text-[10px] md:text-[11px] font-bold text-slate-400">({totalRev})</span>
                            </div>
                          </>
                        )}
                      </div>

                      <h3 className="text-[15px] sm:text-base md:text-lg font-bold text-slate-900 leading-snug mb-1.5 md:mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={product.title}>
                        {product.title}
                      </h3>
                      
                      {product.description && (
                        <p className="text-[13px] md:text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1 mb-3 md:mb-4">
                          {product.description.replace(/<[^>]+>/g, '')}
                        </p>
                      )}

                      <motion.div layout="position" className="mt-auto pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Harga Akses</p>
                          <p className={`text-lg sm:text-xl font-black tracking-tight leading-none ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
                            {formatRupiah(product.price)}
                          </p>
                        </div>
                        
                        <Link href={`/e-products/${product.slug}`} className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 md:py-2 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white text-[11px] md:text-xs font-bold rounded-xl transition-colors shrink-0">
                          Detail <ArrowRight size={14} />
                        </Link>
                      </motion.div>

                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ════════ PROMO BANNER BOTTOM ════════ */}
        {!loading && products.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            className="mt-12 md:mt-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative overflow-hidden shadow-xl shadow-indigo-600/20"
          >
            {/* Banner Deco */}
            <div className="absolute right-0 top-0 w-[150%] md:w-1/2 h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="relative z-10 text-center md:text-left flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">Akselerasi Kariermu Lebih Jauh</h2>
              <p className="text-[13px] md:text-base text-indigo-100 font-medium max-w-lg mx-auto md:mx-0 leading-relaxed">Selain aset digital berkualitas, temukan juga program bootcamp dan webinar intensif dari Amania untuk tingkatkan <i>skill</i> kamu.</p>
            </div>
            
            <Link href="/events" className="relative z-10 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-white text-indigo-600 px-6 py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20">
              Lihat Program Kelas <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}

      </div>

      {/* Global Style CSS untuk efek Mask Fade di scroll horizontal */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        /* Mask fade out at the right edge for smooth scrolling hint */
        .mask-fade-right {
          -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
          mask-image: linear-gradient(to right, black 85%, transparent 100%);
        }
        @media (min-width: 1024px) {
          .mask-fade-right {
            -webkit-mask-image: none;
            mask-image: none;
          }
        }
      `}</style>
    </div>
  );
}