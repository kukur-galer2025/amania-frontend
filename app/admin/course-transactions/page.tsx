"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Loader2, Receipt, GraduationCap,
  User, Calendar, CreditCard, CheckCircle2, Clock, XCircle, AlertCircle, Eye, Hash, X
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import { safeStorage } from '@/app/utils/safeStorage';

export default function AdminCourseTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const selectedDetail = transactions.find(t => t.id === selectedDetailId) || null;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState('all');

  useEffect(() => {
    setIsMounted(true);
    try {
      const userStr = safeStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'superadmin');
      }
    } catch {}
  }, []);

  const [creatorsList, setCreatorsList] = useState<{id: number; name: string}[]>([]);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/course-transactions');
      const json = await res.json();
      if (res.ok && json.success) {
        setTransactions(json.data);
        if (json.creators) {
          setCreatorsList(json.creators);
        }
      }
    } catch {
      toast.error('Gagal mengambil data transaksi kursus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMarkAsPaid = async (id: number) => {
    setActionLoadingId(id);
    const tid = toast.loading("Memperbarui status transaksi...");
    try {
      const res = await apiFetch(`/admin/course-transactions/${id}/mark-paid`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success(json.message, { id: tid });
        fetchData();
        setSelectedDetailId(null);
      } else {
        toast.error(json.message || "Gagal mengupdate transaksi.", { id: tid });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: tid });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }
    setActionLoadingId(id);
    try {
      const res = await apiFetch(`/admin/course-transactions/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (!res.ok) throw new Error();
      toast.success('Transaksi berhasil ditolak.');
      fetchData();
      setSelectedDetailId(null);
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Gagal menolak transaksi.');
    } finally {
      setActionLoadingId(null);
    }
  };

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

  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (t.user?.name || '').toLowerCase().includes(searchLower) ||
      (t.course?.title || '').toLowerCase().includes(searchLower) ||
      (t.invoice_code || '').toLowerCase().includes(searchLower);
    
    const creatorName = t.course?.user?.name || '';
    const matchesCreator = selectedCreator === 'all' || creatorName === selectedCreator;

    return matchesSearch && matchesCreator;
  });

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
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          {isMounted && isAdmin && creatorsList.length > 0 && (
            <div className="relative w-full sm:w-auto">
              <select
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:border-emerald-500 transition-all shadow-sm cursor-pointer"
              >
                <option value="all">Semua Kreator</option>
                {creatorsList.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          )}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari user, kursus, invoice..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full transition-all"
            />
          </div>
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
                {isMounted && isAdmin && <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Kreator</th>}
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Total</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Tanggal</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={isMounted && isAdmin ? 8 : 7} className="px-6 py-16 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-emerald-500" /><span className="font-bold">Memuat transaksi...</span></td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan={isMounted && isAdmin ? 8 : 7} className="px-6 py-16 text-center text-slate-500"><Receipt size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700 text-base">Belum Ada Transaksi</p><p className="text-xs">Transaksi pembelian kursus akan muncul di sini.</p></td></tr>
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
                      {isMounted && isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs">
                            <User size={13} className="text-indigo-400 shrink-0" />
                            <span className="font-bold text-slate-700 truncate max-w-[120px]">
                              {trx.course?.user?.name || '-'}
                            </span>
                          </div>
                        </td>
                      )}
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
                        <span>{trx.created_at ? new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => setSelectedDetailId(trx.id)}
                          className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] md:text-xs font-bold transition-colors shadow-sm"
                        >
                          <Eye size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {proofImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setProofImage(null)}>
            <div className="relative max-w-3xl max-h-[90vh] w-full rounded-2xl overflow-hidden bg-white flex flex-col items-center">
                <button
                    className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black transition-colors"
                    onClick={() => setProofImage(null)}
                >
                    <XCircle size={24} />
                </button>
                <img loading="lazy" src={proofImage} alt="Bukti Pembayaran" className="w-full h-auto max-h-[90vh] object-contain" />
            </div>
        </div>
      )}

      {/* 🔥 MODAL DETAIL TRANSAKSI KURSUS 🔥 */}
      <AnimatePresence>
        {selectedDetail && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedDetailId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl relative max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 md:gap-3">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">Detail Transaksi Kursus</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedDetail.status).bg}`}>
                    {getStatusBadge(selectedDetail.status).label}
                  </span>
                </div>
                <button onClick={() => setSelectedDetailId(null)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors p-1.5 rounded-lg">
                  <X size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-5 md:space-y-6 custom-scrollbar">
                
                <div className="space-y-3">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <GraduationCap size={14} className="text-indigo-500 md:w-4 md:h-4" /> Informasi Kursus
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid gap-4">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kursus Dibeli</p>
                      <p className="text-xs md:text-sm font-bold text-slate-900 leading-relaxed">{selectedDetail.course?.title || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Hash size={10} className="text-slate-400"/> Invoice</p>
                         <p className="text-xs md:text-sm font-mono font-bold text-slate-900">{selectedDetail.invoice_code || `#${selectedDetail.id}`}</p>
                       </div>
                       <div>
                         <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard size={10} className="text-slate-400"/> Tipe Harga</p>
                         <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">{selectedDetail.amount === 0 ? 'Gratis' : 'Berbayar'}</p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                     <User size={14} className="text-blue-500 md:w-4 md:h-4" /> Data Pembeli
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-white px-2">
                     <div>
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{selectedDetail.user?.name}</p>
                     </div>
                     <div>
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Email</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{selectedDetail.user?.email}</p>
                     </div>
                     <div className="sm:col-span-2">
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Waktu Transaksi</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900">
                          {new Date(selectedDetail.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })} WIB
                       </p>
                     </div>
                   </div>
                </div>

                {Number(selectedDetail.amount) > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CreditCard size={14} className="text-emerald-500 md:w-4 md:h-4" /> Detail Pembayaran
                    </h3>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between mb-2">
                       <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">Total Tagihan</span>
                       <span className="text-base md:text-lg font-black text-emerald-700">{formatRupiah(selectedDetail.amount)}</span>
                    </div>

                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bukti Transfer (Manual QRIS):</p>
                      {selectedDetail.payment_proof ? (
                        <div 
                           onClick={() => setProofImage(selectedDetail.payment_proof)}
                           className="relative w-full h-32 md:h-48 bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200 group"
                        >
                           <img loading="lazy" src={selectedDetail.payment_proof} alt="Bukti Bayar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 shadow-sm"><Eye size={14} className="md:w-4 md:h-4"/> Lihat Penuh</span>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full py-8 md:py-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] md:text-xs font-bold">
                           {selectedDetail.checkout_url ? "Transaksi via Tripay otomatis. (Tidak perlu upload bukti transfer)." : "Belum ada bukti transfer diunggah."}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(selectedDetail.status?.toUpperCase() === 'PENDING' || selectedDetail.status?.toUpperCase() === 'UNPAID') && (
                <div className="px-5 md:px-6 py-4 md:py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
                  <button 
                    onClick={() => setRejectingId(selectedDetail.id)}
                    className="w-full sm:w-auto py-2.5 md:py-3 px-6 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    Tolak Transaksi
                  </button>
                  <button 
                    onClick={() => handleMarkAsPaid(selectedDetail.id)}
                    disabled={actionLoadingId === selectedDetail.id}
                    className="w-full sm:w-auto py-2.5 md:py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {actionLoadingId === selectedDetail.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} 
                    Verifikasi Lunas
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 MODAL TOLAK TRANSAKSI 🔥 */}
      <AnimatePresence>
        {rejectingId && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setRejectingId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl relative max-w-md w-full overflow-hidden flex flex-col border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h2 className="text-base md:text-lg font-bold text-slate-900">Tolak Transaksi</h2>
                <button onClick={() => setRejectingId(null)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors p-1.5 rounded-lg">
                  <X size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
              <div className="p-5 md:p-6 flex-1 space-y-4">
                <p className="text-xs md:text-sm text-slate-600">Berikan alasan mengapa transaksi ini ditolak. User akan dapat melihat alasan ini dan mengunggah ulang bukti bayar.</p>
                <div>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Bukti transfer buram, mohon foto ulang dengan jelas."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                  />
                </div>
              </div>
              <div className="px-5 md:px-6 py-4 md:py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button onClick={() => setRejectingId(null)} className="py-2.5 px-6 text-slate-600 text-xs md:text-sm font-bold hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button 
                  onClick={() => handleReject(rejectingId)}
                  disabled={actionLoadingId === rejectingId || !rejectReason.trim()}
                  className="py-2.5 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoadingId === rejectingId ? <Loader2 size={16} className="animate-spin" /> : null}
                  Tolak Sekarang
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
