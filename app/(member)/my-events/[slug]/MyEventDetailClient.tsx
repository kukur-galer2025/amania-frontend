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
  ArrowLeft, DownloadCloud // 🔥 DITAMBAHKAN: ArrowLeft dan DownloadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

// Helper pembersih HTML
const cleanHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/&amp;nbsp;/g, ' ').replace(/&nbsp;/g, ' ');
};

// 🔥 Komponen ini sekarang Menerima props 'slug' dari page.tsx 🔥
export default function MyEventDetailClient({ slug }: { slug: string }) {
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'curriculum'>('curriculum');

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        const res = await apiFetch(`/events/${slug}`);
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

  // 🔥 DITAMBAHKAN: Fungsi handleShare 🔥
  const handleShare = async () => {
    const currentUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title || 'Program Amania',
          text: 'Lihat program menarik ini di Amania!',
          url: currentUrl,
        });
      } else {
        await navigator.clipboard.writeText(currentUrl);
        toast.success("Link program berhasil disalin!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Jika error karena user cancel, tidak perlu tampilkan toast error
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
        <Loader2 size={32} className="text-indigo-600 animate-spin" />
        <p className="text-sm font-bold tracking-widest uppercase text-slate-400 text-center px-4">Mempersiapkan Ruang Kelas...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-center p-4 sm:p-6 w-full min-w-0">
         <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 border-dashed">
           <AlertCircle size={48} className="mx-auto text-rose-500 mb-4 opacity-50 shrink-0" />
           <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
           <p className="text-slate-500 mb-6 md:mb-8 text-xs md:text-sm leading-relaxed">Maaf, program ini tidak dapat diakses atau URL yang Anda tuju salah.</p>
           <Link href="/my-events" className="inline-flex px-5 py-2.5 bg-slate-900 text-white rounded-xl font-semibold text-xs md:text-sm hover:bg-indigo-600 transition-colors shadow-sm shrink-0">
             Kembali ke Kelas Saya
           </Link>
         </div>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const isPast = new Date(event.end_time) < new Date();

  // LOGIKA ORGANIZER
  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24 font-sans overflow-x-hidden w-full min-w-0">
      
      {/* NAVBAR STICKY */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 h-14 md:h-16 flex items-center w-full min-w-0">
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
            <img src={`${STORAGE_URL}/${event.image}`} alt="Background" className="w-full h-full object-cover object-center opacity-30" />
          ) : (
            <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-gradient-to-r from-indigo-500/30 to-transparent blur-3xl rounded-full mix-blend-screen" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 md:pt-16 pb-8 md:pb-12 relative z-10 w-full min-w-0">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 w-full min-w-0">
              <span className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 bg-indigo-500/20 text-indigo-300 text-[9px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border border-indigo-400/30 backdrop-blur-sm shrink-0">
                <BookOpen size={10} className="shrink-0" /> Ruang Belajar
              </span>
              <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 text-[9px] md:text-[11px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-sm shrink-0 ${isPast ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30'}`}>
                 {isPast ? <CheckCircle2 size={10} className="shrink-0" /> : <Zap size={10} className="shrink-0" />} 
                 {isPast ? 'Telah Selesai' : 'Sedang Berjalan'}
              </span>
           </motion.div>
           
           <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.2] tracking-tight max-w-4xl mb-6 break-words w-full">
             {event.title}
           </motion.h1>

           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 bg-white/5 border border-white/10 p-4 sm:p-5 rounded-2xl backdrop-blur-md w-full sm:w-fit min-w-0 shadow-lg">
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
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Waktu Akses</p>
                  <p className="text-xs sm:text-sm text-white font-semibold">{startDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</p>
                </div>
             </div>
           </motion.div>
        </div>
      </div>

      {/* CONTENT LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 md:gap-8 items-start w-full min-w-0">
        
        {/* KOLOM KIRI (KONTEN UTAMA) */}
        <div className="w-full min-w-0 space-y-6 md:space-y-8 order-2 lg:order-1">
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-hidden w-full min-w-0">
            
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
                      <div className="py-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-center px-4 w-full min-w-0">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-4 shrink-0" />
                        <h4 className="text-slate-900 font-bold text-base md:text-lg mb-2">Materi Belum Tersedia</h4>
                        <p className="text-slate-500 text-xs md:text-sm max-w-sm mx-auto leading-relaxed">Modul dan link pertemuan akan dipublikasikan oleh instruktur mendekati jadwal pelaksanaan.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 md:p-5 rounded-2xl mb-6 md:mb-8 w-full min-w-0 flex items-start gap-3">
                            <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs md:text-sm font-bold text-indigo-900 mb-1">Panduan Akses</p>
                              <p className="text-[11px] md:text-xs text-indigo-700 leading-relaxed">Berikut adalah daftar seluruh materi untuk kelas ini. Modul dengan label VIP hanya bisa dibuka oleh peserta Premium.</p>
                            </div>
                        </div>

                        {event.materials.map((mat: any, idx: number) => (
                          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all group min-w-0 w-full relative overflow-hidden">
                             
                             {/* Ikon Materi */}
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
                               <h4 className="text-sm md:text-base font-bold text-slate-900 leading-snug break-words group-hover:text-indigo-600 transition-colors line-clamp-2 w-full">
                                 {mat.title}
                               </h4>
                             </div>

                             <div className="pt-2 sm:pt-0 sm:shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 mt-2 sm:mt-0">
                               {mat.access_tier === 'premium' ? (
                                 <button className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 sm:py-2.5 rounded-lg cursor-not-allowed border border-slate-200">
                                   <Lock size={14} className="shrink-0" /> Terkunci
                                 </button>
                               ) : (
                                 <a href={`${STORAGE_URL}/${mat.file_path}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white px-4 py-2 sm:py-2.5 rounded-lg transition-colors border border-indigo-100 hover:border-transparent shadow-sm">
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
                    <div className="prose-editorial break-words w-full min-w-0">
                      <div dangerouslySetInnerHTML={{ __html: cleanHtml(event.description) }} />
                    </div>

                    {/* PROFIL PEMBICARA */}
                    {event.speakers && event.speakers.length > 0 && (
                      <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 w-full min-w-0">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                          <User size={20} className="text-indigo-500 shrink-0" /> Profil Instruktur
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full min-w-0">
                          {event.speakers.map((spk: any) => (
                            <div key={spk.id} className="flex items-center gap-4 p-4 md:p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all group min-w-0 w-full">
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-[3px] border-white shadow-sm shrink-0 bg-slate-200">
                                <img src={`${STORAGE_URL}/${spk.photo}`} alt={spk.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              </div>
                              <div className="flex-1 min-w-0 w-full">
                                <h4 className="text-sm md:text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors w-full">{spk.name}</h4>
                                <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mt-1 truncate w-full uppercase tracking-wider">
                                  <Briefcase size={12} className="text-indigo-400 shrink-0"/> <span className="truncate">{spk.role}</span>
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

        {/* KOLOM KANAN (INFO CARD) */}
        <aside className="lg:sticky lg:top-24 relative z-20 order-1 lg:order-2 min-w-0 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 w-full min-w-0"
          >
            {/* KOTAK ORGANIZER */}
            <div className="w-full min-w-0 mb-8">
              <h3 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <ShieldCheck size={14} className="shrink-0" /> Penyelenggara Resmi
              </h3>
              <div className="flex items-center gap-3 w-full min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-inner p-1">
                  {organizerAvatar ? (
                    <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover rounded-full" />
                  ) : isSuperadmin ? (
                    <img src="/logo-amania.png" alt="Amania" className="w-full h-full object-contain p-1" />
                  ) : (
                    <User size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-sm md:text-base font-bold text-slate-900 break-words w-full flex items-center gap-1.5">
                    {organizerName} {isSuperadmin && <CheckCircle2 size={14} className="text-blue-500 shrink-0 fill-blue-50" />}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate w-full">
                    {isSuperadmin ? 'Tim Internal Amania' : 'Mitra Terverifikasi'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4 mb-8 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 w-full min-w-0">
              <div className="flex items-center justify-between text-xs md:text-sm min-w-0 w-full">
                <span className="text-slate-500 font-semibold flex items-center gap-2 shrink-0"><Users size={16} className="text-indigo-400 shrink-0"/> Kuota Kelas</span>
                <span className="font-bold text-slate-900 text-right truncate min-w-0 bg-white px-3 py-1 rounded-lg border border-slate-200">{event.quota === 0 ? 'Habis' : `${event.quota} Peserta`}</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm min-w-0 w-full">
                <span className="text-slate-500 font-semibold flex items-center gap-2 shrink-0"><Award size={16} className="text-emerald-400 shrink-0"/> E-Certificate</span>
                <span className="font-bold text-emerald-600 text-right truncate min-w-0 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">Termasuk</span>
              </div>
            </div>
            
            {event.image && (
              <button onClick={handleDownloadBanner} className="w-full py-3 md:py-4 rounded-xl text-xs md:text-sm font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors flex justify-center items-center gap-2 border border-indigo-100 mb-4 shadow-sm">
                <Download size={16} className="shrink-0" /> Simpan Poster Event
              </button>
            )}

            <button onClick={handleShare} className="w-full py-3 md:py-4 rounded-xl text-xs md:text-sm font-bold bg-white border-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors flex justify-center items-center gap-2 shadow-sm">
              <Share2 size={16} className="shrink-0" /> Bagikan ke Teman
            </button>
            
          </motion.div>
        </aside>

      </main>

      <style jsx global>{`
        .prose-editorial { 
          font-family: 'Inter', sans-serif; 
          font-size: 0.95rem; 
          line-height: 1.8; 
          color: #334155; 
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          width: 100%;
        }
        .prose-editorial img, .prose-editorial iframe, .prose-editorial video {
          max-width: 100%; height: auto; border-radius: 1rem; margin: 1.5rem 0;
        }
        .prose-editorial a { color: #4f46e5; text-decoration: underline; font-weight: 500; }
        .prose-editorial h2, .prose-editorial h3 { font-weight: 900; color: #0f172a; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; letter-spacing: -0.02em; }
        .prose-editorial h2 { font-size: 1.5rem; }
        .prose-editorial h3 { font-size: 1.25rem; }
        .prose-editorial p { margin-bottom: 1.25rem; }
        .prose-editorial ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.25rem; }
        .prose-editorial li { margin-bottom: 0.5rem; }
        .prose-editorial strong { color: #0f172a; font-weight: 700; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}