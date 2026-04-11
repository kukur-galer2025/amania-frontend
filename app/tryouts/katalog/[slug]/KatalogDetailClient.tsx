"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// 🔥 PERBAIKAN: Import Variants dari framer-motion
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, Clock, FileQuestion, CheckCircle2, 
  ShieldCheck, Target, Sparkles, BookOpen, Banknote, Info, Flame, LayoutList, X, AlertCircle, Loader2
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

// 🔥 PERBAIKAN: Tambahkan tipe : Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

// 🔥 PERBAIKAN: Tambahkan tipe : Variants
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

export default function KatalogDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  
  // State untuk Modal & Checkout
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/tryout/skd/katalog`);
        const json = await res.json();
        
        if (res.ok && json.success) {
          const detailTryout = json.data.find((t: any) => t.slug === slug);
          if (detailTryout) {
            setData(detailTryout);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Fungsi membuka Modal & Fetch Metode Pembayaran
  const handleOpenPaymentModal = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Silakan login terlebih dahulu untuk membeli paket.");
      router.push('/login');
      return;
    }

    setIsModalOpen(true);
    setIsLoadingChannels(true);
    setErrorMessage(null);

    try {
      const res = await apiFetch('/tryout/skd/payment-channels');
      const json = await res.json();
      
      if (res.ok && json.success) {
        // Cek struktur respons yang baru dari Controller
        if (Array.isArray(json.data) && json.data.length > 0) {
            setPaymentChannels(json.data);
        } else {
            setErrorMessage("Metode pembayaran kosong dari server.");
        }
      } else {
        setErrorMessage(json.message || "Gagal mengambil data dari Tripay.");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setErrorMessage("Terjadi kesalahan jaringan atau server down.");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Fungsi Proses Checkout ke Backend Laravel
  const handleProcessCheckout = async () => {
    if (!selectedChannel) {
      alert("Silakan pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const res = await apiFetch('/tryout/skd/checkout', {
        method: 'POST',
        body: JSON.stringify({
          skd_tryout_id: data.id,
          method: selectedChannel
        })
      });
      
      const json = await res.json();

      if (res.ok && json.success) {
        // Arahkan user ke URL Pembayaran Tripay
        window.location.href = json.data.checkout_url;
      } else {
        alert(json.message || "Gagal memproses checkout.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses checkout.");
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-6 relative z-10 text-center">
          <div className="w-20 h-20 border-[6px] border-sky-100 border-t-orange-500 rounded-full animate-spin shadow-lg"></div>
          <p className="text-sm font-black text-sky-600 tracking-widest uppercase animate-pulse">Menyiapkan Paket Tryout...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-50 rounded-full blur-[120px] pointer-events-none" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-slate-200/50 mb-8 border border-slate-100 relative">
            <Info size={56} className="text-slate-300" />
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-3xl" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Paket Tidak Ditemukan</h2>
          <p className="text-slate-600 font-medium max-w-sm mb-10 leading-relaxed">Maaf, paket simulasi tryout yang Anda tuju mungkin belum diaktifkan atau tautannya tidak valid.</p>
          <button onClick={() => router.push('/tryouts/katalog')} className="px-10 py-5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-black shadow-[0_10px_40px_-10px_rgba(2,132,199,0.6)] transition-all active:scale-95 flex items-center gap-3 text-base group">
            <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" /> Jelajahi Katalog Tryout
          </button>
        </motion.div>
      </div>
    );
  }

  const originalPrice = Number(data.price);
  const discountPrice = data.discount_price ? Number(data.discount_price) : 0;
  const isDiscount = discountPrice > 0 && discountPrice < originalPrice;
  const activePrice = isDiscount ? discountPrice : originalPrice;
  const isFree = activePrice === 0;

  // 🔥 FIX: Typed explicitly as Record<string, any[]> to avoid TypeScript 'unknown' error on Object.entries
  const groupedChannels = paymentChannels.reduce((acc, channel) => {
    if (channel.active) {
      if (!acc[channel.group]) acc[channel.group] = [];
      acc[channel.group].push(channel);
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="w-full bg-slate-50 min-h-screen relative pb-28 md:pb-32 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-sky-600 -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-slate-50 rounded-t-[3rem] md:rounded-t-[5rem] translate-y-1/2" />
        <div className="absolute top-[-20%] left-[-15%] w-[600px] h-[600px] bg-white/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-[110px] pointer-events-none" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        <Link href="/tryouts/katalog" className="inline-flex items-center gap-2.5 text-sm font-black text-orange-600 hover:text-orange-700 mb-8 md:mb-12 transition-all bg-white px-6 py-3 rounded-full shadow-[0_10px_30px_-10px_rgba(249,115,22,0.3)] hover:shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] border border-orange-100 group relative z-50">
          <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" /> Kembali ke Katalog
        </Link>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col lg:flex-row lg:items-start gap-8 xl:gap-12 relative z-10">
          
          <div className="flex-1 min-w-0 space-y-6 md:space-y-8">
            <motion.div variants={itemVariants} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-50 rounded-full blur-[50px] pointer-events-none transition-colors group-hover:bg-sky-100/70" />

              <div className="flex flex-wrap items-center gap-3 mb-8 relative z-10">
                <span className="px-4 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">
                  {data.category?.name || 'CPNS/Kedinasan'}
                </span>
                {data.is_hots == 1 && (
                  <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5 shadow-sm">
                    <Flame size={14} className="text-rose-500" /> Soal HOTS
                  </span>
                )}
                {data.questions_count > 1000 && (
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={14} className="text-amber-500" /> Paket Bundling
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight relative z-10">
                {data.title}
              </h1>
              
              {data.description ? (
                <div 
                  className="text-slate-600 font-medium leading-relaxed md:text-lg break-words whitespace-pre-wrap [&>p]:mb-4 relative z-10 w-full"
                  dangerouslySetInnerHTML={{ __html: data.description }} 
                />
              ) : (
                <p className="text-slate-600 font-medium leading-relaxed md:text-lg break-words whitespace-pre-wrap relative z-10 w-full">
                  Paket super lengkap untuk persiapan seleksi CPNS/Sekolah Kedinasan. Disusun langsung oleh ahli materi berdasarkan Field Report (FR) terbaru. Dapatkan pengalaman simulasi terbaik.
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="p-5 md:p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform group">
                <div className="w-16 h-16 rounded-3xl bg-sky-50 flex items-center justify-center text-sky-600 border border-sky-100 group-hover:bg-sky-100 transition-colors"><FileQuestion size={32}/></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Total Soal</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{data.questions_count || 110}</p>
                </div>
              </div>
              <div className="p-5 md:p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform group">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100 group-hover:bg-orange-100 transition-colors"><Clock size={32}/></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Waktu Ujian</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{data.duration_minutes} Menit</p>
                </div>
              </div>
              <div className="col-span-2 md:col-span-1 p-5 md:p-6 bg-white rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform group">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 group-hover:bg-emerald-100 transition-colors"><ShieldCheck size={32}/></div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sistem Penilaian</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">CAT BKN</p>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 shadow-inner">
                  <Target className="text-sky-600" size={30} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Fasilitas Lengkap</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">Yang Anda Dapatkan</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                {[
                  'Penilaian CAT Standar BKN & Skoring TKP Bertingkat',
                  'Perankingan Skala Nasional secara Real-time',
                  'Pembahasan Teks Lengkap & Mudah Dipahami',
                  'Grafik Evaluasi Perkembangan Nilai',
                  'Akses 24 Jam Non-Stop Melalui Perangkat Apapun'
                ].map((item: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-4.5 p-6 bg-slate-50/80 rounded-2xl border border-slate-100 transition-colors">
                    <CheckCircle2 size={22} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span className="font-bold text-slate-700 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          <motion.div variants={itemVariants} className="hidden lg:block w-[400px] shrink-0 sticky top-[110px]">
            <div className="bg-white rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-[0_30px_70px_-20px_rgba(2,132,199,0.15)] relative overflow-hidden">
              
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-100 rounded-full blur-[50px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-sky-100 rounded-full blur-[50px] pointer-events-none" />

              <div className="mb-10 text-center relative z-10">
                {isDiscount && (
                  <div className="flex items-center justify-center gap-3.5 mb-2.5">
                    <span className="text-sm font-bold text-slate-400 line-through decoration-rose-500 decoration-2">Rp {originalPrice.toLocaleString('id-ID')}</span>
                    <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black tracking-widest uppercase rounded-lg border border-rose-200">
                      HEMAT {(100 - (discountPrice/originalPrice)*100).toFixed(0)}%
                    </span>
                  </div>
                )}
                <h3 className={`text-5xl lg:text-6xl font-black tracking-tight ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
                  {isFree ? 'GRATIS' : `Rp ${activePrice.toLocaleString('id-ID')}`}
                </h3>
              </div>

              <button 
                onClick={handleOpenPaymentModal}
                className="relative z-10 w-full py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-[1.5rem] font-black text-lg transition-all flex items-center justify-center gap-3.5 shadow-[0_15px_30px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_40px_-10px_rgba(249,115,22,0.7)] active:scale-95 mb-10 group"
              >
                <Banknote size={24} strokeWidth={2.5} className="group-hover:-rotate-12 transition-transform duration-300" /> {isFree ? 'Ambil Paket Ini' : 'Beli Paket Sekarang'}
              </button>

              <div className="border-t border-slate-100/70 pt-8 relative z-10">
                <div className="flex items-center gap-2.5 mb-6">
                  <LayoutList size={18} className="text-sky-500" />
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Ringkasan Komposisi Materi</p>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-slate-700">Tes Wawasan Kebangsaan (TWK)</span>
                    <span className="text-xs font-black text-sky-600 bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100">30 Soal</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-bold text-slate-700">Tes Intelegensia Umum (TIU)</span>
                    <span className="text-xs font-black text-sky-600 bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-100">35 Soal</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 border-orange-100 bg-orange-50/20">
                    <span className="text-xs font-bold text-slate-700">Tes Karakteristik Pribadi (TKP)</span>
                    <span className="text-xs font-black text-orange-500 bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-orange-100">45 Soal</span>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>

        </motion.div> 
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-sky-100/50 p-4 pb-safe z-40 shadow-[0_-15px_40px_rgba(2,132,199,0.1)]">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          <div className="flex-1 min-w-0">
            {isDiscount && (
              <p className="text-[10px] font-bold text-slate-400 line-through truncate mb-1 decoration-rose-500 decoration-2">Rp {originalPrice.toLocaleString('id-ID')}</p>
            )}
            <p className={`text-2xl sm:text-3xl font-black truncate tracking-tight leading-none ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
              {isFree ? 'GRATIS' : `Rp ${activePrice.toLocaleString('id-ID')}`}
            </p>
          </div>
          <button 
            onClick={handleOpenPaymentModal}
            className="flex-shrink-0 px-8 py-4.5 sm:px-10 bg-orange-500 active:bg-orange-600 text-white rounded-[1.25rem] font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-[0_10px_20px_-5px_rgba(249,115,22,0.5)] group active:scale-95"
          >
            <Banknote size={20} strokeWidth={2.5} className="sm:size-22" /> <span className="hidden sm:inline">Beli</span> Paket
          </button>
        </div>
      </div>

      {/* 🔥 MODAL PEMILIHAN PEMBAYARAN TRIPAY 🔥 */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[101] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-auto md:w-[600px] max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900">Metode Pembayaran</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Pilih Channel Favorit Anda</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-slate-50">
                {isLoadingChannels ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 size={40} className="text-sky-500 animate-spin" />
                    <p className="text-sm font-bold text-slate-500 animate-pulse">Menghubungkan ke Tripay...</p>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center py-10">
                    <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold mb-2">Terjadi Kesalahan</p>
                    <p className="text-slate-500 font-medium text-sm">{errorMessage}</p>
                    <p className="text-xs text-slate-400 mt-4 px-4 bg-slate-100 py-2 rounded-lg inline-block">Cek kembali konfigurasi .env dan pastikan telah run <code className="font-mono text-rose-500">php artisan config:clear</code> di server.</p>
                  </div>
                ) : Object.keys(groupedChannels).length === 0 ? (
                  <div className="text-center py-10">
                    <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">Metode pembayaran tidak tersedia saat ini.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* 🔥 FIX: Cast to [string, any[]][] to fix TypeScript 'unknown' error */}
                    {(Object.entries(groupedChannels) as [string, any[]][]).map(([groupName, channels]) => (
                      <div key={groupName}>
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">{groupName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {channels.map((channel: any) => (
                            <button
                              key={channel.code}
                              onClick={() => setSelectedChannel(channel.code)}
                              className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                                selectedChannel === channel.code 
                                  ? 'border-sky-500 bg-sky-50/50 shadow-md' 
                                  : 'border-white bg-white hover:border-sky-200 shadow-sm'
                              }`}
                            >
                              <div className="w-12 h-10 shrink-0 bg-white rounded-lg flex items-center justify-center px-1">
                                <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${selectedChannel === channel.code ? 'text-sky-700' : 'text-slate-700'}`}>
                                  {channel.name}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left w-full sm:w-auto">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                  <p className="text-2xl font-black text-slate-900 leading-none">Rp {activePrice.toLocaleString('id-ID')}</p>
                </div>
                <button 
                  onClick={handleProcessCheckout}
                  disabled={!selectedChannel || isProcessingCheckout || !!errorMessage}
                  className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-[1.25rem] font-black transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isProcessingCheckout ? (
                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  ) : (
                    <>Bayar Sekarang <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>

    </div>
  );
}
