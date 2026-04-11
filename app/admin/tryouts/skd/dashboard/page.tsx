"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, BookOpen, Users, FileQuestion, 
  TrendingUp, Clock, Award, ArrowRight, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

export default function SkdTryoutDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_packages: 0,
    total_questions: 0,
    total_attempts: 0,
    passing_rate: '0%'
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/dashboard'); 
      const json = await res.json();
      if (res.ok && json.success) {
        setStats({
          total_packages: json.tryout_stats?.packages_count || 0,
          total_questions: json.tryout_stats?.questions_count || 0,
          total_attempts: json.tryout_stats?.attempts_count || 0,
          passing_rate: json.tryout_stats?.passing_rate || '0%',
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // LINK SUDAH DISESUAIKAN KE PATH BARU: /admin/tryouts/skd/...
  const STAT_CARDS = [
    { title: 'Total Sesi Ujian (Tryout)', value: stats.total_packages, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/admin/tryouts/skd/manage' },
    { title: 'Total Bank Soal', value: stats.total_questions, icon: FileQuestion, color: 'text-rose-600', bg: 'bg-rose-50', link: '/admin/tryouts/skd/questions' },
    { title: 'Total Pengerjaan User', value: stats.total_attempts, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', link: '/admin/tryouts/skd/results' },
    { title: 'Rata-rata Kelulusan', value: stats.passing_rate, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/tryouts/skd/results' },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Dashboard Evaluasi SKD</h1>
          <p className="text-slate-500 font-medium text-sm">
            Ringkasan statistik sistem Computer Based Test (CBT) Amania.
          </p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-2.5 text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl transition-all shadow-sm"
        >
          <ActivityIcon className={loading ? "animate-spin" : ""} size={20} />
        </button>
      </div>

      {/* STATISTIK CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STAT_CARDS.map((stat, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            key={stat.title} 
            className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800 mb-1">
                {loading ? "..." : stat.value}
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.title}</p>
            </div>
            
            <Link href={stat.link} className="absolute inset-x-0 bottom-0 bg-slate-50 border-t border-slate-100 py-2.5 px-6 flex items-center justify-between opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Lihat Detail</span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* LOWER CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Aktivitas Ujian Terbaru</h3>
              <p className="text-xs font-medium text-slate-500">Log pengerjaan peserta secara real-time.</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
            {loading ? (
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            ) : (
              <>
                <Clock size={32} className="text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">Belum ada aktivitas ujian yang tercatat</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-indigo-600 rounded-[2rem] shadow-xl shadow-indigo-200 p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <Target size={140} className="absolute -bottom-8 -right-8 text-indigo-500/40 rotate-12" />
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-3 leading-tight">Kelola Bank<br/>Soal SKD</h3>
            <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-90">
              Update materi TWK, TIU, dan TKP secara berkala untuk menjaga kualitas tryout peserta.
            </p>
          </div>
          
          {/* LINK SUDAH DISESUAIKAN KE PATH BARU */}
          <Link href="/admin/tryouts/skd/questions" className="relative z-10 bg-white text-indigo-700 px-6 py-3.5 rounded-xl font-black text-sm text-center shadow-lg hover:bg-slate-50 transition-all active:scale-95">
            Buka Bank Soal
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
    </svg>
  );
}