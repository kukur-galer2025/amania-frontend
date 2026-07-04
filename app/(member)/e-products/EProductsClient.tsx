"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, Check,
  Star, PackageSearch, CheckCircle2, Crown, Library,
  FilterX, BookMarked, ShieldCheck, DownloadCloud, LayoutGrid, BookOpen, Award,
  ShoppingCart, Loader2, Layers, UserCircle, Eye, Banknote, Download, List
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import AdBanner from '@/app/components/AdBanner';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru Dirilis' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest', label: 'Harga Terendah' },
  { value: 'priciest', label: 'Harga Tertinggi' },
];

// 🔥 HELPER: Membersihkan tag HTML dan mengubah entitas HTML menjadi teks biasa
const stripHtmlAndEntities = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

// 🔥 SKELETON CARD ANTI OVERFLOW 🔥
const SkeletonCard = () => (
  <div className="flex flex-col bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-clip w-full">
    <div className="aspect-[4/3] bg-slate-100" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="h-3 bg-slate-100 dark:bg-slate-800/300 rounded-full w-1/4" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800/300 rounded-full w-full" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800/300 rounded-full w-3/4" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800/300 rounded-full w-1/2 mt-2" />
      <div className="border-t border-slate-100 dark:border-slate-700/30 pt-3 mt-3 space-y-2">
        <div className="h-5 bg-slate-100 dark:bg-slate-800/300 rounded-full w-1/3" />
        <div className="h-10 bg-slate-100 dark:bg-slate-800/300 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

export default function EProductsClient() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');


  // 🔥 UPDATE: Tambah 'owned' ke state priceFilter 🔥
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'owned'>('all');
  const [sort, setSort] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addingCartId, setAddingCartId] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [productToBuy, setProductToBuy] = useState<any>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = safeStorage.getItem('token');
        const h: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') h['Authorization'] = `Bearer ${token}`;

        const [pRes, cRes] = await Promise.all([
          apiFetch('/e-products', { headers: h }),
          apiFetch('/e-product-categories'),
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();

        if (pRes.ok && pJson.success) setProducts(pJson.data ?? []);
        if (cRes.ok && cJson.success && Array.isArray(cJson.data)) {
          setCategories(['Semua', ...cJson.data.map((c: any) => String(c.name)).filter(Boolean)]);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }

    // 🔥 UPDATE: Filter untuk produk Gratis atau Sudah Dimiliki 🔥
    if (priceFilter === 'free') list = list.filter(p => p.price === 0);
    else if (priceFilter === 'owned') list = list.filter(p => p.is_purchased === true);

    if (selectedCategory !== 'Semua') list = list.filter(p => p.category?.name === selectedCategory);

    if (sort === 'top_rated') list.sort((a, b) => (parseFloat(b.reviews_avg_rating) || 0) - (parseFloat(a.reviews_avg_rating) || 0));
    else if (sort === 'cheapest') list.sort((a, b) => a.price - b.price);
    else if (sort === 'priciest') list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [products, search, sort, priceFilter, selectedCategory]);

  useEffect(() => {
    setVisibleCount(12);
  }, [search, sort, priceFilter, selectedCategory]);

  const formatRupiah = (n: number) =>
    n === 0 ? 'Gratis' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;
  const hasFilters = search !== '' || priceFilter !== 'all' || selectedCategory !== 'Semua' || sort !== 'newest';

  const clearAll = () => { setSearch(''); setPriceFilter('all'); setSelectedCategory('Semua'); setSort('newest'); };
  const scrollToCatalog = () => { document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); e.stopPropagation();
    const userStr = safeStorage.getItem('user');
    if (!userStr || userStr === 'null') { toast.error('Silakan masuk terlebih dahulu.'); router.push('/login'); return; }
    setAddingCartId(productId);
    const tid = toast.loading('Memproses...');
    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` },
        body: JSON.stringify({ e_product_id: productId })
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { success: false, message: 'Terjadi kesalahan sistem.' }; }
      toast.dismiss(tid);
      if (res.ok && json.success) {
        window.dispatchEvent(new CustomEvent('showCartModal', {
          detail: { type: 'success', title: 'Berhasil Masuk!', message: 'Produk telah ditambahkan ke keranjang belanja Anda.' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('showCartModal', {
          detail: { type: 'error', title: 'Pemberitahuan', message: json.message || 'Produk gagal dimasukkan.' }
        }));
      }
    } catch { toast.dismiss(tid); toast.error('Kesalahan jaringan.'); } finally { setAddingCartId(null); }
  };

  const handleOpenPaymentModal = async (e: React.MouseEvent, product: any) => {
    e.preventDefault(); e.stopPropagation();
    const token = safeStorage.getItem('token');
    if (!token) { toast.error('Silakan login terlebih dahulu'); router.push('/login'); return; }
    setProductToBuy(product);
    setPaymentProof(null);
    setIsPaymentModalOpen(true);
  };

  const handleProcessCheckout = async () => {
    if (!productToBuy) return;

    // For free products we don't need proof
    if (productToBuy.price > 0 && !paymentProof) {
      toast.error("Silakan upload bukti transfer!");
      return;
    }

    setBtnLoading(true);
    const tid = toast.loading('Memproses transaksi...');

    try {
      const formData = new FormData();
      formData.append('e_product_id', productToBuy.id);
      formData.append('method', 'MANUAL_QRIS');
      if (paymentProof) {
        formData.append('payment_proof', paymentProof);
      }

      const res = await apiFetch('/checkout/e-product', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` },
        body: formData
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.message?.toLowerCase().includes('sudah memiliki')) {
          toast.success('Akses sudah di tangan Anda!', { id: tid, icon: '💎' });
          setIsPaymentModalOpen(false);
          setProducts(prev => prev.map(p => p.id === productToBuy.id ? { ...p, is_purchased: true } : p));
        } else {
          toast.error(json.message || 'Gagal memproses pesanan.', { id: tid });
        }
        setBtnLoading(false); return;
      }

      if (json.is_free) {
        toast.success('Produk gratis berhasil diklaim!', { id: tid });
        setIsPaymentModalOpen(false);
        setProducts(prev => prev.map(p => p.id === productToBuy.id ? { ...p, is_purchased: true } : p));
        setBtnLoading(false); return;
      }

      if (json.checkout_url) {
        toast.success('Pemesanan berhasil, mengarahkan...', { id: tid });
        window.location.href = json.checkout_url;
      } else {
        toast.success('Pemesanan berhasil! Menunggu konfirmasi admin.', { id: tid });
        setIsPaymentModalOpen(false);
        setBtnLoading(false);
        router.push('/my-e-products');
      }
    } catch { toast.error('Kesalahan koneksi.', { id: tid }); setBtnLoading(false); }
  };

  return (
    <div className="font-sans bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen text-slate-900 dark:text-slate-100 w-full flex flex-col relative overflow-x-clip">

      {/* --- HERO (ULTRA-FAST PURE CSS) --- */}
      <section className="relative w-full bg-[#0a0f1c] rounded-b-2xl md:rounded-b-3xl border-b border-indigo-900/50 pb-12 pt-8 md:pt-16 md:pb-24">
        <div className="absolute inset-0 z-0 bg-[#0c1225]">
          {/* Solid color background for max performance */}
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="w-full lg:w-1/2 text-center lg:text-left pt-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-600 dark:text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
              <Crown size={14} className="text-amber-500 dark:text-amber-400" /> Edisi Premium
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.15] mb-6">
              Tingkatkan <span className="text-amber-400">Skill Digital</span><br className="hidden md:block" /> Anda Hari Ini.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Dapatkan akses eksklusif ke koleksi digital terbaik untuk akselerasi karir profesional Anda.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={scrollToCatalog} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-black active:scale-95">
                <Search size={16} /> Eksplorasi Katalog
              </button>
            </div>
          </div>

          <div className="w-full sm:max-w-md lg:w-5/12 grid grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-indigo-400">
                <BookMarked size={20} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{loading ? '-' : products.length}</h3>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Produk</p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-emerald-400">
                <Gift size={20} className="md:w-6 md:h-6" />
              </div>
              <h3 className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{loading ? '-' : products.filter(p => p.price === 0).length}</h3>
              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akses Gratis</p>
            </div>

            <div className="col-span-2 bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 md:p-6 flex items-center justify-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 shrink-0 bg-amber-500 rounded-full flex items-center justify-center text-slate-900">
                <Award size={20} className="md:w-[28px] md:h-[28px]" />
              </div>
              <div className="text-left min-w-0">
                <h3 className="text-xl md:text-2xl font-black text-white mb-0.5 md:mb-1 truncate">{loading ? '-' : Math.max(0, categories.length - 1)} Topik Belajar</h3>
                <p className="text-[10px] md:text-xs font-medium text-amber-200/80 truncate">Kategori materi terstruktur.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <div className="w-full relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 md:-mt-12 mb-6 md:mb-8">
        <AdBanner placement="eproduct" className="shadow-2xl dark:shadow-black/40 rounded-2xl md:rounded-3xl overflow-hidden" />
      </div>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-8 md:mb-10">
        <div className="bg-white dark:bg-[#111827] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/30 p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800 shadow-sm dark:shadow-black/10">
          <div className="flex items-center gap-3 pt-0 sm:pt-0 pl-0 sm:pl-0 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-500/10 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors rounded-full flex items-center justify-center shrink-0 text-indigo-600"><DownloadCloud size={20} className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="text-left"><p className="text-[13px] md:text-[15px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">Akses Instan</p><p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-tight">Bisa langsung diunduh</p></div>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-0 pl-0 sm:pl-5 md:pl-8 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/10 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors rounded-full flex items-center justify-center shrink-0 text-emerald-600"><ShieldCheck size={20} className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="text-left"><p className="text-[13px] md:text-[15px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">Kualitas Terjamin</p><p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-tight">Karya original & legal</p></div>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-0 pl-0 sm:pl-5 md:pl-8 group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 dark:bg-amber-500/10 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20 transition-colors rounded-full flex items-center justify-center shrink-0 text-amber-600"><Star size={20} className="w-4 h-4 md:w-5 md:h-5" /></div>
            <div className="text-left"><p className="text-[13px] md:text-[15px] font-black text-slate-900 dark:text-white leading-tight mb-0.5">Rating Tinggi</p><p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-tight">Diulas oleh komunitas</p></div>
          </div>
        </div>
      </div>

      {/* ══════════ 2. STICKY TOOLBAR & PENCARIAN ══════════ */}
      <div id="katalog-section" className="sticky top-[60px] md:top-[64px] z-[40] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-200/80 dark:border-slate-800/80 w-full py-3 md:py-4 shadow-sm dark:shadow-none transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-5">

            <div className="relative w-full sm:flex-1 shrink-0">
              <Search size={16} className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-[18px] md:h-[18px]" />
              <input
                type="text"
                placeholder="Cari e-book, template, atau modul..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-10 text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#111827] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
              />
              <AnimatePresence>
                {search && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearch('')} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 bg-slate-200 hover:bg-rose-100 p-1 md:p-1.5 rounded-full transition-colors">
                    <X size={12} className="md:w-3.5 md:h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 md:gap-3 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs md:text-sm transition-all active:scale-95"
              >
                <SlidersHorizontal size={14} className="md:w-[18px] md:h-[18px]" />
                <span>Filter & Urutkan</span>
                {hasFilters && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-50 dark:bg-rose-500 ml-1"></span>}
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 shrink-0">
                <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Tampilan Grid"
                >
                <LayoutGrid size={16} className="md:w-5 md:h-5" />
                </button>
                <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                title="Tampilan List"
                >
                <List size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {hasFilters && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex flex-wrap items-center gap-2 overflow-hidden border-t border-slate-100 dark:border-slate-700/30 pt-3 md:pt-4">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1 md:mr-2">Filter Aktif:</span>

                {selectedCategory !== 'Semua' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] md:text-xs font-bold border border-indigo-200 dark:border-indigo-500/30 shrink-0">
                    <Tag size={10} className="md:w-3 md:h-3 opacity-70" /> {selectedCategory}
                    <button onClick={() => setSelectedCategory('Semua')} className="hover:bg-indigo-200 dark:hover:bg-indigo-500/30 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className={`inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold border shrink-0 ${priceFilter === 'owned' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'}`}>
                    {priceFilter === 'owned' ? <CheckCircle2 size={10} className="md:w-3 md:h-3 opacity-70" /> : <Gift size={10} className="md:w-3 md:h-3 opacity-70" />}
                    {priceFilter === 'owned' ? 'Dimiliki' : 'Gratis'}
                    <button onClick={() => setPriceFilter('all')} className={`p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1 ${priceFilter === 'owned' ? 'hover:bg-indigo-200 dark:hover:bg-indigo-500/30' : 'hover:bg-emerald-200 dark:hover:bg-emerald-500/30'}`}><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] md:text-xs font-bold border border-slate-200 dark:border-slate-700 shrink-0">
                    <SlidersHorizontal size={10} className="md:w-3 md:h-3 opacity-70" /> {currentSort?.label || 'Terbaru'}
                    <button onClick={() => setSort('newest')} className="hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                <button onClick={clearAll} className="inline-flex items-center gap-1 md:gap-1.5 ml-1 md:ml-2 text-[10px] md:text-[11px] font-bold text-rose-500 hover:text-white hover:bg-rose-500 dark:text-rose-400 dark:hover:text-white dark:bg-rose-500/10 dark:hover:bg-rose-600 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg transition-all shrink-0">
                  <FilterX size={12} className="md:w-3.5 md:h-3.5" /> Reset Semua
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════ 3. GRID KATALOG UTAMA (LUXURY HORIZONTAL CARD) ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 w-full flex-1">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/50">
              <Library size={24} className="text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mb-2">Jelajahi Pustaka</h2>
              <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 font-medium">Koleksi digital premium pilihan Amania.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-5 md:gap-6" : "grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4"}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-16 md:py-24 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 mx-2 md:mx-0">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-slate-100 dark:border-slate-700">
              <PackageSearch size={32} className="md:w-12 md:h-12 text-slate-300" strokeWidth={1} />
            </div>
            <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-1.5 md:mb-2">Pencarian Tidak Ditemukan</p>
            <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 max-w-xs md:max-w-md mb-6 md:mb-8 px-4">Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter dan kata kunci Anda.</p>
            <button onClick={clearAll} className="px-6 md:px-8 py-2.5 md:py-3.5 bg-indigo-600 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-indigo-50 dark:bg-indigo-500 transition-colors">
              Bersihkan Filter
            </button>
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-5 md:gap-6" : "grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4"}>
            <>
              {filtered.slice(0, visibleCount).map((p, idx) => {
                const free = p.price === 0;
                const avg = parseFloat(p.reviews_avg_rating) || 0;
                const owned = p.is_purchased === true;
                const originalPrice = p.price * 5;
                const isAdding = addingCartId === p.id;
                const authorName = !p.author?.name || p.author?.name.toLowerCase() === 'admin amania' ? 'Amania Official' : p.author.name;

                return (
                  <div key={p.id} className="group h-full animate-fade-in" style={{ animationDelay: `${Math.min(idx * 0.04, 0.25)}s`, animationFillMode: 'both' }}>
                    <div
                      className={`relative h-full flex bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}
                      onClick={() => router.push(`/e-products/${p.slug}`)}
                    >
                      {/* COVER IMAGE */}
                      <div className={`relative overflow-clip bg-slate-100 dark:bg-slate-800 shrink-0 ${viewMode === 'list' ? 'w-24 sm:w-2/5 lg:w-[260px] aspect-[3/4] sm:aspect-[4/3] border-r border-b-0 border-slate-200 dark:border-slate-700/50' : 'w-full aspect-[4/3] border-b border-slate-200 dark:border-slate-700/50'}`}>
                        {p.cover_image ? (
                          <img loading="lazy" src={`${storageUrl}/${p.cover_image}`} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x400/1e293b/334155?text=Amania'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <FileText size={48} className="text-slate-300 dark:text-slate-600 w-8 h-8 sm:w-12 sm:h-12" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Badges */}
                        <div className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 flex flex-col gap-1 sm:gap-1.5 z-10">
                          {owned ? (
                            <span className="bg-indigo-600/90 text-white text-[7px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg flex items-center gap-0.5 sm:gap-1"><CheckCircle2 size={11} className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Dimiliki</span>
                          ) : free ? (
                            <span className="bg-emerald-600/90 text-white text-[7px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg flex items-center gap-0.5 sm:gap-1"><Gift size={11} className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Gratis</span>
                          ) : (
                            <span className="bg-orange-600 text-white text-[7px] sm:text-[9px] font-black uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-md flex items-center gap-0.5 sm:gap-1"><Crown size={11} className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Premium</span>
                          )}
                        </div>

                        {/* Rating badge top right */}
                        {avg > 0 ? (
                          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 z-10 flex items-center gap-0.5 sm:gap-1 bg-white/90 dark:bg-slate-900/90 px-1 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                            <Star size={12} className="fill-amber-400 text-amber-400 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-[8px] sm:text-[11px] font-black text-amber-700 dark:text-amber-400">{avg.toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="absolute top-1.5 sm:top-3 right-1.5 sm:right-3 z-10 flex items-center gap-0.5 sm:gap-1 bg-white/95 dark:bg-slate-900/90 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded sm:rounded-lg border border-slate-200 dark:border-slate-700">
                            <Star size={12} className="text-slate-300 w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-[7px] sm:text-[10px] font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
                          </div>
                        )}

                        {/* Bottom hover CTA */}
                        <div className="absolute bottom-3 right-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <Eye size={13} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Lihat Detail</span>
                          </div>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className={`flex flex-col flex-1 min-w-0 p-2.5 sm:p-4 md:p-5 ${viewMode === 'list' ? 'justify-between' : ''}`}>
                        {/* Category */}
                        <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                          <span className="text-[8px] sm:text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/50 px-1.5 sm:px-2 py-0.5 rounded sm:rounded-md truncate max-w-[100px] sm:max-w-[120px]">
                            {p.category?.name || 'Umum'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 
                          className="text-xs sm:text-[15px] font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1.5 sm:mb-2"
                          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {p.title}
                        </h3>

                        {/* Description */}
                        {p.description && (
                          <p 
                            className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed mb-3"
                            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                          >
                            {stripHtmlAndEntities(p.description)}
                          </p>
                        )}

                        {/* Spacer */}
                        {viewMode === 'grid' && <div className="flex-1" />}

                        {/* Author */}
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 pt-1 sm:pt-2">
                          {authorName === 'Amania Official'
                            ? <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"><img loading="lazy" src="/logo-mini.png" className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 object-contain dark:brightness-0 dark:invert" /></div>
                            : (
                              p.author?.avatar
                                ? <img loading="lazy" src={`${storageUrl}/${p.author.avatar}`} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                                : <UserCircle size={16} className="text-slate-300 shrink-0 w-4 h-4 sm:w-4 sm:h-4" />
                            )
                          }
                          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate">{authorName}</span>
                        </div>

                        {/* Price + Actions */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 sm:pt-3 space-y-2.5 sm:space-y-3">
                          {/* Price row */}
                          <div className="flex items-center justify-between">
                            <div className="w-full">
                              {!owned && !free && (
                                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 dark:text-slate-500 line-through">{formatRupiah(originalPrice)}</span>
                                  <span className="text-[7px] sm:text-[8px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1 sm:px-1.5 py-0.5 rounded">80% OFF</span>
                                </div>
                              )}
                              <p className={`text-[13px] sm:text-lg font-black truncate w-full ${owned ? 'text-indigo-600 dark:text-indigo-400' : free ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {owned ? 'Dimiliki' : formatRupiah(p.price)}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                            {owned ? (
                              <button onClick={(e) => { e.stopPropagation(); router.push('/my-e-products'); }} className="w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-white text-[9px] sm:text-[11px] bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95">
                                <Layers size={14} className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" /> <span className="truncate">Buka</span>
                              </button>
                            ) : (
                              <>
                                {!free && (
                                  <button onClick={(e) => handleAddToCart(e, p.id)} disabled={isAdding} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-lg sm:rounded-xl font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50" title="Tambah Keranjang">
                                    {isAdding ? <Loader2 size={15} className="animate-spin w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <ShoppingCart size={16} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                  </button>
                                )}
                                <button onClick={(e) => handleOpenPaymentModal(e, p)} className="flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-white text-[9px] sm:text-[11px] bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 transition-all relative overflow-hidden group/btn border border-emerald-500 dark:border-emerald-500 px-1 sm:px-0">
                                  {/* Shimmer removed for performance */}
                                  <Banknote size={14} className="relative z-10 w-3 h-3 sm:w-3.5 sm:h-3.5 hidden xs:block" />
                                  <span className="relative z-10 truncate">{free ? 'Gratis' : 'Beli'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        )}

        {/* Load More Pagination */}
        {!loading && filtered.length > visibleCount && (
          <div className="mt-8 md:mt-12 flex justify-center w-full">
            <button
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 flex items-center gap-2"
            >
              <LayoutGrid size={16} className="text-indigo-500" /> Tampilkan Lebih Banyak
            </button>
          </div>
        )}
      </main>

      {/* --- MODAL PEMBAYARAN --- */}
      <AnimatePresence>
        {isPaymentModalOpen && productToBuy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-black/80" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] shadow-lg w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-amber-50 dark:bg-amber-500/10">
                <div><h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100">Pilih Pembayaran</h3><p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Transaksi Aman & Terenkripsi</p></div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-700 transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Transfer via QRIS</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Silakan scan kode QRIS di bawah ini untuk melakukan pembayaran.</p>
                    <div className="bg-white p-2 rounded-xl inline-block border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-3">
                      <img loading="lazy" src="/qris-amania.jpeg" alt="QRIS Amania" className="w-48 h-auto object-contain mx-auto rounded-lg" />
                    </div>
                    <div>
                      <a href="/qris-amania.jpeg" download="QRIS-Amania.jpeg" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-200 dark:border-indigo-500/20">
                        <Download size={14} /> Unduh QRIS
                      </a>
                    </div>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Upload Bukti Transfer</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 font-medium">Format: JPG, PNG, WEBP (Maksimal 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
                          if (!validTypes.includes(file.type)) {
                            toast.error('Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.');
                            e.target.value = '';
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error('Ukuran file terlalu besar! Maksimal 5MB.');
                            e.target.value = '';
                            return;
                          }
                          setPaymentProof(file);
                          toast.success('Bukti pembayaran berhasil dipilih!');
                        }
                      }}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-2"
                    />
                    {paymentProof && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                        <CheckCircle2 size={12} /> File terpilih: {paymentProof.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto text-center sm:text-left"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Total Tagihan</p><p className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">{formatRupiah(productToBuy.price)}</p></div>

                <button onClick={handleProcessCheckout} disabled={(!paymentProof && productToBuy.price > 0) || btnLoading} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                  {btnLoading ? <Loader2 className="animate-spin" size={18} /> : <Banknote size={18} />} {btnLoading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ 4. MODAL FILTER (Mobile Optimized) ══════════ */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setIsFilterModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border-t sm:border dark:border-slate-800 rounded-t-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] z-10"
            >
              {/* Swipe Handle for Mobile */}
              <div className="w-full flex justify-center pt-3 pb-1 sm:hidden bg-slate-50 dark:bg-slate-900/50 absolute top-0 z-20">
                <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 md:px-6 py-4 pt-6 sm:pt-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} className="md:w-5 md:h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base md:text-lg">Filter & Urutkan</h3>
                </div>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 space-y-6 md:space-y-8">
                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={14} /> Urutkan Berdasarkan
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                    {SORT_OPTIONS.map(o => (
                      <button
                        key={o.value}
                        onClick={() => setSort(o.value)}
                        className={`flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all ${sort === o.value ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-400 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600/50'}`}
                      >
                        {o.label}
                        {sort === o.value && <Check size={16} strokeWidth={3} />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <LayoutGrid size={14} /> Tipe Akses
                  </h4>
                  <div className="flex flex-wrap gap-2.5 md:gap-3">
                    {[
                      { val: 'all', label: 'Semua Produk' },
                      { val: 'free', label: 'Hanya Gratis' },
                      { val: 'owned', label: 'Sudah Dimiliki' },
                    ].map(({ val, label }) => {
                      const isActive = priceFilter === val;
                      const activeBg = 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-400 dark:text-indigo-400 shadow-sm';
                      const hoverBg = 'hover:border-indigo-300 dark:hover:border-indigo-600/50';

                      return (
                        <button
                          key={val}
                          onClick={() => setPriceFilter(val as any)}
                          className={`flex-1 min-w-[120px] px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all text-center sm:text-left ${isActive ? activeBg : `bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 ${hoverBg}`}`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookMarked size={14} /> Topik Belajar
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl border text-[11px] md:text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-400 dark:text-indigo-400 shadow-sm' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-indigo-600/50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 pb-6 sm:pb-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/80 flex items-center gap-3 shrink-0 relative z-20">
                <button
                  onClick={clearAll}
                  className="flex-1 py-3 md:py-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs md:text-sm transition-colors border border-slate-200 dark:border-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-[2] py-3 md:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs md:text-sm active:scale-95 flex justify-center items-center gap-2 transition-colors"
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
        @keyframes shimmer { 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
}