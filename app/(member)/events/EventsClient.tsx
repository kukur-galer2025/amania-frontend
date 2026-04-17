"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { 
  Calendar, MapPin, Search, AlertCircle, 
  Image as ImageIcon, Sparkles, 
  ChevronLeft, ChevronRight, User, Gem, Zap, CheckCircle2, ShieldCheck, ArrowRight
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

const EventSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] p-3 border border-slate-200/60 shadow-sm flex flex-col w-full h-full">
    <div className="w-full aspect-[16/10] bg-slate-100 animate-pulse rounded-[1rem] shrink-0" />
    <div className="px-3 pt-5 pb-4 space-y-3 flex-1">
      <div className="flex gap-2">
        <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded-md" />
        <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded-md" />
      </div>
      <div className="h-6 w-full bg-slate-200 animate-pulse rounded-md" />
      <div className="h-6 w-2/3 bg-slate-200 animate-pulse rounded-md" />
    </div>
    <div className="px-3 pb-2 pt-4 border-t border-slate-50 flex gap-3 w-full mt-auto">
      <div className="h-12 flex-1 bg-slate-100 animate-pulse rounded-xl" />
      <div className="h-12 flex-1 bg-slate-100 animate-pulse rounded-xl" />
    </div>
  </div>
);

