"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
 Calendar, MapPin, Search, AlertCircle, 
 Image as ImageIcon, Sparkles, 
 ChevronLeft, ChevronRight, User, Gem, Zap, CheckCircle2, ShieldCheck, ArrowRight,
 MonitorPlay, BookOpen, LayoutGrid, Archive, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api';
import AdBanner from '@/app/components/AdBanner';

const EventSkeleton = () => (
 <div className="bg-white dark:bg-[#111827] rounded-[2rem] overflow-clip border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-black/10 flex flex-col w-full h-full">
 <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-slate-700/50 shrink-0"/>
 <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col">
 <div className="flex gap-2">
 <div className="h-5 w-1/3 bg-slate-100 dark:bg-slate-700/50 rounded-md"/>
 <div className="h-5 w-1/4 bg-slate-100 dark:bg-slate-700/50 rounded-md"/>
 </div>
 <div className="space-y-2">
 <div className="h-7 w-full bg-slate-200 dark:bg-slate-700/50 rounded-md"/>
 <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-700/50 rounded-md"/>
 </div>
 <div className="pt-4 mt-auto flex gap-3 w-full border-t border-slate-50 dark:border-slate-700/30">
 <div className="h-14 flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl"/>
 <div className="h-14 flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl"/>
 </div>
 </div>
 </div>
);

