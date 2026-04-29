"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Calendar, MapPin, Search, AlertCircle, 
  Image as ImageIcon, Sparkles, 
  ChevronLeft, ChevronRight, User, Gem, Zap, CheckCircle2, ShieldCheck, ArrowRight,
  MonitorPlay, BookOpen, LayoutGrid, Archive, Clock
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

const EventSkeleton = () => (
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-200/60 shadow-sm flex flex-col w-full h-full">
    <div className="w-full aspect-[4/3] bg-slate-100 animate-pulse shrink-0" />
    <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
      <div className="flex gap-2">
        <div className="h-5 w-1/3 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-5 w-1/4 bg-slate-100 animate-pulse rounded-md" />
      </div>
      <div className="space-y-2">
        <div className="h-7 w-full bg-slate-200 animate-pulse rounded-md" />
        <div className="h-7 w-2/3 bg-slate-200 animate-pulse rounded-md" />
      </div>
      <div className="pt-4 mt-auto flex gap-3 w-full border-t border-slate-50">
        <div className="h-14 flex-1 bg-slate-100 animate-pulse rounded-xl" />
        <div className="h-14 flex-1 bg-slate-100 animate-pulse rounded-xl" />
      </div>
    </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring" as const, stiffness: 100, damping: 15 } 
  }
};

