"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Loader2, CheckCircle2, Clock, 
  XCircle, Eye, Image as ImageIcon, X, 
  ChevronRight, Search, ReceiptText, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk modal bukti transfer
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // 🔗 AMBIL STORAGE URL DARI .ENV
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

        // 🔥 PENGGUNAAN APIFETCH 🔥
        const res = await apiFetch('/my-registrations');
        const json = await res.json();
        
        if (res.ok && json.success) {
          setTransactions(json.data);
        }
      } catch (error) {
        toast.error("Gagal memuat data transaksi");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500">Menarik data tagihan Amania Anda...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-700 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-3 md:mb-4">
              <ReceiptText size={14} className="md:w-4 md:h-4" /> Tagihan & Pembayaran Amania
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Riwayat Transaksi
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
              Pantau seluruh riwayat pendaftaran kelas, status verifikasi pembayaran, dan unduh bukti transaksi Anda di sini.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
        
        {transactions.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 border border-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 md:mb-5 shadow-sm">
              <Receipt size={24} className="md:w-8 md:h-8" strokeWidth={1.5} />
            </div>
            <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 md:mb-2">Belum Ada Transaksi</h3>
            <p className="text-slate-500 text-xs md:text-sm font-medium max-w-sm md:mb-8 leading-relaxed">
              Anda belum melakukan pendaftaran atau pembelian kelas. Transaksi Anda akan muncul di sini.
            </p>
          </div>
        ) : (
          /* TRANSACTION LIST */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Table Header (Hidden on Mobile) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Deskripsi Program</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Total Tagihan</div>
              <div className="col-span-2 text-right">Aksi</div>
            </div>

            {/* Table Rows */}
            <div className="flex flex-col divide-y divide-slate-100">
              <AnimatePresence>
                {transactions.map((trx, idx) => {
                  const isPaid = parseFloat(trx.total_amount) > 0;

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                      key={trx.id} 
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center px-4 md:px-6 py-4 md:py-5 hover:bg-slate-50/50 transition-colors group"
                    >
                      
                      {/* DESKRIPSI */}
                      <div className="col-span-1 md:col-span-5 flex flex-col w-full">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            {new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[9px] md:text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                            {trx.ticket_code || `TRX-${trx.id}`}
                          </span>
                        </div>
                        <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-snug line-clamp-2 md:pr-4 group-hover:text-indigo-600 transition-colors">
                          {trx.event?.title || <span className="italic text-slate-400">Event tidak tersedia</span>}
                        </h3>
                        <div className="mt-1.5 md:mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-wider border ${
                            trx.tier === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {trx.tier === 'premium' ? 'VIP Access' : 'Basic Pass'}
                          </span>
                        </div>
                      </div>

                      {/* Divider for Mobile */}
                      <div className="h-px w-full bg-slate-100 md:hidden my-1"></div>

                      {/* STATUS, TAGIHAN & AKSI DIBUAT FLEX HORIZONTAL DI MOBILE */}
                      <div className="col-span-1 md:col-span-7 w-full flex flex-row md:grid md:grid-cols-7 items-center justify-between gap-2 md:gap-4">
                        
                        {/* STATUS */}
                        <div className="md:col-span-3 flex items-center shrink-0">
                          <div className={`inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[11px] font-semibold border ${
                            trx.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                            trx.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200/50' :
                            'bg-amber-50 text-amber-700 border-amber-200/50'
                          }`}>
                            {trx.status === 'verified' && <CheckCircle2 size={12} className="md:w-3.5 md:h-3.5" />}
                            {trx.status === 'rejected' && <XCircle size={12} className="md:w-3.5 md:h-3.5" />}
                            {trx.status === 'pending' && <Clock size={12} className="md:w-3.5 md:h-3.5" />}
                            <span className="uppercase tracking-wider">
                              {trx.status === 'verified' ? 'Berhasil' : trx.status === 'rejected' ? 'Ditolak' : 'Diproses'}
                            </span>
                          </div>
                        </div>

                        {/* TOTAL TAGIHAN & AKSI UNTUK DESKTOP (Di Mobile Menyesuaikan Flex) */}
                        <div className="flex items-center gap-3 md:col-span-4 md:grid md:grid-cols-4 md:w-full ml-auto">
                          {/* TOTAL TAGIHAN */}
                          <div className="md:col-span-2 flex flex-col items-end w-full">
                            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest md:hidden mb-0.5">Total</span>
                            <span className="text-xs md:text-sm font-extrabold text-slate-900 font-mono text-right">
                              {isPaid ? `Rp ${parseFloat(trx.total_amount).toLocaleString('id-ID')}` : 'Gratis'}
                            </span>
                          </div>

                          {/* AKSI BUKTI */}
                          <div className="md:col-span-2 flex justify-end w-full">
                            {isPaid ? (
                              <button 
                                onClick={() => trx.payment_proof ? setSelectedProof(`${STORAGE_URL}/${trx.payment_proof}`) : toast.error("Bukti belum diunggah")}
                                className="inline-flex items-center justify-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] md:text-xs font-semibold transition-colors shadow-sm shrink-0"
                              >
                                {trx.payment_proof ? (
                                  <><Eye size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Lihat Bukti</span><span className="sm:hidden">Bukti</span></>
                                ) : (
                                  <><ImageIcon size={12} className="text-slate-300 md:w-3.5 md:h-3.5" /> <span className="hidden sm:inline">Tanpa Bukti</span></>
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

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* MODAL IMAGE VIEWER */}
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

    </div>
  );
}