export default function EventsClient() {
 const [events, setEvents] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 
 const [searchQuery, setSearchQuery] = useState('');
 const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
 const [visibleCount, setVisibleCount] = useState(9);

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
 setVisibleCount(9);
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

 const visibleEvents = filteredEvents.slice(0, visibleCount);

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
 
  {/* ════════ HERO SECTION (NEXT-GEN) ════════ */}
  <section className="relative pt-16 md:pt-32 pb-24 md:pb-40 w-full flex flex-col items-center justify-center bg-slate-950 rounded-b-3xl md:rounded-b-[4rem] border-b border-indigo-900/50">
  
  {/* High-Performance Pure CSS Gradient Background (No Lag) */}
  <div className="absolute inset-0 z-0 rounded-b-3xl md:rounded-b-[4rem]" style={{
  background: 'radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.4) 0%, rgba(2, 6, 23, 1) 70%)'
  }}></div>
  
  <div className="relative z-10 max-w-5xl mx-auto px-6 text-center w-full">
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
  <Gem size={14} className="text-amber-400 drop-shadow-md"/> Amania Masterclass
  </motion.div>
  
  <div className="relative mb-8">
  <motion.div initial={{ opacity: 0, scale: 0.5, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="absolute -top-10 -left-6 md:left-12 text-white/10 hidden md:block">
  <MonitorPlay size={64} strokeWidth={1} />
  </motion.div>
  
  <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 tracking-tight leading-[1.15] md:leading-[1.1] drop-shadow-sm">
  Elevate Your <br className="hidden sm:block"/>
  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-serif italic font-light pr-2">Expertise.</span>
  </motion.h1>
  
  <motion.div initial={{ opacity: 0, scale: 0.5, rotate: 20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="absolute -bottom-6 -right-6 md:right-16 text-white/10 hidden md:block">
  <BookOpen size={56} strokeWidth={1} />
  </motion.div>
  </div>
  
  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="text-slate-300/90 text-sm md:text-base lg:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
  Bergabunglah dengan Webinar dan Event premium kami. Dipandu eksklusif oleh pakar industri untuk melesatkan karir profesional Anda.
  </motion.p>
  </div>
  {/* Search Bar (Inside Hero) */}
  <div className="relative z-30 px-4 mt-8 max-w-3xl mx-auto w-full">
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
  <div className="flex flex-col sm:flex-row items-center bg-slate-800/90 dark:bg-slate-900 rounded-2xl md:rounded-[2rem] p-2 border border-slate-700 shadow-lg focus-within:border-amber-400/50 w-full gap-2 sm:gap-0 transition-colors">
  <div className="hidden sm:block pl-6 pr-3 text-slate-300 group-focus-within:text-amber-400 transition-colors">
  <Search size={24} strokeWidth={2} />
  </div>
  <input 
  type="text"
  placeholder="Cari webinar, bootcamp..."
  value={searchQuery} 
  onChange={(e) => setSearchQuery(e.target.value)} 
  className="w-full bg-transparent border-none text-white placeholder:text-slate-400 py-3.5 sm:py-4 px-5 sm:px-0 text-sm md:text-base font-bold outline-none min-w-0 text-center sm:text-left"
  />
  <button className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-8 py-3.5 sm:py-4 rounded-xl md:rounded-2xl font-black text-sm shrink-0 active:scale-95 sm:ml-2 flex justify-center items-center gap-2 shadow-lg shadow-orange-500/30 transition-all">
  <Search size={16} className="sm:hidden"/> Eksplorasi
  </button>
  </div>
  </motion.div>
  </div>
  </section>

  {/* PROMO BANNERS */}
  <div className="w-full relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 mb-8 md:mb-10">
    <AdBanner placement="webinar" className="shadow-md dark:shadow-none rounded-2xl md:rounded-[2rem] overflow-hidden" />
  </div>

 {/* ════════ SEGMENTED FILTER TABS (APPLE STYLE) ════════ */}
 <div className="sticky top-[70px] md:top-[80px] z-[40] flex justify-center mb-10 md:mb-12 w-full px-4 pointer-events-none transition-all">
 <div className="pointer-events-auto flex overflow-x-auto hide-scrollbar p-1.5 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 w-full sm:w-max shadow-sm">
 {[
 { id: 'upcoming', label: 'Program Tersedia', icon: Sparkles },
 { id: 'all', label: 'Semua Katalog', icon: LayoutGrid },
 { id: 'past', label: 'Telah Selesai', icon: Archive }
 ].map((tab) => (
 <button 
 key={tab.id} 
 onClick={() => setFilter(tab.id as any)} 
 className={`relative px-4 sm:px-6 py-2.5 md:py-3 rounded-xl text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors flex-shrink-0 ${filter === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
 >
 {filter === tab.id && (
 <motion.div layoutId="activeWebinarFilter" className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-600/50 z-0" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
 )}
 <span className="relative z-10 flex items-center justify-center gap-1.5 md:gap-2">
 <tab.icon size={14} className={`${filter === tab.id ? 'text-indigo-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
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
 <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Webinar & Event</h2>
 <div className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
 <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredEvents.length}</span> program
 </div>
 </div>
 )}

 {error ? (
 <div className="py-20 text-center bg-white dark:bg-[#111827] rounded-[24px] border border-rose-100 dark:border-rose-500/20 max-w-2xl mx-auto px-6">
 <AlertCircle size={48} className="mx-auto mb-4 text-rose-500 opacity-80"/>
 <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Gagal Memuat Data</h3>
 <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
 </div>
 ) : loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
 {[1, 2, 3, 4, 5, 6].map((i) => <EventSkeleton key={i} />)}
 </div>
 ) : filteredEvents.length === 0 ? (
 <div className="py-28 text-center bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-700/50 px-6">
 <div className="w-20 h-20 bg-slate-50 dark:bg-[#111827] rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100 dark:border-slate-700/50">
 <Search size={32} className="text-slate-300 dark:text-slate-500"/>
 </div>
 <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">Tidak Ditemukan</h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">Kami tidak dapat menemukan program yang sesuai dengan pencarian atau filter Anda saat ini.</p>
 </div>
 ) : (
 <>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
 {visibleEvents.map((event) => {
 const isPast = new Date(event.end_time) < new Date();
 const isFree = event.basic_price === 0;
 const isSuperadmin = true;
 const organizerName = event.organizer?.name || 'Amania Official';
 const organizerAvatar = event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;
 const timeLeft = getTimeLeft(event.start_time);

 return (
 <div key={event.id} className="w-full h-full">
 <Link 
 href={`/events/${event.slug}`} 
 className="group flex flex-col h-full bg-white dark:bg-[#0c1222] rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-600 relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1"
 >
 
 {/* Glow Effect Background on Hover */}
 <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />
 
 <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-500"/>

 <div className="relative w-full aspect-[16/9] bg-slate-900 overflow-clip shrink-0 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/50 rounded-t-2xl md:rounded-t-[2rem]">
 
 <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
 {/* Kiri - Status Event/Sisa Kuota */}
 <div className="flex flex-col gap-2 items-start">
 {isPast ? (
 <span className="bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
 <CheckCircle2 size={12} /> Selesai
 </span>
 ) : event.quota === 0 ? (
 <span className="bg-rose-600/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-rose-500 flex items-center gap-1.5">
 <AlertCircle size={12} /> Penuh
 </span>
 ) : event.quota <= 15 ? (
 <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-amber-400 flex items-center gap-1.5">
 <Zap size={12} className="fill-white"/> Sisa {event.quota}
 </span>
 ) : (
 <span className="bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/30 flex items-center gap-1.5">
 <span className="relative flex h-2 w-2">
 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
 </span>
 Buka
 </span>
 )}
 </div>
 
 {/* Kanan - Info Waktu */}
 {timeLeft && !isPast && (
 <div className="bg-slate-900/90 text-slate-100 text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5">
 <Clock size={12} className="text-amber-400"/>
 {timeLeft}
 </div>
 )}

 </div>

 <div className={`w-full h-full relative ${isPast ? 'grayscale opacity-75' : ''}`}>
 {event.image ? (
 <img loading="lazy" src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="w-full h-full object-cover rounded-t-[1.5rem] md:rounded-t-[2rem] group-hover:scale-110 transition-transform duration-700 ease-out"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 relative z-10 rounded-t-[1.5rem] md:rounded-t-[2rem]"><ImageIcon size={40} strokeWidth={1.5} /></div>
 )}
 {/* Glass Overlay Gradient */}
 <div className="absolute inset-0 bg-gradient-to-t from-[#0c1222]/80 via-transparent to-transparent opacity-0 dark:opacity-100 pointer-events-none z-10"></div>
 </div>
 </div>

 <div className="p-4 md:p-6 flex flex-col flex-1 relative bg-transparent z-10">
 
 <div className="absolute -top-8 right-5 z-30">
 <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-white dark:border-[#0c1222] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg shadow-black/5 dark:shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
 {isSuperadmin ? (
 <img loading="lazy" src="/logo.webp"
 className="w-full h-full object-contain p-1 dark:brightness-0 dark:invert"
 alt="Amania Official"
 onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Amania&background=0D8ABC&color=fff&rounded=true&bold=true'; }} 
 />
 ) : organizerAvatar ? (
 <img loading="lazy" src={organizerAvatar} className="w-full h-full object-cover" alt="org"/>
 ) : (
 <User size={18} className="text-slate-400 dark:text-slate-400"/>
 )}
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-3 pr-12">
 <span className="flex items-center gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md md:rounded-lg border border-amber-100 dark:border-amber-500/20">
 <Calendar size={12} className="mb-0.5 w-3 h-3"/> 
 {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
 </span>
 <span className="flex items-start gap-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md md:rounded-lg border border-indigo-100 dark:border-indigo-500/20">
 <MapPin size={12} className="mt-[1px] shrink-0 w-3 h-3"/> 
 <span className="break-words line-clamp-1">{event.venue}</span>
 </span>
 </div>

 <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white leading-[1.3] md:leading-[1.35] mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 min-h-[2.6rem] md:min-h-[2.7rem] break-words">
 {event.title}
 </h3>

 <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4 md:mb-5">
 Oleh <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[120px]">{organizerName}</span> {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500 w-3 h-3"/>}
 </p>

 <div className="mt-auto pt-5 flex flex-col gap-3 w-full relative z-10">
 
 <div className="flex gap-2 w-full">
 <div className={`flex-1 rounded-xl md:rounded-2xl p-2.5 md:p-3 border flex flex-col justify-center transition-colors ${isFree ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-700/50'}`}>
 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">Basic Pass</p>
 <p className={`text-sm md:text-base font-black truncate ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
 {isFree ? 'GRATIS' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
 </p>
 </div>

 {event.premium_price > 0 && (
 <div className="flex-1 rounded-xl md:rounded-2xl p-2.5 md:p-3 border border-amber-300/40 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/40 dark:to-orange-900/20 flex flex-col justify-center relative overflow-hidden group/premium">
 <div className="absolute top-0 right-0 w-20 h-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 to-transparent rounded-full group-hover/premium:from-amber-400/30 transition-colors"></div>
 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-500 mb-0.5 flex items-center gap-1 relative z-10">
 <Gem size={12} className="w-3 h-3 text-amber-500" /> VIP Premium
 </p>
 <p className="text-sm md:text-base font-black text-amber-900 dark:text-amber-300 truncate relative z-10 drop-shadow-sm">
 Rp {event.premium_price.toLocaleString('id-ID')}
 </p>
 </div>
 )}
 </div>

 <div className="w-full relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] md:text-xs font-bold py-3 md:py-3.5 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-md">
 <span className="relative z-10 flex items-center gap-2">Lihat Detail <ArrowRight size={14} className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
 </div>

 </div>
 </div>
 </Link>
 </div>
 );
 })}
 </div>

 {!loading && filteredEvents.length > visibleCount && (
 <div className="mt-8 md:mt-12 flex justify-center w-full">
 <button
 onClick={() => setVisibleCount(prev => prev + 9)}
 className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm active:scale-95 flex items-center gap-2"
 >
 <LayoutGrid size={16} className="text-indigo-500" /> Tampilkan Lebih Banyak
 </button>
 </div>
 )}
 </>
 )}
 </main>
 </div>
 );
}