"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, CreditCard, Ticket, AlertCircle, 
  ArrowUpRight, Clock, CheckCircle2, MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_pendapatan: 0,
    total_peserta: 0,
    tiket_terjual: 0,
    menunggu_verifikasi: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🔥 PENGGUNAAN APIFETCH 🔥
        const res = await apiFetch('/admin/dashboard');
        const json = await res.json();

        if (json.success) {
          setStats({
            total_pendapatan: json.data.total_pendapatan,
            total_peserta: json.data.total_peserta,
            tiket_terjual: json.data.tiket_terjual,
            menunggu_verifikasi: json.data.menunggu_verifikasi,
          });
          setRecentRegistrations(json.data.recent_registrations);
        } else {
          toast.error(json.message || "Gagal memuat data dashboard Amania.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 md:gap-4">
        <div className="animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-b-2 border-indigo-600"></div>
        <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-widest">Menyinkronkan Data Amania...</p>
      </div>
    );
  }

  const STAT_CARDS = [
    { title: 'Total Pendapatan', value: `Rp ${stats.total_pendapatan.toLocaleString('id-ID')}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Peserta', value: stats.total_peserta.toLocaleString('id-ID'), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Tiket Terjual', value: stats.tiket_terjual.toLocaleString('id-ID'), icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Menunggu Verifikasi', value: stats.menunggu_verifikasi.toLocaleString('id-ID'), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-2 sm:px-0 pb-20">
      
      <div className="mt-2 md:mt-0">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Selamat Datang, Admin! 👋</h1>
        <p className="text-xs md:text-sm font-medium text-slate-500 mt-1">Berikut adalah ringkasan performa Amania saat ini.</p>
      </div>

      {/* STAT CARDS - Horizontal Scroll Mobile */}
      <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 overflow-x-auto custom-scrollbar pb-4 md:pb-0 snap-x">
        {STAT_CARDS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 md:gap-4 transition-all hover:shadow-md hover:border-indigo-200 min-w-[240px] md:min-w-0 snap-start shrink-0 flex-1">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0 border ${stat.bg} ${stat.color} ${stat.border}`}>
                <Icon size={20} strokeWidth={2.5} className="md:w-6 md:h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1 truncate">{stat.title}</p>
                <h3 className="text-lg md:text-2xl font-black text-slate-900 truncate">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* RECENT REGISTRATIONS */}
        <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900">Pendaftaran Terbaru</h3>
              <p className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-0.5">Segera verifikasi tiket yang berstatus pending.</p>
            </div>
            <Link href="/admin/registrations" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 px-2.5 py-1.5 rounded-lg md:bg-transparent md:px-0 md:py-0 shrink-0">
              Kelola <span className="hidden sm:inline">Semua</span> <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-white">
                  <th className="px-4 md:px-6 py-3 md:py-4">Peserta</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Program</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 md:px-6 py-8 md:py-10 text-center text-xs md:text-sm font-medium text-slate-400">
                      Belum ada data pendaftaran terbaru.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <p className="text-xs md:text-sm font-bold text-slate-900">{reg.name}</p>
                        <p className="text-[9px] md:text-[10px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="md:w-3 md:h-3" /> {reg.date}
                        </p>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <p className="text-[11px] md:text-xs font-semibold text-slate-600 line-clamp-1">{reg.event}</p>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        {reg.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md bg-amber-50 text-amber-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-amber-200/60">
                            <AlertCircle size={10} className="md:w-3 md:h-3" /> Pending
                          </span>
                        ) : reg.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-emerald-200/60">
                            <CheckCircle2 size={10} className="md:w-3 md:h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-rose-200/60">
                            <AlertCircle size={10} className="md:w-3 md:h-3" /> Ditolak
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3 md:mb-4">Aksi Cepat</h3>
            <div className="space-y-2 md:space-y-3">
              <Link href="/admin/events" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                <span className="text-[11px] md:text-xs font-bold">Kelola Event</span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
              </Link>
              <Link href="/admin/article-categories" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                <span className="text-[11px] md:text-xs font-bold">Tulis Artikel / Berita</span>
                <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
              </Link>
            </div>
          </div>

          {/* STATUS SYSTEM */}
          <div className="bg-slate-900 rounded-xl md:rounded-2xl border border-slate-800 shadow-lg p-5 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-24 h-24 md:w-32 md:h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
            <h3 className="text-xs md:text-sm font-bold text-white mb-2 relative z-10">Status Sistem Amania</h3>
            <div className="flex items-center gap-2 mb-3 md:mb-4 relative z-10">
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
              </span>
              <p className="text-[10px] md:text-xs font-medium text-emerald-400">Terhubung & Tersinkronisasi</p>
            </div>
            <div className="pt-3 md:pt-4 border-t border-white/10 relative z-10">
              <p className="text-[9px] md:text-[10px] text-slate-400 font-medium">Laravel 11.x • Next.js App Router</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}