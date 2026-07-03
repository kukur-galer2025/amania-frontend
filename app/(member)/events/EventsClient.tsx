"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
 Calendar, MapPin, Search, AlertCircle, 
 Image as ImageIcon, Sparkles, 
 ChevronLeft, ChevronRight, User, Gem, Zap, CheckCircle2, ShieldCheck, ArrowRight,
 MonitorPlay, BookOpen, LayoutGrid, Archive, Clock
} from 'lucide-react';
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
 
   {/* ════════ HERO SECTION (ULTRA-FAST CSS ONLY) ════════ */}
 <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 w-full flex flex-col items-center justify-center bg-slate-950 rounded-[2rem] md:rounded-[3rem] mb-12 border border-slate-800">
 
 {/* CSS Pure Gradients (No Images, No Masks, 100% GPU Accelerated) */}
 <div className="absolute inset-0 z-0 rounded-[2rem] md:rounded-[3rem]" style={{
 background: 'radial-gradient(circle at 50% 0%, rgba(30, 58, 138, 0.4) 0%, rgba(2, 6, 23, 1) 70%)'
 }}></div>
 
 <div className="relative z-10 max-w-4xl mx-auto px-6 text-center w-full">
 <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-900/80 border border-amber-400/20 rounded-full text-amber-300 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-8">
 <Gem size={14} className="text-amber-400"/> Amania Masterclass
 </div>
 
 <div className="relative mb-6">
 <div className="absolute -top-6 -left-4 md:left-10 text-slate-800 hidden md:block">
 <MonitorPlay size={40} strokeWidth={1} />
 </div>
 
 <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 tracking-tight leading-[1.1]">
 Elevate Your <br className="hidden sm:block"/>
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 font-serif italic font-light pr-2">Expertise.</span>
 </h1>
 
 <div className="absolute -bottom-2 -right-2 md:right-12 text-slate-800 hidden md:block">
 <BookOpen size={36} strokeWidth={1} />
 </div>
 </div>
 
 <p className="text-slate-400 text-sm md:text-base lg:text-lg font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
 Bergabunglah dengan Webinar dan Event premium kami. Dipandu eksklusif oleh pakar industri untuk melesatkan karir profesional Anda.
 </p>
 
 <div className="max-w-2xl mx-auto w-full relative">
 <div className="relative flex flex-col sm:flex-row items-center bg-slate-900 rounded-2xl p-2 border border-slate-700 focus-within:border-amber-400/50 w-full gap-2 sm:gap-0">
 <div className="hidden sm:block pl-5 pr-3 text-slate-500 group-focus-within:text-amber-400">
 <Search size={22} strokeWidth={2} />
 </div>
 <input 
 type="text"
 placeholder="Cari webinar, bootcamp, atau mentor..."
 value={searchQuery} 
 onChange={(e) => setSearchQuery(e.target.value)} 
 className="w-full bg-transparent border-none text-white placeholder:text-slate-500 py-3 sm:py-3.5 px-4 sm:px-0 text-sm md:text-base font-medium outline-none min-w-0 text-center sm:text-left"
 />
 <button className="w-full sm:w-auto bg-orange-500 text-white px-8 py-3.5 sm:py-4 rounded-xl font-black text-sm hover:bg-orange-600 shrink-0 active:scale-95 sm:ml-2 flex justify-center items-center gap-2">
 <Search size={16} className="sm:hidden"/> Eksplorasi
 </button>
 </div>
 </div>
 </div>
 </section>

  {/* PROMO BANNERS */}
  <AdBanner placement="webinar" className="pb-6 -mt-2" />

 {/* ════════ FILTER TABS ════════ */}
 <div className="relative z-20 flex justify-center mb-8 w-full">
 <div className="flex gap-2 overflow-x-auto custom-scrollbar bg-white dark:bg-slate-800/95 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 w-max max-w-full">
 {[
 { id: 'upcoming', label: 'Program Tersedia', icon: Sparkles },
 { id: 'all', label: 'Semua Katalog', icon: LayoutGrid },
 { id: 'past', label: 'Telah Selesai', icon: Archive }
 ].map((tab) => (
 <button 
 key={tab.id} 
 onClick={() => setFilter(tab.id as any)} 
 className={`group relative px-5 py-2.5 md:py-3 rounded-xl text-[11px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap ${filter === tab.id ? 'text-white bg-slate-900' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
 >
 <span className="relative z-10 flex items-center gap-2">
 <tab.icon size={14} className={`${filter === tab.id ? 'text-amber-400' : 'text-slate-400 dark:text-slate-400 group-hover:text-indigo-500'}`} />
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
 {currentEvents.map((event) => {
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
 className="group flex flex-col h-full bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-indigo-400 relative overflow-hidden"
 >
 
 <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-500 opacity-0 group-hover:opacity-100 z-20"/>

 <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-clip shrink-0 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/50 rounded-t-[2rem]">
 
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
 <img loading="lazy" src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="w-full h-full object-contain p-2 rounded-t-[2rem]"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 relative z-10 rounded-t-[2rem]"><ImageIcon size={40} strokeWidth={1.5} /></div>
 )}
 </div>
 </div>

 <div className="p-5 sm:p-6 flex flex-col flex-1 relative bg-white dark:bg-[#111827]">
 
 <div className="absolute -top-7 right-5 z-30">
 <div className="w-12 h-12 rounded-full border-4 border-slate-200/50 dark:border-slate-700/30 bg-slate-50 dark:bg-[#111827] flex items-center justify-center overflow-hidden">
 {isSuperadmin ? (
 <img loading="lazy" src="/logo.png"
 className="w-full h-full object-contain p-1"
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

 <div className="flex flex-wrap items-center gap-2 mb-4 pr-14">
 <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-100 dark:border-amber-500/20">
 <Calendar size={12} className="mb-0.5"/> 
 {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
 </span>
 <span className="flex items-start gap-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
 <MapPin size={12} className="mt-[2px] shrink-0"/> 
 <span className="break-words line-clamp-2">{event.venue}</span>
 </span>
 </div>

 <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-[1.35] mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 min-h-[3rem] break-words">
 {event.title}
 </h3>

 <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-6">
 Oleh <span className="text-slate-800 dark:text-slate-200 font-bold">{organizerName}</span> {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500"/>}
 </p>

 <div className="mt-auto pt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 w-full">
 
 <div className="flex gap-2 w-full">
 <div className={`flex-1 rounded-xl p-2.5 border flex flex-col justify-center ${isFree ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-[#111827] border-slate-100 dark:border-slate-700/50'}`}>
 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-400 mb-0.5">Basic Pass</p>
 <p className={`text-xs md:text-sm font-black truncate ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
 {isFree ? 'GRATIS' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
 </p>
 </div>

 {event.premium_price > 0 && (
 <div className="flex-1 rounded-xl p-2.5 border border-amber-200/60 bg-amber-50 dark:bg-amber-950/30 flex flex-col justify-center relative overflow-hidden">
 <p className="text-[9px] font-black uppercase tracking-widest text-amber-600 mb-0.5 flex items-center gap-1">
 <Gem size={10} /> VIP Premium
 </p>
 <p className="text-xs md:text-sm font-black text-amber-900 dark:text-amber-400 truncate">
 Rp {event.premium_price.toLocaleString('id-ID')}
 </p>
 </div>
 )}
 </div>

 <div className="w-full bg-slate-900 text-white text-[11px] md:text-xs font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600">
 Lihat Detail Program <ArrowRight size={14} />
 </div>

 </div>
 </div>
 </Link>
 </div>
 );
 })}
 </div>

 {totalPages > 1 && (
 <div className="flex justify-center mt-12 md:mt-16 w-full">
 <div className="flex items-center gap-1 p-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl">
 <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none">
 <ChevronLeft size={18} strokeWidth={2.5} />
 </button>
 <div className="flex items-center gap-1 px-1">
 {[...Array(totalPages)].map((_, i) => (
 <button key={i} onClick={() => handlePageChange(i + 1)} className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
 {i + 1}
 </button>
 ))}
 </div>
 <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors">
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