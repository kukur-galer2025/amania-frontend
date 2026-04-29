"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, MapPin, Loader2, Image as ImageIcon, 
  CheckCircle2, Clock, Shield, Award, Sparkles, ShieldCheck,
  Compass, Tag, ArrowRight, Video, LayoutGrid, CalendarClock, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function MyEventsClient() {
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Silakan login untuk melihat event Anda.");
          return;
        }

        const res = await apiFetch('/my-registrations');
        const json = await res.json();
        
        if (json.success) {
          const verifiedEvents = json.data.filter((reg: any) => reg.status === 'verified');
          setMyEvents(verifiedEvents);
        }
      } catch (error) {
        toast.error("Gagal memuat daftar program Anda.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return myEvents.filter((reg: any) => {
      const matchesSearch = reg.event?.title?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      const eventDate = new Date(reg.event?.start_time);
      const now = new Date();
      
      if (statusFilter === 'upcoming') matchesStatus = eventDate >= now;
      if (statusFilter === 'past') matchesStatus = eventDate < now;

      return matchesSearch && matchesStatus;
    });
  }, [myEvents, searchTerm, statusFilter]);

  // 🔥 FUNGSI HITUNG MUNDUR (COUNTDOWN)
  const getTimeLeft = (startTime: string) => {
    const eventDate = new Date(startTime);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} Hari ${hours} Jam`;
    if (hours > 0) return `${hours} Jam ${minutes} Mnt`;
    return `${minutes} Menit`;
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
      <Loader2 className="animate-spin text-indigo-600" size={36} strokeWidth={2.5} />
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 break-words text-center px-4">Menyinkronkan Ruang Belajar...</span>
    </div>
  );

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-24 font-sans selection:bg-indigo-100">
      
      {/* ════════ IMMERSIVE LUXURY HERO SECTION ════════ */}
      <section className="relative w-full pt-20 pb-28 md:pt-28 md:pb-36 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-900/10 bg-slate-950 flex flex-col items-center justify-center text-center border border-white/5 mt-4 md:mt-0">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
            alt="Learning Concept" 
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/70 to-slate-950/90" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 px-6 max-w-3xl mx-auto flex flex-col items-center w-full min-w-0">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-sm">
             <Sparkles size={14} className="text-amber-400" /> Ruang Belajar Eksklusif
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] drop-shadow-lg mb-5 w-full">
            Koleksi Event & <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-400 font-serif italic font-light pr-2">Webinar Anda.</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-indigo-100/70 text-sm md:text-base font-medium leading-relaxed max-w-lg mx-auto w-full px-2">
            Akses seluruh jadwal kelas, modul eksklusif, dan rekaman dari program Amania yang telah Anda ikuti.
          </motion.p>
        </div>
      </section>

      {/* ════════ FLOATING TOOLBAR (PENCARIAN & FILTER) ════════ */}
      <div className="relative z-20 max-w-[1000px] mx-auto px-4 md:px-8 -mt-20 md:-mt-24 w-full">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/60 rounded-2xl md:rounded-[2rem] p-3 md:p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-3 md:gap-5 w-full">
          
          <div className="relative w-full md:flex-1 min-w-0 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari kelas Anda..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl md:rounded-2xl py-3 pl-11 pr-4 text-xs md:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-inner"
            />
          </div>

          <div className="flex w-full md:w-auto bg-slate-100/80 p-1.5 rounded-xl md:rounded-2xl border border-slate-200/50 shrink-0 overflow-x-auto custom-scrollbar">
            {[
              { id: 'all', label: 'Semua', icon: LayoutGrid },
              { id: 'upcoming', label: 'Akan Datang', icon: CalendarClock },
              { id: 'past', label: 'Selesai', icon: CheckCircle2 }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setStatusFilter(type.id as any)}
                className={`flex items-center justify-center gap-1.5 flex-1 md:flex-none px-4 md:px-5 py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg md:rounded-xl transition-all whitespace-nowrap relative ${
                  statusFilter === type.id 
                    ? 'text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                {statusFilter === type.id && (
                  <motion.div layoutId="myEventsFilter" className="absolute inset-0 bg-white border border-slate-200/50 rounded-lg md:rounded-xl -z-10 shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <type.icon size={14} className={statusFilter === type.id ? 'text-indigo-500' : 'text-slate-400'} />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ════════ MAIN GRID CLASS CARDS ════════ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 w-full min-w-0 mt-8 md:mt-12">
        {filteredEvents.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-indigo-100/60 rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 flex flex-col items-center justify-center text-center shadow-sm w-full min-w-0">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm shrink-0">
               <Compass size={32} className="text-indigo-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 break-words w-full">Area Belajar Kosong</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-8 max-w-md leading-relaxed break-words w-full">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tidak ada program yang sesuai dengan kata kunci atau filter saat ini.' 
                : 'Anda belum mendaftar kelas apapun. Yuk, jelajahi katalog kami dan temukan skill baru!'}
            </p>
            <Link href="/events" className="px-8 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:shadow-lg hover:shadow-slate-900/20 transition-all shadow-sm inline-flex items-center gap-2 shrink-0 group">
              Eksplorasi Program <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full min-w-0">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((reg, idx) => {
                const isPast = new Date(reg.event?.end_time || reg.event?.start_time) < new Date();
                const isSuperadmin = !reg.event?.organizer || reg.event?.organizer?.role === 'superadmin';
                const organizerName = isSuperadmin ? 'Amania Official' : reg.event?.organizer?.name;
                const isFree = reg.event?.basic_price === 0;
                
                // 🔥 AMBIL DATA WAKTU TERSISA
                const timeLeft = getTimeLeft(reg.event?.start_time);

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    key={reg.id} 
                    className="group bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-15px_rgba(79,70,229,0.15)] hover:border-indigo-300 transition-all duration-500 flex flex-col overflow-hidden w-full min-w-0 transform hover:-translate-y-1.5"
                  >
                    
                    {/* 🔥 IMAGE CONTAINER (UNCROPPED & LUXURY BLUR) 🔥 */}
                    <div className="relative w-full h-[200px] sm:h-[220px] bg-slate-900 overflow-hidden p-2.5 flex items-center justify-center shrink-0">
                      
                      {reg.event?.image && (
                        <div className="absolute inset-0 z-0">
                          <img src={`${STORAGE_URL}/${reg.event.image}`} className="w-full h-full object-cover blur-[20px] opacity-40 scale-125" alt="blur-bg"/>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-slate-900/50 z-0" />

                      {/* Lencana VIP / Basic */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl backdrop-blur-md border ${
                          reg.tier === 'premium' ? 'bg-amber-500/90 text-white border-amber-400' : 'bg-white/95 text-slate-800 border-slate-200'
                        }`}>
                          {reg.tier === 'premium' ? <Award size={12} className="shrink-0"/> : <Shield size={12} className="shrink-0 text-indigo-600"/>}
                          <span className="truncate">{reg.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}</span>
                        </span>
                      </div>

                      {/* AREA KANAN ATAS (Status & Waktu) */}
                      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
                         {/* Lencana Selesai / Aktif */}
                         {isPast ? (
                            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shadow-xl">
                              <CheckCircle2 size={12} /> Selesai
                            </span>
                         ) : (
                            <span className="bg-indigo-500 text-indigo-50 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-indigo-400 flex items-center gap-1 shadow-xl shadow-indigo-500/30">
                              <CheckCircle2 size={12} className="text-white" /> Kelas Aktif
                            </span>
                         )}

                         {/* 🔥 BADGE HITUNG MUNDUR LUXURY 🔥 */}
                         {timeLeft && !isPast && (
                           <span className="bg-amber-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border border-amber-400 flex items-center gap-1.5 shadow-xl">
                             <Clock size={12} className="text-white shrink-0" />
                             {timeLeft}
                           </span>
                         )}
                      </div>

                      <div className={`relative z-10 w-full h-full transition-all duration-700 ease-out group-hover:scale-105 flex items-center justify-center ${isPast ? 'grayscale opacity-90' : ''}`}>
                        {reg.event?.image ? (
                          <img src={`${STORAGE_URL}/${reg.event.image}`} alt={reg.event.title} className="w-full h-full object-contain drop-shadow-2xl rounded-xl" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500"><ImageIcon size={40} strokeWidth={1.5} /></div>
                        )}
                      </div>
                    </div>

                    {/* CONTENT CONTAINER */}
                    <div className="p-4 md:p-5 flex-1 flex flex-col w-full min-w-0 bg-white">
                      <div className="flex items-center justify-between mb-3 min-w-0 w-full gap-2">
                         <div className="flex items-center gap-1.5 min-w-0 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            <Briefcase size={10} className="text-slate-400 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 truncate min-w-0 flex items-center gap-1">
                              {organizerName}
                              {isSuperadmin && <ShieldCheck size={10} className="text-indigo-400 shrink-0" />}
                            </p>
                         </div>
                      </div>

                      <h3 className={`text-base md:text-[17px] font-black leading-[1.3] mb-4 line-clamp-2 transition-colors break-words w-full ${isPast ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-700'}`}>
                        {reg.event?.title || 'Program Tidak Tersedia'}
                      </h3>

                      <div className="mt-auto pb-5 w-full min-w-0 grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1 min-w-0 border-r border-slate-100">
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            <Calendar size={10} className="text-indigo-400" /> Tanggal
                          </span>
                          <span className="text-[11px] md:text-xs font-semibold text-slate-700 truncate w-full pr-2">
                            {reg.event ? new Date(reg.event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0 pl-2">
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            <MapPin size={10} className="text-rose-400" /> Lokasi
                          </span>
                          <span className="text-[11px] md:text-xs font-semibold text-slate-700 truncate w-full">
                            {reg.event?.venue || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 w-full min-w-0">
                        <div className="flex flex-col min-w-0 shrink-0">
                          <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                             <Tag size={10} className="text-amber-500" /> Nilai Tiket
                          </span>
                          <span className={`text-[13px] md:text-sm font-black truncate w-full ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
                             {isFree ? 'FREE' : `Rp ${reg.event?.basic_price?.toLocaleString('id-ID') || 0}`}
                          </span>
                        </div>

                        <Link 
                          href={`/my-events/${reg.event?.slug || reg.event?.id}`} 
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all group/btn min-w-0 ${
                            isPast 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 shadow-sm' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white shadow-sm border border-indigo-100/50 hover:border-indigo-600'
                          }`}
                        >
                          <Video size={14} className={isPast ? 'text-slate-500' : 'text-indigo-400 group-hover/btn:text-indigo-200'} />
                          <span className="truncate">{isPast ? 'Rekaman Kelas' : 'Masuk Kelas'}</span> 
                        </Link>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      
    </div>
  );
}