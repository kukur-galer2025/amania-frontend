"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Loader2, CheckCircle2, Clock, 
  XCircle, Eye, Image as ImageIcon, X, 
  Search, ReceiptText, ArrowUpRight,
  Ticket, FileText, DownloadCloud, CalendarDays, Hash, CreditCard, ShieldAlert
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\./g, ':'); 
    return `${formattedDate} WIB`;
  };

  // 🔥 DESAIN BADGE STATUS BARU 🔥
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'verified' || s === 'paid' || s === 'success') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
          <CheckCircle2 size={12} className="text-emerald-500" /> Berhasil
        </div>
      );
    }
    if (s === 'rejected' || s === 'failed' || s === 'expired') {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
          <XCircle size={12} className="text-rose-500" /> Gagal
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm">
        <Clock size={12} className="text-amber-500 animate-pulse" /> Diproses
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
      <span className="text-sm font-bold text-slate-500 tracking-wide">Sinkronisasi Data Tagihan...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      
      {/* ════ HEADER SECTION ════ */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0 md:pt-12 md:pb-0">
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
          <div className="flex gap-8 border-b border-slate-200 overflow-x-auto hide-scroll-bar">
            <button 
              onClick={() => setActiveTab('event')}
              className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'event' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Ticket size={18} className={activeTab === 'event' ? 'text-indigo-500' : ''} /> Tiket Event & Kelas
              {activeTab === 'event' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('eproduct')}
              className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap flex items-center gap-2 ${activeTab === 'eproduct' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileText size={18} className={activeTab === 'eproduct' ? 'text-indigo-500' : ''} /> E-Produk Premium
              {activeTab === 'eproduct' && <motion.div layoutId="activeTabTrx" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>
        </div>
      </div>

      {/* ════ MAIN CONTENT ════ */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10">
        
        {/* TAB 1: TRANSAKSI EVENT (WEBINAR/KELAS) */}
        {activeTab === 'event' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {eventTransactions.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Ticket size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Belum Ada Transaksi Event</h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-8">
                  Anda belum melakukan pendaftaran kelas atau webinar. Temukan program menarik di katalog kami.
                </p>
                <Link href="/events" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                  Cari Kelas Sekarang
                </Link>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {eventTransactions.map((trx) => (
                  <div key={trx.id} className="bg-white border border-slate-200/80 rounded-[1.5rem] p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group flex flex-col sm:flex-row gap-5">
                    
                    {/* Kiri: Thumbnail Event */}
                    <div className="w-full sm:w-36 md:w-48 shrink-0 rounded-[1rem] bg-slate-100 overflow-hidden border border-slate-200/80 relative shadow-sm aspect-video sm:aspect-[4/3] md:aspect-video">
                      {trx.event?.image ? (
                        <img src={`${STORAGE_URL}/${trx.event.image}`} alt={trx.event?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><Ticket size={32} strokeWidth={1} /></div>
                      )}
                      <div className="absolute top-2 left-2 sm:hidden">
                        {getStatusBadge(trx.status)}
                      </div>
                    </div>

                    {/* Kanan: Detail & Aksi */}
                    <div className="flex-1 flex flex-col">
                      <div className="hidden sm:flex flex-wrap gap-2 mb-2.5">
                        {getStatusBadge(trx.status)}
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest"><Hash size={12}/> {trx.ticket_code || `TRX-EVT-${trx.id}`}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest"><CalendarDays size={12}/> {formatDateTime(trx.created_at)}</span>
                      </div>
                      
                      <div className="sm:hidden flex flex-wrap gap-2 mb-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-widest"><Hash size={12}/> {trx.ticket_code || `TRX-EVT-${trx.id}`}</span>
                      </div>

                      <h3 className="text-base md:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-2">
                        {trx.event?.title || <span className="italic text-slate-400">Event tidak tersedia</span>}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4">
                        Kategori: <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${trx.tier === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{trx.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}</span>
                      </div>

                      {/* Area Harga & Tombol */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5"><CreditCard size={12} /> Total Pembayaran</span>
                          <span className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {formatRupiah(trx.total_amount)}
                          </span>
                        </div>

                        <div className="flex w-full sm:w-auto">
                          {parseFloat(trx.total_amount) > 0 ? (
                            <button 
                              onClick={() => trx.payment_proof ? setSelectedProof(`${STORAGE_URL}/${trx.payment_proof}`) : toast.error("Bukti belum diunggah")}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-md"
                            >
                              {trx.payment_proof ? (
                                <><Eye size={16} /> Lihat Bukti Transfer</>
                              ) : (
                                <><ShieldAlert size={16} className="text-rose-400" /> Belum Upload Bukti</>
                              )}
                            </button>
                          ) : (
                            <div className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-xs md:text-sm font-bold">
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

        {/* TAB 2: TRANSAKSI E-PRODUCT (TRIPAY) 🔥 KINI DENGAN COVER PRODUK 🔥 */}
        {activeTab === 'eproduct' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {eProductTransactions.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-12 md:p-20 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Belum Ada Transaksi E-Produk</h3>
                <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed mb-8">
                  Anda belum melakukan pembelian e-book atau modul. Histori pembayaran otomatis Anda akan tampil di sini.
                </p>
                <Link href="/e-products" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20">
                  Lihat Katalog Produk
                </Link>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {eProductTransactions.map((trx) => (
                  <div key={`ep-${trx.id}`} className="bg-white border border-slate-200/80 rounded-[1.5rem] p-4 md:p-6 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group flex flex-col sm:flex-row gap-5 md:gap-6">
                    
                    {/* Kiri: Thumbnail Cover E-Product */}
                    <div className="w-24 sm:w-28 md:w-32 shrink-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 relative shadow-sm" style={{ aspectRatio: '2/3' }}>
                      {trx.product?.cover_image ? (
                        <img src={`${STORAGE_URL}/${trx.product.cover_image}`} alt={trx.product?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50"><FileText size={32} strokeWidth={1}/></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent pointer-events-none"></div>
                      
                      {/* Status untuk mobile diletakkan di dalam cover */}
                      <div className="absolute top-2 left-2 sm:hidden">
                        {getStatusBadge(trx.status)}
                      </div>
                    </div>

                    {/* Kanan: Detail & Aksi */}
                    <div className="flex-1 flex flex-col justify-center">
                      
                      <div className="hidden sm:flex flex-wrap gap-2 mb-2.5">
                        {getStatusBadge(trx.status)}
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                          <Receipt size={12}/> Ref: {trx.reference || `TRX-EP-${trx.id}`}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest">
                          <CalendarDays size={12}/> {formatDateTime(trx.created_at)}
                        </span>
                      </div>

                      <div className="sm:hidden flex flex-wrap gap-2 mb-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[9px] font-bold uppercase tracking-widest">
                          <Receipt size={12}/> Ref: {trx.reference || `TRX-EP-${trx.id}`}
                        </span>
                      </div>

                      <h3 className="text-base md:text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight mb-2">
                        {trx.product?.title || <span className="italic text-slate-400">Produk tidak tersedia</span>}
                      </h3>

                      {trx.payment_method && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-4">
                          Metode Bayar: <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px] border border-slate-200">{trx.payment_method}</span>
                        </div>
                      )}

                      {/* Area Harga & Tombol */}
                      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1"><CreditCard size={12}/> Tagihan Tripay</span>
                          <span className="text-lg md:text-2xl font-black text-slate-900 font-mono tracking-tight">{formatRupiah(trx.amount)}</span>
                        </div>

                        <div className="flex gap-2.5 w-full sm:w-auto">
                          {trx.status === 'PAID' || trx.status === 'success' || trx.status === 'verified' ? (
                            <>
                              {trx.checkout_url && (
                                <a href={trx.checkout_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm">
                                  <ReceiptText size={16} className="text-slate-400" /> <span className="hidden xl:inline">E-Receipt</span>
                                </a>
                              )}
                              <Link href={`/e-products/${trx.product?.slug}`} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-md shadow-indigo-600/20">
                                <DownloadCloud size={16} /> Akses Produk
                              </Link>
                            </>
                          ) : trx.checkout_url && trx.status !== 'EXPIRED' ? (
                            <a href={trx.checkout_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs md:text-sm font-black transition-all shadow-lg shadow-amber-500/20">
                              Bayar Sekarang <ArrowUpRight size={16} />
                            </a>
                          ) : (
                            <div className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 bg-slate-50 border border-slate-200 text-slate-400 rounded-xl text-xs md:text-sm font-bold cursor-not-allowed">
                              Kedaluwarsa
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

      </div>

      {/* ════ MODAL IMAGE VIEWER (BUKTI TRANSFER EVENT) ════ */}
      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="relative max-w-xl w-full flex flex-col items-center bg-white p-3 rounded-[2rem] shadow-2xl border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="w-full flex justify-between items-center px-3 py-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                   <ImageIcon size={16} className="text-indigo-500" /> BUKTI PEMBAYARAN
                </span>
                <button 
                  onClick={() => setSelectedProof(null)}
                  className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-500 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="w-full bg-slate-100 rounded-2xl overflow-hidden">
                 <img src={selectedProof} alt="Bukti Transfer" className="w-full max-h-[65vh] object-contain" />
              </div>
              <div className="w-full pt-4 pb-1 px-1 flex justify-end">
                 <a 
                   href={selectedProof} 
                   download 
                   target="_blank"
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg"
                 >
                   Buka Resolusi Penuh <ArrowUpRight size={16} />
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