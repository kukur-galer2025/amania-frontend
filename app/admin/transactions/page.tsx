"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  Search, CheckCircle2, XCircle, Clock, 
  Loader2, Inbox, Image as ImageIcon, Eye, X, 
  CreditCard, TrendingUp, Calendar, Filter, User,
  ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

interface TransactionData {
  id: number;
  ticket_code: string;
  status: 'pending' | 'verified' | 'rejected';
  total_amount: string | number;
  payment_proof: string | null;
  rejection_reason: string | null;
  created_at: string;
  user: { name: string; email: string };
  event: { id: number; title: string; basic_price: number };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [eventsList, setEventsList] = useState<{id: number, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all'); 

  // 🔥 STATE MODAL FILTER EVENT (TENGAH LAYAR) 🔥
  const [showEventFilterModal, setShowEventFilterModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // Modal Proof
  const [proofImage, setProofImage] = useState<string | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch('/admin/transactions');
      const json = await res.json();
      
      if (res.ok && json.success) {
        setTransactions(json.data || []);
        if (json.events) {
          setEventsList(json.events);
        }
      } else {
        toast.error(json.message || "Gagal memuat data.");
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

  // --- HELPER: FORMAT RUPIAH ---
  const formatRupiah = (value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) || numericValue === 0) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  };

  // =========================================================================
  // 🔥 LOGIKA STATISTIK REALTIME BERDASARKAN EVENT YANG DIPILIH 🔥
  // =========================================================================
  const dynamicStats = useMemo(() => {
    // Hanya filter berdasarkan event yang dipilih agar angka stat card stabil
    const filteredByEvent = eventFilter === 'all' 
      ? transactions 
      : transactions.filter(tx => tx.event?.id.toString() === eventFilter);

    let totalRevenue = 0;
    let pendingCount = 0;
    let verifiedCount = 0;

    filteredByEvent.forEach(tx => {
      if (tx.status === 'verified') {
        verifiedCount++;
        totalRevenue += parseFloat(tx.total_amount?.toString() || '0');
      } else if (tx.status === 'pending') {
        pendingCount++;
      }
    });

    return { totalRevenue, pendingCount, verifiedCount };
  }, [transactions, eventFilter]);

  // --- FILTER UNTUK TABEL BAWAH ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        (tx.ticket_code?.toLowerCase() || '').includes(searchLower) || 
        (tx.user?.name?.toLowerCase() || '').includes(searchLower) ||
        (tx.event?.title?.toLowerCase() || '').includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      const matchesEvent = eventFilter === 'all' || tx.event?.id.toString() === eventFilter;

      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [transactions, searchTerm, statusFilter, eventFilter]);

  // Reset pagination saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, eventFilter]);

  // Kalkulasi Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500 relative pb-20 md:pb-24">
      
      {/* 1. PAGE HEADER */}
      <div className="mb-6 md:mb-8 mt-2 md:mt-0">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="text-indigo-600 md:w-6 md:h-6" size={20} /> Riwayat Transaksi
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-500">
          Pantau arus kas, detail pembayaran, dan bukti transfer dari seluruh peserta event.
        </p>
      </div>

