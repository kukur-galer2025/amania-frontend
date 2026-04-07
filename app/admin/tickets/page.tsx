"use client";

import React, { useEffect, useState, useRef } from 'react';
import { 
  Ticket, Search, ScanLine, CheckCircle2, 
  XCircle, Clock, Loader2, User, Users, Presentation, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

interface TicketData {
  id: number;
  ticket_code: string;
  status: 'pending' | 'verified' | 'rejected';
  user: { name: string; email: string };
  event: { title: string; start_time: string };
}

export default function AdminTicketsPage() {
  const [eventsList, setEventsList] = useState<{id: number, title: string}[]>([]);
  const [recentTickets, setRecentTickets] = useState<TicketData[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scanResult, setScanResult] = useState<{ type: string, data?: TicketData | null }>({ type: 'idle' });
  
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRecentTickets = async () => {
    setLoadingList(true);
    try {
      const url = selectedEvent 
        ? `/admin/tickets?event_id=${selectedEvent}` 
        : `/admin/tickets`;

      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(url);
      const json = await res.json();
      
      if (res.ok && json.success) {
        setRecentTickets(json.data?.data || json.data || []);
        if (eventsList.length === 0 && json.events) {
            setEventsList(json.events);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat database tiket.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRecentTickets();
    if (selectedEvent && inputRef.current) inputRef.current.focus();
  }, [selectedEvent]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return toast.error("Pilih event terlebih dahulu!");
    if (!searchCode.trim()) return;

    setIsSearching(true);
    setScanResult({ type: 'idle' });

    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(`/admin/tickets/scan`, {
          method: 'POST',
          body: JSON.stringify({ ticket_code: searchCode, event_id: selectedEvent })
      });
      
      const json = await res.json();

      if (res.ok && json.success) {
        setScanResult({ type: 'verified', data: json.data });
        toast.success("Tiket Berhasil Diverifikasi!");
      } else {
        setScanResult({ type: json.status_code || 'not_found', data: json.data });
        
        if (json.status_code === 'not_found') toast.error("Tiket tidak valid/bodong!");
        if (json.status_code === 'wrong_event') toast.error("Salah Event!");
      }
      
      setSearchCode('');
      if (inputRef.current) inputRef.current.focus();

    } catch (error) {
      toast.error("Terjadi kesalahan koneksi.");
      setScanResult({ type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const clearScan = () => {
    setSearchCode('');
    setScanResult({ type: 'idle' });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 pb-24">
      
      <div className="mb-6 md:mb-8 mt-2 md:mt-0">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ScanLine className="text-indigo-600 md:w-6 md:h-6" size={20} /> Scanner Kehadiran (Check-In)
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Atur gerbang digital Amania. Pilih program acara yang sedang berlangsung, lalu mulai pindai tiket peserta.
        </p>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50 mb-6 md:mb-8 flex flex-col md:flex-row items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
            <Presentation size={20} className="md:w-6 md:h-6" />
        </div>
        <div className="flex-1 w-full">
            <label className="block text-[9px] md:text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1 md:mb-1.5 text-center md:text-left">Setup Gerbang Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer truncate text-center md:text-left"
            >
              <option value="" disabled>-- Pilih Event Yang Sedang Berlangsung --</option>
              {eventsList.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* KOLOM KIRI (SCANNER AREA) */}
        <div className="lg:col-span-5 space-y-6">
          <div className={`bg-white p-5 md:p-6 rounded-xl md:rounded-2xl border transition-colors relative overflow-hidden ${!selectedEvent ? 'border-slate-200' : 'border-indigo-200 shadow-sm shadow-indigo-100'}`}>
            
            {!selectedEvent && (
                <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
                    <AlertTriangle size={28} className="text-slate-400 mb-2 md:mb-3 md:w-8 md:h-8" />
                    <p className="text-xs md:text-sm font-bold text-slate-600">Scanner Terkunci</p>
                    <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">Silakan pilih event di atas terlebih dahulu untuk mengaktifkan scanner.</p>
                </div>
            )}

            {isSearching && <div className="absolute inset-0 bg-indigo-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600 w-6 h-6 md:w-8 md:h-8" /></div>}
            
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Ticket size={16} className="md:w-5 md:h-5" /></div>
                <h2 className="text-sm md:text-base font-bold text-slate-900">Input Scanner</h2>
              </div>
              {selectedEvent && (
                <span className="relative flex h-2 w-2 md:h-3 md:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            
            <form onSubmit={handleScan} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wide">Kode QR / Barcode</label>
                <div className="relative">
                  <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-[18px] md:h-[18px]" size={16} />
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    placeholder="Tembakkan Scanner..."
                    required
                    disabled={!selectedEvent}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl py-3 md:py-4 pl-10 md:pl-11 pr-4 text-sm md:text-base font-black text-slate-900 placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all uppercase tracking-widest shadow-inner disabled:opacity-50"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button 
                  type="button" onClick={clearScan} disabled={!selectedEvent}
                  className="px-3 md:px-4 py-2.5 md:py-3.5 bg-slate-100 text-slate-600 font-bold text-xs md:text-sm rounded-lg md:rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Reset
                </button>
                <button 
                  type="submit" disabled={isSearching || !searchCode || !selectedEvent}
                  className="flex-1 bg-indigo-600 text-white font-bold text-xs md:text-sm py-2.5 md:py-3.5 rounded-lg md:rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cek Tiket
                </button>
              </div>
            </form>
          </div>

          {/* HASIL SCAN (NOT FOUND) */}
          {scanResult.type === 'not_found' && (
            <div className="bg-rose-50 border border-rose-200 p-6 md:p-8 rounded-xl md:rounded-2xl text-center animate-in zoom-in-95 duration-300">
              <XCircle size={40} className="md:w-14 md:h-14 text-rose-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-black text-rose-700 tracking-tight mb-1 md:mb-2">Tiket Bodong</h3>
              <p className="text-xs md:text-sm font-medium text-rose-600/80">Kode tiket tidak ditemukan dalam database.</p>
            </div>
          )}

          {/* HASIL SCAN (WRONG EVENT) */}
          {scanResult.type === 'wrong_event' && scanResult.data && (
            <div className="bg-rose-50 border border-rose-200 p-6 md:p-8 rounded-xl md:rounded-2xl text-center animate-in zoom-in-95 duration-300 shadow-lg shadow-rose-500/10">
              <AlertTriangle size={48} className="md:w-16 md:h-16 text-rose-500 mx-auto mb-3 md:mb-4 drop-shadow-sm" />
              <h3 className="text-2xl md:text-3xl font-black text-rose-700 tracking-tight mb-1 md:mb-2">SALAH EVENT!</h3>
              <p className="text-xs md:text-sm font-medium text-rose-600/80 mb-4 md:mb-6">Peserta ini mendaftar untuk event lain, bukan untuk event yang sedang dijaga saat ini.</p>
              
              <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-5 text-left border border-rose-100 shadow-sm">
                 <p className="text-[9px] md:text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Tiket ini diperuntukkan untuk:</p>
                 <p className="text-xs md:text-sm font-bold text-slate-900">{scanResult.data.event.title}</p>
                 <p className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">Milik: {scanResult.data.user.name}</p>
              </div>
            </div>
          )}

          {/* HASIL SCAN (VERIFIED) */}
          {scanResult.type === 'verified' && scanResult.data && (
            <div className="bg-emerald-50 border border-emerald-200 p-6 md:p-8 rounded-xl md:rounded-2xl text-center animate-in zoom-in-95 duration-300 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 size={48} className="md:w-16 md:h-16 text-emerald-500 mx-auto mb-3 md:mb-4 drop-shadow-sm" />
              <h3 className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight mb-1">TIKET VALID</h3>
              <p className="text-[10px] md:text-sm font-bold text-emerald-600/80 uppercase tracking-widest mb-4 md:mb-6 bg-emerald-100/50 inline-block px-2.5 py-1 rounded-md">{scanResult.data.ticket_code}</p>
              
              <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-5 text-left border border-emerald-100 shadow-sm space-y-3 md:space-y-4">
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Identitas Peserta</p>
                  <p className="text-sm md:text-base font-black text-slate-900">{scanResult.data.user.name}</p>
                  <p className="text-[10px] md:text-xs font-medium text-slate-500">{scanResult.data.user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* HASIL SCAN (PENDING) */}
          {scanResult.type === 'pending' && scanResult.data && (
            <div className="bg-amber-50 border border-amber-200 p-6 md:p-8 rounded-xl md:rounded-2xl text-center animate-in zoom-in-95 duration-300">
              <Clock size={40} className="md:w-14 md:h-14 text-amber-500 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-black text-amber-700 tracking-tight mb-1 md:mb-2">Belum Lunas</h3>
              <p className="text-xs md:text-sm font-medium text-amber-600/80 mb-4 md:mb-6">Atas nama <strong className="text-amber-800">{scanResult.data.user.name}</strong> terdaftar, tapi belum disetujui kasir.</p>
              <p className="text-[10px] md:text-xs font-bold text-amber-800 bg-amber-200/50 py-1.5 md:py-2 px-2 rounded-lg border border-amber-200">Arahkan peserta ke meja Registrasi & Pembayaran.</p>
            </div>
          )}
        </div>

        {/* KOLOM KANAN (DAFTAR HADIR) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px] md:h-[500px]">
            <div className="px-4 md:px-6 py-3.5 md:py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users size={14} className="text-slate-400 md:w-4 md:h-4" /> Database Tiket Event Ini
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {!selectedEvent ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <Presentation size={24} className="mb-2 md:mb-3 text-slate-300 md:w-8 md:h-8" />
                  <p className="text-xs md:text-sm font-medium text-slate-500">Pilih event terlebih dahulu.</p>
                </div>
              ) : loadingList ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <Loader2 size={20} className="animate-spin mb-2 md:w-6 md:h-6" />
                  <p className="text-[10px] md:text-xs font-medium">Memuat database tiket...</p>
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <Ticket size={24} className="mb-2 md:mb-3 text-slate-300 md:w-8 md:h-8" />
                  <p className="text-xs md:text-sm font-medium text-slate-500">Belum ada tiket terjual untuk event ini.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 md:p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center gap-3 md:gap-4 overflow-hidden pr-2">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                          <User size={14} className="md:w-[18px] md:h-[18px]" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{ticket.user.name}</p>
                          <p className="text-[9px] md:text-[11px] font-black text-indigo-600 mt-0.5 tracking-wider truncate">{ticket.ticket_code}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold">
                          <CheckCircle2 size={10} className="md:w-3 md:h-3" /> <span className="hidden sm:inline">Valid</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}