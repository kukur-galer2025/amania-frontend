"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // 🔥 KEMBALI MENGGUNAKAN useSearchParams
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Clock, CheckCircle2, 
  BookOpen, FileText, Video, AlertCircle, Share2, Award, 
  Sparkles, Zap, Ticket, Gem, ChevronRight, ShieldCheck,
  Loader2, User, Briefcase, ArrowRight, Lock, Info, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

// 🔥 Helper pembersih HTML & karakter nyangkut
const cleanHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/&amp;nbsp;/g, ' ').replace(/&nbsp;/g, ' ');
};

export default function EventDetailClient({ slug: propSlug }: { slug?: string }) {
  const router = useRouter();
  
  // 🔥 AMBIL SLUG DARI URL PARAMETER (?slug=...) 🔥
  const searchParams = useSearchParams();
  const activeSlug = propSlug || searchParams.get('slug');

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'curriculum'>('desc');

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!activeSlug) return; // Tunggu sampai URL terbaca

    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/events/${activeSlug}`);
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
  }, [activeSlug]);

  const handleRegister = () => {
    router.push(`/checkout?slug=${activeSlug}`);
  };

  // 🔥 FUNGSI SHARE NATIVE KE SOSMED / WHATSAPP (FALLBACK KE COPY LINK) 🔥
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: event?.title || 'Amania Class',
      text: `Yuk, ikuti program ${event?.title || 'ini'} di Amania dan tingkatkan skillmu!`,
      url: shareUrl,
    };

    // Jika browser (terutama HP) mendukung Web Share API
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Membagikan dibatalkan'); // User menutup pop-up share
      }
    } else {
      // Fallback jika dibuka di Laptop/PC lama
      navigator.clipboard.writeText(shareUrl);
      toast.success("Tautan disalin ke clipboard!");
    }
  };

  // 🔥 FUNGSI UNDUH BANNER 🔥
  const handleDownloadBanner = async () => {
    if (!event?.image) return;
    try {
      const response = await fetch(`${STORAGE_URL}/${event.image}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Banner-${event.slug || 'Amania'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Banner berhasil diunduh!");
    } catch (error) {
      window.open(`${STORAGE_URL}/${event.image}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 w-full min-w-0">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500 break-words text-center px-4">Memuat data program...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-6 bg-slate-50 w-full min-w-0">
         <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 min-w-0">
           <AlertCircle size={48} className="mx-auto text-rose-500 mb-4 opacity-50 shrink-0" />
           <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2 break-words w-full">Program Tidak Ditemukan</h1>
           <p className="text-slate-500 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed break-words w-full">Maaf, kelas atau program Amania yang Anda cari tidak tersedia, mungkin URL salah atau telah dihapus.</p>
           <Link href="/events" className="inline-flex px-5 md:px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-xs md:text-sm hover:bg-slate-800 transition-colors shadow-sm shrink-0">
             Kembali ke Katalog
           </Link>
         </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const isPast = new Date(event.end_time) < new Date();

  // 🔥 LOGIKA ORGANIZER 🔥
  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 md:pb-24 font-sans selection:bg-indigo-100 selection:text-indigo-700 overflow-x-hidden w-full min-w-0">
      
      {/* 🔥 PERBAIKAN Z-INDEX MENJADI z-20 AGAR TIDAK MENEMBUS SIDEBAR MENU HP 🔥 */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 h-14 md:h-16 flex items-center w-full min-w-0">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm min-w-0 pr-4 flex-1">
             <Link href="/events" className="text-slate-500 hover:text-slate-900 font-medium transition-colors shrink-0 hidden sm:inline">Katalog</Link>
             <ChevronRight size={14} className="text-slate-300 shrink-0 hidden sm:block" />
             <span className="text-slate-900 font-semibold truncate w-full">{event.title}</span>
          </div>
          <button onClick={handleShare} className="shrink-0 p-1.5 md:p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-500 hover:text-slate-900 transition-colors shadow-sm" title="Bagikan Link">
            <Share2 size={14} className="md:w-4 md:h-4" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="bg-slate-900 border-b border-slate-800 relative overflow-hidden w-full min-w-0">
        <div className="absolute inset-0 z-0">
          {event.image ? (
            <img src={`${STORAGE_URL}/${event.image}`} alt="Background" className="w-full h-full object-cover object-center" />
          ) : (
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-indigo-500/30 to-transparent blur-3xl rounded-full mix-blend-screen" />
          )}
          <div className="absolute inset-0 bg-slate-950/60 md:bg-gradient-to-r md:from-slate-950/95 md:via-slate-950/70 md:to-slate-900/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-16 lg:py-24 relative z-10 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-4 md:mb-6 w-full min-w-0">
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 bg-indigo-500/80 text-white text-[9px] md:text-[11px] font-semibold uppercase tracking-wider rounded-md border border-indigo-400 shadow-sm backdrop-blur-sm shrink-0">
                <Ticket size={10} className="md:w-3 md:h-3 shrink-0" /> Amania Class
              </span>
              {event.premium_price > 0 && (
                <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 bg-amber-500/80 text-white text-[9px] md:text-[11px] font-semibold uppercase tracking-wider rounded-md border border-amber-400 shadow-sm backdrop-blur-sm shrink-0">
                  <Gem size={10} className="md:w-3 md:h-3 shrink-0" /> Tersedia VIP
                </span>
              )}
           </motion.div>
           
           <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight max-w-4xl mb-6 md:mb-8 drop-shadow-md break-words w-full">
             {event.title}
           </motion.h1>

           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto max-w-full min-w-0">
             <div className="w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
               <div className="flex items-center gap-4 md:gap-6 bg-slate-900/60 border border-white/20 p-3 md:p-4 rounded-xl backdrop-blur-md min-w-max shadow-lg h-full">
                  <div className="flex items-center gap-2 md:gap-3">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0"><Calendar size={16} className="md:w-5 md:h-5"/></div>
                     <div className="text-left">
                       <p className="text-[9px] md:text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Tanggal</p>
                       <p className="text-xs md:text-sm text-white font-medium whitespace-nowrap drop-shadow-sm">{startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                     </div>
                  </div>
                  <div className="w-[1px] h-8 md:h-10 bg-white/20 shrink-0"></div>
                  <div className="flex items-center gap-2 md:gap-3 max-w-[200px] md:max-w-[250px]">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0"><MapPin size={16} className="md:w-5 md:h-5"/></div>
                     <div className="text-left min-w-0">
                       <p className="text-[9px] md:text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Lokasi</p>
                       <p className="text-xs md:text-sm text-white font-medium drop-shadow-sm break-words leading-tight truncate">{event.venue}</p>
                     </div>
                  </div>
                  <div className="w-[1px] h-8 md:h-10 bg-white/20 shrink-0"></div>
                  <div className="flex items-center gap-2 md:gap-3 pr-2 md:pr-0">
                     <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0"><Clock size={16} className="md:w-5 md:h-5"/></div>
                     <div className="text-left">
                       <p className="text-[9px] md:text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Waktu</p>
                       <p className="text-xs md:text-sm text-white font-medium whitespace-nowrap drop-shadow-sm">{startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                     </div>
                  </div>
               </div>
             </div>

             {event.image && (
               <button onClick={handleDownloadBanner} className="flex items-center justify-center gap-2 px-4 py-3 sm:py-0 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl backdrop-blur-md transition-colors text-xs md:text-sm font-semibold shadow-lg shrink-0 sm:h-full min-h-[50px] md:min-h-[74px]">
                 <Download size={16} className="md:w-5 md:h-5 shrink-0" />
                 <span>Unduh Banner</span>
               </button>
             )}
           </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 md:gap-8 items-start w-full min-w-0">
        
        {/* KOLOM KIRI */}
        <div className="space-y-6 md:space-y-8 order-2 lg:order-1 min-w-0 w-full">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-4 overflow-hidden w-full min-w-0">
            <div className="flex p-1 bg-slate-100 rounded-lg mb-4 md:mb-6 w-full min-w-0">
              <button onClick={() => setActiveTab('desc')} className={`flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all rounded-md truncate px-1 shrink-0 ${activeTab === 'desc' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-900'}`}>
                Informasi Program
              </button>
              <button onClick={() => setActiveTab('curriculum')} className={`flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all rounded-md truncate px-1 shrink-0 ${activeTab === 'curriculum' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' : 'text-slate-500 hover:text-slate-900'}`}>
                Kurikulum
              </button>
            </div>

            <div className="px-2 md:px-4 pb-2 md:pb-4 w-full min-w-0">
              <AnimatePresence mode="wait">
                {activeTab === 'desc' ? (
                  <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
                    <div className="prose-editorial break-words w-full min-w-0">
                      <div dangerouslySetInnerHTML={{ __html: cleanHtml(event.description) }} />
                    </div>

                    {/* PROFIL PEMBICARA */}
                    {event.speakers && event.speakers.length > 0 && (
                      <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 w-full min-w-0">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 md:mb-6 flex items-center gap-2 w-full break-words">
                          <User size={18} className="text-indigo-500 md:w-5 md:h-5 shrink-0" /> Profil Instruktur
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full min-w-0">
                          {event.speakers.map((spk: any) => (
                            <div key={spk.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group min-w-0 w-full">
                              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 bg-slate-200 relative">
                                <img src={`${STORAGE_URL}/${spk.photo}`} alt={spk.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors w-full">{spk.name}</h4>
                                <p className="text-[10px] md:text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5 truncate w-full">
                                  <Briefcase size={10} className="text-slate-400 shrink-0 md:w-3 md:h-3"/> 
                                  <span className="truncate">{spk.role}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="curriculum" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3 md:space-y-4 w-full min-w-0">
                    {(!event.materials || event.materials.length === 0) ? (
                      <div className="py-12 md:py-16 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center px-4 w-full min-w-0">
                        <BookOpen size={32} className="mx-auto text-slate-300 mb-3 md:mb-4 md:w-10 md:h-10 shrink-0" />
                        <h4 className="text-slate-900 font-semibold text-sm md:text-base mb-1 break-words w-full">Kurikulum Masih Disusun</h4>
                        <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto break-words w-full">Syllabus lengkap akan segera dipublikasikan oleh tim instruktur menjelang acara.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-indigo-50/50 border border-indigo-100 p-3 md:p-4 rounded-xl mb-4 md:mb-6 w-full min-w-0">
                            <p className="text-[10px] md:text-xs text-indigo-800 flex items-start gap-2 leading-relaxed w-full min-w-0">
                                <Info size={14} className="text-indigo-500 shrink-0 mt-0.5 md:w-4 md:h-4" />
                                <span className="break-words w-full min-w-0">Kurikulum di bawah adalah daftar materi yang akan Anda pelajari. Materi dengan ikon <strong>Gembok (VIP)</strong> hanya dapat diakses secara penuh jika Anda memiliki tiket <strong>VIP Premium</strong>.</span>
                            </p>
                        </div>

                        {event.materials.map((mat: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border border-slate-200 shadow-sm rounded-xl hover:border-indigo-300 transition-all group min-w-0 w-full">
                             
                             <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center shrink-0 ${mat.access_tier === 'premium' ? 'bg-slate-100 text-slate-400' : mat.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                {mat.access_tier === 'premium' ? <Lock size={16} className="md:w-5 md:h-5 shrink-0"/> : mat.type === 'video' ? <Video size={16} className="md:w-5 md:h-5 shrink-0"/> : <FileText size={16} className="md:w-5 md:h-5 shrink-0"/>}
                             </div>

                             <div className="flex-1 min-w-0 w-full">
                               <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5 flex flex-wrap items-center gap-1.5 md:gap-2 w-full min-w-0">
                                 Modul {idx + 1}
                                 {mat.access_tier === 'premium' ? (
                                    <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[7px] md:text-[8px] flex items-center gap-0.5 shrink-0"><Gem size={8} className="shrink-0"/> VIP</span>
                                 ) : (
                                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[7px] md:text-[8px] flex items-center gap-0.5 shrink-0"><CheckCircle2 size={8} className="shrink-0"/> BASIC</span>
                                 )}
                               </p>
                               <h4 className={`text-xs md:text-sm font-semibold leading-tight transition-colors break-words line-clamp-2 w-full ${mat.access_tier === 'premium' ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                                 {mat.title}
                               </h4>
                             </div>

                             <div className="hidden sm:block shrink-0">
                               {mat.access_tier === 'premium' ? (
                                 <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md border border-amber-200/50">
                                   <Lock size={10} className="md:w-3 md:h-3 shrink-0" /> Terkunci
                                 </span>
                               ) : (
                                 <span className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 px-2.5 md:px-3 py-1 md:py-1.5 rounded-md border border-slate-200">
                                   <AlertCircle size={10} className="md:w-3 md:h-3 shrink-0" /> Pratinjau
                                 </span>
                               )}
                             </div>
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (PRICING CARD) */}
        <aside className="lg:sticky lg:top-24 relative z-20 order-1 lg:order-2 min-w-0 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 relative overflow-hidden w-full min-w-0"
          >
            {isPast && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-[11px] md:text-xs font-semibold flex items-center gap-2 mb-5 md:mb-6 break-words w-full">
                <AlertCircle size={14} className="md:w-4 md:h-4 shrink-0"/> Program Telah Selesai
              </div>
            )}

            {/* 🔥 KOTAK ORGANIZER/PENYELENGGARA 🔥 */}
            <div className="w-full min-w-0 mb-6 md:mb-8">
              <h3 className="text-[11px] md:text-xs font-bold text-slate-900 mb-3 md:mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <User size={14} className="text-indigo-500 shrink-0" /> Penyelenggara
              </h3>
              <div className="flex items-center gap-3 w-full min-w-0 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {organizerAvatar ? (
                    <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover rounded-full" />
                  ) : isSuperadmin ? (
                    <img src="/logo-amania.png" alt="Amania" className="w-6 h-6 object-contain" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-xs md:text-sm font-bold text-slate-900 break-words w-full flex items-center gap-1.5">
                    {organizerName}
                    {isSuperadmin && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate w-full">
                    {isSuperadmin ? 'Tim Internal Amania' : 'Mitra Penyelenggara'}
                  </p>
                </div>
              </div>
            </div>

            <h3 className="text-[11px] md:text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Pilihan Tiket</h3>
            
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 w-full min-w-0">
              {/* PAKET BASIC */}
              <div className="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors group cursor-default relative overflow-hidden w-full min-w-0">
                 <div className="absolute top-0 right-0 p-2 text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity"><CheckCircle2 size={24} className="md:w-8 md:h-8 shrink-0"/></div>
                 <div className="relative z-10 w-full min-w-0">
                   <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldCheck size={12} className="shrink-0"/> Akses Basic</p>
                   <p className={`text-xl md:text-2xl font-bold break-words w-full ${event.basic_price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                     {event.basic_price === 0 ? 'GRATIS' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
                   </p>
                 </div>
              </div>

              {/* PAKET VIP */}
              {event.premium_price > 0 && (
                <div className="bg-slate-950 p-4 md:p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group cursor-default relative overflow-hidden shadow-lg shadow-slate-900/10 w-full min-w-0">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute top-3 md:top-4 right-3 md:right-4 text-amber-500"><Gem size={16} className="md:w-5 md:h-5 shrink-0"/></div>
                   <div className="relative z-10 w-full min-w-0">
                     <p className="text-[10px] md:text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Gem size={10} className="shrink-0"/> VIP Premium</p>
                     <p className="text-xl md:text-2xl font-bold text-white break-words w-full">Rp {event.premium_price.toLocaleString('id-ID')}</p>
                   </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 bg-slate-50/80 p-3.5 md:p-4 rounded-xl border border-slate-100 w-full min-w-0">
              <div className="flex items-center justify-between text-[11px] md:text-xs min-w-0 w-full">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0"><Users size={12} className="text-indigo-400 md:w-3.5 md:h-3.5 shrink-0"/> Sisa Kuota</span>
                <span className="font-semibold text-slate-900 text-right truncate min-w-0">{event.quota === 0 ? 'Habis' : `${event.quota} Kursi`}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] md:text-xs min-w-0 w-full">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0"><Award size={12} className="text-emerald-400 md:w-3.5 md:h-3.5 shrink-0"/> E-Certificate</span>
                <span className="font-semibold text-emerald-600 text-right truncate min-w-0">Tersedia</span>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ scale: isPast || event.quota === 0 ? 1 : 1.02 }}
              whileTap={{ scale: isPast || event.quota === 0 ? 1 : 0.98 }}
              onClick={handleRegister} 
              disabled={isPast || event.quota === 0} 
              className={`w-full py-3 md:py-4 rounded-xl text-xs md:text-sm font-semibold transition-all flex justify-center items-center gap-2 px-2 ${
                isPast || event.quota === 0 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
              }`}
            >
              <span className="truncate">{isPast ? 'PROGRAM BERAKHIR' : event.quota === 0 ? 'KUOTA HABIS' : 'DAFTAR SEKARANG'}</span> 
              {!(isPast || event.quota === 0) && <ArrowRight size={14} className="md:w-4 md:h-4 shrink-0" />}
            </motion.button>
            
            <p className="text-[9px] md:text-[10px] text-center font-medium text-slate-400 mt-3 md:mt-4 uppercase tracking-widest flex items-center justify-center gap-1.5 break-words w-full">
              <Sparkles size={10} className="text-amber-500 md:w-3 md:h-3 shrink-0" /> Amania Nusantara
            </p>
          </motion.div>
        </aside>

      </main>

      {/* 🔥 PENAMBAHAN PROPERTI BREAK-WORD PADA CSS PROSE 🔥 */}
      <style jsx global>{`
        .prose-editorial { 
          font-family: 'Inter', sans-serif; 
          font-size: 0.9rem; 
          line-height: 1.6; 
          color: #475569; 
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          width: 100%;
          overflow-x: hidden;
        }
        .prose-editorial img, .prose-editorial iframe, .prose-editorial video {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .prose-editorial a { word-break: break-all; color: #2563eb; text-decoration: underline; }
        @media (min-width: 768px) {
          .prose-editorial { font-size: 0.95rem; line-height: 1.7; }
        }
        .prose-editorial h2, .prose-editorial h3 { font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; }
        @media (min-width: 768px) {
          .prose-editorial h2, .prose-editorial h3 { margin-top: 2rem; margin-bottom: 1rem; }
        }
        .prose-editorial h2 { font-size: 1.15rem; }
        .prose-editorial h3 { font-size: 1.05rem; }
        @media (min-width: 768px) {
          .prose-editorial h2 { font-size: 1.25rem; }
          .prose-editorial h3 { font-size: 1.15rem; }
        }
        .prose-editorial p { margin-bottom: 0.75rem; }
        @media (min-width: 768px) {
          .prose-editorial p { margin-bottom: 1rem; }
        }
        .prose-editorial ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 0.75rem; }
        @media (min-width: 768px) {
          .prose-editorial ul { padding-left: 1.5rem; margin-bottom: 1rem; }
        }
        .prose-editorial li { margin-bottom: 0.25rem; }
        @media (min-width: 768px) {
          .prose-editorial li { margin-bottom: 0.5rem; }
        }
        .prose-editorial strong { color: #0f172a; font-weight: 600; }
      `}</style>
    </div>
  );
}