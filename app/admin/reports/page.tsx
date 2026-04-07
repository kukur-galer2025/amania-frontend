"use client";

import React, { useEffect, useState } from 'react';
import { 
  FileText, Download, TrendingUp, 
  Users, Presentation, Loader2, Calendar, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

interface EventStat {
  id: number;
  title: string;
  start_time: string;
  total_peserta: number;
  total_pendapatan: number;
}

export default function AdminReportsPage() {
  const [events, setEvents] = useState<EventStat[]>([]);
  const [dropdownEvents, setDropdownEvents] = useState<{id: number, title: string}[]>([]); 
  const [globalStats, setGlobalStats] = useState({ total_event: 0, total_semua_peserta: 0, total_semua_pendapatan: 0 });
  const [loading, setLoading] = useState(true);
  
  // State untuk form Filter & Export
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const fetchReportSummary = async () => {
    setLoading(true);
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(`/admin/reports?event_id=${selectedEvent}&status=${selectedStatus}`);
      const json = await res.json();
      
      if (res.ok && json.success) {
        setEvents(json.events || []);
        setGlobalStats(json.stats || { total_event: 0, total_semua_peserta: 0, total_semua_pendapatan: 0 });
        
        // Simpan data pilar untuk dropdown hanya pada fetch pertama
        if (dropdownEvents.length === 0 && json.all_events) {
            setDropdownEvents(json.all_events);
        }
      }
    } catch (error) {
      toast.error("Gagal memuat ringkasan laporan.");
    } finally {
      setLoading(false);
    }
  };

  // Otomatis refresh data tabel jika filter diubah
  useEffect(() => {
    fetchReportSummary();
  }, [selectedEvent, selectedStatus]); 

  // --- FUNGSI DOWNLOAD PDF ---
  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExporting(true);
    const loadToast = toast.loading("Menyusun dokumen PDF Amania...");

    try {
      // 🔥 PENGGUNAAN APIFETCH UNTUK BLOB 🔥
      const res = await apiFetch(`/admin/reports/export?event_id=${selectedEvent}&status=${selectedStatus}`);
      if (!res.ok) throw new Error("Gagal mengunduh file.");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Penamaan file menggunakan brand Amania
      link.setAttribute('download', `Laporan_Amania_${new Date().getTime()}.pdf`); 
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Laporan PDF berhasil diunduh!", { id: loadToast });
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengekspor PDF.", { id: loadToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. PAGE HEADER */}
      <div className="mb-6 md:mb-8 mt-2 md:mt-0">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="text-indigo-600 md:w-6 md:h-6" size={20} /> Pusat Laporan & Analitik
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Cetak laporan resmi Amania dalam format PDF dan pantau statistik performa setiap program.
        </p>
      </div>

      {/* 2. LIVE STATS WIDGETS - Horizontal Scroll di HP */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto custom-scrollbar pb-4 md:pb-0 snap-x">
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[220px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
            <Presentation size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Total Program</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">{globalStats.total_event} <span className="text-xs md:text-sm font-medium text-slate-500">Event</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[220px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Omset Terfilter</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">Rp {(globalStats.total_semua_pendapatan || 0).toLocaleString('id-ID')}</h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[220px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center shrink-0 border border-amber-100">
            <Users size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Tiket Terjual</p>
            <h3 className="text-xl md:text-2xl font-black text-slate-900">{globalStats.total_semua_peserta} <span className="text-xs md:text-sm font-medium text-slate-500">Peserta</span></h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* 3. FILTER & EXPORT COLUMN */}
        <div className="lg:col-span-4 order-2 lg:order-1">
          <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm p-5 md:p-6 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 border-b border-slate-100 pb-3 md:pb-4">
              <div className="p-1.5 md:p-2 bg-rose-50 text-rose-600 rounded-lg"><Download size={16} className="md:w-5 md:h-5" /></div>
              <h2 className="text-sm md:text-base font-bold text-slate-900">Filter & Ekspor</h2>
            </div>
            
            <form onSubmit={handleExport} className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Pilih Program</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer truncate"
                >
                  <option value="all">Semua Program Event</option>
                  {dropdownEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Status Pembayaran</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="all">Semua Status</option>
                  <option value="verified">Lunas / Disetujui</option>
                  <option value="pending">Menunggu Verifikasi</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>

              <div className="pt-1 md:pt-2">
                <button 
                  type="submit" disabled={isExporting || loading}
                  className="w-full bg-rose-600 text-white font-bold text-xs md:text-sm py-3 md:py-4 rounded-xl hover:bg-rose-700 shadow-lg md:shadow-xl shadow-rose-200 transition-all flex items-center justify-center gap-2 md:gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <FileText size={16} className="md:w-[18px] md:h-[18px]" />}
                  {isExporting ? 'MENYUSUN PDF...' : 'DOWNLOAD LAPORAN PDF'}
                </button>
              </div>
            </form>
            
            <div className="mt-5 md:mt-6 p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl border border-slate-200 flex items-start gap-2 md:gap-3">
              <CheckCircle2 className="text-slate-400 shrink-0 mt-0.5 md:w-4 md:h-4" size={14} />
              <p className="text-[10px] md:text-[11px] font-medium text-slate-500 leading-relaxed">
                Tabel di sebelah akan melakukan kalkulasi ulang otomatis setiap kali Anda mengubah filter.
              </p>
            </div>
          </div>
        </div>

        {/* 4. PERFORMANCE TABLE COLUMN */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px] md:min-h-[500px]">
            <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xs md:text-sm font-bold text-slate-800">Performa Program (Live Data)</h2>
              <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">Data dikalkulasi berdasarkan filter status dan program yang aktif.</p>
            </div>

            <div className="flex-1 overflow-x-auto p-0 custom-scrollbar">
              <table className="min-w-full divide-y divide-slate-200 min-w-[500px]">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Program</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendaftar</th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-4 md:px-6 py-16 md:py-20 text-center">
                        <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 animate-spin mx-auto mb-2 md:mb-3" />
                        <p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-wider uppercase">Mengkalkulasi...</p>
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 md:px-6 py-20 md:py-24 text-center text-slate-400">
                        <Presentation size={32} className="mx-auto mb-3 md:mb-4 text-slate-200 md:w-10 md:h-10" strokeWidth={1.5} />
                        <p className="text-xs md:text-sm font-bold text-slate-500">Tidak ada data untuk filter ini.</p>
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="text-xs md:text-sm font-bold text-slate-900 max-w-[200px] md:max-w-[280px] truncate" title={ev.title}>
                            {ev.title}
                          </div>
                          <div className="text-[9px] md:text-[10px] text-slate-400 mt-1 flex items-center gap-1 md:gap-1.5 font-bold uppercase tracking-wider">
                            <Calendar size={10} className="md:w-3 md:h-3" />
                            {new Date(ev.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center bg-indigo-50 text-indigo-700 px-2 md:px-3 py-1 rounded-md md:rounded-lg text-[10px] md:text-xs font-bold border border-indigo-100">
                            {ev.total_peserta} <span className="hidden sm:inline ml-1">Orang</span>
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                          <div className="text-xs md:text-sm font-black text-emerald-600">
                            Rp {(ev.total_pendapatan || 0).toLocaleString('id-ID')}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}