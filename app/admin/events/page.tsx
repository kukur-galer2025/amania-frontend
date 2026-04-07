"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link'; 
import { 
  Plus, Search, Edit2, Trash2, Calendar, 
  MapPin, Loader2, Image as ImageIcon,
  ChevronLeft, ChevronRight, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchEvents = async () => {
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/admin/events');
      const json = await res.json();
      setEvents(json.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data dari server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus program ini? Tindakan ini tidak dapat dibatalkan.")) return;
    
    const loadToast = toast.loading("Menghapus data...");
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(`/admin/events/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Program berhasil dihapus", { id: loadToast });
        fetchEvents();
      } else {
        toast.error("Gagal menghapus program", { id: loadToast });
      }
    } catch (error) {
      toast.error("Kesalahan sistem.", { id: loadToast });
    }
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesFilter = true;
      const eventDate = new Date(e.start_time);
      const now = new Date();
      
      if (timeFilter === 'upcoming') matchesFilter = eventDate >= now;
      if (timeFilter === 'past') matchesFilter = eventDate < now;

      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, timeFilter]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, timeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const currentEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-2 sm:px-4 md:px-0 animate-in fade-in duration-500 pb-20">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8 mt-2 md:mt-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Katalog Program</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500">
            Kelola semua webinar, masterclass, dan bootcamp Amania yang tersedia di sistem Anda.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <Link 
            href="/admin/events/create" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-2.5 bg-slate-900 border border-transparent rounded-lg md:rounded-xl text-xs md:text-sm font-semibold text-white hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> Program Baru
          </Link>
        </div>
      </div>

      {/* 2. TOOLBAR: SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center mb-5 md:mb-6 bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4">
            <Search className="h-4 w-4 md:h-4 md:w-4 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder="Cari program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg md:rounded-xl border border-slate-200 bg-slate-50 py-2.5 md:py-3 pl-9 md:pl-11 pr-3 md:pr-4 text-xs md:text-sm placeholder:text-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all shadow-inner"
          />
        </div>

        {/* Segmented Filter */}
        <div className="flex p-1 w-full md:w-auto bg-slate-100 border border-slate-200 rounded-lg md:rounded-xl overflow-x-auto custom-scrollbar">
          {(['all', 'upcoming', 'past'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setTimeFilter(type)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 md:py-2 text-[10px] md:text-xs font-bold rounded-md md:rounded-lg capitalize transition-all whitespace-nowrap ${
                timeFilter === type 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              {type === 'all' ? 'Semua' : type === 'upcoming' ? 'Akan Datang' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-slate-200 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Program</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Status</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Jadwal</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Tiket / Kuota</th>
                <th scope="col" className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50 font-medium">
              
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-16 md:py-20 text-center">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-spin mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-wider">Memuat database program...</p>
                  </td>
                </tr>
              ) : currentEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-16 md:py-24 text-center">
                    <Inbox className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mx-auto mb-3 md:mb-4" strokeWidth={1.5} />
                    <h3 className="text-sm md:text-base font-bold text-slate-900">Tidak ada program</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                currentEvents.map((event: any) => {
                  const isPast = new Date(event.start_time) < new Date();
                  const isSoldOut = event.quota === 0;

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* COLUMN 1: PROGRAM INFO */}
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-lg md:rounded-xl border border-slate-200 overflow-hidden bg-slate-100 ${isPast ? 'opacity-50 grayscale' : ''}`}>
                            {event.image ? (
                              <img className="h-full w-full object-cover" src={`${STORAGE_URL}/${event.image}`} alt="" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400"><ImageIcon size={14} className="md:w-4 md:h-4"/></div>
                            )}
                          </div>
                          <div className="ml-3 md:ml-4">
                            <div className={`text-xs md:text-sm font-bold ${isPast ? 'text-slate-500' : 'text-slate-900'} max-w-[200px] md:max-w-[250px] truncate`}>
                              {event.title}
                            </div>
                            <div className="text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 md:mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                              <MapPin size={10} className="text-slate-400 md:w-3 md:h-3" />
                              <span className="truncate max-w-[150px] md:max-w-[200px]">{event.venue}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* COLUMN 2: STATUS BADGE */}
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        {isPast ? (
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 md:px-2.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold text-slate-600 ring-1 ring-inset ring-slate-500/10 uppercase tracking-wider">
                            Selesai
                          </span>
                        ) : isSoldOut ? (
                          <span className="inline-flex items-center rounded-md bg-rose-50 px-2 md:px-2.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 uppercase tracking-wider">
                            Sold Out
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 md:px-2.5 py-1 md:py-1.5 text-[9px] md:text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                            Akan Datang
                          </span>
                        )}
                      </td>

                      {/* COLUMN 3: SCHEDULE */}
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm text-slate-900 font-bold">
                          {new Date(event.start_time).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[9px] md:text-[10px] font-semibold text-slate-500 mt-0.5 md:mt-1 flex items-center gap-1 uppercase tracking-wider">
                          <Calendar size={10} className="md:w-3 md:h-3 text-slate-400" />
                          {new Date(event.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </td>

                      {/* COLUMN 4: PRICING & QUOTA */}
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs md:text-sm font-bold text-emerald-600">
                          {event.basic_price === 0 ? 'GRATIS' : `Rp ${event.basic_price?.toLocaleString('id-ID')}`}
                        </div>
                        <div className={`text-[9px] md:text-[10px] font-semibold mt-0.5 md:mt-1 uppercase tracking-wider ${isSoldOut ? 'text-rose-500' : 'text-slate-500'}`}>
                          {isSoldOut ? 'Habis' : `${event.quota} Kursi Tersedia`}
                        </div>
                      </td>

                      {/* COLUMN 5: ACTIONS */}
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 md:gap-2">
                          <Link 
                            href={`/admin/events/edit?id=${event.id}`}
                            className="inline-flex items-center justify-center p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shadow-sm"
                            title="Edit Program"
                          >
                            <Edit2 size={14} className="md:w-4 md:h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(event.id)} 
                            className="inline-flex items-center justify-center p-1.5 md:p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-colors shadow-sm"
                            title="Hapus Program"
                          >
                            <Trash2 size={14} className="md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION FOOTER */}
        {!loading && filteredEvents.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 md:px-6 py-3 md:py-4 gap-3">
            <div>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredEvents.length)}</span> dari <span className="font-bold text-slate-900">{filteredEvents.length}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={14} className="md:w-4 md:h-4" />
              </button>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-slate-700 shadow-sm min-w-[50px] md:min-w-[80px] text-center">
                 {currentPage} / {totalPages || 1}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
      `}</style>
    </div>
  );
}