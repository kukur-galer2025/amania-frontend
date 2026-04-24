"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, PackageSearch, ChevronRight, ChevronLeft, Flame, Sparkles, BookOpen,
  ArrowRight, CheckCircle2, Crown, Library, LayoutGrid, Layers, User, FilterX,
  BookMarked
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
    <div className="rounded-xl bg-slate-200 mb-2" style={{ aspectRatio: '2/3' }} />
    <div className="h-2 bg-slate-200 rounded w-1/2 mb-1.5" />
    <div className="h-2.5 bg-slate-200 rounded w-3/4 mb-1.5" />
    <div className="h-2.5 bg-slate-200 rounded w-1/3" />
  </div>
);

export default function EProductsClient() {
  const [products,         setProducts]         = useState<any[]>([]);
  const [categories,       setCategories]       = useState<string[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState('');
  const [priceFilter,      setPriceFilter]      = useState<'all' | 'free' | 'paid'>('all');
  const [sort,             setSort]             = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeDropdown,   setActiveDropdown]   = useState<'none' | 'sort' | 'category'>('none');

  const sortRef     = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';

  /* ─── Fetch ─── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const [prodRes, catRes] = await Promise.all([
          apiFetch('/e-products', { headers }),
          apiFetch('/e-product-categories'),
        ]);
        const prodJson = await prodRes.json();
        const catJson  = await catRes.json();

        if (prodRes.ok && prodJson.success) setProducts(prodJson.data ?? []);
        if (catRes.ok && catJson.success && Array.isArray(catJson.data)) {
          const names = catJson.data.map((c: any) => String(c.name)).filter(Boolean);
          setCategories(['Semua', ...names]);
        }
      } catch (e) {
        console.error('EProducts fetch error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── Close dropdowns on outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current     && !sortRef.current.contains(e.target as Node))     setActiveDropdown(d => d === 'sort'     ? 'none' : d);
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) setActiveDropdown(d => d === 'category' ? 'none' : d);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Derived ─── */
  const featuredProducts = useMemo(() =>
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
    if (priceFilter === 'paid') list = list.filter(p => p.price > 0);
    if (selectedCategory !== 'Semua') list = list.filter(p => p.category?.name === selectedCategory);
    if (sort === 'top_rated')   list.sort((a, b) => (parseFloat(b.reviews_avg_rating) || 0) - (parseFloat(a.reviews_avg_rating) || 0));
    else if (sort === 'cheapest') list.sort((a, b) => a.price - b.price);
    else if (sort === 'priciest') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [products, search, sort, priceFilter, selectedCategory]);

  const formatRupiah = (price: number) =>
    price === 0
      ? 'Gratis'
      : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  const scrollCarousel = (dir: 'left' | 'right') =>
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });

  const clearAllFilters = () => {
    setSearch(''); setPriceFilter('all'); setSelectedCategory('Semua'); setSort('newest');
  };

  const hasActiveFilters = search !== '' || priceFilter !== 'all' || selectedCategory !== 'Semua' || sort !== 'newest';

  /* ════════════════════════════════════════════════
     RENDER — seluruh konten tetap di dalam container
     yang sudah diatur oleh MemberLayout (max-w, px)
  ════════════════════════════════════════════════ */
  return (
    <div className="w-full space-y-8 pb-12">

      {/* ══════════ 1. HERO ══════════ */}
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #0f172a 100%)' }}
      >
        {/* Glow accents */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-violet-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Dekorasi book spine desktop */}
        <div className="absolute right-10 bottom-0 hidden lg:flex items-end gap-2 opacity-[0.15] pointer-events-none select-none">
          {[52, 68, 60, 76, 64].map((h, i) => (
            <div key={i} className="w-7 rounded-t-sm"
              style={{ height: h, background: ['#6366f1','#8b5cf6','#a78bfa','#818cf8','#c4b5fd'][i] }} />
          ))}
        </div>

        <div className="relative z-10 p-8 md:p-12 max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-4"
          >
            <Sparkles size={11} className="text-amber-400" /> Pustaka Digital Amania
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3"
          >
            E-Produk{' '}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }}>
              Premium
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm leading-relaxed mb-7 max-w-sm"
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

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
            className="flex flex-wrap gap-5 mt-7 pt-6 border-t border-white/10"
          >
            {[
              { icon: BookMarked, label: 'Koleksi',  value: loading ? '—' : products.length },
              { icon: Tag,        label: 'Kategori', value: loading ? '—' : Math.max(0, categories.length - 1) },
              { icon: Gift,       label: 'Gratis',   value: loading ? '—' : products.filter(p => p.price === 0).length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon size={13} className="text-indigo-400" />
                <span className="text-xs font-black text-white">{value}</span>
                <span className="text-[10px] font-medium text-slate-500">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════ 2. CAROUSEL TERPOPULER ══════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
              <Crown size={16} className="text-amber-500 fill-amber-400" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-none">Koleksi Terpopuler</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Rating tertinggi pilihan komunitas</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {(['left','right'] as const).map(dir => (
              <button key={dir} onClick={() => scrollCarousel(dir)}
                className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                {dir === 'left' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => <div key={i} className="shrink-0 w-[130px]"><SkeletonCard /></div>)}
          </div>
        ) : (
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {featuredProducts.map(prod => {
              const isFree = prod.price === 0;
              const avg    = parseFloat(prod.reviews_avg_rating) || 0;
              const owned  = prod.is_purchased === true;
              return (
                <Link key={`feat-${prod.id}`} href={`/e-products/${prod.slug}`}
                  className="shrink-0 w-[130px] sm:w-[148px] group">
                  <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-2.5 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300"
                    style={{ aspectRatio: '2/3' }}>
                    {prod.cover_image
                      ? <img src={`${storageUrl}/${prod.cover_image}`} alt={prod.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="absolute inset-0 flex items-center justify-center text-slate-300"><FileText size={28} strokeWidth={1} /></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                      {owned
                        ? <span className="flex items-center gap-1 bg-indigo-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded"><CheckCircle2 size={8} /> Dimiliki</span>
                        : isFree
                          ? <span className="flex items-center gap-1 bg-emerald-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded"><Gift size={8} /> Gratis</span>
                          : null
                      }
                    </div>
                    {avg > 0 && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded">
                        <Star size={9} className="fill-amber-400" /> {avg.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-wide truncate">{prod.category?.name || 'Umum'}</p>
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mt-0.5 group-hover:text-indigo-600 transition-colors">{prod.title}</h3>
                  <p className={`text-xs font-black mt-1 ${owned ? 'text-indigo-600' : isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {owned ? 'Akses Terbuka' : formatRupiah(prod.price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ══════════ 3. FILTER BAR (tidak sticky — sudah ada header sticky di layout) ══════════ */}
      <div id="katalog-section" className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

        {/* Baris: Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
              placeholder="Cari e-book, template, penulis..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors p-0.5">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Harga toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 self-start sm:self-auto shrink-0">
            {([
              { val: 'all',  label: 'Semua',   Icon: LayoutGrid },
              { val: 'free', label: 'Gratis',  Icon: Gift },
              { val: 'paid', label: 'Premium', Icon: Sparkles },
            ] as const).map(({ val, label, Icon }) => (
              <button key={val} onClick={() => setPriceFilter(val)}
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

          {/* Kategori + Sort row */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Kategori */}
            {!loading && categories.length > 1 && (
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setActiveDropdown(d => d === 'category' ? 'none' : 'category')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                    selectedCategory !== 'Semua'
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-400/30'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  <Layers size={13} />
                  <span>{selectedCategory === 'Semua' ? 'Kategori' : selectedCategory}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'category' && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      className="absolute left-0 top-[calc(100%+6px)] w-52 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50"
                    >
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
                        <Tag size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Topik Belajar</span>
                        <span className="ml-auto text-[9px] font-bold text-indigo-500">{categories.length - 1} topik</span>
                      </div>
                      <div className="p-1.5 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {categories.map(cat => (
                          <button key={cat}
                            onClick={() => { setSelectedCategory(cat); setActiveDropdown('none'); }}
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

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setActiveDropdown(d => d === 'sort' ? 'none' : 'sort')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors whitespace-nowrap"
              >
                <SlidersHorizontal size={13} />
                <span className="hidden sm:inline text-slate-400">Urutkan:</span>
                <span>{currentSort.label}</span>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${activeDropdown === 'sort' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'sort' && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-[calc(100%+6px)] w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50"
                  >
                    {SORT_OPTIONS.map(o => (
                      <button key={o.value}
                        onClick={() => { setSort(o.value); setActiveDropdown('none'); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          sort === o.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {o.label}
                        {sort === o.value && <Check size={12} strokeWidth={3} className="text-indigo-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="flex flex-wrap items-center gap-2 overflow-hidden"
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0">Aktif:</span>
              {selectedCategory !== 'Semua' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                  {selectedCategory}
                  <button onClick={() => setSelectedCategory('Semua')} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                </span>
              )}
              {priceFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  {priceFilter === 'free' ? 'Gratis' : 'Premium'}
                  <button onClick={() => setPriceFilter('all')} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                </span>
              )}
              {sort !== 'newest' && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                  {currentSort.label}
                  <button onClick={() => setSort('newest')} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 max-w-[160px]">
                  <span className="truncate">"{search}"</span>
                  <button onClick={() => setSearch('')} className="ml-0.5 hover:opacity-70 shrink-0"><X size={10} /></button>
                </span>
              )}
              <button onClick={clearAllFilters}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors">
                <FilterX size={11} /> Hapus semua
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════ 4. GRID KATALOG ══════════ */}
      <section>
        {/* Header */}
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
            {loading ? '...' : `${filtered.length} Produk`}
          </span>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200"
          >
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <PackageSearch size={26} className="text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-base font-black text-slate-800 mb-1">Tidak Ditemukan</p>
            <p className="text-sm text-slate-400 max-w-[260px] mb-5">Tidak ada e-produk yang cocok dengan filter aktif Anda.</p>
            <button onClick={clearAllFilters}
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
              {filtered.map((product, idx) => {
                const isFree  = product.price === 0;
                const avg     = parseFloat(product.reviews_avg_rating) || 0;
                const isHot   = avg >= 4.5 && (product.reviews_count || 0) >= 1;
                const owned   = product.is_purchased === true;

                return (
                  <motion.div key={product.id} layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.03, 0.25) } }}
                    exit={{ opacity: 0, scale: 0.94 }}
                  >
                    <Link href={`/e-products/${product.slug}`} className="group block">
                      {/* Cover */}
                      <div
                        className="relative w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-2.5 shadow-sm group-hover:shadow-[0_8px_28px_rgba(79,70,229,0.16)] group-hover:-translate-y-1 group-hover:border-indigo-200 transition-all duration-300"
                        style={{ aspectRatio: '2/3' }}
                      >
                        {product.cover_image
                          ? <img src={`${storageUrl}/${product.cover_image}`} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300"><FileText size={30} strokeWidth={1} /></div>
                        }
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none" />

                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {owned ? (
                            <span className="flex items-center gap-1 bg-indigo-600/95 backdrop-blur-sm text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                              <CheckCircle2 size={8} /> Dimiliki
                            </span>
                          ) : (
                            <>
                              {isFree && <span className="flex items-center gap-1 bg-emerald-500/95 backdrop-blur-sm text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md"><Gift size={8} /> Gratis</span>}
                              {isHot && !isFree && <span className="flex items-center gap-1 bg-amber-400/95 backdrop-blur-sm text-amber-950 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md"><Flame size={8} /> Hot</span>}
                            </>
                          )}
                        </div>

                        {avg > 0 && (
                          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                            <Star size={9} className="fill-amber-400" /> {avg.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide truncate flex items-center gap-1 mb-0.5" title={product.author?.name}>
                        <User size={9} className="shrink-0" />
                        {product.author?.name || 'Amania Official'}
                      </p>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-1.5" title={product.title}>
                        {product.title}
                      </h3>
                      <p className={`text-sm font-black ${owned ? 'text-indigo-600' : isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {owned ? 'Akses Buka' : formatRupiah(product.price)}
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