      {/* 2. STATS WIDGETS (REALTIME BERDASARKAN FILTER EVENT) */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 overflow-x-auto custom-scrollbar pb-4 md:pb-0 snap-x">
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow min-w-[240px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Total Pendapatan</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 truncate transition-all duration-300">
              {formatRupiah(dynamicStats.totalRevenue)}
            </h3>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow min-w-[240px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-50 text-amber-500 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-amber-100">
            <Clock size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Menunggu Validasi</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 transition-all duration-300">
              {dynamicStats.pendingCount} <span className="text-[10px] md:text-sm font-medium text-slate-500">transaksi</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 md:gap-4 hover:shadow-md transition-shadow min-w-[240px] md:min-w-0 snap-start shrink-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
            <CheckCircle2 size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">Tiket Lunas</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900 transition-all duration-300">
              {dynamicStats.verifiedCount} <span className="text-[10px] md:text-sm font-medium text-slate-500">tiket</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8">
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-0">
          {/* Segmented Filter Status */}
          <div className="flex p-0.5 w-full sm:w-auto bg-slate-100/80 border border-slate-200 rounded-lg overflow-x-auto custom-scrollbar shrink-0">
            {(['all', 'pending', 'verified', 'rejected'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setStatusFilter(type)}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-md capitalize transition-all whitespace-nowrap ${
                  statusFilter === type 
                    ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {type === 'all' ? 'Semua' : type === 'pending' ? 'Pending' : type === 'verified' ? 'Lunas' : 'Ditolak'}
              </button>
            ))}
          </div>

          {/* 🔥 Tombol Modal Event Filter 🔥 */}
          <div className="relative w-full sm:w-auto shrink-0 min-w-0">
            <button
              onClick={() => setShowEventFilterModal(true)}
              className="w-full sm:w-[250px] flex items-center justify-between bg-white border border-slate-200 rounded-lg py-2.5 md:py-3 px-3.5 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="text-indigo-500 shrink-0" size={16} />
                <span className="truncate">
                  {eventFilter === 'all' 
                    ? 'Semua Program Event' 
                    : eventsList.find(e => e.id.toString() === eventFilter)?.title || 'Semua Program Event'}
                </span>
              </div>
              <ChevronDown size={16} className="text-slate-400 shrink-0 ml-2" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 shrink-0 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" size={14} />
          <input
            type="text"
            placeholder="Cari kode tiket atau nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg py-2.5 md:py-3 pl-9 pr-4 text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
        </div>
        
      </div>

      {/* 4. DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="min-w-full divide-y divide-slate-200 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[18%]">Waktu Transaksi</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[25%]">Pendaftar</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[30%]">Event & Nominal</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-center text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[12%]">Bukti TF</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] w-[15%]">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-16 md:py-20 text-center">
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 animate-spin mx-auto mb-2 md:mb-3" />
                    <p className="text-[10px] md:text-sm font-bold text-slate-400 tracking-wider">Memuat data transaksi...</p>
                  </td>
                </tr>
              ) : currentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 md:px-6 py-16 md:py-24 text-center">
                    <Inbox className="w-8 h-8 md:w-10 md:h-10 text-slate-300 mx-auto mb-3 md:mb-4" strokeWidth={1.5} />
                    <h3 className="text-sm md:text-base font-bold text-slate-900">Tidak ada transaksi ditemukan</h3>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Sesuaikan filter atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              ) : (
                currentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0">
                      <div className="text-xs md:text-sm font-medium text-slate-900 truncate w-full">
                        {new Date(tx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 mt-0.5 md:mt-1 flex items-center gap-1 font-bold uppercase tracking-wider truncate w-full">
                        <Calendar size={10} className="md:w-3 md:h-3 shrink-0" /> <span className="truncate">{new Date(tx.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap min-w-0">
                      <div className="text-xs md:text-sm font-black text-indigo-600 tracking-wide mb-0.5 md:mb-1 truncate w-full">
                        {tx.ticket_code ? `#${tx.ticket_code}` : 'Belum Diverifikasi'}
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-slate-900 truncate w-full" title={tx.user?.name}>{tx.user?.name}</div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 max-w-[200px] md:max-w-[250px] min-w-0">
                      <div className="text-xs md:text-sm font-bold text-slate-900 truncate" title={tx.event?.title}>
                        {tx.event?.title}
                      </div>
                      <div className="text-[11px] md:text-sm font-black text-emerald-600 mt-0.5 md:mt-1 truncate w-full">
                        {formatRupiah(tx.total_amount)}
                      </div>
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-center">
                      {tx.payment_proof ? (
                        <button 
                          onClick={() => setProofImage(`${STORAGE_URL}/${tx.payment_proof}`)}
                          className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md text-[10px] md:text-xs font-bold transition-colors border border-slate-200 shadow-sm"
                        >
                          <Eye size={12} className="md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Lihat Struk</span><span className="sm:hidden">Lihat</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1 text-[10px] md:text-xs text-slate-400 font-medium">
                          <ImageIcon size={12} className="md:w-3.5 md:h-3.5" /> Menunggu
                        </span>
                      )}
                    </td>

                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right min-w-0">
                      <div className="flex flex-col items-end">
                        {tx.status === 'verified' && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-emerald-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 uppercase tracking-wider">
                            <CheckCircle2 size={10} className="md:w-3 md:h-3" /> Lunas
                          </span>
                        )}
                        {tx.status === 'pending' && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-amber-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-600/20 uppercase tracking-wider">
                            <Clock size={10} className="md:w-3 md:h-3" /> Pending
                          </span>
                        )}
                        {tx.status === 'rejected' && (
                          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-rose-50 px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20 uppercase tracking-wider">
                            <XCircle size={10} className="md:w-3 md:h-3" /> Ditolak
                          </span>
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
                Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> dari <span className="font-bold text-slate-900">{filteredTransactions.length}</span> hasil
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

      {/* 🔥 MODAL POPUP: FILTER PROGRAM EVENT 🔥 */}
      <AnimatePresence>
        {showEventFilterModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowEventFilterModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-[1.5rem] md:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h2 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2 min-w-0">
                  <Filter size={18} className="text-indigo-500 shrink-0" /> <span className="truncate w-full">Filter Event</span>
                </h2>
                <button 
                  onClick={() => setShowEventFilterModal(false)} 
                  className="text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition-colors p-1.5 rounded-lg shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-3 md:p-4 overflow-y-auto custom-scrollbar flex-1 space-y-1.5 w-full min-w-0">
                <button
                  onClick={() => { setEventFilter('all'); setShowEventFilterModal(false); }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-between min-w-0 ${
                    eventFilter === 'all' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <span className="truncate w-full">Semua Program Event</span>
                  {eventFilter === 'all' && <CheckCircle2 size={18} className="text-indigo-600 shrink-0 ml-2" />}
                </button>

                {eventsList.map((ev: any) => (
                  <button
                    key={ev.id}
                    onClick={() => { setEventFilter(ev.id.toString()); setShowEventFilterModal(false); }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center justify-between min-w-0 ${
                      eventFilter === ev.id.toString() ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span className="truncate w-full pr-2">{ev.title}</span>
                    {eventFilter === ev.id.toString() && <CheckCircle2 size={18} className="text-indigo-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL LIHAT BUKTI TRANSFER */}
      <AnimatePresence>
        {proofImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setProofImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative max-w-2xl w-full flex flex-col items-center bg-white p-2 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="w-full flex justify-between items-center px-4 py-3 mb-2 border-b border-slate-100 min-w-0">
                 <span className="text-[10px] md:text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} className="text-indigo-500"/> Bukti Pembayaran</span>
                 <button 
                   onClick={() => setProofImage(null)}
                   className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors shrink-0"
                 >
                   <X size={18} />
                 </button>
              </div>
              <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center">
                 <img loading="lazy" src={proofImage} alt="Bukti Transfer" className="w-full max-h-[70vh] md:max-h-[75vh] object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}