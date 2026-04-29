"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Clock, CheckCircle2, 
  BookOpen, FileText, Video, AlertCircle, Share2, Award, 
  Sparkles, Zap, Ticket, Gem, ChevronRight, ShieldCheck,
  Loader2, User, Briefcase, ArrowRight, Lock, Info, Download,
  ArrowLeft, DownloadCloud, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

// ─────────────────────────────────────────────────────────────────────────────
// processQuillHtml — v3 (Fungsi Sakti untuk Merapikan HTML dari Admin)
// ─────────────────────────────────────────────────────────────────────────────
const BASE_P_STYLE =
  'margin:0;padding:0;line-height:1.7;overflow-wrap:break-word;word-break:normal;hyphens:none;-webkit-hyphens:none;';

const WC = 'a-zA-Z\\u00C0-\\u024F\\u1E00-\\u1EFF0-9';
const IC = '(?:<\\/(?:span|strong|em|b|i|u|s|code|a|mark|sup|sub)[^>]*>\\s*)*';
const IO = '(?:\\s*<(?:span|strong|em|b|i|u|s|code|a|mark|sup|sub)[^>]*>)*';

const processQuillHtml = (html: string): string => {
  if (!html) return '';
  let r = html.replace(/\r\n?/g, '\n');
  r = r.replace(/[\u200B-\u200D\uFEFF]/g, ''); 
  r = r.replace(/&shy;/gi, '');                
  r = r.replace(/&nbsp;/gi, ' ');              

  {
    let prev = '';
    while (prev !== r) {
      prev = r;
      r = r.replace(new RegExp(`([${WC}])${IC}<\\/p>[ \\t\\n]*<p(?:\\s[^>]*)?>[ \\t\\n]*${IO}([${WC}])`, 'g'), '$1$2');
    }
  }

  {
    let prev = '';
    while (prev !== r) {
      prev = r;
      r = r.replace(new RegExp(`([${WC}])${IC}<br[ \\t]*\\/?>[ \\t\\n]*${IO}([${WC}])`, 'g'), '$1$2');
    }
  }

  r = r.replace(new RegExp(`([${WC}])[ \\t]*\\n+[ \\t]*([${WC}])`, 'g'), '$1$2');
  r = r.replace(/ {2,}/g, ' ');
  r = r.replace(/<p><\/p>/g, `<p style="${BASE_P_STYLE}min-height:1.617em;"></p>`);
  r = r.replace(/<p><br\s*\/?><\/p>/gi, `<p style="${BASE_P_STYLE}min-height:1.617em;"><br></p>`);
  r = r.replace(/<p(\s[^>]*)?>/g, (_, attrs = '') => {
    if (attrs.includes('style=')) {
      return `<p${attrs.replace(/style="([^"]*)"/, `style="${BASE_P_STYLE}$1"`)}>`;
    }
    return `<p${attrs} style="${BASE_P_STYLE}">`;
  });

  return r;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER CONVERT HTML TO PLAIN TEXT (Untuk WhatsApp Share)
// ─────────────────────────────────────────────────────────────────────────────
const stripHtmlToText = (html: string) => {
  if (!html) return '';
  let text = html.replace(/<br\s*[\/]?>/gi, ' ').replace(/<\/p>/gi, ' ');
  text = text.replace(/<[^>]*>?/gm, '');
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'")
             .replace(/\s+/g, ' '); 
  return text.trim();
};

export default function MyEventDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'curriculum'>('curriculum');
  const [isSharing, setIsSharing] = useState(false);
  
  // 🔥 STATE HITUNG MUNDUR (REAL TIME)
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/my-events/${slug}`);
        if (!res.ok) throw new Error("Gagal mengambil detail");
        const data = await res.json();
        if (data.success) {
          setEvent(data.data);
        } else {
          setEvent(null);
        }
      } catch (error) {
        toast.error("Gagal memuat detail program.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  // 🔥 EFEK COUNTDOWN (UPDATE SETIAP MENIT) 🔥
  useEffect(() => {
    if (!event?.start_time) return;

    const updateTimer = () => {
      // Perbaikan timezone yang aman
      let safeStr = event.start_time.replace(' ', 'T');
      if (!safeStr.includes('Z') && !safeStr.includes('+')) {
        safeStr += '+07:00';
      }
      
      const targetDate = new Date(safeStr).getTime();
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      if (days > 0) {
        setTimeLeft(`${days} Hari ${hours} Jam Lagi`);
      } else if (hours > 0) {
        setTimeLeft(`${hours} Jam ${minutes} Mnt Lagi`);
      } else {
        setTimeLeft(`${minutes} Menit Lagi`);
      }
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 60000);

    return () => clearInterval(intervalId);
  }, [event?.start_time]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DOWNLOAD POSTER LANGSUNG TANPA TAB BARU
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDownloadBanner = async () => {
    if (!event?.image) return;
    
    const tid = toast.loading("Mempersiapkan unduhan...");
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/my-events/${event.slug}/download-poster`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Gagal mengunduh file dari server");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Poster-${event.slug}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Poster berhasil diunduh!", { id: tid });
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengunduh poster. Pastikan koneksi internet stabil.", { id: tid });
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const shareUrl = `${window.location.origin}/events/${event?.slug}`;
    const shareTitle = event?.title || 'Program Unggulan Amania';
    
    let cleanDesc = stripHtmlToText(event?.description || '');
    if (cleanDesc.length > 180) {
      cleanDesc = cleanDesc.substring(0, 180).replace(/\s+\S*$/, "") + '...';
    }

    const captionText = `🎓 *Yuk ikutan program "${shareTitle}" di Amania Nusantara!*\n\n📝 "${cleanDesc}"\n\n📍 *Cek detail & daftar di sini:*\n${shareUrl}`;

    try {
      try {
        await navigator.clipboard.writeText(captionText);
      } catch (err) {
        console.warn("Clipboard access denied", err);
      }

      if (navigator.share) {
        let sharedWithImage = false;

        if (event?.image) {
          try {
            const imgUrl = `${STORAGE_URL}/${event.image}`;
            const response = await fetch(imgUrl, { mode: 'cors' });
            const blob = await response.blob();
            
            const ext = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `poster-${slug}.${ext}`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              toast.success('Teks disalin! Silakan "Tempel" di WA.', { duration: 4000, icon: '📋' });

              await navigator.share({
                title: shareTitle,
                text: captionText, 
                files: [file]
              });
              sharedWithImage = true;
            }
          } catch (imgError) {
            console.warn("Gagal menyiapkan file gambar", imgError);
          }
        }

        if (!sharedWithImage) {
          await navigator.share({ title: shareTitle, text: captionText });
          toast.success('Berhasil membagikan tautan!');
        }
      } else {
        toast.success('Teks dan tautan disalin ke clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Terjadi kesalahan saat membagikan.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-slate-400 text-center px-4">Mempersiapkan Ruang Kelas...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center p-4 sm:p-6 w-full min-w-0">
         <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-200 border-dashed">
           <AlertCircle size={48} className="mx-auto text-rose-500 mb-4 opacity-50 shrink-0" />
           <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
           <p className="text-slate-500 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed">Maaf, program ini tidak dapat diakses atau Anda belum terdaftar.</p>
           <Link href="/my-events" className="inline-flex px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs md:text-sm hover:bg-indigo-600 transition-colors shadow-sm shrink-0">
             Kembali ke Kelas Saya
           </Link>
         </div>
      </div>
    );
  }

  // 🔥 FORMAT TANGGAL DAN JAM (START & END) 🔥
  const startDate = new Date(event.start_time);
  const endDate = event.end_time ? new Date(event.end_time) : null;
  const isPast = endDate ? endDate < new Date() : startDate < new Date();

  const startTimeStr = startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  const endTimeStr = endDate ? endDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':') : 'Selesai';
  const timeString = `${startTimeStr} - ${endTimeStr} WIB`;

  // LOGIKA ORGANIZER
  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;

  // CEK TIER USER DARI BACKEND
  const userTier = event.user_registration?.tier; 

  const processedDescription = processQuillHtml(event.description || '');

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans overflow-x-hidden w-full min-w-0">
      
      {/* NAVBAR STICKY */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-14 md:h-16 flex items-center w-full min-w-0 shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-8 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm min-w-0 flex-1">
             <Link href="/my-events" className="text-slate-500 hover:text-indigo-600 font-bold transition-colors shrink-0 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                <ArrowLeft size={14} /> <span className="hidden sm:inline">Kembali</span>
             </Link>
             <ChevronRight size={14} className="text-slate-300 shrink-0 hidden sm:block" />
             <span className="text-slate-900 font-bold truncate w-full ml-1 sm:ml-0">{event.title}</span>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-slate-900 relative overflow-hidden w-full min-w-0">
        <div className="absolute inset-0 z-0">
          {event.image ? (
            <img src={`${STORAGE_URL}/${event.image}`} alt="Background" className="w-full h-full object-cover object-center opacity-20 blur-sm scale-105" />
          ) : (
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-indigo-500/30 to-transparent blur-3xl rounded-full mix-blend-screen" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 md:pt-16 pb-8 md:pb-12 relative z-10 w-full min-w-0">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 w-full min-w-0">
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[9px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border border-indigo-400/30 backdrop-blur-sm shrink-0">
                <BookOpen size={10} className="shrink-0" /> Ruang Belajar
              </span>
              
              <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 text-[9px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-sm shrink-0 ${isPast ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'}`}>
                 {isPast ? <CheckCircle2 size={10} className="shrink-0" /> : <Zap size={10} className="shrink-0" />} 
                 {isPast ? 'Telah Selesai' : 'Sedang Berjalan'}
              </span>

              {/* 🔥 BADGE HITUNG MUNDUR (DI HERO) 🔥 */}
              {timeLeft && !isPast && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 py-1.5 bg-amber-500/90 backdrop-blur-md border border-amber-400 text-white rounded-md text-[9px] md:text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg shrink-0"
                >
                  <Clock size={12} /> {timeLeft}
                </motion.span>
              )}
           </motion.div>
           
           <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight max-w-4xl mb-6 break-words w-full">
             {event.title}
           </motion.h1>

           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 lg:gap-8 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-md w-full sm:w-fit min-w-0 shadow-lg">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0"><Calendar size={18}/></div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Jadwal Mulai</p>
                  <p className="text-xs sm:text-sm text-white font-semibold">{startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
             </div>
             
             <div className="w-px h-10 bg-white/10 hidden sm:block shrink-0"></div>
             
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><Clock size={18}/></div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Waktu Pelaksanaan</p>
                  <p className="text-xs sm:text-sm text-white font-semibold">{timeString}</p>
                </div>
             </div>
           </motion.div>
        </div>
      </div>

      {/* CONTENT LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] gap-6 md:gap-8 items-start w-full min-w-0">
        
        {/* KOLOM KIRI (KONTEN UTAMA) */}
        <div className="w-full min-w-0 space-y-6 md:space-y-8 order-2 lg:order-1">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 md:p-8 overflow-hidden w-full min-w-0">
            
            {/* AKSES PRIVAT (LINK ZOOM) */}
            {(event.join_link || event.join_instructions) && (
              <div className="bg-indigo-50 border border-indigo-100 p-5 md:p-6 rounded-2xl md:rounded-[1.5rem] shadow-sm mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-black text-indigo-900 flex items-center gap-2 mb-1.5">
                    <LinkIcon size={18} className="text-indigo-600" /> Akses Pertemuan
                  </h3>
                  {event.join_instructions && (
                    <p className="text-[11px] md:text-xs font-medium text-indigo-700/80 leading-relaxed break-words w-full">
                      {event.join_instructions}
                    </p>
                  )}
                </div>
                {event.join_link && (
                  <a
                    href={event.join_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                  >
                    <Video size={16} /> Gabung Pertemuan
                  </a>
                )}
              </div>
            )}

            {/* TABS BUTTONS */}
            <div className="flex p-1.5 bg-slate-100 rounded-xl mb-6 md:mb-8 w-full min-w-0 overflow-x-auto custom-scrollbar">
              <button onClick={() => setActiveTab('curriculum')} className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all rounded-lg truncate px-2 shrink-0 ${activeTab === 'curriculum' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-900'}`}>
                Materi & Kurikulum
              </button>
              <button onClick={() => setActiveTab('desc')} className={`flex-1 py-2 sm:py-2.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all rounded-lg truncate px-2 shrink-0 ${activeTab === 'desc' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-900'}`}>
                Informasi Program
              </button>
            </div>

            {/* TAB KONTEN */}
            <div className="w-full min-w-0 pb-4">
              <AnimatePresence mode="wait">
                
                {/* MATERI & KURIKULUM */}
                {activeTab === 'curriculum' ? (
                  <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 md:space-y-5 w-full min-w-0">
                    {(!event.materials || event.materials.length === 0) ? (
                      <div className="py-12 md:py-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center px-4 w-full min-w-0">
                        <BookOpen size={36} className="mx-auto text-slate-300 mb-3 md:mb-4 shrink-0" />
                        <h4 className="text-slate-900 font-bold text-sm md:text-base mb-1 md:mb-2">Materi Belum Tersedia</h4>
                        <p className="text-slate-500 text-xs md:text-sm max-w-xs md:max-w-sm mx-auto leading-relaxed">Modul tambahan akan dipublikasikan oleh instruktur mendekati jadwal pelaksanaan atau sesudah acara.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-5 rounded-2xl mb-5 md:mb-8 w-full min-w-0 flex items-start gap-3">
                            <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] md:text-xs font-bold text-indigo-900 mb-1 uppercase tracking-widest">Panduan Akses</p>
                              <p className="text-[11px] md:text-xs text-indigo-700 leading-relaxed">Berikut adalah daftar seluruh materi untuk kelas ini. Modul dengan label VIP hanya bisa dibuka oleh peserta Premium.</p>
                            </div>
                        </div>

                        {event.materials.map((mat: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group min-w-0 w-full relative overflow-hidden">
                             
                             <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${mat.access_tier === 'premium' ? 'bg-amber-50 text-amber-500' : mat.type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {mat.type === 'video' ? <Video size={20} strokeWidth={2}/> : <FileText size={20} strokeWidth={2}/>}
                             </div>

                             <div className="flex-1 min-w-0 w-full space-y-1.5">
                               <div className="flex items-center gap-2 min-w-0 w-full flex-wrap">
                                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">MODUL {idx + 1}</span>
                                  {mat.access_tier === 'premium' ? (
                                     <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold flex items-center gap-1 shrink-0"><Gem size={10} className="shrink-0"/> VIP ONLY</span>
                                  ) : (
                                     <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold flex items-center gap-1 shrink-0"><CheckCircle2 size={10} className="shrink-0"/> BASIC</span>
                                  )}
                               </div>
                               <h4 className="text-[13px] md:text-sm font-bold text-slate-900 leading-snug break-words group-hover:text-indigo-600 transition-colors line-clamp-2 w-full">
                                 {mat.title}
                               </h4>
                             </div>

                             <div className="pt-2 sm:pt-0 sm:shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                               {mat.access_tier === 'premium' && event.user_registration?.tier !== 'premium' ? (
                                 <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2.5 rounded-xl cursor-not-allowed border border-slate-200">
                                   <Lock size={14} className="shrink-0" /> Terkunci
                                 </button>
                               ) : (
                                 <a href={`${STORAGE_URL}/${mat.file_path}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-4 py-2.5 rounded-xl transition-colors border border-indigo-100 hover:border-transparent shadow-sm">
                                   <DownloadCloud size={14} className="shrink-0" /> {mat.type === 'video' ? 'Tonton Video' : 'Unduh Modul'}
                                 </a>
                               )}
                             </div>
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                ) 

                /* INFORMASI PROGRAM */
                : (
                  <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
                    <div className="q-content break-words w-full min-w-0" dangerouslySetInnerHTML={{ __html: processedDescription }} />

                    {event.speakers && event.speakers.length > 0 && (
                      <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 w-full min-w-0">
                        <h3 className="text-base md:text-lg font-black text-slate-900 mb-4 md:mb-6 flex items-center gap-2">
                          <User size={18} className="text-indigo-500 shrink-0" /> Profil Instruktur
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full min-w-0">
                          {event.speakers.map((spk: any) => (
                            <div key={spk.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all group min-w-0 w-full">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200">
                                <img src={`${STORAGE_URL}/${spk.photo}`} alt={spk.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors w-full">{spk.name}</h4>
                                <p className="text-[9px] md:text-[10px] font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5 truncate w-full uppercase tracking-wider">
                                  <Briefcase size={10} className="text-indigo-400 shrink-0"/> <span className="truncate">{spk.role}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (INFO CARD & POSTER) */}
        <aside className="lg:sticky lg:top-24 relative z-20 order-1 lg:order-2 min-w-0 w-full flex flex-col gap-6">
          
          {/* 🔥 WIDGET HITUNG MUNDUR LUXURY (DI KANAN ATAS POSTER) 🔥 */}
          {timeLeft && !isPast && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-[2rem] border bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 shadow-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/20 rounded-bl-full -z-10 blur-xl group-hover:bg-amber-400/40 transition-all duration-500" />
              <div className="flex items-center gap-3.5 z-10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30">
                  <Clock size={22} />
                </div>
                <div>
                  <p className="text-[10px] text-amber-700/80 font-black uppercase tracking-[0.15em] mb-1">
                    Waktu Tersisa
                  </p>
                  <p className="text-sm sm:text-base font-black text-amber-950 uppercase tracking-wide drop-shadow-sm">
                    {timeLeft}
                  </p>
                </div>
              </div>
              <div className="shrink-0 z-10 hidden sm:block">
                 <Zap size={28} className="text-amber-500 opacity-60 animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* POSTER EVENT */}
          {event.image && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="w-full bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border-4 border-white shadow-xl overflow-hidden relative"
            >
              <img
                src={`${STORAGE_URL}/${event.image}`}
                alt="Poster Program"
                className="w-full h-auto max-h-[600px] object-contain rounded-[1.25rem] md:rounded-[1.5rem]"
              />
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-5 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 w-full min-w-0"
          >
            
            {/* TICKET TIER BADGE LUXURY */}
            {userTier && (
              <div className="mb-6 w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${userTier === 'premium' ? 'bg-amber-400 text-amber-900' : 'bg-emerald-400 text-emerald-900'}`}>
                    <Ticket size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider mb-0.5">Status Tiket Anda</p>
                    <p className="text-xs sm:text-sm font-bold uppercase">{userTier === 'premium' ? 'VIP / Premium' : 'Basic / Reguler'}</p>
                  </div>
                </div>
                <div className="shrink-0 mr-2">
                   {userTier === 'premium' ? <Gem size={24} className="text-amber-400 opacity-90" /> : <CheckCircle2 size={24} className="text-emerald-400 opacity-90" />}
                </div>
              </div>
            )}

            {/* KOTAK ORGANIZER */}
            <div className="w-full min-w-0 mb-6 md:mb-8">
              <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <ShieldCheck size={12} className="shrink-0" /> Penyelenggara Resmi
              </h3>
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-1">
                  {organizerAvatar ? (
                    <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover rounded-full" />
                  ) : isSuperadmin ? (
                    <img src="/logo-amania.png" alt="Amania" className="w-full h-full object-contain p-1" />
                  ) : (
                    <User size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-[13px] md:text-sm font-bold text-slate-900 break-words w-full flex items-center gap-1.5">
                    {organizerName} {isSuperadmin && <CheckCircle2 size={12} className="text-blue-500 shrink-0 fill-blue-50" />}
                  </p>
                  <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate w-full">
                    {isSuperadmin ? 'Tim Internal Amania' : 'Mitra Terverifikasi'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6 bg-slate-50 p-4 rounded-xl md:rounded-2xl border border-slate-100 w-full min-w-0">
              <div className="flex items-center justify-between text-[11px] md:text-xs min-w-0 w-full">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0"><Users size={14} className="text-indigo-400 shrink-0"/> Kuota Kelas</span>
                <span className="font-bold text-slate-900 text-right truncate min-w-0 bg-white px-2 py-1 rounded-md border border-slate-200">{event.quota === 0 ? 'Habis' : `${event.quota} Peserta`}</span>
              </div>
              
              {/* E-CERTIFICATE & (KHUSUS PREMIUM / VIP) */}
              <div className="flex items-start justify-between text-[11px] md:text-xs min-w-0 w-full pt-1">
                <span className="text-slate-500 font-semibold flex items-center gap-1.5 shrink-0 pt-0.5"><Award size={14} className="text-emerald-400 shrink-0"/> E-Certificate</span>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-bold text-emerald-600 text-right truncate min-w-0 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">Termasuk</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right leading-tight max-w-[100px] sm:max-w-none">
                    (Khusus Premium/VIP)
                  </span>
                </div>
              </div>
            </div>
            
            {/* TOMBOL KLAIM E-CERTIFICATE */}
            {event.certificate_link && (
              <a 
                href={event.certificate_link} target="_blank" rel="noopener noreferrer"
                className="w-full py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors flex justify-center items-center gap-1.5 border border-amber-200 mb-3 shadow-sm"
              >
                <Award size={14} className="shrink-0" /> Klaim E-Certificate
              </a>
            )}
            
            {event.image && (
              <button onClick={handleDownloadBanner} className="w-full py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex justify-center items-center gap-1.5 border border-indigo-100 mb-3 shadow-sm">
                <Download size={14} className="shrink-0" /> Simpan Poster Event
              </button>
            )}

            <button onClick={handleShare} disabled={isSharing} className="w-full py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-colors flex justify-center items-center gap-1.5 shadow-sm disabled:opacity-50">
              {isSharing ? <Loader2 size={14} className="animate-spin shrink-0"/> : <Share2 size={14} className="shrink-0" />} 
              Bagikan ke Teman
            </button>
            
          </motion.div>
        </aside>

      </main>

      <style jsx global>{`
        .q-content {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          overflow-wrap: break-word;
          word-break: normal;
          hyphens: none;
          -webkit-hyphens: none;
          white-space: normal;
        }
        .q-content p, .q-content span, .q-content li,
        .q-content h1, .q-content h2, .q-content h3, .q-content h4 {
          margin: 0 !important;
          word-break: normal !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          white-space: normal !important;
        }
        .q-content strong, .q-content b { font-weight: 800; color: #0f172a; }
        .q-content em, .q-content i      { font-style: italic; }
        .q-content u                     { text-decoration: underline; }
        .q-content s                     { text-decoration: line-through; }
        .q-content h1 { font-size:1.75rem; font-weight:900; color:#0f172a; margin:1.5rem 0 0.5rem !important; line-height:1.3; }
        .q-content h2 { font-size:1.5rem;  font-weight:800; color:#0f172a; margin:1.25rem 0 0.4rem !important; line-height:1.35; }
        .q-content h3 { font-size:1.25rem; font-weight:700; color:#0f172a; margin:1rem 0 0.35rem !important; line-height:1.4; }
        .q-content h4 { font-size:1.1rem;  font-weight:700; color:#1e293b; margin:0.75rem 0 0.25rem !important; }
        .q-content ul { padding-left:1.5em; margin:0; list-style-type:disc; margin-bottom:1.25rem !important; }
        .q-content ol { padding-left:1.5em; margin:0; list-style-type:decimal; margin-bottom:1.25rem !important; }
        .q-content li { margin-bottom:0.2rem !important; }
        .q-content blockquote {
          border-left:4px solid #6366f1; margin:0.5rem 0; padding:0.5rem 1rem;
          background:#f1f5f9; border-radius:0 0.5rem 0.5rem 0;
          color:#475569; font-style:italic;
        }
        .q-content pre {
          background:#0f172a; color:#34d399; padding:1rem;
          border-radius:0.5rem; overflow-x:auto; font-size:0.85rem; margin:0.5rem 0;
        }
        .q-content code {
          background:#f1f5f9; padding:0.15em 0.4em;
          border-radius:0.25rem; font-size:0.875em; color:#6366f1;
        }
        .q-content img, .q-content video, .q-content iframe {
          max-width:100%; height:auto; border-radius:0.75rem;
          margin:0.75rem 0; box-shadow:0 4px 20px rgba(0,0,0,0.08);
        }
        .q-content a { color:#4f46e5; text-decoration:underline; text-underline-offset:2px; }
        .q-content a:hover { color:#4338ca; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}