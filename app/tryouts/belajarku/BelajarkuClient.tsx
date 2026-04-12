"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Lock, PlayCircle, Clock, ShoppingBag, AlertCircle, FileQuestion } from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // Pastikan path ini benar sesuai struktur folder Mas Prima

export default function BelajarkuClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [myPackages, setMyPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      fetchMyPackages();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMyPackages = async () => {
    try {
      // Menembak endpoint API yang berisi transaksi tryout milik user
      const res = await apiFetch('/tryout/skd/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        // Filter hanya transaksi yang sukses (PAID)
        const paidPackages = json.data.filter((trx: any) => trx.status === 'PAID' && trx.skd_tryout);
        setMyPackages(paidPackages);
      } else {
        setError(json.message || "Gagal memuat data paket belajarku.");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  // Tampilan Loading
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Tampilan JIKA BELUM LOGIN
  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-lg w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Oops, Kamu Belum Login!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Silakan masuk ke akunmu terlebih dahulu untuk melihat dan mengerjakan paket tryout yang sudah kamu miliki.
          </p>
          <Link href="/login" className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            Masuk / Daftar Sekarang
          </Link>
        </motion.div>
      </div>
    );
  }

  // Tampilan JIKA ERROR FETCH DATA
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 flex justify-center text-center">
        <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl max-w-md">
          <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rose-800 mb-2">Gagal Memuat Data</h3>
          <p className="text-sm text-rose-600">{error}</p>
        </div>
      </div>
    );
  }

  // Tampilan JIKA SUDAH LOGIN
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
          <BookOpen className="text-indigo-600" size={32} /> Dashboard Belajarku
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          Daftar paket tryout yang siap kamu kerjakan. Fokus dan berikan yang terbaik!
        </p>
      </div>

      {myPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPackages.map((trx, idx) => {
            const tryout = trx.skd_tryout;
            if (!tryout) return null; // Skip jika data tryout terhapus di backend

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={trx.id} 
                className="bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all flex flex-col"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                    {tryout.category?.name || 'SKD / Kedinasan'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    ID: {trx.merchant_ref}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-4 line-clamp-2">{tryout.title}</h3>
                
                <div className="space-y-2 mb-8 mt-auto">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><FileQuestion size={14} className="text-slate-400" /> Jumlah Soal</span>
                    <span>{tryout.questions_count || 110} Soal</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> Waktu Ujian</span>
                    <span>{tryout.duration_minutes} Menit</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-2"><PlayCircle size={14} className="text-slate-400" /> Mode Tes</span>
                    <span className="text-emerald-600">CBT BKN</span>
                  </div>
                </div>

                <Link 
                  href={`/tryouts/exam/${tryout.slug || tryout.id}`}
                  className="w-full py-3.5 rounded-xl font-black transition-all flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white shadow-md active:scale-95"
                >
                  Mulai Kerjakan
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Belum Ada Paket</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md">Kamu belum memiliki paket tryout yang aktif. Yuk jelajahi katalog dan mulai persiapkan dirimu!</p>
          <Link href="/tryouts/katalog" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Lihat Katalog Tryout
          </Link>
        </div>
      )}
    </div>
  ); 
}