"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Loader2, CheckCircle2, Clock, 
  XCircle, Eye, Image as ImageIcon, X, 
  ReceiptText, ArrowUpRight, Search,
  Ticket, FileText, DownloadCloud, CalendarDays, Hash, CreditCard, ShieldAlert, Timer
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

// ============================================================================
// HELPER: SAFE DATE PARSER
// ============================================================================
const parseSafeDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  let safeStr = dateStr.replace(' ', 'T');
  if (!safeStr.includes('Z') && !safeStr.includes('+')) safeStr += '+07:00';
  return new Date(safeStr);
};

// ============================================================================
// KOMPONEN COUNTDOWN TIMER UNTUK INVOICE TRIPAY
// ============================================================================
const InvoiceCountdown = ({ createdAt, expiredAt }: { createdAt: string, expiredAt?: number | string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>('Menghitung...');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTargetTime = () => {
      // 🔥 FIX: Tripay mengirimkan expired_time dalam Unix Timestamp (Detik) 🔥
      // Jadi kita harus mengalikannya dengan 1000 untuk mendapatkan Milidetik JS
      if (expiredAt) {
        return new Date(Number(expiredAt) * 1000).getTime();
      }
      
      // Fallback jika expiredAt null (Default 24 jam dari created_at)
      const createdDate = parseSafeDate(createdAt).getTime();
      return createdDate + (24 * 60 * 60 * 1000); 
    };

    const targetTime = calculateTargetTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft('Waktu Habis');
        clearInterval(interval);
      } else {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, expiredAt]);

  if (isExpired) {
    return (
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1 mb-0.5">
          <XCircle size={12} /> Status Waktu
        </span>
        <span className="text-sm font-bold text-rose-600 truncate w-full">Waktu Habis</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-w-0">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
        <Timer size={12} /> Sisa Waktu Bayar
      </span>
      <span className="text-base font-black text-amber-600 font-mono tracking-tight animate-pulse">{timeLeft}</span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function TransactionsClient() {
  const [eventTransactions, setEventTransactions] = useState<any[]>([]);
  const [eProductTransactions, setEProductTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'event' | 'eproduct'>('event');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // 🔥 STATE UNTUK PENCARIAN & FILTER 🔥
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Silakan login kembali");
          setLoading(false);
          return;
        }

        const [resEvents, resEProducts] = await Promise.all([
          apiFetch('/my-registrations'),
          apiFetch('/my-eproduct-transactions')
        ]);

        const jsonEvents = await resEvents.json();
        const jsonEProducts = await resEProducts.json();
        
        if (resEvents.ok && jsonEvents.success) {
          setEventTransactions(jsonEvents.data);
        }
        if (resEProducts.ok && jsonEProducts.success) {
          setEProductTransactions(jsonEProducts.data);
        }
      } catch (error) {
        toast.error("Gagal memuat riwayat transaksi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatRupiah = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (num === 0) return 'Gratis';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  };

  const formatDateTime = (dateString: string) => {
    const date = parseSafeDate(dateString);
    const formattedDate = date.toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(/\./g, ':'); 
    return `${formattedDate} WIB`;
  };

  const getStatusBadge = (status: string, createdAt?: string, expiredAt?: number | string | null) => {
    const s = status?.toLowerCase();
    
    // Perhitungan waktu untuk Tripay
    let isTimeExpired = false;
    if (s === 'unpaid' || s === 'pending') {
       if (expiredAt) {
           isTimeExpired = new Date().getTime() > (Number(expiredAt) * 1000);
       } else if (createdAt) {
           const createdTime = parseSafeDate(createdAt).getTime();
           isTimeExpired = new Date().getTime() > (createdTime + 24 * 60 * 60 * 1000);
       }
    }

    if (s === 'verified' || s === 'paid' || s === 'success' || s === 'settled') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0">
          <CheckCircle2 size={12} className="text-indigo-500" /> Berhasil
        </div>
      );
    }
    
    if (s === 'rejected' || s === 'failed' || s === 'expired' || s === 'refund' || isTimeExpired) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0">
          <XCircle size={12} className="text-rose-500" /> {isTimeExpired && s !== 'rejected' ? 'Kedaluwarsa' : 'Gagal'}
        </div>
      );
    }

    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0">
        <Clock size={12} className="text-amber-500 animate-pulse" /> Menunggu Pembayaran
      </div>
    );
  };

  // ============================================================================
  // LOGIKA FILTER DAN PENCARIAN (SEARCH)
  // ============================================================================
  const filteredEvents = useMemo(() => {
    return eventTransactions.filter(trx => {
      // Search
      const query = searchQuery.toLowerCase();
      const titleMatch = (trx.event?.title || '').toLowerCase().includes(query);
      const codeMatch = (trx.ticket_code || '').toLowerCase().includes(query);
      const matchesSearch = titleMatch || codeMatch;

      // Status
      let matchesStatus = true;
      const s = (trx.status || '').toLowerCase();
      
      if (filterStatus === 'success') {
        matchesStatus = ['verified', 'paid', 'success'].includes(s);
      } else if (filterStatus === 'pending') {
        matchesStatus = ['pending', 'unpaid'].includes(s);
      } else if (filterStatus === 'failed') {
        matchesStatus = ['rejected', 'failed', 'expired'].includes(s);
      }

      return matchesSearch && matchesStatus;
    });
  }, [eventTransactions, searchQuery, filterStatus]);

  const filteredEProducts = useMemo(() => {
    return eProductTransactions.filter(trx => {
      // Search
      const query = searchQuery.toLowerCase();
      const titleMatch = (trx.product?.title || '').toLowerCase().includes(query);
      const refMatch = (trx.reference || '').toLowerCase().includes(query);
      const matchesSearch = titleMatch || refMatch;

      // Status & Waktu Expired
      let matchesStatus = true;
      const s = (trx.status || '').toLowerCase();
      
      let isTimeExpired = false;
      if (trx.expired_time) {
          isTimeExpired = new Date().getTime() > (Number(trx.expired_time) * 1000);
      } else {
          const createdTime = parseSafeDate(trx.created_at).getTime();
          isTimeExpired = new Date().getTime() > (createdTime + 24 * 60 * 60 * 1000);
      }
      
      const isActuallyUnpaid = (s === 'unpaid' || s === 'pending') && !isTimeExpired;

      if (filterStatus === 'success') {
        matchesStatus = ['paid', 'success', 'settled'].includes(s);
      } else if (filterStatus === 'pending') {
        matchesStatus = isActuallyUnpaid;
      } else if (filterStatus === 'failed') {
        matchesStatus = ['rejected', 'failed', 'expired', 'refund'].includes(s) || ((s === 'unpaid' || s === 'pending') && isTimeExpired);
      }

      return matchesSearch && matchesStatus;
    });
  }, [eProductTransactions, searchQuery, filterStatus]);

  // Reset filter when changing tabs
  useEffect(() => {
    setSearchQuery('');
    setFilterStatus('all');
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-indigo-600" size={40} strokeWidth={2.5}/>
        <span className="text-xs font-bold text-slate-500 tracking-widest uppercase animate-pulse">Memuat Transaksi...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans selection:bg-indigo-100 w-full min-w-0">
      
      {/* ════ HEADER SECTION ════ */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] w-full min-w-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0 md:pt-12 md:pb-0 w-full min-w-0">
          <div className="max-w-2xl mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100/50 border border-indigo-200/50 rounded-full text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-4">
              <ReceiptText size={14} /> Tagihan & Akses
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Riwayat Transaksi
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-lg">
              Pantau status verifikasi pembayaran dan akses produk digital yang telah Anda beli.
            </p>
          </div>

          {/* 🔥 TABS NAVIGATION 🔥 */}
          <div className="flex gap-8 border-b border-slate-200 overflow-x-auto hide-scroll-bar w-full">
            <button 
              onClick={() => setActiveTab('event')}
              className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'event' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Ticket size={18} className={activeTab === 'event' ? 'text-indigo-500' : ''} /> Tiket Event & Kelas
              {activeTab === 'event' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
            </button>
            <button 
              onClick={() => setActiveTab('eproduct')}
              className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'eproduct' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileText size={18} className={activeTab === 'eproduct' ? 'text-indigo-500' : ''} /> E-Produk Premium
              {activeTab === 'eproduct' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
            </button>
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 w-full min-w-0">
        
        {/* 🔥 PENCARIAN DAN FILTER STATUS 🔥 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 md:mb-8 w-full min-w-0">
          
          <div className="relative w-full md:w-96 group shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Cari judul, tiket, atau referensi..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 pr-4 text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="flex p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto hide-scroll-bar w-full md:w-auto shadow-[0_2px_10px_rgba(0,0,0,0.02)] shrink-0">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'success', label: 'Berhasil' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'failed', label: 'Gagal' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`flex-1 md:flex-none px-4 md:px-5 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                  filterStatus === tab.id 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TRANSAKSI EVENT */}
        {/* ========================================================================= */}
        {activeTab === 'event' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
            {filteredEvents.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-sm w-full">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Ticket size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'Hasil Pencarian Kosong' : 'Belum Ada Transaksi Event'}
                </h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-8">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Tidak ada transaksi yang cocok dengan kata kunci atau filter saat ini.' 
                    : 'Anda belum mendaftar kelas atau webinar apapun. Temukan program menarik di katalog kami.'}
                </p>
                {searchQuery || filterStatus !== 'all' ? (
                  <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold rounded-xl transition-all">
                    Reset Pencarian
                  </button>
                ) : (
                  <Link href="/events" className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                    Cari Kelas Sekarang <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6 w-full min-w-0">
                {filteredEvents.map((trx) => (
                  <div key={`evt-${trx.id}`} className="bg-white border border-slate-200/80 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)] hover:border-indigo-200 transition-all duration-300 group flex flex-col sm:flex-row gap-5 md:gap-6 w-full min-w-0">
                    
                    <div className="w-full sm:w-40 md:w-56 shrink-0 rounded-xl md:rounded-[1.25rem] bg-slate-900 overflow-hidden border border-slate-200 relative shadow-sm aspect-video sm:aspect-square md:aspect-video flex items-center justify-center p-1.5 md:p-2">
                      {trx.event?.image ? (
                        <React.Fragment>
                           <div className="absolute inset-0 z-0">
                             <img src={`${STORAGE_URL}/${trx.event.image}`} className="w-full h-full object-cover blur-xl opacity-40 scale-125" alt="blur"/>
                           </div>
                           <img src={`${STORAGE_URL}/${trx.event.image}`} alt={trx.event?.title} className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-lg" />
                        </React.Fragment>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500"><Ticket size={32} strokeWidth={1.5} /></div>
                      )}
                      <div className="absolute top-2 left-2 z-20 sm:hidden">
                        {getStatusBadge(trx.status, trx.created_at)}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col w-full min-w-0">
                      <div className="hidden sm:flex flex-wrap items-center gap-2 mb-3 w-full min-w-0">
                        {getStatusBadge(trx.status, trx.created_at)}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate shrink-0">
                          <Hash size={12}/> {trx.ticket_code || `TRX-EVT-${trx.id}`}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate shrink-0">
                          <CalendarDays size={12}/> {formatDateTime(trx.created_at)}
                        </span>
                      </div>
                      
                      <div className="sm:hidden flex flex-wrap items-center gap-2 mb-2 w-full min-w-0">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-widest shrink-0">
                          <Hash size={12}/> {trx.ticket_code || `TRX-EVT-${trx.id}`}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-widest shrink-0">
                          <CalendarDays size={12}/> {formatDateTime(trx.created_at)}
                        </span>
                      </div>

                      <h3 className="text-base md:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-2 w-full break-words">
                        {trx.event?.title || <span className="italic text-slate-400">Event tidak tersedia</span>}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-slate-500 mb-4 w-full min-w-0">
                        Kategori Tiket: <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] uppercase tracking-widest font-black shrink-0 ${trx.tier === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{trx.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
                        
                        <div className="flex flex-col min-w-0 shrink-0">
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                             <CreditCard size={12} /> Total Pembayaran
                          </span>
                          <span className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight w-full truncate">
                            {formatRupiah(trx.total_amount)}
                          </span>
                        </div>

                        <div className="flex w-full sm:w-auto shrink-0">
                          {parseFloat(trx.total_amount) > 0 ? (
                            <button 
                              onClick={() => trx.payment_proof ? setSelectedProof(`${STORAGE_URL}/${trx.payment_proof}`) : toast.error("Bukti belum diunggah")}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                            >
                              {trx.payment_proof ? (
                                <span className="flex items-center gap-1.5"><Eye size={16} className="text-indigo-500" /> Lihat Bukti Transfer</span>
                              ) : (
                                <span className="flex items-center gap-1.5"><ShieldAlert size={16} className="text-rose-400" /> Belum Upload Bukti</span>
                              )}
                            </button>
                          ) : (
                            <div className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold">
                              Tiket Gratis (Free Pass)
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRANSAKSI E-PRODUCT (TRIPAY) */}
        {/* ========================================================================= */}
        {activeTab === 'eproduct' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full min-w-0">
            {filteredEProducts.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-sm w-full">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  {searchQuery || filterStatus !== 'all' ? 'Hasil Pencarian Kosong' : 'Belum Ada Transaksi E-Produk'}
                </h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-8">
                  {searchQuery || filterStatus !== 'all' 
                    ? 'Tidak ada transaksi yang cocok dengan kata kunci atau filter saat ini.' 
                    : 'Anda belum melakukan pembelian e-book atau modul. Histori pembayaran otomatis Anda akan tampil di sini.'}
                </p>
                {searchQuery || filterStatus !== 'all' ? (
                  <button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="px-6 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold rounded-xl transition-all">
                    Reset Pencarian
                  </button>
                ) : (
                  <Link href="/e-products" className="px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                    Lihat Katalog Produk <ArrowUpRight size={16} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6 w-full min-w-0">
                {filteredEProducts.map((trx) => {
                  const s = trx.status?.toLowerCase();
                  const isSuccess = s === 'paid' || s === 'success' || s === 'settled';
                  
                  // 🔥 LOGIKA KEDALUWARSA WAKTU 🔥
                  let isTimeExpired = false;
                  if (trx.expired_time) {
                      isTimeExpired = new Date().getTime() > (Number(trx.expired_time) * 1000);
                  } else {
                      const createdTime = parseSafeDate(trx.created_at).getTime();
                      isTimeExpired = new Date().getTime() > (createdTime + 24 * 60 * 60 * 1000);
                  }
                  
                  const isActuallyUnpaid = (s === 'unpaid' || s === 'pending') && !isTimeExpired;

                  return (
                    <div key={`ep-${trx.id}`} className="bg-white border border-slate-200/80 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(79,70,229,0.1)] hover:border-indigo-200 transition-all duration-300 group flex flex-col sm:flex-row gap-5 md:gap-6 w-full min-w-0">
                      
                      {/* Thumbnail E-Product */}
                      <div className="w-24 sm:w-28 md:w-36 shrink-0 rounded-xl md:rounded-[1.25rem] bg-slate-900 overflow-hidden border border-slate-200 relative shadow-sm flex items-center justify-center p-1.5" style={{ aspectRatio: '2/3' }}>
                        {trx.product?.cover_image ? (
                          <React.Fragment>
                            <div className="absolute inset-0 z-0">
                              <img src={`${STORAGE_URL}/${trx.product.cover_image}`} className="w-full h-full object-cover blur-lg opacity-40 scale-125" alt="blur-bg"/>
                            </div>
                            <img src={`${STORAGE_URL}/${trx.product.cover_image}`} alt={trx.product?.title} className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md" />
                          </React.Fragment>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500"><FileText size={32} strokeWidth={1}/></div>
                        )}
                        <div className="absolute top-2 left-2 z-20 sm:hidden">
                          {getStatusBadge(trx.status, trx.created_at, trx.expired_time)}
                        </div>
                      </div>

                      {/* Detail & Aksi */}
                      <div className="flex-1 flex flex-col justify-center w-full min-w-0">
                        
                        <div className="hidden sm:flex flex-wrap items-center gap-2 mb-3 w-full min-w-0">
                          {getStatusBadge(trx.status, trx.created_at, trx.expired_time)}
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate shrink-0">
                            <Receipt size={12}/> Ref: {trx.reference || `TRX-EP-${trx.id}`}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-widest truncate shrink-0">
                            <CalendarDays size={12}/> {formatDateTime(trx.created_at)}
                          </span>
                        </div>

                        <div className="sm:hidden flex flex-wrap items-center gap-2 mb-2 w-full min-w-0">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0">
                            <Receipt size={12}/> Ref: {trx.reference || `TRX-EP-${trx.id}`}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-black uppercase tracking-widest shrink-0">
                            <CalendarDays size={12}/> {formatDateTime(trx.created_at)}
                          </span>
                        </div>

                        <h3 className="text-base md:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-3 w-full break-words">
                          {trx.product?.title || <span className="italic text-slate-400">Produk tidak tersedia</span>}
                        </h3>

                        {trx.payment_method && (
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-slate-500 mb-4 w-full min-w-0">
                            Metode Bayar: <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider text-[9px] md:text-[10px] border border-slate-200 shrink-0">{trx.payment_method}</span>
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 w-full min-w-0">
                          
                          <div className="flex items-center gap-6 md:gap-8 w-full min-w-0 border-b lg:border-b-0 border-slate-100 pb-3 lg:pb-0">
                             <div className="flex flex-col min-w-0 shrink-0">
                               <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><CreditCard size={12}/> Tagihan Otomatis</span>
                               <span className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight w-full truncate">{formatRupiah(trx.amount)}</span>
                             </div>

                             {isActuallyUnpaid && trx.checkout_url && (
                                <div className="border-l border-slate-200 pl-4 md:pl-6 shrink-0">
                                   <InvoiceCountdown createdAt={trx.created_at} expiredAt={trx.expired_time} />
                                </div>
                             )}
                          </div>

                          <div className="flex gap-2.5 w-full lg:w-auto shrink-0 mt-1 lg:mt-0">
                            {isSuccess ? (
                              <React.Fragment>
                                {trx.checkout_url && (
                                  <a href={trx.checkout_url} target="_blank" rel="noopener noreferrer" className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 md:px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-sm shrink-0 min-w-0">
                                    <ReceiptText size={16} className="text-slate-400 shrink-0" /> <span className="truncate">E-Receipt</span>
                                  </a>
                                )}
                                <Link href={`/e-products/${trx.product?.slug}`} className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-md shadow-indigo-600/20 shrink-0 min-w-0">
                                  <DownloadCloud size={16} className="shrink-0" /> <span className="truncate">Akses Produk</span>
                                </Link>
                              </React.Fragment>
                            ) : isActuallyUnpaid && trx.checkout_url ? (
                              <a href={trx.checkout_url} target="_blank" rel="noopener noreferrer" className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 shrink-0 min-w-0">
                                Lanjutkan Pembayaran <ArrowUpRight size={16} className="shrink-0" />
                              </a>
                            ) : (
                              <div className="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed shrink-0 min-w-0">
                                Waktu Habis / Kedaluwarsa
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* ════ MODAL IMAGE VIEWER ════ */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md w-full min-w-0"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative max-w-xl w-full flex flex-col items-center bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200 min-w-0"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="w-full flex justify-between items-center px-4 py-3 mb-2 border-b border-slate-100 min-w-0">
                <span className="text-[10px] md:text-xs font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest truncate">
                   <ImageIcon size={16} className="text-indigo-500 shrink-0" /> Bukti Pembayaran Manual
                </span>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-500 rounded-xl transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="w-full bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                 <img src={selectedProof || ''} alt="Bukti Transfer" className="w-full max-h-[60vh] object-contain" />
              </div>
              <div className="w-full pt-4 pb-2 px-2 flex justify-end">
                 <a 
                   href={selectedProof || ''} 
                   download 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg min-w-0"
                 >
                   Buka Resolusi Penuh <ArrowUpRight size={16} className="shrink-0" />
                 </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}