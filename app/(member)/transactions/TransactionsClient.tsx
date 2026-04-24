"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Loader2, CheckCircle2, Clock, 
  XCircle, Eye, Image as ImageIcon, X, 
  ChevronRight, Search, ReceiptText, ArrowUpRight,
  Ticket, FileText, DownloadCloud
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

export default function TransactionsClient() {
  const [eventTransactions, setEventTransactions] = useState<any[]>([]);
  const [eProductTransactions, setEProductTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tab Navigation State ('event' | 'eproduct')
  const [activeTab, setActiveTab] = useState<'event' | 'eproduct'>('event');

  // Modal State
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

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

        // 🔥 FETCH KEDUA DATA SECARA BERSAMAAN 🔥
        const [resEvents, resEProducts] = await Promise.all([
          apiFetch('/my-registrations'),
          apiFetch('/my-e-products')
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

  // 🔥 FUNGSI UNTUK FORMAT TANGGAL + JAM 🔥
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':'); // Mengubah format 14.30 menjadi 14:30
    
    return `${formattedDate} WIB`;
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'verified' || s === 'paid' || s === 'success') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-md text-[10px] font-bold uppercase tracking-wider">
          <CheckCircle2 size={14} /> Berhasil
        </div>
      );
    }
    if (s === 'rejected' || s === 'failed' || s === 'expired') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/50 rounded-md text-[10px] font-bold uppercase tracking-wider">
          <XCircle size={14} /> Gagal / Ditolak
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-md text-[10px] font-bold uppercase tracking-wider">
        <Clock size={14} /> Diproses
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500">Menarik data tagihan Amania Anda...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      
      {/* ════ HEADER SECTION ════ */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0 md:pt-10 md:pb-0">
          <div className="max-w-2xl mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-700 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-3 md:mb-4">
              <ReceiptText size={14} className="md:w-4 md:h-4" /> Tagihan & Pembayaran Amania
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Riwayat Transaksi
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
              Pantau status verifikasi dan akses histori pembelian produk pembelajaran Anda di sini.
            </p>
          </div>

          {/* 🔥 TABS NAVIGATION 🔥 */}
          <div className="flex gap-6 border-b border-slate-200 overflow-x-auto hide-scroll-bar">
            <button 
              onClick={() => setActiveTab('event')}
              className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'event' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Ticket size={16} /> Tiket Event / Kelas
              {activeTab === 'event' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('eproduct')}
              className={`pb-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'eproduct' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileText size={16} /> E-Produk Premium
              {activeTab === 'eproduct' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        
        {/* TAB 1: TRANSAKSI EVENT (WEBINAR/KELAS) */}
        {activeTab === 'event' && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {eventTransactions.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm">
                  <Ticket size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 md:mb-2">Belum Ada Transaksi Event</h3>
                <p className="text-slate-500 text-xs md:text-sm font-medium max-w-sm leading-relaxed mb-6">
                  Anda belum melakukan pendaftaran kelas atau webinar. Transaksi tiket Anda akan muncul di sini.
                </p>
                <Link href="/events" className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-indigo-200">
                  Lihat Katalog Program
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Deskripsi Program</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-right">Total Tagihan</div>
                  <div className="col-span-2 text-right">Aksi</div>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                  {eventTransactions.map((trx) => (
                    <div key={trx.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50/50 transition-colors group">
                      
                      <div className="col-span-1 md:col-span-5 flex flex-col w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            {formatDateTime(trx.created_at)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {trx.ticket_code || `TRX-EVT-${trx.id}`}
                          </span>
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-snug line-clamp-2 md:pr-4 group-hover:text-indigo-600 transition-colors">
                          {trx.event?.title || <span className="italic text-slate-400">Event tidak tersedia</span>}
                        </h3>
                        <div className="mt-1.5 md:mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider border ${trx.tier === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {trx.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}
                          </span>
                        </div>
                      </div>

                      <div className="h-px w-full bg-slate-100 md:hidden my-1"></div>

                      <div className="col-span-1 md:col-span-7 w-full flex flex-row md:grid md:grid-cols-7 items-center justify-between gap-2 md:gap-4">
                        <div className="md:col-span-3 flex items-center shrink-0">
                          {getStatusBadge(trx.status)}
                        </div>

                        <div className="flex items-center gap-3 md:col-span-4 md:grid md:grid-cols-4 md:w-full ml-auto">
                          <div className="md:col-span-2 flex flex-col items-end w-full">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest md:hidden mb-0.5">Total</span>
                            <span className="text-xs md:text-sm font-extrabold text-slate-900 font-mono text-right">
                              {formatRupiah(trx.total_amount)}
                            </span>
                          </div>

                          <div className="md:col-span-2 flex justify-end w-full">
                            {parseFloat(trx.total_amount) > 0 ? (
                              <button 
                                onClick={() => trx.payment_proof ? setSelectedProof(`${STORAGE_URL}/${trx.payment_proof}`) : toast.error("Bukti belum diunggah")}
                                className="inline-flex items-center justify-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] md:text-xs font-semibold transition-colors shadow-sm shrink-0"
                              >
                                {trx.payment_proof ? (
                                  <><Eye size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> <span className="hidden xl:inline">Lihat Bukti</span><span className="xl:hidden">Bukti</span></>
                                ) : (
                                  <><ImageIcon size={12} className="text-slate-300 md:w-3.5 md:h-3.5" /> <span className="hidden xl:inline">Tanpa Bukti</span><span className="xl:hidden">-</span></>
                                )}
                              </button>
                            ) : (
                              <div className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-[10px] md:text-xs font-medium cursor-not-allowed">
                                -
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: TRANSAKSI E-PRODUCT (TRIPAY) */}
        {activeTab === 'eproduct' && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            {eProductTransactions.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm">
                  <FileText size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 md:mb-2">Belum Ada Transaksi E-Produk</h3>
                <p className="text-slate-500 text-xs md:text-sm font-medium max-w-sm leading-relaxed mb-6">
                  Anda belum melakukan pembelian aset digital atau modul. Histori pembayaran otomatis Anda akan tampil di sini.
                </p>
                <Link href="/e-products" className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-lg transition-colors border border-indigo-200">
                  Lihat Katalog E-Produk
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-5">Informasi Produk</div>
                  <div className="col-span-3">Status Tripay</div>
                  <div className="col-span-2 text-right">Total Tagihan</div>
                  <div className="col-span-2 text-right">Aksi</div>
                </div>

                <div className="flex flex-col divide-y divide-slate-100">
                  {eProductTransactions.map((trx) => (
                    <div key={`ep-${trx.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50/50 transition-colors group">
                      
                      <div className="col-span-1 md:col-span-5 flex flex-col w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                            {formatDateTime(trx.created_at)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                            {trx.reference || `TRX-EP-${trx.id}`}
                          </span>
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-snug line-clamp-2 md:pr-4 group-hover:text-indigo-600 transition-colors">
                          {trx.product?.title || <span className="italic text-slate-400">Produk tidak tersedia</span>}
                        </h3>
                        <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider border bg-sky-50 text-sky-700 border-sky-200">
                            Digital Asset
                          </span>
                          {trx.payment_method && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Via {trx.payment_method}</span>
                          )}
                        </div>
                      </div>

                      <div className="h-px w-full bg-slate-100 md:hidden my-1"></div>

                      <div className="col-span-1 md:col-span-7 w-full flex flex-row md:grid md:grid-cols-7 items-center justify-between gap-2 md:gap-4">
                        <div className="md:col-span-3 flex items-center shrink-0">
                          {getStatusBadge(trx.status)}
                        </div>

                        <div className="flex items-center gap-3 md:col-span-4 md:grid md:grid-cols-4 md:w-full ml-auto">
                          <div className="md:col-span-2 flex flex-col items-end w-full">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest md:hidden mb-0.5">Total</span>
                            <span className="text-xs md:text-sm font-extrabold text-slate-900 font-mono text-right">
                              {formatRupiah(trx.amount)}
                            </span>
                          </div>

                          <div className="md:col-span-2 flex justify-end w-full gap-2">
                            {trx.status === 'PAID' || trx.status === 'success' || trx.status === 'verified' ? (
                              <>
                                {/* 🔥 TOMBOL E-RECEIPT 🔥 */}
                                {trx.checkout_url && (
                                  <a 
                                    href={trx.checkout_url} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[10px] md:text-xs font-bold transition-colors shadow-sm shrink-0"
                                    title="Lihat Struk Pembayaran"
                                  >
                                    <ReceiptText size={14} /> <span className="hidden xl:inline">E-Receipt</span>
                                  </a>
                                )}
                                
                                <Link 
                                  href={`/e-products/${trx.product?.slug}`}
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] md:text-xs font-bold transition-colors shadow-sm shadow-indigo-600/20 shrink-0"
                                >
                                  <DownloadCloud size={14} /> Akses
                                </Link>
                              </>
                            ) : trx.checkout_url && trx.status !== 'EXPIRED' ? (
                               <a 
                                 href={trx.checkout_url} target="_blank" rel="noopener noreferrer"
                                 className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] md:text-xs font-bold transition-colors shadow-sm shadow-amber-500/20 shrink-0"
                               >
                                 Bayar Sekarang
                               </a>
                            ) : (
                               <div className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-lg text-[10px] md:text-xs font-medium cursor-not-allowed">
                                -
                               </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* ════ MODAL IMAGE VIEWER (BUKTI TRANSFER EVENT) ════ */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }}
              className="relative max-w-xl w-full flex flex-col items-center bg-white p-2 rounded-xl md:rounded-2xl shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="w-full flex justify-between items-center p-2 mb-1 md:mb-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider ml-2">Bukti Pembayaran</span>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="p-1 md:p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                >
                  <X size={16} className="md:w-4 md:h-4" />
                </button>
              </div>
              <div className="w-full bg-slate-50 rounded-lg md:rounded-xl overflow-hidden border border-slate-100">
                 <img src={selectedProof} alt="Bukti Transfer" className="w-full max-h-[60vh] md:max-h-[70vh] object-contain" />
              </div>
              <div className="w-full p-3 md:p-4 flex justify-end">
                 <a 
                   href={selectedProof} 
                   download 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-slate-900 text-white rounded-lg text-[10px] md:text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
                 >
                   Buka Resolusi Penuh <ArrowUpRight size={14} className="md:w-3.5 md:h-3.5" />
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