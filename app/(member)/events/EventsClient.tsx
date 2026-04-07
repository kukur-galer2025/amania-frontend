"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Search, AlertCircle, ArrowRight, 
  Zap, Image as ImageIcon, Sparkles, 
  ShieldCheck, Gem, ChevronLeft, ChevronRight, Clock, User
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

const EventSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden mx-1 md:mx-0 w-full min-w-0">
    <div className="w-full aspect-video bg-slate-100 animate-pulse shrink-0" />
    <div className="p-4 md:p-5 space-y-3 md:space-y-4 flex-1 w-full min-w-0">
      <div className="h-3 md:h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
      <div className="h-5 md:h-6 w-full bg-slate-200 animate-pulse rounded-lg" />
      <div className="h-3 md:h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
    </div>
    <div className="p-4 md:p-5 border-t border-slate-100 flex justify-between w-full min-w-0">
      <div className="h-5 md:h-6 w-20 md:w-24 bg-slate-200 animate-pulse rounded" />
      <div className="h-5 md:h-6 w-6 md:w-8 bg-slate-100 animate-pulse rounded" />
    </div>
  </div>
);

const getSnippet = (html: string, length = 110) => {
  if (!html) return "";
  let text = html.replace(/<[^>]+>/g, ' ');
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  text = text.replace(/\s+/g, ' ').trim();
  return text.length > length ? text.substring(0, length) + '...' : text;
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
      const isMatchSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
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

  const renderFOMO = (quota: number) => {
    if (quota === 0) return (
      <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-rose-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 rounded-md z-10 shadow-lg">
        Sold Out
      </div>
    );
    if (quota <= 15) return (
      <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute top-3 right-3 md:top-4 md:right-4 bg-amber-500 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 md:px-3 md:py-1.5 rounded-md z-10 flex items-center gap-1.5 shadow-lg"
      >
        <Zap size={10} className="fill-white md:w-3 md:h-3" /> Sisa {quota} Kursi
      </motion.div>
    );
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-24 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden w-full">
      
      <section className="relative min-h-[400px] md:min-h-[500px] flex items-center overflow-hidden border-b border-slate-800 w-full min-w-0">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" alt="Hero Background" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-900/40 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10 py-16 md:py-20 w-full text-center md:text-left min-w-0">
          <div className="max-w-2xl mx-auto md:mx-0 w-full min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 bg-white/5 border border-white/10 rounded-full text-indigo-300 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest mb-4 md:mb-6">
                <Sparkles size={10} className="md:w-3 md:h-3 shrink-0" /> Amania Education Platform
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4 md:mb-6 leading-[1.1] break-words w-full">
              Investasi Terbaik <br className="hidden lg:block"/> Adalah Edukasi.
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl font-medium mb-8 md:mb-12 max-w-xl leading-relaxed mx-auto md:mx-0 px-4 md:px-0 break-words w-full">
              Akselerasi karir teknologi Anda. Temukan bootcamp dan webinar eksklusif yang dipandu oleh para ahli industri di ekosistem Amania.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative max-w-xl shadow-2xl mx-auto md:mx-0 group px-4 md:px-0 w-full min-w-0">
              <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex flex-col sm:flex-row items-center bg-white rounded-xl p-1.5 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all border border-slate-200 shadow-xl shadow-indigo-500/5 w-full min-w-0">
                <div className="flex w-full items-center min-w-0">
                  <Search size={18} className="text-slate-400 ml-3 md:ml-4 shrink-0 md:w-[22px] md:h-[22px]" />
                  <input type="text" placeholder="Cari Bootcamp, UI/UX..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 py-2.5 md:py-3.5 px-3 md:px-4 text-xs md:text-sm font-medium outline-none min-w-0" />
                </div>
                <button className="bg-indigo-600 text-white w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3.5 rounded-lg font-semibold text-xs transition-colors hover:bg-indigo-500 shrink-0 mt-2 sm:mt-0">
                  Eksplorasi
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 -mt-8 md:-mt-12 relative z-20 w-full min-w-0">
        
        <div className="bg-white p-2 md:p-2.5 rounded-xl border border-slate-200 shadow-sm mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 w-full min-w-0">
          <div className="px-2 md:px-4 py-1.5 md:py-2 hidden md:flex shrink-0 min-w-0">
             <h2 className="text-xs md:text-sm font-semibold text-slate-900 flex items-center gap-2 truncate w-full">
               Katalog Program <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] md:text-[10px] shrink-0">{filteredEvents.length}</span>
             </h2>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl flex w-full md:w-auto border border-slate-200 overflow-x-auto custom-scrollbar min-w-0">
            {(['upcoming', 'all', 'past'] as const).map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)} className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${filter === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                {tab === 'upcoming' ? 'Upcoming' : tab === 'all' ? 'Semua Event' : 'Selesai'}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="py-16 md:py-20 text-center text-red-600 bg-red-50 rounded-2xl border border-red-100 font-semibold max-w-2xl mx-auto shadow-sm px-4 w-full break-words">
            <AlertCircle size={40} className="md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-30 shrink-0" />
            <p className="text-sm md:text-base w-full">Terjadi Kesalahan Sistem: {error}</p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full min-w-0">
            {[1, 2, 3, 4, 5, 6].map((i) => <EventSkeleton key={i} />)}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-24 md:py-40 text-center bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm mx-1 md:mx-0 px-4 w-full min-w-0">
            <Search size={40} className="md:w-14 md:h-14 mx-auto text-slate-200 mb-4 md:mb-6 shrink-0" />
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1.5 md:mb-2 break-words w-full">Program Tidak Ditemukan</h3>
            <p className="text-slate-500 font-medium text-xs md:text-sm break-words w-full">Coba gunakan kata kunci atau filter lain.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full min-w-0">
              <AnimatePresence mode="popLayout">
                {currentEvents.map((event, index) => {
                  
                  // 🔥 LOGIKA ORGANIZER 🔥
                  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
                  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;

                  return (
                    <motion.div layout key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }} className="group mx-1 sm:mx-0 h-full w-full min-w-0">
                      
                      <Link href={`/events/detail?slug=${event.slug}`} className="block h-full w-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col min-w-0">
                        
                        <div className="relative w-full aspect-video bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                          {renderFOMO(event.quota)}
                          
                          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col items-start gap-1.5 min-w-0">
                            {event.basic_price === 0 && (
                              <div className="bg-emerald-600 text-white text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-2 py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1 md:gap-1.5 shadow-lg shadow-emerald-600/10 border border-emerald-500 shrink-0">
                                <ShieldCheck size={10} className="md:w-3 md:h-3" /> Basic Free
                              </div>
                            )}
                            {event.premium_price > 0 && (
                              <div className="bg-amber-500 text-white text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-2 py-1 md:px-2.5 md:py-1.5 rounded-md md:rounded-lg flex items-center gap-1 md:gap-1.5 shadow-lg shadow-amber-500/10 border border-amber-400 shrink-0">
                                <Gem size={10} className="fill-white md:w-3 md:h-3" /> VIP Tersedia
                              </div>
                            )}
                          </div>

                          {event.image ? (
                            <img src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={32} className="md:w-12 md:h-12" strokeWidth={1.5} /></div>
                          )}
                        </div>

                        <div className="p-4 md:p-6 flex flex-col flex-1 w-full min-w-0">
                          
                          {/* 🔥 TAMPILAN ORGANIZER 🔥 */}
                          <div className="flex items-center gap-1.5 mb-2.5 md:mb-3">
                            <User size={12} className="text-indigo-500 shrink-0" />
                            <p className="text-[10px] md:text-[11px] font-bold text-indigo-600 truncate min-w-0 flex items-center gap-1">
                              {organizerName}
                              {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500 shrink-0" />}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-semibold text-slate-500 mb-3 md:mb-4 uppercase tracking-widest w-full min-w-0">
                            <span className="flex items-center gap-1 md:gap-1.5 text-indigo-600 shrink-0">
                              <Calendar size={12} className="md:w-3.5 md:h-3.5" /> 
                              {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            <span className="flex items-center gap-1 md:gap-1.5 shrink-0">
                              <Clock size={12} className="md:w-3.5 md:h-3.5" /> 
                              {new Date(event.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 leading-[1.3] mb-2.5 md:mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.6rem] md:min-h-[3.2rem] break-words w-full">
                            {event.title}
                          </h3>

                          <p className="text-xs md:text-sm font-medium text-slate-500 leading-relaxed line-clamp-2 mb-4 md:mb-6 flex-1 break-words w-full">
                            {getSnippet(event.description, 90)}
                          </p>
                          
                          <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-auto min-w-0 w-full">
                            <MapPin size={12} className="text-rose-500 md:w-3.5 md:h-3.5 shrink-0" />
                            <span className="truncate flex-1 w-full min-w-0">{event.venue}</span>
                          </div>
                        </div>

                        <div className="px-4 md:px-6 py-4 md:py-5 bg-slate-50/50 mt-auto flex items-end justify-between border-t border-slate-100 group-hover:bg-white transition-colors w-full min-w-0">
                          <div className="space-y-2 md:space-y-3 min-w-0 flex-1">
                            <div className="flex flex-col min-w-0 w-full">
                              <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 md:mb-1.5 leading-none truncate w-full">Basic Access</span>
                              <span className={`text-sm md:text-base font-bold break-words w-full ${event.basic_price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                {event.basic_price === 0 ? 'Gratis' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
                              </span>
                            </div>

                            {event.premium_price > 0 && (
                              <div className="flex flex-col border-t border-slate-200 pt-2 md:pt-2.5 min-w-0 w-full">
                                <span className="text-[9px] md:text-[10px] font-semibold text-amber-600 uppercase tracking-widest flex items-center gap-1 md:gap-1.5 mb-1 md:mb-1.5 leading-none truncate w-full">
                                  <Gem size={10} className="md:w-3 md:h-3 shrink-0" /> VIP Premium
                                </span>
                                <span className="text-sm md:text-base font-bold text-slate-900 break-words w-full">
                                  Rp {event.premium_price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-2 md:p-3 bg-white rounded-lg md:rounded-xl border border-slate-200 shadow-sm group-hover:border-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 shrink-0 ml-3">
                            <ArrowRight size={16} className="md:w-5 md:h-5 shrink-0" />
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-center mt-12 md:mt-20 border-t border-slate-200 pt-8 md:pt-10 w-full min-w-0">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-center w-full min-w-0">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm shadow-indigo-500/5 shrink-0">
                    <ChevronLeft size={18} className="md:w-5 md:h-5 shrink-0" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl text-xs md:text-sm font-extrabold transition-all shrink-0 ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm shadow-indigo-500/5 shrink-0">
                    <ChevronRight size={18} className="md:w-5 md:h-5 shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { height: 0px; width: 0px; }`}</style>
    </div>
  );
}