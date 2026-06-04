"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, X, SlidersHorizontal, Tag, Gift, Check,
  Star, PackageSearch, CheckCircle2, Crown, Library, 
  FilterX, BookMarked, ShieldCheck, DownloadCloud, LayoutGrid, BookOpen, Award,
  ShoppingCart, Loader2, Layers, UserCircle, Eye, Banknote
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru Dirilis' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Harga Terendah' },
  { value: 'priciest',  label: 'Harga Tertinggi' },
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
  <div className="animate-pulse flex flex-col bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden w-full">
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
  const [products,          setProducts]          = useState<any[]>([]);
  const [categories,        setCategories]        = useState<string[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [search,            setSearch]            = useState('');
  
  // 🔥 UPDATE: Tambah 'owned' ke state priceFilter 🔥
  const [priceFilter,       setPriceFilter]       = useState<'all' | 'free' | 'owned'>('all');
  const [sort,              setSort]              = useState('newest');
  const [selectedCategory,  setSelectedCategory]  = useState('Semua');
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [addingCartId,      setAddingCartId]      = useState<number | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [productToBuy,       setProductToBuy]       = useState<any>(null);
  const [paymentChannels,    setPaymentChannels]    = useState<any[]>([]);
  const [selectedChannel,    setSelectedChannel]    = useState<string>('');
  const [isLoadingChannels,  setIsLoadingChannels]  = useState(false);
  const [btnLoading,         setBtnLoading]         = useState(false);
  const [channelError,       setChannelError]       = useState<string | null>(null);

  const storageUrl  = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

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
    
    if (sort === 'top_rated') list.sort((a, b) => (parseFloat(b.reviews_avg_rating)||0) - (parseFloat(a.reviews_avg_rating)||0));
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
  const scrollToCatalog = () => { document.getElementById('katalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); e.stopPropagation();
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'null') { toast.error('Silakan masuk terlebih dahulu.'); router.push('/login'); return; }
    setAddingCartId(productId);
    const tid = toast.loading('Memproses...');
    try {
      const res = await apiFetch('/cart', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Silakan login terlebih dahulu'); router.push('/login'); return; }
    setProductToBuy(product);
    setIsPaymentModalOpen(true);
    setIsLoadingChannels(true);
    setChannelError(null);
    try {
      const res = await apiFetch('/checkout/payment-channels', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (res.ok && json.success) setPaymentChannels(json.data);
      else setChannelError(json.message || "Gagal memuat metode pembayaran.");
    } catch { setChannelError("Kesalahan jaringan."); } finally { setIsLoadingChannels(false); }
  };

  const handleProcessCheckout = async () => {
    if (!selectedChannel) { toast.error("Pilih metode pembayaran!"); return; }
    setBtnLoading(true);
    try {
      const res = await apiFetch('/checkout/e-product', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ e_product_id: productToBuy.id, method: selectedChannel })
      });
      const json = await res.json();
      if (json.success && json.checkout_url) window.location.href = json.checkout_url;
      else toast.error(json.message || "Gagal memproses pesanan.");
    } catch { toast.error("Kesalahan jaringan."); } finally { setBtnLoading(false); }
  };

  const groupedChannels = paymentChannels.reduce((acc, c) => {
    if (c.active) { if (!acc[c.group]) acc[c.group] = []; acc[c.group].push(c); }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="font-sans bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen text-slate-900 dark:text-slate-100 w-full flex flex-col relative overflow-x-hidden">
      
      {/* --- HERO --- */}
      <section className="relative w-full bg-[#0a0f1c] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl border-b border-indigo-900/50 pb-12 pt-8 md:pt-16 md:pb-24">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000" className="w-full h-full object-cover opacity-15 mix-blend-luminosity" alt="Background" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c]/90 via-[#0a0f1c]/80 to-[#0a0f1c]"></div>
          <div className="absolute -top-24 -left-24 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/20 blur-[100px] md:blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[200px] md:w-[400px] h-[200px] md:h-[400px] bg-transparent dark:bg-amber-500/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-5 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="w-full lg:w-1/2 text-center lg:text-left pt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6">
              <Crown size={14} className="text-amber-400" /> Edisi Premium
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.15] mb-6">
              Tingkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-400 to-orange-600">Skill Digital</span><br className="hidden md:block"/> Anda Hari Ini.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Dapatkan akses eksklusif ke koleksi digital terbaik untuk akselerasi karir profesional Anda.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={scrollToCatalog} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 text-white rounded-xl text-sm font-black transition-all shadow-[0_8px_20px_rgba(245,158,11,0.3)] active:scale-95">
                <Search size={16} /> Eksplorasi Katalog
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="w-full sm:max-w-md lg:w-5/12 grid grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-indigo-400">
                  <BookMarked size={20} className="md:w-6 md:h-6" />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white mb-0.5 md:mb-1">{loading ? '-' : products.length}</h3>
               <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Produk</p>
             </div>
             
             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
               <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-2 md:mb-3 text-emerald-400">
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

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
         <div className="bg-white dark:bg-[#111827] rounded-[1rem] md:rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/30 p-3 md:p-6 flex overflow-x-auto custom-scrollbar md:flex-wrap md:justify-between items-center gap-4 md:gap-6 snap-x snap-mandatory">
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600"><DownloadCloud size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Akses Instan</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Bisa langsung diunduh</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200 shrink-0"></div>
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-600"><ShieldCheck size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Kualitas Terjamin</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Original & Legal</p></div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-200 shrink-0"></div>
            <div className="flex items-center gap-2.5 md:gap-3 shrink-0 snap-start px-2 md:px-0 pr-4 md:pr-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600"><Star size={16} className="md:w-5 md:h-5"/></div>
              <div className="text-left"><p className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-none mb-1">Rating Tinggi</p><p className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-none">Diulas oleh komunitas</p></div>
            </div>
         </div>
      </div>

      {/* ══════════ 2. STICKY TOOLBAR & PENCARIAN ══════════ */}
      <div id="katalog-section" className="sticky top-[60px] md:top-[64px] z-[40] bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-y border-slate-200 dark:border-slate-700/50 shadow-[0_4px_30px_rgba(0,0,0,0.06)] w-full py-3 md:py-4 transition-all mt-6 md:mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
            
            <div className="relative w-full sm:flex-1 shrink-0">
              <Search size={16} className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none md:w-[18px] md:h-[18px]" />
              <input
                type="text"
                placeholder="Cari e-book, template, atau modul..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0B1120] border border-slate-200 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-10 text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#111827] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-inner"
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
                {hasFilters && <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-50 dark:bg-rose-500 ml-1"></span>}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {hasFilters && (
              <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 12 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} className="flex flex-wrap items-center gap-2 overflow-hidden border-t border-slate-100 dark:border-slate-700/30 pt-3 md:pt-4">
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-1 md:mr-2">Filter Aktif:</span>
                
                {selectedCategory !== 'Semua' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 text-[10px] md:text-xs font-bold border border-indigo-200 shadow-sm shrink-0">
                    <Tag size={10} className="md:w-3 md:h-3 opacity-70" /> {selectedCategory}
                    <button onClick={() => setSelectedCategory('Semua')} className="hover:bg-indigo-200 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className={`inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold border shadow-sm shrink-0 ${priceFilter === 'owned' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 border-indigo-200' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 border-emerald-200'}`}>
                    {priceFilter === 'owned' ? <CheckCircle2 size={10} className="md:w-3 md:h-3 opacity-70" /> : <Gift size={10} className="md:w-3 md:h-3 opacity-70" />} 
                    {priceFilter === 'owned' ? 'Dimiliki' : 'Gratis'}
                    <button onClick={() => setPriceFilter('all')} className={`p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1 ${priceFilter === 'owned' ? 'hover:bg-indigo-200' : 'hover:bg-emerald-200'}`}><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                {sort !== 'newest' && (
                  <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg bg-slate-100 dark:bg-slate-800/300 text-slate-700 dark:text-slate-300 text-[10px] md:text-xs font-bold border border-slate-200 shadow-sm shrink-0">
                    <SlidersHorizontal size={10} className="md:w-3 md:h-3 opacity-70" /> {currentSort.label}
                    <button onClick={() => setSort('newest')} className="hover:bg-slate-200 p-0.5 rounded-sm transition-colors ml-0.5 md:ml-1"><X size={12} className="md:w-3.5 md:h-3.5" /></button>
                  </span>
                )}
                <button onClick={clearAll} className="inline-flex items-center gap-1 md:gap-1.5 ml-1 md:ml-2 text-[10px] md:text-[11px] font-bold text-rose-500 hover:text-white hover:bg-rose-50 dark:bg-rose-500 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg transition-all shrink-0 shadow-sm">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center text-center py-16 md:py-24 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-800 shadow-sm mx-2 md:mx-0">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-slate-100 dark:border-slate-700 shadow-inner">
              <PackageSearch size={32} className="md:w-12 md:h-12 text-slate-300" strokeWidth={1} />
            </div>
            <p className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 mb-1.5 md:mb-2">Pencarian Tidak Ditemukan</p>
            <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 max-w-xs md:max-w-md mb-6 md:mb-8 px-4">Maaf, kami tidak dapat menemukan produk yang sesuai dengan filter dan kata kunci Anda.</p>
            <button onClick={clearAll} className="px-6 md:px-8 py-2.5 md:py-3.5 bg-indigo-600 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-indigo-50 dark:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30">
              Bersihkan Filter
            </button>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, idx) => {
                const free  = p.price === 0;
                const avg   = parseFloat(p.reviews_avg_rating) || 0;
                const owned = p.is_purchased === true;
                const originalPrice = p.price * 5;
                const isAdding = addingCartId === p.id;
                const authorName = !p.author?.name || p.author?.name.toLowerCase() === 'admin amania' ? 'Amania Official' : p.author.name;

                return (
                  <motion.div key={p.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(idx * 0.04, 0.25) } }} exit={{ opacity: 0, scale: 0.95 }} className="group h-full">
                    <div
                      className="relative h-full flex flex-col bg-white dark:bg-[#111827] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 dark:hover:shadow-black/35 hover:border-slate-200 dark:hover:border-slate-700 hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden"
                      onClick={() => router.push(`/e-products/${p.slug}`)}
                    >
                      {/* COVER IMAGE */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                        {p.cover_image ? (
                          <img src={`${storageUrl}/${p.cover_image}`} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                            <FileText size={48} className="text-slate-200 dark:text-slate-700" />
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {owned ? (
                            <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1"><CheckCircle2 size={11}/> Dimiliki</span>
                          ) : free ? (
                            <span className="bg-emerald-50 dark:bg-emerald-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1"><Gift size={11}/> Gratis</span>
                          ) : (
                            <span className="bg-gradient-to-r from-orange-600 to-amber-600 backdrop-blur-md text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1"><Crown size={11}/> Premium</span>
                          )}
                        </div>

                        {/* Rating badge top right */}
                        {avg > 0 ? (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">{avg.toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700/30/50 dark:border-slate-800">
                            <Star size={12} className="text-slate-300" />
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
                          </div>
                        )}

                        {/* Bottom hover CTA */}
                        <div className="absolute bottom-3 right-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg">
                            <Eye size={13} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Lihat Detail</span>
                          </div>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-col flex-1 p-4 sm:p-5">
                        {/* Category */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-900/50 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                            {p.category?.name || 'Umum'}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-[15px] font-black text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors mb-2">
                          {p.title}
                        </h3>

                        {/* Description */}
                        {p.description && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">{stripHtmlAndEntities(p.description)}</p>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Author */}
                        <div className="flex items-center gap-2 mb-3 pt-2">
                          {authorName === 'Amania Official'
                            ? <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0"><img src="/logo-mini.png" className="w-3.5 h-3.5 object-contain dark:brightness-0 dark:invert" /></div>
                            : (
                                p.author?.avatar 
                                ? <img src={`${storageUrl}/${p.author.avatar}`} className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0" />
                                : <UserCircle size={16} className="text-slate-300 shrink-0" />
                            )
                          }
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 truncate">{authorName}</span>
                        </div>

                        {/* Price + Actions */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                          {/* Price row */}
                          <div className="flex items-center justify-between">
                            <div>
                              {!owned && !free && (
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500 line-through">{formatRupiah(originalPrice)}</span>
                                  <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">80% OFF</span>
                                </div>
                              )}
                              <p className={`text-base sm:text-lg font-black ${owned ? 'text-indigo-600 dark:text-indigo-400' : free ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                                {owned ? 'Sudah Dimiliki' : formatRupiah(p.price)}
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 w-full">
                            {owned ? (
                              <button onClick={(e) => { e.stopPropagation(); router.push('/my-e-products'); }} className="w-full py-2.5 rounded-xl font-black text-white text-[11px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-indigo-500/20">
                                <Layers size={14}/> Buka Koleksi
                              </button>
                            ) : (
                              <>
                                {!free && (
                                  <button onClick={(e) => handleAddToCart(e, p.id)} disabled={isAdding} className="w-10 h-10 shrink-0 rounded-xl font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-sm" title="Tambah Keranjang">
                                    {isAdding ? <Loader2 size={15} className="animate-spin" /> : <ShoppingCart size={16} />}
                                  </button>
                                )}
                                <button onClick={(e) => handleOpenPaymentModal(e, p)} className="flex-1 py-2.5 rounded-xl font-black text-white text-[11px] bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all relative overflow-hidden group/btn shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/30 border border-emerald-500 dark:border-emerald-500">
                                  <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
                                  <Banknote size={14} className="relative z-10" />
                                  <span className="relative z-10">{free ? 'Gratis' : 'Beli Sekarang'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* --- MODAL PEMBAYARAN --- */}
      <AnimatePresence>
        {isPaymentModalOpen && productToBuy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-850 flex justify-between items-center bg-amber-50 dark:bg-amber-500/10/30 dark:bg-amber-950/10">
                <div><h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100">Pilih Pembayaran</h3><p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Transaksi Aman & Terenkripsi</p></div>
                <button onClick={()=>setIsPaymentModalOpen(false)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-400 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-700 transition-colors"><X size={18}/></button>
              </div>
              <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1">
                {isLoadingChannels ? (
                  <div className="py-20 text-center"><Loader2 size={36} className="animate-spin text-amber-600 dark:text-amber-400 mx-auto mb-4"/><p className="text-xs font-bold text-slate-400 dark:text-slate-500">Menyiapkan metode...</p></div>
                ) : (
                  <div className="space-y-6">
                    {(Object.entries(groupedChannels) as [string, any[]][]).map(([group, channels]) => (
                      <div key={group}>
                        <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-amber-500"></div> {group}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                          {channels.map((c: any) => (
                            <button key={c.code} onClick={()=>setSelectedChannel(c.code)} className={`flex items-center gap-3 p-3 rounded-[1rem] border-2 transition-all ${selectedChannel===c.code ? 'border-amber-600 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/20 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-amber-200 dark:hover:border-amber-500/50 bg-white dark:bg-slate-900/60'}`}>
                              <div className="w-10 h-6 shrink-0 bg-white dark:bg-white rounded flex items-center justify-center p-0.5"><img src={c.icon_url} className="max-w-full max-h-full object-contain" alt={c.name}/></div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-5 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto text-center sm:text-left"><p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1">Total Tagihan</p><p className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">{formatRupiah(productToBuy.price)}</p></div>
                
                {/* 🔥 BAYAR SEKARANG: KUNCI DI WARNA HIJAU (EMERALD) 🔥 */}
                <button onClick={handleProcessCheckout} disabled={!selectedChannel || btnLoading} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-600/20 dark:shadow-emerald-950/30 active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 dark:text-slate-400 transition-all flex items-center justify-center gap-2">
                  {btnLoading ? <Loader2 className="animate-spin" size={18}/> : <Banknote size={18}/>} {btnLoading ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh] z-10"
            >
              <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-[#0B1120]/50 dark:bg-slate-900/50 shrink-0">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                    {SORT_OPTIONS.map(o => (
                      <button 
                        key={o.value} 
                        onClick={() => setSort(o.value)}
                        className={`flex items-center justify-between px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all ${sort === o.value ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
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
                      { val: 'all',  label: 'Semua Produk' },
                      { val: 'free', label: 'Hanya Gratis' },
                      { val: 'owned', label: 'Sudah Dimiliki' },
                    ].map(({ val, label }) => {
                      const isActive = priceFilter === val;
                      const activeBg = val === 'owned' 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-500 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm' 
                        : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-300 shadow-sm';
                      const hoverBg = val === 'owned' ? 'hover:border-indigo-300 dark:hover:border-indigo-700' : 'hover:border-emerald-300 dark:hover:border-emerald-700';
                      
                      return (
                      <button
                        key={val} 
                        onClick={() => setPriceFilter(val as any)}
                        className={`flex-1 min-w-[120px] px-4 py-2.5 md:py-3 rounded-xl border text-xs font-bold transition-all text-center sm:text-left ${isActive ? activeBg : `bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 ${hoverBg}`}`}
                      >
                        {label}
                      </button>
                    )})}
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
                        className={`px-3 md:px-4 py-2 md:py-2.5 rounded-xl border text-[11px] md:text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-slate-900 border-slate-900 dark:bg-slate-100 dark:border-slate-100 dark:text-slate-950 text-white shadow-md' : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/80'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0">
                <button 
                  onClick={clearAll} 
                  className="flex-1 py-3 md:py-3.5 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-xs md:text-sm transition-colors border border-rose-100 dark:border-rose-900/30"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)} 
                  className="flex-[2] py-3 md:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg shadow-indigo-600/20 dark:shadow-indigo-950/30 active:scale-95 flex justify-center items-center gap-2"
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