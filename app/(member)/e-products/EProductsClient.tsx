"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, PackageSearch, ChevronRight, ChevronLeft, Flame, Sparkles, BookOpen,
  ArrowRight, CheckCircle2, Crown, Library, LayoutGrid, Layers, User, FilterX,
  BookMarked, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Harga Terendah' },
  { value: 'priciest',  label: 'Harga Tertinggi' },
];

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="rounded-xl bg-slate-200 mb-3" style={{ aspectRatio: '2/3' }} />
    <div className="h-2 bg-slate-200 rounded w-1/3 mb-1.5" />
    <div className="h-3 bg-slate-200 rounded w-full mb-1" />
    <div className="h-3 bg-slate-200 rounded w-4/5 mb-2" />
    <div className="h-3 bg-slate-200 rounded w-1/3" />
  </div>
);

export default function EProductsClient() {
  const [products,         setProducts]         = useState<any[]>([]);
  const [categories,       setCategories]       = useState<string[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  // 🔥 PERBAIKAN: Hanya menampung state all dan free
  const [priceFilter,      setPriceFilter]      = useState<'all' | 'free'>('all');
  const [sort,             setSort]             = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [catOpen,          setCatOpen]          = useState(false);
  const [sortOpen,         setSortOpen]         = useState(false);

  const catRef      = useRef<HTMLDivElement>(null);
  const sortRef     = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const storageUrl  = process.env.NEXT_PUBLIC_STORAGE_URL || '';

  /* ─── Fetch ─── */
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

  /* ─── Close dropdowns on outside click ─── */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current  && !catRef.current.contains(e.target as Node))  setCatOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ─── Derived ─── */
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
    // 🔥 PERBAIKAN: Hanya logic filter harga gratis yang dijalankan jika dipilih
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
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });

  /* ═══════════════════════════════════════════ */
  return (
    <div className="w-full space-y-8 pb-16">

      {/* ══════════ 1. HERO ══════════ */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)' }}
      >
        {/* Ambient glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-2/3 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 px-8 pt-10 pb-8 md:px-12 md:pt-12 md:pb-10">
          {/* Label */}
          <motion.p
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300 mb-4"
          >
            <Sparkles size={11} className="text-amber-400" /> Pustaka Digital Amania
          </motion.p>

          {/* Heading + stats side-by-side on desktop */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
                className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3"
              >
                E-Produk{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }}>
                  Premium
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-slate-400 text-sm leading-relaxed max-w-md mb-6"
              >
                Koleksi e-book, modul praktis, dan template profesional untuk akselerasi karier Anda.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
                className="flex flex-wrap gap-3"
              >
                <button
                  onClick={() => document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-black hover:bg-indigo-50 transition-colors shadow-lg"
                >
                  <Search size={14} /> Eksplorasi Katalog <ArrowRight size={14} />
                </button>
                <Link href="/events"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  <BookOpen size={14} className="text-indigo-300" /> Lihat Kelas Live
                </Link>
              </motion.div>
            </div>

            {/* Stats block — sudah terpisah dari decorasi, tidak ada yang menumpuk */}
            <motion.div
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-wrap lg:flex-col gap-3 lg:gap-2 lg:items-end"
            >
              {[
                { icon: BookMarked, label: 'Koleksi',  value: loading ? '—' : products.length },
                { icon: Tag,        label: 'Kategori', value: loading ? '—' : Math.max(0, categories.length - 1) },
                { icon: Gift,       label: 'Gratis',   value: loading ? '—' : products.filter(p => p.price === 0).length },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 backdrop-blur-sm">
                  <Icon size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-sm font-black text-white">{value}</span>
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* ══════════ 2. CAROUSEL TERPOPULER ══════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
              <Crown size={15} className="text-amber-500 fill-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Koleksi Terpopuler</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Rating tertinggi pilihan komunitas</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['left', 'right'] as const).map(dir => (
              <button key={dir} onClick={() => scrollCarousel(dir)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                {dir === 'left' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => <div key={i} className="shrink-0 w-[130px]"><SkeletonCard /></div>)}
          </div>
        ) : (
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {featured.map(prod => {
              const free  = prod.price === 0;
              const avg   = parseFloat(prod.reviews_avg_rating) || 0;
              const owned = prod.is_purchased === true;
              return (
                <Link key={`feat-${prod.id}`} href={`/e-products/${prod.slug}`} className="shrink-0 w-[130px] sm:w-[148px] group">
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-2.5 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300" style={{ aspectRatio: '2/3' }}>
                    {prod.cover_image
                      ? <img src={`${storageUrl}/${prod.cover_image}`} alt={prod.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="absolute inset-0 flex items-center justify-center text-slate-300"><FileText size={28} strokeWidth={1} /></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      {owned
                        ? <span className="flex items-center gap-1 bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded"><CheckCircle2 size={8} />Dimiliki</span>
                        : free
                          ? <span className="flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded"><Gift size={8} />Gratis</span>
                          : <span className="flex items-center gap-1 bg-amber-400 text-amber-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded"><ShoppingBag size={8} />Premium</span>
                      }
                    </div>
                    {avg > 0 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded">
                        <Star size={9} className="fill-amber-400" />{avg.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide truncate">{prod.category?.name || 'Umum'}</p>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-indigo-600 transition-colors">{prod.title}</h3>
                  <p className={`text-xs font-black mt-1 ${owned ? 'text-indigo-600' : free ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {owned ? 'Akses Terbuka' : formatRupiah(prod.price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════ 3. FILTER BAR ══════════
          2-row layout:
          Row 1 → Search bar (full width)
          Row 2 → Semua/Gratis | Kategori | Urutkan
          Tidak ada yang overflow atau tertutup
      ══════════════════════════════════════ */}
      <div id="katalog-section" className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-visible">

        {/* Row 1: Search */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
          <div className="relative w-full">
            {/* Icon di dalam input — posisi absolute relatif terhadap div ini */}
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              style={{ zIndex: 1 }}
            />
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 focus:bg-white transition-all"
              placeholder="Cari e-book, template, atau nama penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 text-slate-500 hover:text-rose-500 flex items-center justify-center transition-colors"
                style={{ zIndex: 1 }}
              >
                <X size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Filters */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-2">

          {/* Toggle Harga (Dipotong jadi hanya Semua dan Gratis) */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
            {([
              { val: 'all',  label: 'Semua',  Icon: LayoutGrid },
              { val: 'free', label: 'Gratis', Icon: Gift },
            ] as const).map(({ val, label, Icon }) => (
              <button
                key={val}
                onClick={() => setPriceFilter(val)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  priceFilter === val
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 shrink-0" />

          {/* Kategori dropdown */}
          {!loading && categories.length > 1 && (
            <div className="relative shrink-0" ref={catRef}>
              <button
                onClick={() => { setCatOpen(o => !o); setSortOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedCategory !== 'Semua'
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                <Layers size={13} />
                {selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {catOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute left-0 top-[calc(100%+6px)] w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
                      <Tag size={12} className="text-slate-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Topik Belajar</span>
                      <span className="ml-auto text-[9px] font-bold text-indigo-500">{categories.length - 1} topik</span>
                    </div>
                    <div className="p-1.5 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => { setSelectedCategory(cat); setCatOpen(false); }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
                            selectedCategory === cat ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span>{cat}</span>
                          {selectedCategory === cat && <Check size={12} strokeWidth={3} className="text-indigo-600 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Urutkan dropdown */}
          <div className="relative shrink-0" ref={sortRef}>
            <button
              onClick={() => { setSortOpen(o => !o); setCatOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors whitespace-nowrap"
            >
              <SlidersHorizontal size={13} />
              <span className="text-slate-400 hidden sm:inline">Urutkan:</span>
              <span>{currentSort.label}</span>
              <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-[calc(100%+6px)] w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50"
                >
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        sort === o.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {o.label}
                      {sort === o.value && <Check size={12} strokeWidth={3} className="text-indigo-600 shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Chip filter aktif */}
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-1.5 ml-auto">
              {selectedCategory !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Semua')} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
                </span>
              )}
              {priceFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {priceFilter === 'free' ? 'Gratis' : 'Premium'}
                  <button onClick={() => setPriceFilter('all')} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
                </span>
              )}
              {sort !== 'newest' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                  {currentSort.label}
                  <button onClick={() => setSort('newest')} className="hover:opacity-70 ml-0.5"><X size={10} /></button>
                </span>
              )}
              <button onClick={clearAll} className="flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 px-1.5 py-1 transition-colors">
                <FilterX size={11} /> Hapus semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ 4. GRID KATALOG ══════════ */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <Library size={16} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Semua Koleksi</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Pustaka digital terlengkap Amania</p>
            </div>
          </div>
          <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            {loading ? '—' : `${filtered.length} Produk`}
          </span>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <PackageSearch size={26} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-base font-black text-slate-800 mb-1">Tidak Ditemukan</p>
            <p className="text-sm text-slate-400 max-w-[260px] mb-5">Tidak ada e-produk yang cocok dengan filter aktif Anda.</p>
            <button onClick={clearAll}
              className="px-5 py-2 bg-indigo-50 text-indigo-600 font-bold text-sm rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
              Reset Filter
            </button>
          </motion.div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <motion.div layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => {
                const free  = p.price === 0;
                const avg   = parseFloat(p.reviews_avg_rating) || 0;
                const isHot = avg >= 4.5 && (p.reviews_count || 0) >= 1;
                const owned = p.is_purchased === true;

                return (
                  <motion.div
                    key={p.id} layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.03, 0.25) } }}
                    exit={{ opacity: 0, scale: 0.94 }}
                  >
                    <Link href={`/e-products/${p.slug}`} className="group block">

                      {/* Cover */}
                      <div
                        className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-3 shadow-sm group-hover:shadow-[0_8px_28px_rgba(79,70,229,0.16)] group-hover:-translate-y-1 group-hover:border-indigo-200 transition-all duration-300"
                        style={{ aspectRatio: '2/3' }}
                      >
                        {p.cover_image
                          ? <img src={`${storageUrl}/${p.cover_image}`} alt={p.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300"><FileText size={30} strokeWidth={1} /></div>
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                        {/* Badge kiri atas */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {owned ? (
                            <span className="flex items-center gap-1 bg-indigo-600/95 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                              <CheckCircle2 size={8} /> Dimiliki
                            </span>
                          ) : free ? (
                            <span className="flex items-center gap-1 bg-emerald-500/95 backdrop-blur-sm text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                              <Gift size={8} /> Gratis
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 bg-amber-400/95 backdrop-blur-sm text-amber-950 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">
                              {isHot ? <><Flame size={8} /> Hot</> : <><ShoppingBag size={8} /> Premium</>}
                            </span>
                          )}
                        </div>

                        {/* Rating kanan bawah */}
                        {avg > 0 && (
                          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            <Star size={9} className="fill-amber-400" /> {avg.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide truncate flex items-center gap-1 mb-0.5" title={p.author?.name}>
                        <User size={9} className="shrink-0" />
                        {p.author?.name || 'Amania Official'}
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                      <p className={`text-sm font-black mt-1 ${owned ? 'text-indigo-600' : free ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {owned ? 'Akses Terbuka' : formatRupiah(p.price)}
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}