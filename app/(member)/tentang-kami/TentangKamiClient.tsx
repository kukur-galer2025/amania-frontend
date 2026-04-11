"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, Target, ShoppingCart, CheckCircle2, ShieldCheck, Zap
} from 'lucide-react';
import Link from 'next/link';

export default function TentangKamiClient() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-16 md:pb-24 selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      
      {/* Background Pattern Lembut */}
      <div className="absolute inset-0 z-0 pointer-events-none h-[400px] md:h-[600px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-[-10%] w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-indigo-500/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 lg:pt-24 space-y-16 md:space-y-24">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 md:space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={10} className="md:w-3 md:h-3 text-indigo-500" /> Tentang Kami
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Satu Platform Untuk <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Semua Kebutuhan Belajar</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-base lg:text-lg text-slate-500 font-medium leading-relaxed px-2 sm:px-0">
            Amania hadir sebagai solusi cerdas untuk meningkatkan kompetensi Anda. Melalui ekosistem digital terintegrasi, kami berkomitmen menghubungkan Anda dengan materi berkualitas dan simulasi persiapan karir terbaik.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* 2. LAYANAN UTAMA KAMI (SERVICE CARDS) */}
        {/* ========================================================================= */}
        <div>
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 md:mb-4">Layanan Unggulan Amania</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium px-4 sm:px-0">Kami menyediakan tiga pilar layanan utama untuk akselerasi karir Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            
            {/* Layanan 1: Event & Webinar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(99,102,241,0.15)] hover:border-indigo-200 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Rocket size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3">Event & Webinar</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                Ikuti kelas interaktif langsung bersama mentor berpengalaman. Cocok untuk Anda yang ingin belajar secara *real-time* dan berdiskusi langsung dengan praktisi.
              </p>
              <Link href="/events" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 uppercase tracking-widest">
                Lihat Katalog <Sparkles size={14}/>
              </Link>
            </motion.div>

            {/* Layanan 2: Tryout SKD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(249,115,22,0.15)] hover:border-orange-200 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Badge Populer */}
              <div className="absolute top-5 right-5 bg-orange-100 text-orange-600 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">Unggulan</div>

              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-6 border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                <Target size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3">Simulasi Tryout</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                Sistem simulasi ujian dengan standar *Computer Assisted Test* (CAT) BKN. Dilengkapi soal HOTS terbaru, *timer* akurat, dan skoring/perankingan skala nasional.
              </p>
              <Link href="/tryouts" className="text-sm font-bold text-orange-500 hover:text-orange-700 flex items-center gap-1.5 uppercase tracking-widest">
                Mulai Ujian <Sparkles size={14}/>
              </Link>
            </motion.div>

            {/* Layanan 3: E-Product */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.15)] hover:border-emerald-200 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                <ShoppingCart size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3">Produk Digital</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                Dapatkan akses instan ke berbagai produk digital premium seperti E-Book ringkasan materi, modul belajar intensif, dan rekaman video eksklusif.
              </p>
              <Link href="/e-products" className="text-sm font-bold text-emerald-500 hover:text-emerald-700 flex items-center gap-1.5 uppercase tracking-widest">
                Beli Produk <Sparkles size={14}/>
              </Link>
            </motion.div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. KENAPA MEMILIH KAMI */}
        {/* ========================================================================= */}
        <div className="bg-[#0B0F19] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 lg:p-16 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 md:gap-16 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Dirancang Untuk Memaksimalkan Potensi Anda
              </h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                Kami memastikan setiap layanan di platform Amania tidak hanya sekadar transaksi, melainkan sebuah investasi cerdas untuk masa depan karir Anda.
              </p>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <ShieldCheck size={24} className="text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Transaksi Aman & Otomatis</h4>
                  <p className="text-xs text-slate-400">Didukung oleh Tripay Payment Gateway, transaksi langsung diverifikasi oleh sistem dalam hitungan detik.</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <Zap size={24} className="text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Akses Instan 24/7</h4>
                  <p className="text-xs text-slate-400">Tidak perlu menunggu admin. Produk digital dan Tryout langsung bisa diakses kapan saja dan di mana saja.</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <CheckCircle2 size={24} className="text-orange-400 shrink-0" />
                <div>
                  <h4 className="text-white font-bold mb-1">Materi Relevan & Terbaru</h4>
                  <p className="text-xs text-slate-400">Semua modul dan bank soal disusun oleh ahlinya serta di-update secara berkala sesuai kurikulum BKN terbaru.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}