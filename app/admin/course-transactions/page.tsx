"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Loader2, Receipt, GraduationCap,
  User, Calendar, CreditCard, CheckCircle2, Clock, XCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function AdminCourseTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/course-transactions');
      const json = await res.json();
      if (res.ok && json.success) setTransactions(json.data);
    } catch {
      toast.error('Gagal mengambil data transaksi kursus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const formatRupiah = (number: number) => {
    if (number === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'verified':
        return { label: 'Lunas', icon: CheckCircle2, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'pending':
        return { label: 'Menunggu', icon: Clock, bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'failed':
      case 'cancelled':
      case 'expired':
        return { label: status === 'expired' ? 'Kedaluwarsa' : 'Gagal', icon: XCircle, bg: 'bg-rose-50 text-rose-600 border-rose-100' };
      default:
        return { label: status, icon: AlertCircle, bg: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  const filteredTransactions = transactions.filter(t =>
    (t.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.course?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.invoice_code || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 bg-slate-50 min-h-[80vh] pb-10 rounded-2xl">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-3">
            <Receipt size={12} /> Kursus Online
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Transaksi Kursus</h1>
          <p className="text-sm text-slate-500 mt-1">Riwayat pembelian kursus online oleh pengguna.</p>
        </div>
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text" placeholder="Cari user, kursus, invoice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Invoice</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Pengguna</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Kursus</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Total</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-emerald-500" /><span className="font-bold">Memuat transaksi...</span></td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-16 text-center text-slate-500"><Receipt size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700 text-base">Belum Ada Transaksi</p><p className="text-xs">Transaksi pembelian kursus akan muncul di sini.</p></td></tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const statusBadge = getStatusBadge(trx.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                          {trx.invoice_code || `#${trx.id}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                            <User size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{trx.user?.name || 'User'}</p>
                            <p className="text-[10px] text-slate-400 truncate">{trx.user?.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap size={14} className="text-emerald-500 shrink-0" />
                          <span className="font-semibold text-slate-700 truncate max-w-[200px]">{trx.course?.title || 'Kursus dihapus'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black ${trx.amount === 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {formatRupiah(trx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${statusBadge.bg}`}>
                          <StatusIcon size={14} /> {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-semibold">
                        {trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
