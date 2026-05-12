"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, CheckCircle2, XCircle, Clock, 
  Loader2, Inbox, Receipt, TrendingUp, Calendar, 
  ChevronLeft, ChevronRight, ShoppingCart, FileSpreadsheet, ArrowUpRight, CreditCard, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

interface TrxEProduct {
  id: number;
  reference: string;
  tripay_reference: string | null;
  status: string;
  amount: string | number;
  created_at: string;
  checkout_url: string | null;
  payment_method: string | null;
  buyer: { name: string; email: string; phone: string | null };
  // Karena sekarang pakai EProductOrderItem, product menjadi product_names (string gabungan)
  product_names: string; 
}

export default function AdminEProductTransactionsPage() {
  const [transactions, setTransactions] = useState<TrxEProduct[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, paidCount: 0, unpaidCount: 0, expiredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // State Loading Eksport
  const [isExporting, setIsExporting] = useState(false);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNPAID' | 'PAID' | 'EXPIRED'>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch('/admin/e-product-transactions');
      const json = await res.json();
      
      if (res.ok && json.success) {
        setTransactions(json.data || []);
        if (json.stats) {
          setStats({
            totalRevenue: Number(json.stats.total_revenue) || 0,
            paidCount: Number(json.stats.paid_count) || 0,
            unpaidCount: Number(json.stats.unpaid_count) || 0,
            expiredCount: Number(json.stats.expired_count) || 0,
          });
        }
      } else {
        toast.error(json.message || "Gagal memuat data transaksi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleMarkAsPaid = async (id: number, ref: string) => {
    if (!confirm(`Tandai LUNAS secara manual untuk invoice ${ref}? Pastikan Anda sudah menerima dana transferan.`)) return;
    
    setActionLoadingId(id);
    const tid = toast.loading("Memperbarui status transaksi...");
    try {
      const res = await apiFetch(`/admin/e-product-transactions/${id}/mark-paid`, { method: 'POST' });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success(json.message, { id: tid });
        fetchTransactions(); // Refresh data
      } else {
        toast.error(json.message || "Gagal mengupdate transaksi.", { id: tid });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: tid });
    } finally {
      setActionLoadingId(null);
    }
  };

  // FUNGSI EKSPORT PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    const tid = toast.loading("Menyusun laporan PDF...");
    try {
      const res = await apiFetch(`/admin/e-product-transactions/export?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`);
      if (!res.ok) throw new Error("Gagal mengunduh file.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Transaksi_EProduk_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Laporan berhasil diunduh!", { id: tid });
    } catch (error) {
      toast.error("Terjadi kesalahan saat eksport PDF.", { id: tid });
    } finally {
      setIsExporting(false);
    }
  };

  const formatRupiah = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) || numericValue === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(numericValue);
  };

  // --- FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (tx.reference?.toLowerCase() || '').includes(searchLower) || 
        (tx.tripay_reference?.toLowerCase() || '').includes(searchLower) || // Bisa cari via tripay ref juga
        (tx.buyer?.name?.toLowerCase() || '').includes(searchLower) ||
        (tx.product_names?.toLowerCase() || '').includes(searchLower);
      
      const normalizedStatus = tx.status === 'SETTLED' ? 'PAID' : tx.status;
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 relative pb-20 md:pb-24">
      
      {/* 1. PAGE HEADER */}
      <div className="mb-6 md:mb-8 mt-2 md:mt-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="text-indigo-600 md:w-6 md:h-6" size={20} /> Transaksi E-Produk
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-500">
            Pantau arus kas dan riwayat pembelian aset digital (e-book, template, dll) dari seluruh pengguna.
            </p>
        </div>
        
        {/* Tombol Eksport PDF */}
        <button 
          onClick={handleExportPDF}
          disabled={isExporting || loading}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-lg shadow-rose-200 disabled:opacity-50 shrink-0"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
          {isExporting ? 'MENYUSUN...' : 'EKSPORT PDF'}
        </button>
      </div>

      {/* 2. STATS WIDGETS */}
      <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto custom-scrollbar pb-4 md:pb-0 snap-x">
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[240px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Total Omset</p>
            <h3 className="text-lg md:text-xl font-black text-slate-900 truncate">{formatRupiah(stats.totalRevenue)}</h3>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[200px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
            <CheckCircle2 size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Terjual</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{stats.paidCount} <span className="text-[10px] md:text-sm font-medium text-slate-500">item</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[200px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-500 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Unpaid</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{stats.unpaidCount} <span className="text-[10px] md:text-sm font-medium text-slate-500">trx</span></h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 min-w-[200px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-50 text-rose-500 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-rose-100">
            <XCircle size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Expired</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{stats.expiredCount} <span className="text-[10px] md:text-sm font-medium text-slate-500">trx</span></h3>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-0">
          <div className="flex p-0.5 w-full sm:w-auto bg-slate-100/80 border border-slate-200 rounded-lg overflow-x-auto custom-scrollbar shrink-0">
            {(['all', 'UNPAID', 'PAID', 'EXPIRED'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStatusFilter(type)}
                className={`flex-1 sm:flex-none px-3 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-md capitalize transition-all whitespace-nowrap ${
                  statusFilter === type 
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {type === 'all' ? 'Semua' : type === 'PAID' ? 'Lunas' : type === 'UNPAID' ? 'Belum Bayar' : 'Expired'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" size={14} />
          <input
            type="text"
            placeholder="Cari Invoice, Tripay Ref, Pembeli..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg py-2.5 md:py-3 pl-9 pr-4 text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>
        
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-slate-200 min-w-[850px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[15%]">Waktu Transaksi</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[22%]">Invoice & Tripay Ref</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[20%]">Info Pembeli</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[20%]">E-Produk & Harga</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[13%]">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[10%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-16 md:py-20 text-center">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-spin mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-wider">Memuat data transaksi e-produk...</p>
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-16 md:py-24 text-center">
                    <Inbox className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mx-auto mb-3 md:mb-4" strokeWidth={1.5} />
                    <h3 className="text-sm md:text-base font-bold text-slate-900">Tidak ada transaksi ditemukan</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Sesuaikan filter atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    {/* Kolom 1: Waktu */}
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0">
                      <div className="text-xs md:text-sm font-medium text-slate-900 truncate w-full">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 md:mt-1 flex items-center gap-1 font-bold uppercase tracking-wider truncate w-full">
                        <Calendar size={10} className="md:w-3 md:h-3 shrink-0" /> <span className="truncate">{new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </td>

                    {/* Kolom 2: Invoice & Tripay Ref */}
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0">
                      <div className="text-[11px] md:text-xs font-black text-indigo-600 tracking-wide mb-1 truncate w-full">
                        {tx.reference}
                      </div>
                      {/* 🔥 MENAMPILKAN TRIPAY REFERENCE 🔥 */}
                      <div className="text-[9px] md:text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate w-full" title={tx.tripay_reference || 'Tidak via Tripay'}>
                        <Hash size={10} className="text-slate-400 shrink-0" /> 
                        {tx.tripay_reference ? (
                           <span className="truncate text-slate-600 font-mono tracking-tight">{tx.tripay_reference}</span>
                        ) : (
                           <span className="italic text-slate-400">Claim Manual / Gratis</span>
                        )}
                      </div>
                    </td>

                    {/* Kolom 3: Pembeli */}
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0">
                      <div className="text-xs md:text-sm font-semibold text-slate-900 truncate w-full" title={tx.buyer?.name}>{tx.buyer?.name}</div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 truncate w-full">{tx.buyer?.email}</div>
                    </td>

                    {/* Kolom 4: Produk & Harga */}
                    <td className="px-4 md:px-6 py-3 md:py-4 min-w-0">
                      <div className="text-xs md:text-sm font-bold text-slate-900 w-full truncate flex items-center gap-1.5" title={tx.product_names}>
                        <ShoppingCart size={14} className="text-slate-400 shrink-0" /> <span className="truncate">{tx.product_names}</span>
                      </div>
                      <div className="text-[11px] md:text-sm font-black text-emerald-600 mt-1 truncate w-full">
                        {formatRupiah(tx.amount)}
                      </div>
                    </td>

                    {/* Kolom 5: Status & Metode */}
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        {(tx.status === 'PAID' || tx.status === 'SETTLED' || tx.status === 'success') && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                            <CheckCircle2 size={10} className="md:w-3 md:h-3" /> Lunas
                          </span>
                        )}
                        {tx.status === 'UNPAID' && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider">
                            <Clock size={10} className="md:w-3 md:h-3" /> Pending
                          </span>
                        )}
                        {(tx.status === 'EXPIRED' || tx.status === 'FAILED') && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-rose-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 uppercase tracking-wider">
                            <XCircle size={10} className="md:w-3 md:h-3" /> {tx.status}
                          </span>
                        )}

                        {tx.payment_method && Number(tx.amount) > 0 && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase">
                            <CreditCard size={10} /> {tx.payment_method}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kolom 6: Aksi */}
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right min-w-0">
                       <div className="flex items-center justify-end gap-2">
                         
                         {tx.checkout_url && Number(tx.amount) > 0 && (
                           <a 
                             href={tx.checkout_url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] md:text-[10px] font-bold transition-all border border-slate-200"
                           >
                             <ArrowUpRight size={12} /> Cek
                           </a>
                         )}

                         {tx.status === 'UNPAID' && (
                           <button 
                             onClick={() => handleMarkAsPaid(tx.id, tx.reference)}
                             disabled={actionLoadingId === tx.id}
                             className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[9px] md:text-[10px] font-bold transition-all border border-indigo-200 hover:border-transparent disabled:opacity-50"
                           >
                             {actionLoadingId === tx.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} 
                             Lunas
                           </button>
                         )}
                       </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        {!loading && filteredTransactions.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 md:px-6 py-3 md:py-4 gap-3">
            <div className="hidden sm:block min-w-0">
              <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate w-full">
                Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-bold text-slate-900">{filteredTransactions.length}</span> transaksi
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg bg-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <ChevronLeft size={14} className="mr-1 text-slate-400 md:w-4 md:h-4" /> <span className="hidden sm:inline">Sebelumnya</span><span className="sm:hidden">Prev</span>
              </button>
              
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs font-black text-slate-700 shadow-sm min-w-[50px] md:min-w-[70px] text-center">
                 {currentPage} / {totalPages || 1}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="relative inline-flex items-center rounded-lg bg-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <span className="hidden sm:inline">Selanjutnya</span><span className="sm:hidden">Next</span> <ChevronRight size={14} className="ml-1 text-slate-400 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}