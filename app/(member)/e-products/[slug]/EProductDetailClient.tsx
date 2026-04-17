"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, Loader2, CalendarDays,
  ShoppingCart, UserCircle, ShieldCheck, Zap,
  Infinity as InfinityIcon, RefreshCw, BadgeDollarSign, Star,
  MessageSquare, Send, CheckCircle2, Lock, ThumbsUp, DownloadCloud, X
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

const BENEFITS = [
  { icon: InfinityIcon,        label: 'Akses Seumur Hidup',        desc: 'Beli sekali, nikmati selamanya. Tidak ada biaya berulang.',                from: '#6366f1', to: '#8b5cf6', bg: 'bg-indigo-50/50' },
  { icon: RefreshCw,       label: 'Materi Terupdate', desc: 'Konten selalu diperbarui sesuai tren oleh para praktisi terbaik.',          from: '#0ea5e9', to: '#6366f1', bg: 'bg-sky-50/50' },
  { icon: BadgeDollarSign, label: 'Harga Terjangkau',        desc: 'Nilai premium dengan harga bersahabat — investasi terbaik.', from: '#10b981', to: '#0ea5e9', bg: 'bg-emerald-50/50' },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} />
      ))}
    </span>
  );
}

export default function EProductDetailClient({ slug }: { slug: string }) {
  const router       = useRouter();
  const [product,    setProduct]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [isOwned,    setIsOwned]    = useState(false); 

  const [myRating,   setMyRating]   = useState(0);
  const [myReview,   setMyReview]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  
  const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);

  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res  = await apiFetch(`/e-products/${slug}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setProduct(json.data);
          
          if (userData && json.data.reviews) {
            const mine = json.data.reviews.find((r: any) => r.user_id === userData.id);
            if (mine) { 
              setMyRating(mine.rating); 
              setMyReview(mine.review || ''); 
              setSubmitted(true); 
              setIsOwned(true); 
            }
          }
        } else { toast.error('Produk tidak ditemukan.'); router.push('/e-products'); }
      } catch { toast.error('Gagal memuat data.'); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const handlePurchase = async () => {
    if (!userData) {
      toast.error('Silakan masuk terlebih dahulu.');
      sessionStorage.setItem('redirectAfterLogin', `/e-products/${slug}`);
      router.push('/login'); return;
    }
    setBtnLoading(true);
    const tid = toast.loading('Menyiapkan pembayaran Tripay...');
    try {
      const res  = await apiFetch('/checkout/e-product', { 
        method: 'POST', body: JSON.stringify({ e_product_id: product.id, method: 'QRIS' }) 
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) { 
        if (json.message?.toLowerCase().includes('sudah memiliki')) {
          toast.success('Kamu sudah memiliki akses ke produk ini!', { id: tid, icon: '🎉' });
          setIsOwned(true); 
          setIsLockedModalOpen(false); 
        } else {
          toast.error(json.message || 'Gagal memproses pembayaran.', { id: tid }); 
        }
        setBtnLoading(false); return; 
      }
      
      if (json.is_free) { 
        toast.success('Produk gratis berhasil diklaim!', { id: tid }); 
        setIsOwned(true); 
        setIsLockedModalOpen(false);
        setBtnLoading(false); return; 
      }
      
      if (json.checkout_url) {
        toast.success('Mengalihkan ke halaman pembayaran...', { id: tid });
        window.location.href = json.checkout_url;
      } else { 
        toast.error('Gateway tidak tersedia.', { id: tid }); setBtnLoading(false); 
      }
    } catch { toast.error('Kesalahan koneksi.', { id: tid }); setBtnLoading(false); }
  };

  const handleAccessProduct = () => {
    if (!product?.file_path) { toast.error('Materi belum diunggah oleh admin.'); return; }
    if (product.file_path.startsWith('http')) { window.open(product.file_path, '_blank'); } 
    else { window.open(`${STORAGE_URL}/${product.file_path}`, '_blank'); }
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) { toast.error('Pilih bintang terlebih dahulu.'); return; }
    setSubmitting(true);
    try {
      const res  = await apiFetch(`/e-products/${product.id}/reviews`, { 
        method: 'POST', body: JSON.stringify({ rating: myRating, review: myReview }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Ulasan berhasil disimpan!');
        setSubmitted(true);
        const r2 = await apiFetch(`/e-products/${slug}`);
        const j2 = await r2.json();
        if (r2.ok && j2.success) setProduct(j2.data);
      } else { toast.error(json.message || 'Gagal menyimpan ulasan.'); }
    } catch { toast.error('Kesalahan koneksi.'); }
    finally { setSubmitting(false); }
  };

  const formatRupiah = (price: number) =>
    price === 0 ? 'GRATIS'
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const reviews      = product?.reviews || [];
  const totalReviews = product?.reviews_count || reviews.length;
  const avgRating    = parseFloat(product?.reviews_avg_rating) || 0;

  const getAvatar = (user: any) => {
    if (!user?.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${STORAGE_URL}/${user.avatar}`;
  };

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-slate-50">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Loader2 size={36} className="text-indigo-600" />
      </motion.div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat produk...</p>
    </div>
  );

  const isFree = product?.price === 0;

  return (
    <div className="min-h-screen bg-slate-50/80 font-sans pb-28 lg:pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      <style jsx global>{`
        .html-content { font-size: 1rem; line-height: 1.7; color: #475569; word-wrap: break-word; overflow-wrap: break-word; white-space: normal; }
        @media (min-width: 640px) { .html-content { font-size: 1.05rem; line-height: 1.8; } }
        .html-content p { margin-bottom: 1.25em; }
        .html-content strong { color: #0f172a; font-weight: 700; }
        .html-content ul { padding-left: 1.5em; margin-bottom: 1.25em; list-style-type: disc; }
        .html-content ol { padding-left: 1.5em; margin-bottom: 1.25em; list-style-type: decimal; }
        .html-content li { margin-bottom: 0.5em; }
        .html-content h2, .html-content h3 { color: #0f172a; font-weight: 800; margin-top: 2em; margin-bottom: 0.75em; letter-spacing: -0.02em; }
        .html-content h2 { font-size: 1.35rem; } .html-content h3 { font-size: 1.15rem; }
        @media (min-width: 640px) { .html-content h2 { font-size: 1.5rem; } .html-content h3 { font-size: 1.25rem; } }
      `}</style>

      {/* HEADER NAV */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center">
          <Link href="/e-products" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs md:text-sm transition-colors bg-slate-100/50 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-200">
            <ArrowLeft size={16} /> Kembali <span className="hidden sm:inline">ke Katalog</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* KOLOM KIRI (KONTEN UTAMA) */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-8 md:gap-10">
            
            {/* HERO COVER IMAGE */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} 
              className="w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] rounded-[1.5rem] md:rounded-[2rem] bg-slate-200 overflow-hidden relative shadow-sm border border-slate-200/60 group">
              {product.cover_image ? (
                <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-300 gap-3 md:gap-4">
                  <FileText className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1} />
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-300">Digital Asset</span>
                </div>
              )}
              <div className="absolute top-3 md:top-4 left-3 md:left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur text-indigo-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1.5 rounded-full border border-white shadow-sm flex items-center gap-1.5">
                  <Zap size={12} className="fill-indigo-600" /> Digital Product
                </span>
                {isFree && (
                  <span className="bg-emerald-500 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1.5 rounded-full shadow-sm">
                    Gratis
                  </span>
                )}
              </div>
            </motion.div>

            {/* INFO PRODUK */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col gap-5 md:gap-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.2] tracking-tight break-words">
                {product.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-5 gap-y-4 pb-6 md:pb-8 border-b border-slate-200">
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserCircle size={18} className="md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Author</p>
                    <p className="text-xs md:text-sm font-bold text-slate-900">{product.author?.name || 'Amania Official'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Star size={18} className="fill-amber-500 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Rating</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs md:text-sm font-bold text-slate-900">{avgRating > 0 ? avgRating.toFixed(1) : 'Baru'}</p>
                      <span className="text-[10px] md:text-xs text-slate-500 font-medium">({totalReviews} ulasan)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={18} className="md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                    <p className="text-xs md:text-sm font-bold text-emerald-600">Terverifikasi</p>
                  </div>
                </div>
              </div>

              <div className="html-content" dangerouslySetInnerHTML={{ __html: product.description }} />
            </motion.div>

            {/* SEKSI ULASAN */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} 
              className="mt-4 md:mt-8 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-10 shadow-sm">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-6 md:mb-8 flex items-center gap-2.5 md:gap-3">
                <MessageSquare className="text-indigo-500 w-5 h-5 md:w-6 md:h-6" /> Ulasan Pembeli
              </h2>

              {reviews.length === 0 ? (
                <div className="text-center py-10 md:py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed px-4">
                  <ThumbsUp size={36} className="mx-auto mb-3 md:mb-4 text-indigo-200" />
                  <p className="text-slate-900 font-bold text-base md:text-lg mb-1">Belum ada ulasan</p>
                  <p className="text-slate-500 text-xs md:text-sm">Jadilah yang pertama mencoba dan membagikan pengalamanmu!</p>
                </div>
              ) : (
                <div className="grid gap-3 md:gap-4 mb-8 md:mb-10">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100 flex gap-3 md:gap-4">
                      <img src={getAvatar(r.user)} alt="avatar" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-sm shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-2 mb-2">
                          <div>
                            <p className="font-bold text-slate-900 text-xs md:text-sm truncate">{r.user?.name || 'Pengguna Amania'}</p>
                            <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase">{new Date(r.created_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year:'numeric'})}</p>
                          </div>
                          <StarRow rating={r.rating} />
                        </div>
                        {r.review && <p className="text-xs md:text-sm text-slate-600 leading-relaxed break-words">{r.review}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr className="border-slate-100 my-6 md:my-8" />

              {/* Form Ulasan - LOGIKA GEMBOK DENGAN MODAL */}
              <div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500 w-4 h-4 md:w-5 md:h-5"/> {submitted ? 'Ulasan Kamu' : 'Bagikan Pengalamanmu'}
                </h3>

                {!userData ? (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                      <p className="font-bold text-indigo-900 text-sm md:text-base mb-1">Ingin memberi ulasan?</p>
                      <p className="text-xs md:text-sm text-indigo-600/80">Silakan masuk dan selesaikan pembelian terlebih dahulu.</p>
                    </div>
                    <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-xs md:text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors whitespace-nowrap text-center">
                      Masuk ke Akun
                    </Link>
                  </div>
                ) 
                : !isOwned ? (
                  <div 
                    onClick={() => setIsLockedModalOpen(true)}
                    className="bg-slate-50 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 md:mb-4 relative z-10 group-hover:scale-110 transition-transform">
                      <Lock className="text-slate-400 group-hover:text-indigo-500 transition-colors w-5 h-5 md:w-7 md:h-7" />
                    </div>
                    <h4 className="font-black text-slate-900 text-base md:text-lg mb-1 relative z-10">Fitur Review Terkunci</h4>
                    <p className="text-xs md:text-sm text-slate-500 max-w-xs mx-auto relative z-10">
                      Klik di sini untuk membuka form ulasan.
                    </p>
                  </div>
                )
                : submitted ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-emerald-800 text-sm md:text-base mb-2 flex items-center gap-2"><CheckCircle2 size={16}/> Ulasan tersimpan!</p>
                      <StarRow rating={myRating} size={16} />
                      {myReview && <p className="text-xs md:text-sm text-emerald-700 mt-3 bg-white/50 p-3 rounded-lg">{myReview}</p>}
                    </div>
                    <button onClick={() => setSubmitted(false)} className="w-full sm:w-auto text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-4 py-2 rounded-lg transition-colors shrink-0 text-center">Edit Ulasan</button>
                  </div>
                ) 
                : (
                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pilih Rating</label>
                      <div className="flex gap-1 md:gap-2">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} onClick={() => setMyRating(s)} className="p-1 hover:scale-110 transition-transform focus:outline-none">
                            <Star className={`w-7 h-7 md:w-8 md:h-8 ${s <= myRating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Komentar (Opsional)</label>
                      <textarea value={myReview} onChange={(e) => setMyReview(e.target.value)} placeholder="Apa pendapatmu tentang materi ini?" 
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs md:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all min-h-[100px] md:min-h-[120px] resize-none" maxLength={1000} />
                    </div>
                    <button onClick={handleSubmitReview} disabled={submitting || myRating === 0} 
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-slate-900/10">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim Ulasan
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* KOLOM KANAN (SIDEBAR PEMBELIAN) - Sticky on Desktop */}
          <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24">
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/30 overflow-hidden">
              <div className="p-5 sm:p-8">
                <p className="text-[10px] md:text-xs font-black text-indigo-500 uppercase tracking-widest mb-1.5 md:mb-2">Investasi</p>
                <p className={`text-3xl md:text-4xl font-black tracking-tight mb-2 ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>{formatRupiah(product.price)}</p>
                {!isFree && <p className="text-xs md:text-sm font-medium text-slate-500 mb-6 md:mb-8">Pembayaran satu kali untuk akses selamanya.</p>}
                {isFree && <p className="text-xs md:text-sm font-medium text-emerald-600 mb-6 md:mb-8">Tersedia gratis untuk komunitas Amania.</p>}

                <div className="hidden lg:block">
                  {isOwned ? (
                    <button onClick={handleAccessProduct} className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
                      <DownloadCloud size={20} /> Buka / Akses Materi
                    </button>
                  ) : (
                    <button onClick={handlePurchase} disabled={btnLoading} className="w-full py-4 rounded-xl font-black text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
                      {btnLoading ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
                      {isFree ? 'Klaim Gratis Sekarang' : 'Beli Sekarang'}
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-emerald-500" /> 100% Aman & Terenkripsi
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-5 sm:p-8 flex flex-col gap-4 md:gap-5">
                {BENEFITS.map((b) => (
                  <div key={b.label} className="flex gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl ${b.bg} flex items-center justify-center shrink-0`}>
                      <b.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" color={b.from} strokeWidth={2.5}/>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs md:text-sm mb-0.5">{b.label}</p>
                      <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 MOBILE STICKY BOTTOM BAR (Khusus tampil di HP) 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 pb-safe z-50 lg:hidden shadow-[0_-10px_30px_rgba(15,23,42,0.06)] flex items-center justify-between gap-4">
        <div className="shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Harga</p>
          <p className={`text-xl font-black tracking-tight leading-none ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
            {formatRupiah(product.price)}
          </p>
        </div>
        
        {isOwned ? (
          <button onClick={handleAccessProduct} className="flex-1 py-3.5 rounded-xl font-black text-white text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <DownloadCloud size={18} /> Buka Materi
          </button>
        ) : (
          <button onClick={handlePurchase} disabled={btnLoading} className="flex-1 py-3.5 rounded-xl font-black text-white text-sm bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 transition-transform">
            {btnLoading ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
            {isFree ? 'Klaim Gratis' : 'Beli Sekarang'}
          </button>
        )}
      </div>

      {/* 🔥 MODAL POPUP "AKSES TERKUNCI" 🔥 */}
      <AnimatePresence>
        {isLockedModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsLockedModalOpen(false)} 
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-[90%] sm:max-w-md bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 text-center"
            >
              <button onClick={() => setIsLockedModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                <X size={18} />
              </button>
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 border-4 border-white shadow-sm shadow-rose-100">
                <Lock size={28} className="sm:w-8 sm:h-8" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 sm:mb-3">Akses Terkunci</h3>
              
              <p className="text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8 leading-relaxed">
                Hanya pengguna yang telah resmi memiliki produk ini yang diizinkan untuk memberikan ulasan. Ini adalah komitmen Amania untuk menjaga <strong>100% ulasan asli</strong>.
              </p>
              
              <div className="flex flex-col gap-2.5 sm:gap-3">
                <button 
                  onClick={() => { 
                    setIsLockedModalOpen(false); 
                    handlePurchase(); 
                  }} 
                  className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-white text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} /> {isFree ? 'Klaim Gratis Sekarang' : 'Beli Produk Sekarang'}
                </button>
                <button 
                  onClick={() => setIsLockedModalOpen(false)} 
                  className="w-full py-3 sm:py-3.5 rounded-xl font-bold text-slate-500 text-xs sm:text-sm hover:bg-slate-100 transition-colors"
                >
                  Mungkin Nanti Saja
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}