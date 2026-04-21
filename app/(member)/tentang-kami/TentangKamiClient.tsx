"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Rocket, ShoppingCart, CheckCircle2, ShieldCheck, Zap, Newspaper, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function TentangKamiClient() {
  return (
    <div className="w-full relative isolate selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      
      {/* ════ BACKGROUND PATTERN (Disesuaikan untuk dalam layout) ════ */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)] rounded-3xl pointer-events-none"></div>

      {/* ════ 1. HERO SECTION (Skala Dashboard) ════ */}
      <div className="px-2 pt-8 pb-12 sm:pt-12 sm:pb-16 text-center">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-semibold tracking-wide mb-5 shadow-sm">
              <Sparkles size={14} /> Platform Edukasi Terpadu
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} 
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-5 leading-[1.15]"
          >
            Satu Ekosistem Untuk <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Akselerasi Karier Anda</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} 
            className="text-sm md:text-base leading-relaxed text-slate-500 max-w-2xl mx-auto"
          >
            Amania hadir sebagai solusi cerdas untuk meningkatkan kompetensi Anda. Kami menghubungkan Anda dengan materi digital berkualitas, webinar eksklusif, dan wawasan industri terkini.
          </motion.p>
        </div>
      </div>

      {/* ════ 2. LAYANAN UTAMA (Bento Cards - Proporsional) ════ */}
      <div className="mx-auto max-w-6xl px-0 sm:px-2 pb-16 sm:pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">Pilar Layanan Amania</h2>
          <p className="text-sm text-slate-500">Tiga solusi utama yang dirancang untuk mendukung perjalanan belajar Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="flex flex-col bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 group"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="h-6 w-6 text-indigo-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Event & Webinar</h3>
            <p className="text-sm leading-relaxed text-slate-500 flex-auto mb-6">
              Ikuti kelas interaktif bersama mentor berpengalaman. Belajar secara *real-time* dan berdiskusi langsung dengan praktisi ahli.
            </p>
            <Link href="/events" className="mt-auto text-xs font-bold text-indigo-600 flex items-center gap-1.5 group-hover:text-indigo-700">
              Jelajahi Program <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="relative flex flex-col bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 group"
          >
            <div className="absolute top-5 right-5 bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border border-emerald-100">Premium</div>
            
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="h-6 w-6 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Katalog Digital</h3>
            <p className="text-sm leading-relaxed text-slate-500 flex-auto mb-6">
              Akses tak terbatas ke berbagai produk digital seperti E-Book ringkasan, *template* profesional, dan rekaman video eksklusif.
            </p>
            <Link href="/e-products" className="mt-auto text-xs font-bold text-emerald-600 flex items-center gap-1.5 group-hover:text-emerald-700">
              Lihat Katalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="flex flex-col bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 group"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 group-hover:scale-110 transition-transform duration-300">
              <Newspaper className="h-6 w-6 text-blue-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Artikel & Wawasan</h3>
            <p className="text-sm leading-relaxed text-slate-500 flex-auto mb-6">
              Kumpulan artikel, jurnal, dan berita terkini seputar dunia teknologi dan karier untuk menjaga wawasan Anda tetap tajam.
            </p>
            <Link href="/articles" className="mt-auto text-xs font-bold text-blue-600 flex items-center gap-1.5 group-hover:text-blue-700">
              Baca Artikel <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* ════ 3. KENAPA MEMILIH KAMI (Premium Dark Section - Skala Dashboard) ════ */}
      <div className="mx-auto max-w-6xl px-0 sm:px-2">
        <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-12 sm:rounded-[2rem] sm:px-12 lg:flex lg:gap-x-12 lg:items-center shadow-xl border border-slate-800">
          
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:text-left mb-10 lg:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Standar Industri
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Setiap aset di platform Amania dikurasi secara ketat untuk menjamin relevansi dan kualitas maksimal bagi perkembangan *skill* Anda.
            </p>
          </div>

          <div className="mx-auto max-w-md lg:mx-0 lg:flex-auto lg:max-w-none">
            <div className="grid grid-cols-1 gap-4">
              
              <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-500/30">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">Transaksi Aman & Otomatis</h4>
                  <p className="text-xs leading-relaxed text-slate-400">Didukung *payment gateway* terpercaya, akses langsung terbuka otomatis detik itu juga setelah pembayaran.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">Akses Kapan Saja 24/7</h4>
                  <p className="text-xs leading-relaxed text-slate-400">Tidak perlu menunggu admin. Modul, e-book, dan rekaman langsung tersedia di lemari digital Anda.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl bg-white/5 p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <CheckCircle2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">Materi Relevan & Terkurasi</h4>
                  <p className="text-xs leading-relaxed text-slate-400">Materi disusun oleh pakar dan diperbarui berkala mengikuti kebutuhan industri terkini.</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}