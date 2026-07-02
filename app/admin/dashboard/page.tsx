"use client";

import React, { useEffect, useState } from 'react';
import { 
  Users, CreditCard, Ticket, AlertCircle, 
  ArrowUpRight, Clock, CheckCircle2, GraduationCap, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI
import { safeStorage } from '@/app/utils/safeStorage';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [localName, setLocalName] = useState('Admin');
  const [stats, setStats] = useState({
    total_pendapatan: 0,
    pendapatan_kursus: 0,
    pendapatan_eproduk: 0,
    total_peserta: 0,
    tiket_terjual: 0,
    menunggu_verifikasi: 0,
    is_creator: false,
    total_courses: 0,
    total_eproducts: 0,
    user_name: '',
  });
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [wdStats, setWdStats] = useState<any>(null);

  useEffect(() => {
    const userStr = safeStorage.getItem('user');
    let uRole = '';
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.name) setLocalName(u.name);
        if (u && u.role) uRole = u.role;
      } catch {}
    }

    const fetchDashboardData = async () => {
      try {
        // 🔥 PENGGUNAAN APIFETCH 🔥
        const res = await apiFetch('/admin/dashboard');
        const json = await res.json();

        if (json.success) {
          setStats({
            total_pendapatan: json.data.total_pendapatan || 0,
            pendapatan_kursus: json.data.pendapatan_kursus || 0,
            pendapatan_eproduk: json.data.pendapatan_eproduk || 0,
            total_peserta: json.data.total_peserta || 0,
            tiket_terjual: json.data.tiket_terjual || 0,
            menunggu_verifikasi: json.data.menunggu_verifikasi || 0,
            is_creator: json.data.is_creator || false,
            total_courses: json.data.total_courses || 0,
            total_eproducts: json.data.total_eproducts || 0,
            user_name: json.data.user_name || '',
          });
          setRecentRegistrations(json.data.recent_registrations || []);
        } else {
          toast.error(json.message || "Gagal memuat data dashboard Amania.");
        }

        // Fetch Tasks (To-Do List)
        const taskRes = await apiFetch('/admin/tasks');
        const taskJson = await taskRes.json();
        if (taskJson.success) setTasks(taskJson.data.slice(0, 4));

        // Fetch Withdrawals Stats if Creator or Admin
        if (uRole === 'creator' || uRole === 'superadmin') {
          const wdRes = await apiFetch('/withdrawals/stats');
          const wdJson = await wdRes.json();
          if (wdJson.success) setWdStats(wdJson.data);
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

  const STAT_CARDS = stats.is_creator ? [
    { title: 'Pendapatan Kursus', value: `Rp ${Number(stats.pendapatan_kursus).toLocaleString('id-ID')}`, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Pendapatan E-Produk', value: `Rp ${Number(stats.pendapatan_eproduk).toLocaleString('id-ID')}`, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Kursus Saya', value: Number(stats.total_courses).toLocaleString('id-ID'), icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Total E-Produk Saya', value: Number(stats.total_eproducts).toLocaleString('id-ID'), icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ] : [
    { title: 'Total Pendapatan', value: `Rp ${Number(stats.total_pendapatan).toLocaleString('id-ID')}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Total Peserta', value: Number(stats.total_peserta).toLocaleString('id-ID'), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { title: 'Tiket Terjual', value: Number(stats.tiket_terjual).toLocaleString('id-ID'), icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Menunggu Verifikasi', value: Number(stats.menunggu_verifikasi).toLocaleString('id-ID'), icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 px-2 sm:px-0 pb-20">
      
      <div className="mt-2 md:mt-0">
        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Selamat Datang, {stats.user_name || localName || (stats.is_creator ? 'Kreator' : 'Admin')}! 👋</h1>
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
        
        {/* KIRI (Tabel & Tasks) */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* RECENT REGISTRATIONS */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900">{stats.is_creator ? 'Aktivitas Pembelian Terbaru' : 'Pendaftaran Terbaru'}</h3>
                <p className="text-[10px] md:text-[11px] font-medium text-slate-500 mt-0.5">{stats.is_creator ? 'Pantau transaksi pembelian kursus dan e-produk terbaru Anda.' : 'Segera verifikasi tiket yang berstatus pending.'}</p>
              </div>
              {stats.is_creator ? (
                <div className="flex items-center gap-2">
                  <Link href="/admin/course-transactions" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 px-2.5 py-1.5 rounded-lg shrink-0">
                    Kursus <ArrowUpRight size={14} />
                  </Link>
                  <Link href="/admin/e-product-transactions" className="text-[10px] md:text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 transition-colors bg-emerald-50 px-2.5 py-1.5 rounded-lg shrink-0">
                    E-Produk <ArrowUpRight size={14} />
                  </Link>
                </div>
              ) : (
                <Link href="/admin/registrations" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors bg-indigo-50 px-2.5 py-1.5 rounded-lg md:bg-transparent md:px-0 md:py-0 shrink-0">
                  Kelola <span className="hidden sm:inline">Semua</span> <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
            
            <div className="flex-1 overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[9px] md:text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-white">
                    <th className="px-4 md:px-6 py-3 md:py-4">Peserta / Pembeli</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Program / Karya</th>
                    <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 md:px-6 py-8 md:py-10 text-center text-xs md:text-sm font-medium text-slate-400">
                        {stats.is_creator ? (
                          <div className="py-4 flex flex-col items-center justify-center text-center">
                            <GraduationCap size={36} className="text-indigo-200 mb-3" />
                            <h4 className="text-base font-bold text-slate-700">Belum Ada Aktivitas Pembelian</h4>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">Kursus online dan e-produk Anda belum memiliki pembelian. Bagikan tautan karya Anda untuk mulai menghasilkan!</p>
                          </div>
                        ) : 'Belum ada data pendaftaran terbaru.'}
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
                              <AlertCircle size={10} className="md:w-3 md:h-3" /> {reg.status}
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

          {/* TASKS (TO-DO LIST) */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm md:text-base font-bold text-slate-900">Manajemen Task Terbaru</h3>
              <Link href="/admin/tasks" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                Kelola Task <ArrowUpRight size={14} />
              </Link>
            </div>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {tasks.map(t => (
                  <div key={t.id} className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`mt-0.5 w-4 h-4 md:w-5 md:h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${t.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'}`}>
                      {t.status === 'done' && <CheckCircle2 size={12} />}
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm font-bold ${t.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{t.title}</p>
                      {t.description && <p className="text-[10px] md:text-[11px] text-slate-500 mt-1 line-clamp-1">{t.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 font-medium">Belum ada task saat ini.</p>
              </div>
            )}
          </div>
        </div>

        {/* KANAN (Aksi & Status) */}
        <div className="space-y-6">
          {/* QUICK ACTIONS */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-3 md:mb-4">Aksi Cepat</h3>
            <div className="space-y-2 md:space-y-3">
              {!stats.is_creator && (
                <Link href="/admin/events" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                  <span className="text-[11px] md:text-xs font-bold">Kelola Event</span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
                </Link>
              )}
              {stats.is_creator && (
                <Link href="/admin/courses" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                  <span className="text-[11px] md:text-xs font-bold">Buat Kursus Baru</span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
                </Link>
              )}
              {!stats.is_creator && (
                <Link href="/admin/articles/create" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                  <span className="text-[11px] md:text-xs font-bold">Tulis Artikel / Berita</span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
                </Link>
              )}
              {stats.is_creator && (
                <Link href="/admin/e-products/create" className="w-full flex items-center justify-between p-2.5 md:p-3 rounded-lg md:rounded-xl border border-slate-200 hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 transition-all group">
                  <span className="text-[11px] md:text-xs font-bold">Buat E-Produk Baru</span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-indigo-600 md:w-4 md:h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* WITHDRAWAL SHORTCUT */}
          {wdStats && (
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl md:rounded-2xl shadow-lg p-5 md:p-6 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative z-10 flex justify-between items-center mb-1">
                <h3 className="text-sm md:text-base font-bold text-indigo-50">Keuangan</h3>
                <Link href="/admin/withdrawals" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                  <ArrowUpRight size={16} />
                </Link>
              </div>
              <div className="relative z-10 mt-3">
                {stats.is_creator ? (
                  <>
                    <p className="text-[10px] md:text-xs font-medium text-indigo-200">Saldo Bisa Ditarik</p>
                    <p className="text-2xl font-black mt-1">Rp {wdStats.available_balance?.toLocaleString('id-ID') || 0}</p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] md:text-xs font-medium text-indigo-200">Permohonan Penarikan</p>
                    <p className="text-2xl font-black mt-1">{wdStats.total_pending_requests || 0} Antrean</p>
                  </>
                )}
              </div>
            </div>
          )}

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
              <p className="text-[9px] md:text-[10px] text-slate-400 font-medium">Laravel 12.x • Next.js 16.x App Router</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}