export default function EventsClient() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; 

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Tambahkan query parameter jika ada
        const url = searchQuery ? `/events?search=${encodeURIComponent(searchQuery)}` : '/events';
        const res = await apiFetch(url);
        if (!res.ok) throw new Error("Gagal terhubung ke server API");
        const data = await res.json();
        if (data.success) {
          const sorted = data.data.sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
          setEvents(sorted);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Tambahkan debounce
    const delayDebounceFn = setTimeout(() => {
      fetchEvents();
    }, 500)
    
    return () => clearTimeout(delayDebounceFn)

  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time);
      const now = new Date();

      if (filter === 'upcoming') return eventDate >= now;
      if (filter === 'past') return eventDate < now;
      return true; 
    });
  }, [events, filter]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' }); 
  };

  // --- Fungsi Bantuan ---
  const getTimeLeft = (startTime: string) => {
    const eventDate = new Date(startTime);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Dimulai dalam ${days} hari ${hours} jam`;
    } else if (hours > 0) {
      return `Dimulai dalam ${hours} jam ${minutes} menit`;
    } else {
      return `Dimulai dalam ${minutes} menit`;
    }
  };

  return (
    <div className="font-sans pb-12 w-full">
      
      {/* ════════ HERO SECTION KOTAK (LUXURY REDESIGN) ════════ */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0c] rounded-[2rem] md:rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] mb-12 border border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2070" 
            alt="Webinar Hero Background" 
            className="w-full h-full object-cover opacity-[0.15] mix-blend-screen scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-[#0a0a0c]/60 to-[#0a0a0c]" />
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-500/15 via-amber-500/10 to-transparent blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} 
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          >
             <Gem size={14} className="text-amber-400" /> Amania Masterclass
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }} className="relative mb-6">
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute -top-6 -left-4 md:left-10 text-white/20 hidden md:block"
            >
              <MonitorPlay size={40} strokeWidth={1} />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 tracking-tight leading-[1.1] drop-shadow-sm">
              Elevate Your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-serif italic font-light pr-2">Expertise.</span>
            </h1>

            <motion.div 
              animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute -bottom-2 -right-2 md:right-12 text-amber-400/20 hidden md:block"
            >
              <BookOpen size={36} strokeWidth={1} />
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }} 
            className="text-slate-400 text-sm md:text-base lg:text-lg font-medium max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Bergabunglah dengan Webinar dan Event premium kami. Dipandu eksklusif oleh pakar industri untuk melesatkan karir profesional Anda.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }} 
            className="max-w-2xl mx-auto w-full relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-amber-500/20 to-purple-500/20 rounded-[1.75rem] blur-md opacity-50 group-hover:opacity-100 transition duration-700" />
            
            <div className="relative flex flex-col sm:flex-row items-center bg-[#18181b]/80 backdrop-blur-2xl rounded-2xl p-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:bg-[#18181b] focus-within:border-amber-400/30 transition-all duration-500 w-full gap-2 sm:gap-0">
              <div className="hidden sm:block pl-5 pr-3 text-slate-400 group-focus-within:text-amber-400 transition-colors">
                <Search size={22} strokeWidth={2} />
              </div>
              <input 
                type="text" 
                placeholder="Cari webinar, bootcamp, atau mentor..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent border-none text-white placeholder:text-slate-500 py-3 sm:py-3.5 px-4 sm:px-0 text-sm md:text-base font-medium outline-none min-w-0 text-center sm:text-left" 
              />
              <button className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-8 py-3.5 sm:py-4 rounded-xl font-black text-sm hover:from-amber-300 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.2)] shrink-0 active:scale-95 sm:ml-2 flex justify-center items-center gap-2">
                <Search size={16} className="sm:hidden" /> Eksplorasi
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ FILTER TABS DENGAN IKON ════════ */}
      <div className="relative z-20 flex justify-center mb-8 w-full -mt-16">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 w-max max-w-full">
          {[
            { id: 'upcoming', label: 'Program Tersedia', icon: Sparkles },
            { id: 'all', label: 'Semua Katalog', icon: LayoutGrid },
            { id: 'past', label: 'Telah Selesai', icon: Archive }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setFilter(tab.id as any)} 
              className={`group relative px-5 py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === tab.id ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {filter === tab.id && (
                <motion.div 
                  layoutId="activeFilterBubble"
                  className="absolute inset-0 bg-slate-900 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <tab.icon size={14} className={`${filter === tab.id ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`} />
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════ MAIN CONTENT GRID ════════ */}
      <main className="w-full">
        
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between px-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Webinar & Event</h2>
            <div className="text-xs md:text-sm font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-indigo-600 font-bold">{filteredEvents.length}</span> program
            </div>
          </div>
        )}

        {error ? (
          <div className="py-20 text-center bg-white rounded-[24px] border border-rose-100 max-w-2xl mx-auto px-6 shadow-sm">
            <AlertCircle size={48} className="mx-auto mb-4 text-rose-500 opacity-80" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {[1, 2, 3, 4, 5, 6].map((i) => <EventSkeleton key={i} />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-28 text-center bg-white rounded-[2rem] border border-slate-200/60 px-6 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
               <Search size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">Kami tidak dapat menemukan program yang sesuai dengan pencarian atau filter Anda saat ini.</p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full"
            >
              <AnimatePresence mode="popLayout">
                {currentEvents.map((event) => {
                  const isPast = new Date(event.end_time) < new Date();
                  const isFree = event.basic_price === 0;
                  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
                  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
                  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;
                  const timeLeft = getTimeLeft(event.start_time);

                  return (
                    <motion.div 
                      layout 
                      variants={itemVariants}
                      key={event.id} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full h-full"
                    >
                      <Link 
                        href={`/events/${event.slug}`} 
                        className="group flex flex-col h-full bg-white rounded-[2rem] border border-slate-200/80 hover:border-indigo-400 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] transition-all duration-500 hover:-translate-y-1 relative"
                      >
                        
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity z-20" />

                        <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center border-b border-slate-100">
                          
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
                            {/* Kiri - Status Event/Sisa Kuota */}
                            <div className="flex flex-col gap-2 items-start">
                              {isPast ? (
                                <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border border-slate-700 flex items-center gap-1.5">
                                  <CheckCircle2 size={12} /> Selesai
                                </span>
                              ) : event.quota === 0 ? (
                                <span className="bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border border-rose-500 flex items-center gap-1.5">
                                  <AlertCircle size={12} /> Penuh
                                </span>
                              ) : event.quota <= 15 ? (
                                <motion.span animate={{ opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border border-amber-400 flex items-center gap-1.5">
                                  <Zap size={12} className="fill-white" /> Sisa {event.quota}
                                </motion.span>
                              ) : (
                                <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border border-white/50 flex items-center gap-1.5">
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  Buka
                                </span>
                              )}
                            </div>
                            
                            {/* Kanan - Info Waktu */}
                             {timeLeft && !isPast && (
                              <div className="bg-slate-900/80 backdrop-blur-md text-slate-100 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm border border-slate-700 flex items-center gap-1.5">
                                <Clock size={12} className="text-amber-400" />
                                {timeLeft}
                              </div>
                            )}

                          </div>

                          <div className={`w-full h-full relative transition-transform duration-700 ease-out group-hover:scale-105 ${isPast ? 'grayscale opacity-75' : ''}`}>
                            {event.image ? (
                              <>
                                <div className="absolute inset-0 overflow-hidden opacity-50 mix-blend-luminosity">
                                  <img src={`${STORAGE_URL}/${event.image}`} alt="blur" className="w-full h-full object-cover blur-2xl scale-125" />
                                </div>
                                <img src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="relative z-10 w-full h-full object-contain p-2 drop-shadow-xl" />
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-100 relative z-10"><ImageIcon size={40} strokeWidth={1.5} /></div>
                            )}
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col flex-1 relative bg-white">
                          
                          <div className="absolute -top-7 right-5 z-30">
                            <div className="w-12 h-12 rounded-full border-4 border-white bg-slate-50 shadow-md flex items-center justify-center overflow-hidden">
                               {isSuperadmin ? (
                                  <img 
                                    src="/logo.png" 
                                    className="w-full h-full object-contain p-1" 
                                    alt="Amania Official" 
                                    onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Amania&background=0D8ABC&color=fff&rounded=true&bold=true'; }} 
                                  />
                                ) : organizerAvatar ? (
                                  <img src={organizerAvatar} className="w-full h-full object-cover" alt="org"/>
                                ) : (
                                  <User size={18} className="text-slate-400" />
                                )}
                            </div>
                          </div>

                          {/* 🔥 UPDATE: Hapus truncate & max-w di Venue agar tampil utuh 🔥 */}
                          <div className="flex flex-wrap items-center gap-2 mb-4 pr-14">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100">
                              <Calendar size={12} className="mb-0.5"/> 
                              {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="flex items-start gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
                              <MapPin size={12} className="mt-[2px] shrink-0"/> 
                              <span className="break-words line-clamp-2">{event.venue}</span>
                            </span>
                          </div>

                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-[1.35] mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem] break-words">
                            {event.title}
                          </h3>

                          <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 mb-6">
                            Oleh <span className="text-slate-800 font-bold">{organizerName}</span> {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500" />}
                          </p>

                          <div className="mt-auto pt-4 border-t border-dashed border-slate-200 flex flex-col gap-3 w-full">
                            
                            <div className="flex gap-2 w-full">
                              <div className={`flex-1 rounded-xl p-2.5 border flex flex-col justify-center transition-all ${isFree ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Basic Pass</p>
                                 <p className={`text-xs md:text-sm font-black truncate ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                                   {isFree ? 'GRATIS' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
                                 </p>
                              </div>

                              {event.premium_price > 0 && (
                                <div className="flex-1 rounded-xl p-2.5 border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 flex flex-col justify-center relative overflow-hidden group-hover:shadow-inner transition-all">
                                   <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5 flex items-center gap-1">
                                     <Gem size={10} /> VIP Premium
                                   </p>
                                   <p className="text-xs md:text-sm font-black text-amber-900 truncate">
                                     Rp {event.premium_price.toLocaleString('id-ID')}
                                   </p>
                                </div>
                              )}
                            </div>

                            <div className="w-full bg-slate-900 text-white text-[11px] md:text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-colors shadow-sm">
                              Lihat Detail Program <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>

                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-12 md:mt-16 w-full">
                <div className="flex items-center gap-1 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all">
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                  <div className="flex items-center gap-1 px-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}