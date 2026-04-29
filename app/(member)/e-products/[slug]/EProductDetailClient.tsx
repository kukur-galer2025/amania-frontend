"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, Loader2,
  ShoppingCart, UserCircle, ShieldCheck, Zap,
  Infinity as InfinityIcon, RefreshCw, Star,
  MessageSquare, Send, CheckCircle2, Lock, ThumbsUp, DownloadCloud, X, AlertCircle,
  AlertTriangle, Crown, BookOpen, Award
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

const BENEFITS = [
  { icon: InfinityIcon, label: 'Akses Selamanya', desc: 'Satu kali bayar untuk aset ini seumur hidup.', bg: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
  { icon: RefreshCw,    label: 'Update Berkala', desc: 'Gratis update jika ada perbaikan materi.', bg: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  { icon: ShieldCheck,  label: 'Lisensi Resmi', desc: '100% legal dan terverifikasi oleh Amania.', bg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400 drop-shadow-sm' : 'text-slate-200'} />
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);

  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res  = await apiFetch(`/e-products/${slug}`, { headers });
        const json = await res.json();
        
        if (res.ok && json.success) {
          setProduct(json.data);
          setIsOwned(json.data.is_purchased === true);
          
          if (userData && json.data.reviews) {
            const mine = json.data.reviews.find((r: any) => r.user_id === userData.id);
            if (mine) { 
              setMyRating(mine.rating); 
              setMyReview(mine.review || ''); 
              setSubmitted(true); 
            }
          }
        } else { 
          toast.error('Produk tidak ditemukan.'); 
          router.push('/e-products'); 
        }
      } catch { 
        toast.error('Gagal memuat data.'); 
      } finally { 
        setLoading(false); 
      }
    })();
  }, [slug]);

  const handleOpenPaymentModal = async () => {
    if (!userData) {
      toast.error('Silakan masuk terlebih dahulu.');
      sessionStorage.setItem('redirectAfterLogin', `/e-products/${slug}`);
      router.push('/login'); return;
    }

    if (product.price === 0) {
      handleProcessCheckout('FREE'); 
      return;
    }

    setIsPaymentModalOpen(true);
    setIsLoadingChannels(true);
    setChannelError(null);

    try {
      const res = await apiFetch('/checkout/payment-channels', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        setPaymentChannels(json.data);
      } else {
        setChannelError(json.message || "Gagal mengambil data metode pembayaran.");
      }
    } catch (error) {
      setChannelError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  const handleProcessCheckout = async (methodOverride?: string) => {
    const finalMethod = methodOverride || selectedChannel;
    
    if (!finalMethod && product.price > 0) {
      toast.error("Pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setBtnLoading(true);
    const tid = toast.loading('Menyiapkan akses eksklusif...');
    
    try {
      const res  = await apiFetch('/checkout/e-product', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ e_product_id: product.id, method: finalMethod }) 
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) { 
        if (json.message?.toLowerCase().includes('sudah memiliki')) {
          toast.success('Akses sudah di tangan Anda!', { id: tid, icon: '💎' });
          setIsOwned(true); 
          setIsPaymentModalOpen(false);
          setIsLockedModalOpen(false); 
        } else {
          toast.error(json.message || 'Gagal memproses pesanan.', { id: tid }); 
        }
        setBtnLoading(false); return; 
      }
      
      if (json.is_free) { 
        toast.success('Produk gratis berhasil diklaim!', { id: tid }); 
        setIsOwned(true); 
        setIsPaymentModalOpen(false);
        setIsLockedModalOpen(false);
        setBtnLoading(false); return; 
      }
      
      if (json.checkout_url) {
        toast.success('Membuka gerbang pembayaran...', { id: tid });
        window.location.href = json.checkout_url;
      } else { 
        toast.error('Gateway tidak tersedia.', { id: tid }); setBtnLoading(false); 
      }
    } catch { toast.error('Kesalahan koneksi.', { id: tid }); setBtnLoading(false); }
  };

  const handleAccessProduct = () => {
    if (!product?.file_path) { toast.error('Materi belum tersedia di server.'); return; }
    if (product.file_path.startsWith('http')) { window.open(product.file_path, '_blank'); } 
    else { window.open(`${STORAGE_URL}/${product.file_path}`, '_blank'); }
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) { toast.error('Berikan bintang terlebih dahulu.'); return; }
    setSubmitting(true);
    try {
      const res  = await apiFetch(`/e-products/${product.id}/reviews`, { 
        method: 'POST', body: JSON.stringify({ rating: myRating, review: myReview }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Ulasan eksklusif Anda tersimpan!');
        setSubmitted(true);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const r2 = await apiFetch(`/e-products/${slug}`, { headers });
        const j2 = await r2.json();
        if (r2.ok && j2.success) {
          setProduct(j2.data);
          setIsOwned(j2.data.is_purchased === true);
        }
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
  const isFree       = product?.price === 0;
  // 🔥 LOGIKA DISKON 90%
  const originalPrice = product ? product.price * 10 : 0; 
  
  const getAvatar = (user: any) => {
    if (!user?.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e2e8f0&color=334155&bold=true`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${STORAGE_URL}/${user.avatar}`;
  };

  const groupedChannels = paymentChannels.reduce((acc, channel) => {
    if (channel.active) {
      if (!acc[channel.group]) acc[channel.group] = [];
      acc[channel.group].push(channel);
    }
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-[#F8FAFC]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
        <Loader2 size={48} className="text-indigo-600" />
      </motion.div>
      <p className="text-sm font-black text-indigo-500/80 uppercase tracking-[0.3em]">Memuat Aset Premium...</p>
    </div>
  );

  return (
    <div className="min-h-screen font-sans pb-32 lg:pb-24 selection:bg-indigo-100 selection:text-indigo-900 w-full flex flex-col relative bg-slate-50 overflow-x-hidden">
      
      {/* ════ GLOBAL CSS ANIMATIONS ════ */}
      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        /* Penyesuaian HTML Content agar responsive di HP */
        .html-content { font-size: 1.05rem; line-height: 1.8; color: #334155; word-wrap: break-word; overflow-wrap: break-word; }
        .html-content p { margin-bottom: 1.5em; max-width: 100%; overflow-x: hidden; }
        .html-content img, .html-content video, .html-content iframe { max-width: 100%; height: auto; border-radius: 0.75rem; margin: 1rem 0; }
        .html-content strong { color: #0f172a; font-weight: 800; }
        .html-content ul { padding-left: 1.5em; margin-bottom: 1.5em; list-style-type: disc; }
        .html-content li { margin-bottom: 0.5em; }
        .html-content h2 { color: #0f172a; font-weight: 900; margin-top: 2.5em; margin-bottom: 1em; font-size: 1.5rem; letter-spacing: -0.02em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* ════ AMBIENT BACKGROUND GLOW ════ */}
      <div className="absolute top-0 left-0 right-0 h-[600px] z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[60%] bg-blue-400/10 blur-[100px] rounded-full" />
      </div>

      {/* HEADER NAV */}
      <div className="relative z-40 w-full pt-6 md:pt-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/e-products" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs md:text-sm transition-colors bg-white/60 hover:bg-white backdrop-blur-md shadow-sm px-5 py-2.5 rounded-full border border-slate-200/60">
            <ArrowLeft size={16} /> Kembali ke Katalog
          </Link>
        </div>
      </div>

      {/* ════ KONTEN UTAMA ════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          
          {/* KOLOM KIRI (KONTEN) */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-8 md:gap-12">
            
            {/* 1. HEADER & COVER */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start pt-4 w-full">
               
               {/* Animated Floating Cover */}
               <motion.div 
                animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="w-[240px] sm:w-[300px] md:w-[340px] max-w-full aspect-[2/3] shrink-0 rounded-[2rem] bg-white overflow-hidden relative shadow-[0_25px_50px_-12px_rgba(79,70,229,0.3)] border-4 border-white/60 group z-10 mx-auto md:mx-0"
               >
                {product.cover_image ? (
                  <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-300 gap-4">
                    <FileText className="w-20 h-20" strokeWidth={1} />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Premium Asset</span>
                  </div>
                )}
                
                {/* Status Badges on Cover */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {isOwned && (
                    <span className="bg-indigo-600/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 w-fit border border-white/20">
                      <CheckCircle2 size={14} /> Dimiliki
                    </span>
                  )}
                  {isFree && !isOwned && (
                    <span className="bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg w-fit border border-white/20">
                      100% Gratis
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Title & Meta Info */}
              <div className="flex-1 flex flex-col text-center md:text-left w-full min-w-0 mt-4 md:mt-0">
                <div className="inline-flex items-center justify-center md:justify-start gap-1.5 px-3 py-1.5 bg-indigo-100/50 border border-indigo-200/50 rounded-full text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-4 w-fit mx-auto md:mx-0">
                  <Crown size={14} className="text-indigo-500" /> {product.category?.name || 'Aset Eksklusif'}
                </div>
                
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight mb-6 drop-shadow-sm break-words">
                  {product.title}
                </h1>

                {/* Social Proof Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm shrink-0">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-slate-800">{avgRating > 0 ? avgRating.toFixed(1) : '5.0'}</span>
                    <span className="text-xs font-bold text-slate-400">({totalReviews} Ulasan)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm shrink-0">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Terverifikasi Original</span>
                  </div>
                </div>

                {/* Author Box */}
                <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center gap-4 w-full md:w-max shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden shrink-0">
                    {product.author?.avatar ? <img src={`${STORAGE_URL}/${product.author.avatar}`} alt="author" className="w-full h-full object-cover"/> : <UserCircle size={28} />}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Author / Kreator</p>
                    <p className="text-sm md:text-base font-bold text-slate-900 truncate">{product.author?.name || 'Amania Official'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. DESKRIPSI HTML CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} 
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 w-full mt-4 overflow-hidden">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-none mb-1.5">Detail Materi</h2>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Apa yang akan Anda dapatkan</p>
                </div>
              </div>
              <div className="html-content w-full" dangerouslySetInnerHTML={{ __html: product.description }} />
            </motion.div>

            {/* 3. SEKSI ULASAN */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} 
              className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 w-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100/50 shrink-0">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-slate-900 leading-none mb-1.5">Ulasan Pembeli</h2>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Testimoni asli komunitas</p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-10 md:py-12 bg-slate-50 rounded-3xl border border-slate-200 border-dashed px-4 w-full">
                  <ThumbsUp size={40} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-900 font-black text-base md:text-lg mb-1">Belum ada ulasan</p>
                  <p className="text-slate-500 text-xs md:text-sm">Jadilah yang pertama membuktikan kualitas materi ini.</p>
                </div>
              ) : (
                <div className="grid gap-4 mb-12 w-full">
                  {reviews.map((r: any) => (
                    <div key={r.id} className="p-5 md:p-6 rounded-3xl bg-white border border-slate-100 flex gap-4 w-full min-w-0 hover:border-indigo-100 hover:shadow-[0_4px_20px_rgba(79,70,229,0.05)] transition-all duration-300">
                      <img src={getAvatar(r.user)} alt="avatar" className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-sm shrink-0 border border-slate-100" />
                      <div className="min-w-0 flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 w-full">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{r.user?.name || 'Member Eksklusif'}</p>
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', {day: 'numeric', month:'short', year:'numeric'})}</p>
                          </div>
                          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit shrink-0">
                            <StarRow rating={r.rating} size={14} />
                          </div>
                        </div>
                        {r.review && <p className="text-xs md:text-sm text-slate-600 leading-relaxed break-words w-full">{r.review}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Ulasan */}
              <div className="w-full mt-8 md:mt-10 pt-8 border-t border-slate-100">
                <h3 className="text-base md:text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Star className="text-amber-500 fill-amber-500 w-5 h-5 shrink-0"/> {submitted ? 'Ulasan Anda' : 'Berikan Penilaian'}
                </h3>

                {!userData ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left w-full">
                    <div>
                      <p className="font-black text-slate-900 text-sm md:text-base mb-1">Akses Penilaian Terkunci</p>
                      <p className="text-xs md:text-sm text-slate-500">Anda harus masuk dan memiliki produk ini.</p>
                    </div>
                    <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 shrink-0">
                      Masuk Sistem
                    </Link>
                  </div>
                ) 
                : !isOwned ? (
                  <div onClick={() => setIsLockedModalOpen(true)} className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-6 md:p-12 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition-colors group relative overflow-hidden w-full">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 relative z-10 border border-slate-200 group-hover:scale-110 transition-transform">
                      <Lock className="text-slate-400 group-hover:text-amber-500 transition-colors w-6 h-6" />
                    </div>
                    <h4 className="font-black text-slate-900 text-lg md:text-xl mb-2 relative z-10">Kawasan Khusus Pemilik</h4>
                    <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto relative z-10">Beli akses produk untuk membuka fitur penilaian ini.</p>
                  </div>
                )
                : submitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-emerald-800 text-base md:text-lg mb-3 flex items-center gap-2"><CheckCircle2 size={18}/> Tersimpan di Sistem</p>
                      <StarRow rating={myRating} size={18} />
                      {myReview && <p className="text-xs md:text-sm text-emerald-900 mt-4 bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm break-words">{myReview}</p>}
                    </div>
                    <button onClick={() => setSubmitted(false)} className="w-full sm:w-auto text-xs font-bold text-emerald-700 bg-emerald-200/50 hover:bg-emerald-200 px-6 py-3 rounded-xl transition-colors shrink-0">Edit Ulasan</button>
                  </div>
                ) 
                : (
                  <div className="space-y-6 w-full bg-slate-50 p-5 md:p-8 rounded-3xl border border-slate-200 shadow-inner">
                    <div>
                      <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Tingkat Kepuasan</label>
                      <div className="flex gap-1 md:gap-2">
                        {[1,2,3,4,5].map((s) => (
                          <button key={s} onClick={() => setMyRating(s)} className="p-1.5 hover:scale-110 transition-transform focus:outline-none">
                            <Star className={`w-8 h-8 md:w-10 md:h-10 ${s <= myRating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Opini Anda (Opsional)</label>
                      <textarea value={myReview} onChange={(e) => setMyReview(e.target.value)} placeholder="Tuliskan pengalaman berharga Anda..." 
                        className="w-full p-4 md:p-5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all min-h-[120px] resize-none shadow-sm" maxLength={1000} />
                    </div>
                    <button onClick={handleSubmitReview} disabled={submitting || myRating === 0} 
                      className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-indigo-600 text-white font-black text-sm rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_8px_20px_rgba(79,70,229,0.3)]">
                      {submitting ? <Loader2 size={18} className="animate-spin shrink-0" /> : <Send size={18} className="shrink-0" />} Publish Ulasan
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* KOLOM KANAN (THE LUXURY CHECKOUT VAULT) - Sticky on Desktop */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 mt-4 md:mt-8 lg:mt-0 z-30">
            
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden relative flex flex-col w-full group/vault">
              
              <div className="p-6 md:p-10 relative z-10 bg-gradient-to-b from-white to-slate-50">
                {/* INDIKATOR KEPEMILIKAN */}
                {isOwned ? (
                  <div className="inline-flex items-center gap-2 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl w-fit shadow-sm">
                    <CheckCircle2 size={16} strokeWidth={2.5}/>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Akses Terbuka</p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 mb-6 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-xl w-fit shadow-sm">
                    <Zap size={14} className="fill-indigo-600" />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Investasi Aset</p>
                  </div>
                )}

                {/* 🔥 HARGA & DISKON CORET (DESKTOP) 🔥 */}
                {!isFree && !isOwned && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs md:text-sm font-bold text-slate-400 line-through decoration-rose-500/60 decoration-2">
                      {formatRupiah(originalPrice)}
                    </span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                      90% OFF
                    </span>
                  </div>
                )}
                
                <p className={`text-3xl md:text-4xl xl:text-5xl font-black tracking-tighter mb-2 break-words ${isFree || isOwned ? 'text-emerald-500' : 'text-slate-900'}`}>
                  {isOwned ? 'Terverifikasi' : formatRupiah(product.price)}
                </p>
                
                {!isFree && !isOwned && <p className="text-xs md:text-sm font-medium text-slate-500 mb-8 md:mb-10">Pembayaran 1x. Tanpa biaya tersembunyi.</p>}
                {isFree && !isOwned && <p className="text-xs md:text-sm font-medium text-emerald-600 mb-8 md:mb-10">Akses premium gratis khusus Anda.</p>}
                {isOwned && <p className="text-xs md:text-sm font-medium text-indigo-600 mb-8 md:mb-10">Bahan belajar sudah masuk di brankas Anda.</p>}

                {/* TOMBOL AKSI (DESKTOP) */}
                <div className="hidden lg:block w-full">
                  {isOwned ? (
                    <button onClick={handleAccessProduct} className="relative w-full py-4 md:py-5 rounded-2xl font-black text-white text-sm md:text-base bg-emerald-500 hover:bg-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 overflow-hidden group">
                      <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer"></span>
                      <DownloadCloud size={20} className="shrink-0 relative z-10" /> <span className="relative z-10">Buka Materi Sekarang</span>
                    </button>
                  ) : (
                    <button onClick={handleOpenPaymentModal} disabled={btnLoading} className="relative w-full py-4 md:py-5 rounded-2xl font-black text-white text-sm md:text-base bg-slate-900 hover:bg-indigo-600 shadow-[0_10px_30px_rgba(15,23,42,0.2)] hover:shadow-[0_10px_30px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 overflow-hidden group/btn">
                      <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
                      {btnLoading ? <Loader2 size={20} className="animate-spin shrink-0 relative z-10" /> : <ShoppingCart size={20} className="shrink-0 relative z-10" />}
                      <span className="relative z-10">{isFree ? 'Klaim Gratis Sekarang' : 'Dapatkan Akses Sekarang'}</span>
                    </button>
                  )}
                </div>

                {/* Trust Sign under button */}
                {!isOwned && (
                  <div className="hidden lg:flex items-center justify-center gap-2 mt-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    <Lock size={12} className="shrink-0" /> Pembayaran Terenkripsi Aman
                  </div>
                )}
              </div>

              {/* BENEFITS SECTION */}
              <div className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-10 flex flex-col gap-5 md:gap-6 w-full relative z-10">
                {BENEFITS.map((b) => (
                  <div key={b.label} className="flex gap-3 md:gap-4 w-full min-w-0 items-start">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${b.bg} ${b.border} border flex items-center justify-center shrink-0`}>
                      <b.icon size={20} strokeWidth={2.5}/>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-bold text-slate-900 text-xs md:text-sm mb-1">{b.label}</p>
                      <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 🔥 ANTI PIRACY WARNING PREMIUM 🔥 */}
              <div className="bg-rose-50/50 border-t border-rose-100 p-5 md:p-8 w-full flex items-start gap-3 md:gap-4 relative z-10">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200">
                  <AlertTriangle size={16} className="text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] md:text-xs font-black text-rose-900 mb-1.5 uppercase tracking-widest">Peringatan Lisensi</p>
                  <p className="text-[10px] md:text-[11px] text-rose-700/80 leading-relaxed font-medium">
                    Materi dilindungi Hukum Hak Cipta. <strong>Dilarang keras</strong> menggandakan atau memperjualbelikan aset ini tanpa izin resmi Amania.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 MOBILE STICKY BOTTOM BAR (Khusus tampil di HP) 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 p-3.5 pb-safe z-[50] lg:hidden shadow-[0_-15px_40px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 w-full">
        <div className="shrink-0 flex flex-col justify-center min-w-0 max-w-[45%]">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate w-full">
            {isOwned ? 'Status Lisensi' : 'Investasi'}
          </p>
          
          {/* 🔥 HARGA CORET MOBILE 🔥 */}
          {!isFree && !isOwned && (
             <p className="text-[10px] font-bold text-slate-400 line-through decoration-rose-500/50 mb-0.5 truncate w-full">
               {formatRupiah(originalPrice)}
             </p>
          )}

          <p className={`text-lg sm:text-xl font-black tracking-tight leading-none truncate w-full ${isFree || isOwned ? 'text-emerald-500' : 'text-slate-900'}`}>
            {isOwned ? 'Akses Resmi' : formatRupiah(product.price)}
          </p>
        </div>
        
        {isOwned ? (
          <button onClick={handleAccessProduct} className="flex-1 min-w-0 py-3 rounded-xl font-black text-white text-xs sm:text-sm bg-emerald-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
            <DownloadCloud size={16} className="shrink-0" /> <span className="truncate">Buka Materi</span>
          </button>
        ) : (
          <button onClick={handleOpenPaymentModal} disabled={btnLoading} className="relative flex-1 min-w-0 py-3 rounded-xl font-black text-white text-xs sm:text-sm bg-slate-900 shadow-[0_4px_15px_rgba(15,23,42,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-70 active:scale-95 transition-transform overflow-hidden group">
            <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></span>
            {btnLoading ? <Loader2 size={16} className="animate-spin shrink-0 relative z-10" /> : <ShoppingCart size={16} className="shrink-0 relative z-10" />}
            <span className="truncate relative z-10">{isFree ? 'Klaim Gratis' : 'Beli Sekarang'}</span>
          </button>
        )}
      </div>

      {/* 🔥 MODAL POPUP "AKSES TERKUNCI" 🔥 */}
      <AnimatePresence>
        {isLockedModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLockedModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm w-full h-full" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-[90%] sm:max-w-md bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 md:p-10 text-center">
              <button onClick={() => setIsLockedModalOpen(false)} className="absolute top-4 right-4 md:top-5 md:right-5 p-2 text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X size={16} />
              </button>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 md:mb-6 border border-amber-100">
                <Lock size={28} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-3">Area VIP Eksklusif</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 leading-relaxed px-2">
                Fitur ulasan hanya terbuka bagi member yang telah resmi memiliki aset digital ini demi menjaga <strong>kredibilitas 100%</strong> di platform Amania.
              </p>
              <div className="flex flex-col gap-2.5 w-full">
                <button onClick={() => { setIsLockedModalOpen(false); handleOpenPaymentModal(); }} className="w-full py-3.5 md:py-4 rounded-xl font-black text-white text-xs md:text-sm bg-indigo-600 hover:bg-indigo-700 transition-all shadow-[0_8px_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2">
                  <ShoppingCart size={16} className="shrink-0" /> {isFree ? 'Klaim Akses Gratis' : 'Dapatkan Akses Resmi'}
                </button>
                <button onClick={() => setIsLockedModalOpen(false)} className="w-full py-3 rounded-xl font-bold text-slate-500 text-xs md:text-sm hover:text-slate-900 hover:bg-slate-100 transition-colors">
                  Tutup Peringatan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔥 MODAL PEMILIHAN PEMBAYARAN TRIPAY 🔥 */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-full h-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm w-full h-full" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }} className="relative bg-white rounded-[2rem] shadow-2xl w-full md:w-[600px] max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full shrink-0">
                <div className="min-w-0 pr-4">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 truncate w-full">Metode Pembayaran</h3>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest truncate w-full">Sistem Terenkripsi Aman</p>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors shrink-0">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50 w-full">
                {isLoadingChannels ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 w-full">
                    <Loader2 size={40} className="text-indigo-600 animate-spin" />
                    <p className="text-xs md:text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Menghubungkan Gateway...</p>
                  </div>
                ) : channelError ? (
                  <div className="text-center py-10 w-full">
                    <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
                    <p className="text-slate-900 font-black text-base md:text-lg mb-2">Terjadi Kesalahan</p>
                    <p className="text-slate-500 font-medium text-xs md:text-sm px-4">{channelError}</p>
                  </div>
                ) : Object.keys(groupedChannels).length === 0 ? (
                  <div className="text-center py-10 w-full">
                    <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium text-xs md:text-sm">Metode pembayaran tidak tersedia saat ini.</p>
                  </div>
                ) : (
                  <div className="space-y-6 md:space-y-8 w-full">
                    {(Object.entries(groupedChannels) as [string, any[]][]).map(([groupName, channels]) => (
                      <div key={groupName} className="w-full">
                        <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 ml-1 md:ml-2">{groupName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 w-full">
                          {channels.map((channel: any) => (
                            <button key={channel.code} onClick={() => setSelectedChannel(channel.code)} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all w-full min-w-0 ${selectedChannel === channel.code ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-200 bg-white hover:border-indigo-300 shadow-sm'}`}>
                              <div className="w-12 h-8 md:w-14 md:h-10 shrink-0 bg-white rounded-lg flex items-center justify-center px-1.5 md:px-2 py-1 border border-slate-100">
                                <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs md:text-sm font-bold truncate w-full ${selectedChannel === channel.code ? 'text-indigo-800' : 'text-slate-700'}`}>
                                  {channel.name}
                                </p>
                              </div>
                              {selectedChannel === channel.code && <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-5 md:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 w-full shrink-0">
                <div className="text-center sm:text-left w-full sm:w-auto min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate w-full flex items-center justify-center sm:justify-start gap-1"><ShieldCheck size={12}/> Tagihan Terenkripsi</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none truncate w-full">{formatRupiah(product.price)}</p>
                </div>
                <button onClick={() => handleProcessCheckout()} disabled={!selectedChannel || btnLoading || !!channelError} className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_8px_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2 active:scale-95 shrink-0 min-w-0">
                  {btnLoading ? <><Loader2 size={18} className="animate-spin shrink-0" /> <span className="truncate">Memproses...</span></> : <span className="truncate">Selesaikan Pembayaran</span>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}