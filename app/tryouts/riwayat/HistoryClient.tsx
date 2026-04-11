"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { History, Lock, FileText, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

export default function HistoryClient() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<any[]>([]);

  useEffect(() => {
    // Cek status login dari localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      // Simulasi fetch data history nilai
      setTimeout(() => {
        setHistoryData([
          { 
            id: 101, 
            title: 'Master SKD CPNS 2026 - All In One', 
            date: '8 Apr 2026, 14:30 WIB', 
            scores: { twk: 95, tiu: 125, tkp: 185 }, 
            total: 405, 
            status: 'LULUS',
            passing_grade: { twk: 65, tiu: 80, tkp: 166 }
          },
          { 
            id: 102, 
            title: 'Tryout SKD Pemanasan (Gratis)', 
            date: '5 Apr 2026, 09:15 WIB', 
            scores: { twk: 60, tiu: 85, tkp: 170 }, 
            total: 315, 
            status: 'TIDAK LULUS',
            passing_grade: { twk: 65, tiu: 80, tkp: 166 } // TWK tidak memenuhi PG
          },
        ]);
        setLoading(false);
      }, 600);
    } else {
      setLoading(false);
    }
  }, []);

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
          <h2 className="text-2xl font-black text-slate-900 mb-3">Login Untuk Melihat Nilai</h2>
          <p className="text-slate-500 font-medium mb-8">
            Riwayat pengerjaan, grafik perkembangan, dan pembahasan detail hanya tersedia untuk pengguna yang sudah masuk.
          </p>
          <Link href="/login" className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            Masuk / Daftar Sekarang
          </Link>
        </motion.div>
      </div>
    );
  }

  // Tampilan JIKA SUDAH LOGIN
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3 mb-2">
            <History className="text-indigo-600" size={32} /> History Nilai
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            Evaluasi hasil pengerjaanmu untuk mengatur strategi belajar selanjutnya.
          </p>
        </div>
      </div>

      {historyData.length > 0 ? (
        <div className="flex flex-col gap-6">
          {historyData.map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              key={item.id} 
              className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header Card */}
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-1">{item.date}</p>
                  <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                </div>
                <div className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 self-start md:self-auto ${
                  item.status === 'LULUS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  {item.status === 'LULUS' ? <CheckCircle2 size={18} /> : <XCircle size={18} />} 
                  {item.status} PASSING GRADE
                </div>
              </div>

              {/* Body Card - Breakdown Nilai */}
              <div className="p-6 md:p-8 bg-slate-50/50 flex flex-col lg:flex-row gap-6 items-center">
                
                {/* Rincian Skor TWK, TIU, TKP */}
                <div className="grid grid-cols-3 gap-4 flex-1 w-full">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TWK (PG: {item.passing_grade.twk})</p>
                    <p className={`text-2xl font-black ${item.scores.twk >= item.passing_grade.twk ? 'text-slate-900' : 'text-rose-500'}`}>
                      {item.scores.twk}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TIU (PG: {item.passing_grade.tiu})</p>
                    <p className={`text-2xl font-black ${item.scores.tiu >= item.passing_grade.tiu ? 'text-slate-900' : 'text-rose-500'}`}>
                      {item.scores.tiu}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">TKP (PG: {item.passing_grade.tkp})</p>
                    <p className={`text-2xl font-black ${item.scores.tkp >= item.passing_grade.tkp ? 'text-slate-900' : 'text-rose-500'}`}>
                      {item.scores.tkp}
                    </p>
                  </div>
                </div>

                {/* Total Skor & Tombol Pembahasan */}
                <div className="flex flex-col sm:flex-row items-center gap-6 lg:border-l lg:border-slate-200 lg:pl-8 w-full lg:w-auto">
                  <div className="text-center lg:text-left">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Skor</p>
                    <p className="text-4xl font-black text-indigo-600">{item.total}</p>
                  </div>
                  <Link 
                    href={`/tryouts/history/${item.id}/pembahasan`}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <FileText size={18} /> Lihat Pembahasan
                  </Link>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-center text-center mt-8">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
            <TrendingUp size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Belum Ada Riwayat</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md">Kamu belum menyelesaikan tryout apapun. Kerjakan tryout pertamamu di Dashboard Belajarku untuk melihat analisismu di sini!</p>
          <Link href="/tryouts/belajarku" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Ke Dashboard Belajarku
          </Link>
        </div>
      )}
    </div>
  );
}