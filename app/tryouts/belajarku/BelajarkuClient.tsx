"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Lock, PlayCircle, Clock, ShoppingBag, AlertCircle, FileQuestion, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; 

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
      const res = await apiFetch('/tryout/skd/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        // Filter: Hanya yang status PAID dan datanya masih ada di DB
        const paidPackages = json.data.filter((trx: any) => 
          trx.status === 'PAID' && (trx.tryout || trx.skd_tryout)
        );
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

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center text-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-lg w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mb-6">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-3">Akses Dibatasi</h2>
          <p className="text-slate-500 font-medium mb-8">
            Silakan masuk ke akunmu terlebih dahulu untuk melihat dan mengerjakan paket tryout milikmu.
          </p>
          <Link href="/login" className="w-full py-4 bg-slate-900 hover:bg-sky-600 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            Masuk / Daftar Sekarang
          </Link>
        </motion.div>
      </div>
    );
  }

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
            <BookOpen className="text-sky-600" size={32} /> Dashboard Belajarku
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Daftar paket tryout yang siap kamu kerjakan. Fokus dan berikan yang terbaik!
          </p>
        </div>

        {myPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPackages.map((trx, idx) => {
              // Menangani perbedaan nama relasi dari API
              const tryout = trx.tryout || trx.skd_tryout;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                  key={trx.id} 
                  className="bg-white rounded-[2rem] border border-slate-200 hover:border-sky-300 hover:shadow-xl transition-all flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6 flex flex-col h-full">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-sky-100">
                        {tryout?.category?.name || 'SKD CPNS'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">
                        {trx.merchant_ref}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-6 line-clamp-2 group-hover:text-sky-600 transition-colors">
                      {tryout?.title || 'Paket Tryout'}
                    </h3>
                    
                    <div className="space-y-2 mb-8 mt-auto">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-2"><FileQuestion size={14} className="text-slate-400" /> Total Soal</span>
                        <span className="text-slate-900">{tryout?.questions_count || 110} Butir</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-2"><Clock size={14} className="text-slate-400" /> Waktu Ujian</span>
                        <span className="text-slate-900">{tryout?.duration_minutes || 100} Menit</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                        <span className="flex items-center gap-2"><PlayCircle size={14} className="text-emerald-500" /> Mode Ujian</span>
                        <span className="text-emerald-600 font-black">CAT BKN</span>
                      </div>
                    </div>

                    {/* 🔥 LINK DIARAHKAN KE PLAYER CBT 🔥 */}
                    <Link 
                      href={`/tryouts/play/${tryout?.slug || tryout?.id}`}
                      className="w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 bg-slate-900 hover:bg-sky-600 text-white shadow-lg shadow-slate-900/10 active:scale-95 text-sm uppercase tracking-wider"
                    >
                      Mulai Mengerjakan <ChevronRight size={18} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Belum Ada Paket</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md leading-relaxed">
              Kamu belum memiliki paket tryout yang aktif. Yuk jelajahi katalog dan mulai persiapan seleksi kamu dari sekarang!
            </p>
            <Link href="/tryouts/katalog" className="px-10 py-4 bg-sky-600 text-white rounded-2xl font-black hover:bg-sky-700 transition-all shadow-xl shadow-sky-600/30 active:scale-95 flex items-center gap-2">
              Jelajahi Katalog Tryout <ChevronRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </div>
  ); 
}