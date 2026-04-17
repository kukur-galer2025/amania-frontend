"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, MapPin, Loader2, Image as ImageIcon, 
  CheckCircle2, Clock, Shield, Award, ChevronRight, Inbox, Eye, Sparkles, User, ShieldCheck
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

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500 break-words text-center px-4">Menyinkronkan ruang kelas Amania Anda...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-24 overflow-x-hidden w-full min-w-0">
      
      {/* HERO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 md:gap-12 items-center py-8 md:py-16 px-4 md:px-8 mt-4 md:mt-0 w-full min-w-0">
         <div className="space-y-4 md:space-y-6 text-center md:text-left min-w-0 w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm shrink-0">
               <Sparkles size={12} className="text-indigo-500 md:w-[14px] md:h-[14px]" /> Ruang Belajar Pribadi
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1] break-words w-full">
               Semua Kelas <span className="text-indigo-600 hidden sm:inline">&</span><br className="sm:hidden"/> Program Anda
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-500 text-xs md:text-sm lg:text-base font-medium leading-relaxed max-w-lg mx-auto md:mx-0 px-2 md:px-0 break-words w-full">
               Akses cepat ke jadwal kelas, modul pembelajaran, link pertemuan, dan unduh materi eksklusif dari program Amania yang Anda ikuti.
            </motion.p>
         </div>

         <motion.div 
            initial={{ opacity: 0, scale: 0.90, rotate: 0 }} 
            animate={{ opacity: 1, scale: 1, rotate: -2 }} 
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className="relative aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/10 border-[4px] md:border-[6px] border-white hidden md:block w-full min-w-0"
         >
           <img 
             src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2070&auto=format&fit=crop" 
             alt="Learning Concept" 
             className="w-full h-full object-cover"
           />
           <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent mix-blend-multiply" />
         </motion.div>
      </div>

      {/* TOOLBAR PENCARIAN & FILTER */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 md:gap-5 relative z-20 mx-4 md:mx-8 mb-6 md:mb-8 w-auto min-w-0">
        <div className="relative w-full md:w-96 min-w-0">
          <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-[18px] md:h-[18px] shrink-0" size={16} />
          <input 
            type="text" 
            placeholder="Cari nama program, kelas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 md:pr-5 text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner min-w-0"
          />
        </div>

        <div className="flex p-1 w-full sm:w-auto bg-slate-100 rounded-lg md:rounded-xl border border-slate-200/60 overflow-x-auto custom-scrollbar min-w-0">
          {(['all', 'upcoming', 'past'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setStatusFilter(type)}
              className={`flex-1 sm:flex-none px-4 md:px-7 py-2 md:py-2.5 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md md:rounded-lg transition-all whitespace-nowrap shrink-0 ${
                statusFilter === type 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
              }`}
            >
              {type === 'all' ? 'Semua' : type === 'upcoming' ? 'Akan Datang' : 'Telah Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* GRID KARTU KELAS */}
      <div className="px-4 md:px-8 w-full min-w-0">
        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl md:rounded-3xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-sm w-full min-w-0">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm shrink-0">
               <Inbox size={24} className="md:w-[32px] md:h-[32px] text-slate-400" />
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 md:mb-2 break-words w-full">Tidak ada program ditemukan</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 max-w-md leading-relaxed break-words w-full">
              {searchTerm || statusFilter !== 'all' 
                ? 'Coba ubah kata kunci pencarian atau filter status Anda.' 
                : 'Anda belum memiliki kelas aktif. Saatnya meningkatkan skill Anda ke level selanjutnya!'}
            </p>
            <Link href="/events" className="px-6 md:px-8 py-2.5 md:py-3.5 bg-slate-900 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm inline-flex items-center gap-1.5 md:gap-2 shrink-0">
              Eksplorasi Katalog <ChevronRight size={14} className="md:w-4 md:h-4 shrink-0" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full min-w-0">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((reg, idx) => {
                const isPast = new Date(reg.event?.start_time) < new Date();
                
                const isSuperadmin = !reg.event?.organizer || reg.event?.organizer?.role === 'superadmin';
                const organizerName = isSuperadmin ? 'Amania Official' : reg.event?.organizer?.name;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                    key={reg.id} 
                    className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden w-full min-w-0"
                  >
                    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-slate-100 overflow-hidden border-b border-slate-100 shrink-0">
                      <div className={`w-full h-full transition-all duration-700 ${isPast ? 'grayscale opacity-75' : ''}`}>
                        {reg.event?.image ? (
                          <img src={`${STORAGE_URL}/${reg.event.image}`} alt={reg.event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={24} className="md:w-8 md:h-8" strokeWidth={1.5} /></div>
                        )}
                      </div>
                      
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                         <div className="px-4 md:px-5 py-2 md:py-2.5 bg-white rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 text-slate-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye size={16} className="text-indigo-600 md:w-[18px] md:h-[18px] shrink-0" />
                            <span className="text-xs md:text-sm font-bold truncate">Buka Ruang Kelas</span>
                         </div>
                      </div>

                      <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-1.5 md:gap-2 z-10 min-w-0">
                        <span className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md shrink-0 max-w-[120px] ${
                          reg.tier === 'premium' ? 'bg-amber-500/95 text-white border border-amber-400' : 'bg-slate-900/90 text-white border border-slate-700/50'
                        }`}>
                          {reg.tier === 'premium' ? <Award size={10} className="md:w-3 md:h-3 shrink-0"/> : <Shield size={10} className="md:w-3 md:h-3 shrink-0"/>}
                          <span className="truncate">{reg.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 flex-1 flex flex-col w-full min-w-0">
                      
                      <div className="flex items-center justify-between mb-3 md:mb-4 min-w-0 w-full gap-2">
                         <div className="flex items-center gap-1.5 min-w-0">
                            <User size={12} className="text-indigo-500 shrink-0" />
                            <p className="text-[10px] md:text-[11px] font-bold text-indigo-600 truncate min-w-0 flex items-center gap-1">
                              {organizerName}
                              {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500 shrink-0" />}
                            </p>
                         </div>

                         <span className={`inline-flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider shrink-0 ${isPast ? 'text-slate-400' : 'text-emerald-600'}`}>
                           {isPast ? <CheckCircle2 size={12} className="md:w-3.5 md:h-3.5 shrink-0" /> : <Clock size={12} className="md:w-3.5 md:h-3.5 shrink-0" />}
                           {isPast ? 'Telah Selesai' : 'Akan Datang'}
                         </span>
                      </div>

                      <h3 className={`text-base md:text-lg font-extrabold leading-snug mb-3 md:mb-4 line-clamp-2 transition-colors break-words w-full ${isPast ? 'text-slate-600' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                        {reg.event?.title || 'Program Tidak Tersedia'}
                      </h3>

                      <div className="space-y-2 md:space-y-3 mt-auto pb-4 md:pb-6 w-full min-w-0">
                        <div className="flex items-center gap-2 md:gap-2.5 text-[11px] md:text-xs font-semibold text-slate-500 min-w-0 w-full">
                          <Calendar size={14} className="text-indigo-400 shrink-0 md:w-4 md:h-4" />
                          <span className="truncate w-full">{reg.event ? new Date(reg.event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 md:gap-2.5 text-[11px] md:text-xs font-semibold text-slate-500 min-w-0 w-full">
                          <MapPin size={14} className="text-rose-400 shrink-0 md:w-4 md:h-4" />
                          <span className="truncate w-full">{reg.event?.venue || '-'}</span>
                        </div>
                      </div>

                      <div className="pt-4 md:pt-5 border-t border-slate-100 mt-auto w-full min-w-0">
                        {/* 🔥 LINK MENUJU DYNAMIC ROUTE [slug] 🔥 */}
                        <Link 
                          href={`/my-events/${reg.event?.slug}`} 
                          className={`w-full flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all group/btn min-w-0 ${
                            isPast 
                            ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200' 
                            : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-sm hover:shadow-md hover:shadow-indigo-500/20'
                          }`}
                        >
                          <span className="truncate">{isPast ? 'Akses Rekaman' : 'Masuk Ruang Kelas'}</span> 
                          <ChevronRight size={14} className={`md:w-4 md:h-4 opacity-0 group-hover/btn:opacity-100 -ml-3 md:-ml-4 group-hover/btn:ml-0 transition-all duration-300 shrink-0 ${isPast ? 'text-slate-400' : 'text-indigo-200'}`} />
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