const getSnippet = (html: string, length = 110) => {
  if (!html) return "";
  let text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// 🔥 Tipe Variants framer-motion sudah diperbaiki dengan "as const" 🔥
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
        const res = await apiFetch('/events');
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
    fetchEvents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const isMatchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            event.organizer?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const eventDate = new Date(event.start_time);
      const now = new Date();

      if (filter === 'upcoming') return isMatchSearch && eventDate >= now;
      if (filter === 'past') return isMatchSearch && eventDate < now;
      return isMatchSearch; 
    });
  }, [events, searchQuery, filter]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' }); 
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 selection:bg-indigo-100 selection:text-indigo-900 w-full overflow-x-hidden">
      
      {/* ════════ HERO SECTION ════════ */}
      <section className="relative pt-24 pb-28 md:pt-32 md:pb-40 px-4 w-full flex flex-col items-center justify-center overflow-hidden bg-slate-950 rounded-b-[2rem] md:rounded-b-[3.5rem] shadow-2xl z-10">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=2070" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center w-full">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-400/20 rounded-full text-indigo-300 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-lg">
             <Sparkles size={14} className="text-amber-400" /> Amania Masterclass
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter mb-6 leading-[1.1] drop-shadow-2xl">
            Investasi Terbaik <br className="hidden sm:block"/> Adalah Edukasi.
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-sm md:text-lg font-medium max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed px-4">
            Tingkatkan keahlian Anda melalui program intensif dan webinar eksklusif yang dipandu langsung oleh pakar industri.
          </motion.p>
          
          {/* FLOATING SEARCH BAR */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto w-full px-4 sm:px-0">
            <div className="flex items-center bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 md:p-2 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:bg-white/20 focus-within:border-indigo-400/50 transition-all duration-300 w-full group">
              <div className="pl-4 pr-2 text-indigo-300 shrink-0 group-focus-within:text-white transition-colors">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                placeholder="Cari program, kelas, atau mentor..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent border-none text-white placeholder:text-slate-400 py-3.5 text-sm md:text-base font-semibold outline-none min-w-0" 
              />
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl font-bold text-xs md:text-sm hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30 shrink-0 active:scale-95">
                Cari
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ FILTER TABS ════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 -mt-6 md:-mt-8 relative z-20 flex justify-center mb-10 md:mb-12">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/50 w-max max-w-full">
          {[
            { id: 'upcoming', label: 'Program Tersedia' },
            { id: 'all', label: 'Semua Katalog' },
            { id: 'past', label: 'Telah Selesai' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setFilter(tab.id as any)} 
              className={`relative px-5 py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === tab.id ? 'text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {filter === tab.id && (
                <motion.div 
                  layoutId="activeFilterBubble"
                  className="absolute inset-0 bg-slate-900 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ════════ MAIN CONTENT ════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full">
        
        {!loading && !error && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">Eksplorasi Kelas</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full"
            >
              <AnimatePresence mode="popLayout">
                {currentEvents.map((event) => {
                  const isPast = new Date(event.end_time) < new Date();
                  const isFree = event.basic_price === 0;
                  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
                  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
                  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;

                  return (
                    <motion.div 
                      layout 
                      variants={itemVariants}
                      key={event.id} 
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full"
                    >
                      <Link href={`/events/${event.slug}`} className="group block h-full bg-white rounded-[2rem] p-2.5 sm:p-3 border border-slate-200 hover:border-indigo-300 hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col relative overflow-hidden">
                        
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity z-20" />

                        <div className="relative w-full aspect-[16/10] bg-slate-100 rounded-[1.25rem] overflow-hidden mb-4 shrink-0">
                          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 items-start">
                            {isPast ? (
                              <span className="bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border border-slate-700 flex items-center gap-1.5">
                                <CheckCircle2 size={12} /> Selesai
                              </span>
                            ) : event.quota === 0 ? (
                              <span className="bg-rose-600/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border border-rose-500 flex items-center gap-1.5">
                                <AlertCircle size={12} /> Penuh
                              </span>
                            ) : event.quota <= 15 ? (
                              <motion.span animate={{ opacity: [1, 0.8, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="bg-amber-500/95 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border border-amber-400 flex items-center gap-1.5">
                                <Zap size={12} className="fill-white" /> Sisa {event.quota} Kursi
                              </motion.span>
                            ) : (
                              <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border border-white/50 flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Buka
                              </span>
                            )}
                          </div>

                          <div className={`w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105 ${isPast ? 'grayscale opacity-75' : ''}`}>
                            {event.image ? (
                              <img src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} strokeWidth={1.5} /></div>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        <div className="px-3 sm:px-4 pb-3 flex flex-col flex-1">
                          <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3 truncate">
                            <span className="flex items-center gap-1.5 shrink-0 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">
                              <Calendar size={12} className="mb-0.5"/> 
                              {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                            <span className="flex items-center gap-1.5 truncate text-slate-600">
                              <MapPin size={12} className="mb-0.5 text-slate-400"/> {event.venue}
                            </span>
                          </div>

                          <h3 className="text-lg md:text-xl font-black text-slate-900 leading-[1.3] mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem] break-words">
                            {event.title}
                          </h3>

                          <div className="flex items-center gap-2.5 min-w-0 mb-5">
                            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-0.5">
                              {organizerAvatar ? <img src={organizerAvatar} className="w-full h-full object-cover rounded-full" alt="org"/> : <User size={12} className="text-slate-400" />}
                            </div>
                            <p className="text-[11px] md:text-xs font-bold text-slate-600 truncate flex items-center gap-1">
                              {organizerName} {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500" />}
                            </p>
                          </div>

                          <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2 w-full">
                            <div className={`flex-1 rounded-xl p-2.5 md:p-3 border flex flex-col justify-center transition-colors ${isFree ? 'bg-emerald-50/50 border-emerald-100 group-hover:bg-emerald-50' : 'bg-slate-50/50 border-slate-100 group-hover:bg-slate-100'}`}>
                               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Basic Pass</p>
                               <p className={`text-[13px] md:text-sm font-black truncate ${isFree ? 'text-emerald-600' : 'text-slate-900'}`}>
                                 {isFree ? 'GRATIS' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
                               </p>
                            </div>

                            {event.premium_price > 0 && (
                              <div className="flex-1 rounded-xl p-2.5 md:p-3 border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50/50 flex flex-col justify-center relative overflow-hidden group-hover:from-amber-100 group-hover:to-orange-100 transition-colors">
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                 <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5 flex items-center gap-1 relative z-10">
                                   <Gem size={10} /> VIP Premium
                                 </p>
                                 <p className="text-[13px] md:text-sm font-black text-amber-900 truncate relative z-10">
                                   Rp {event.premium_price.toLocaleString('id-ID')}
                                 </p>
                              </div>
                            )}
                            
                            <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-slate-200 shadow-sm group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 shrink-0 ml-1 self-center">
                              <ArrowRight size={16} className="md:w-5 md:h-5 shrink-0" />
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
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}