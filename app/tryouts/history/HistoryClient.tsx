"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Receipt, Lock, AlertCircle, CheckCircle2, 
  XCircle, Clock, CreditCard, ChevronRight, ExternalLink 
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // Sesuaikan path jika berbeda

export default function HistoryClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await apiFetch('/tryout/skd/transactions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setTransactions(json.data);
      } else {
        setError(json.message || "Gagal memuat data riwayat transaksi.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }) + ' WIB';
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Tampilan Loading
  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Tampilan JIKA BELUM LOGIN
  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-lg w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Akses Dibatasi</h2>
          <p className="text-slate-500 font-medium mb-8">
            Silakan masuk ke akunmu terlebih dahulu untuk melihat riwayat transaksi pembelian paket tryout.
          </p>
          <Link href="/login" className="w-full py-4 bg-slate-900 hover:bg-sky-600 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            Masuk / Daftar Sekarang
          </Link>
        </motion.div>
      </div>
    );
  }

  // Tampilan JIKA ERROR FETCH DATA
  if (error) {
    return (
      <div className="w-full min-h-[70vh] bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl max-w-md">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rose-800 mb-2">Gagal Memuat Data</h3>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
            <Receipt className="text-sky-600" size={32} /> Riwayat Transaksi
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Pantau status pembayaran dan riwayat pembelian paket tryout Amania milikmu.
          </p>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-4 md:space-y-6">
            {transactions.map((trx, idx) => {
              const isPaid = trx.status === 'PAID';
              const isUnpaid = trx.status === 'UNPAID';
              const isFailed = trx.status === 'FAILED' || trx.status === 'EXPIRED';
              
              // 🔥 PERBAIKAN: Menangkap object tryout dari Laravel yang bernama `tryout` 
              // (Berdasarkan relasi di SkdTransaction.php: public function tryout() {})
              const tryoutData = trx.tryout || trx.skd_tryout; 
              const hasTryout = !!tryoutData;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  key={trx.id} 
                  className={`bg-white rounded-[2rem] border overflow-hidden transition-all hover:shadow-lg ${
                    isPaid ? 'border-emerald-100 hover:border-emerald-300' : 
                    isUnpaid ? 'border-orange-100 hover:border-orange-300' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Bagian Header Card */}
                  <div className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                    isPaid ? 'bg-emerald-50/50 border-emerald-100' : 
                    isUnpaid ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        {trx.merchant_ref}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                        <Clock size={12} /> {formatDate(trx.created_at)}
                      </span>
                    </div>

                    {/* Badge Status */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest w-fit ${
                      isPaid ? 'bg-emerald-100 text-emerald-700' : 
                      isUnpaid ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isPaid && <CheckCircle2 size={14} />}
                      {isUnpaid && <Clock size={14} />}
                      {isFailed && <XCircle size={14} />}
                      {trx.status}
                    </div>
                  </div>

                  {/* Bagian Body Card */}
                  <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className={`text-lg md:text-xl font-black mb-2 ${hasTryout ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {hasTryout ? tryoutData.title : 'Paket Tryout (Telah Dihapus)'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500">
                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <CreditCard size={16} className="text-sky-500" /> {trx.payment_name || trx.payment_method || 'Transfer'}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span className="text-lg font-black text-slate-900">
                          {formatRupiah(trx.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="w-full md:w-auto shrink-0 flex flex-col gap-2">
                      {isUnpaid && trx.checkout_url && (
                        <a 
                          href={trx.checkout_url} target="_blank" rel="noopener noreferrer"
                          className="w-full md:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2"
                        >
                          Lanjutkan Pembayaran <ExternalLink size={16} />
                        </a>
                      )}
                      
                      {isPaid && hasTryout && (
                        <Link 
                          href={`/tryouts/belajarku`}
                          className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-sky-600 text-white text-sm font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                          Mulai Belajar <ChevronRight size={16} />
                        </Link>
                      )}

                      {(!hasTryout || isFailed) && (
                        <button disabled className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-400 text-sm font-black rounded-xl cursor-not-allowed border border-slate-200">
                          Transaksi Batal
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
              <Receipt size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Belum Ada Transaksi</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md">
              Kamu belum pernah melakukan pembelian paket tryout apapun. Yuk mulai persiapanmu dari sekarang!
            </p>
            <Link href="/tryouts/katalog" className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-black hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/30 active:scale-95 flex items-center gap-2">
              Jelajahi Katalog Tryout <ChevronRight size={18} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}