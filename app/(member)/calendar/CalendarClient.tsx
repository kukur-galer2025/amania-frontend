"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, MapPin, Video, ArrowRight, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function CalendarClient() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetching data event dari API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // 🔥 MENGGUNAKAN APIFETCH 🔥
        const res = await apiFetch('/events');
        const json = await res.json();
        if (json.success) {
          setEvents(json.data);
        }
      } catch (error) {
        console.error("Gagal memuat event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const selectedDateEvents = useMemo(() => {
    return events.filter(ev => {
      const eventDate = new Date(ev.start_time);
      return eventDate.getDate() === selectedDate.getDate() &&
             eventDate.getMonth() === selectedDate.getMonth() &&
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [selectedDate, events]);

  const hasEvent = (day: number) => {
    return events.some(ev => {
      const eventDate = new Date(ev.start_time);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 font-sans animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 pb-8 border-b border-slate-200 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-600 text-[10px] font-bold uppercase tracking-widest shadow-sm mb-4">
            <CalendarIcon size={14} /> Jadwal Amania
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Kalender Program</h1>
          <p className="text-slate-500 font-medium mt-2">Pantau jadwal kelas, masterclass, dan webinar yang akan datang.</p>
        </div>
        <button 
          onClick={goToToday} 
          className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all w-fit flex items-center gap-2"
        >
          <Clock size={16} /> Hari Ini
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* KIRI: GRID KALENDER INTERAKTIF */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6 relative z-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {monthNames[currentDate.getMonth()]} <span className="text-indigo-600">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4 relative z-10">
            {dayNames.map((day, idx) => (
              <div key={day} className={`text-center text-[11px] font-black uppercase tracking-widest ${idx === 0 || idx === 6 ? 'text-rose-400' : 'text-slate-400'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 md:gap-4 relative z-10">
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square rounded-2xl bg-slate-50/50 border border-slate-100/50"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
              const isCurrentToday = isToday(day);
              const dayHasEvent = hasEvent(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center text-sm md:text-base font-bold transition-all duration-300
                    ${isSelected 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-110 z-10 border-transparent' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:shadow-md hover:text-indigo-600'}
                    ${isCurrentToday && !isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 text-indigo-700 bg-indigo-50' : ''}
                  `}
                >
                  <span>{day}</span>
                  
                  {dayHasEvent && (
                    <div className="absolute bottom-2.5 flex gap-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-indigo-500'}`}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* KANAN: PANEL AGENDA DETAIL */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[40px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/30 rounded-full blur-[40px] pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
            
            <div className="relative z-10">
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <CalendarIcon size={14} /> Agenda Harian
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none mb-1">
                {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
              </h2>
              <p className="text-base font-bold text-indigo-200/80">{selectedDate.getFullYear()}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm min-h-[350px] flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
              <Clock size={16} className="text-indigo-500" /> Jadwal Kegiatan
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[1,2].map(i => (
                  <div key={i} className="animate-pulse flex gap-4 p-4 border border-slate-100 rounded-2xl">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) 
            : selectedDateEvents.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {selectedDateEvents.map((event, idx) => (
                    <motion.div 
                      key={event.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 200 }}
                      className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                          {event.tier || 'Amania Event'}
                        </span>
                        <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                          <Clock size={12} />
                          {new Date(event.start_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                        </span>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-900 text-base mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {event.title}
                      </h4>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                          {event.venue.toLowerCase().includes('zoom') ? <Video size={14} className="text-emerald-500"/> : <MapPin size={14} className="text-rose-500"/>}
                          <span className="truncate max-w-[140px]">{event.venue}</span>
                        </div>
                        
                        {/* 🔥 PERBAIKAN LINK MENUJU QUERY PARAMETER 🔥 */}
                        <Link href={`/events/detail?slug=${event.slug}`} className="text-slate-400 bg-slate-50 border border-slate-200 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-indigo-500/30">
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) 
            : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-12 flex-1"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                  <Sparkles size={24} className="text-slate-300" />
                </div>
                <p className="text-sm font-extrabold text-slate-700 mb-1">Hari yang Luang!</p>
                <p className="text-xs font-medium text-slate-500 max-w-[200px]">Tidak ada jadwal program pada tanggal ini. Waktunya istirahat atau eksplorasi katalog.</p>
                
                <Link href="/events" className="mt-6 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">
                  Cari Kelas Baru
                </Link>
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}