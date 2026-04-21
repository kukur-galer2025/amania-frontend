"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  BookOpen, ArrowLeft, FileSignature, 
  UserCheck, CreditCard, RefreshCcw, Copyright 
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function SyaratKetentuanClient() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 md:pb-24 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* ════ BACKGROUND PATTERN ════ */}
      <div className="absolute inset-0 z-0 pointer-events-none h-[500px] flex justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]" />
        <div className="absolute top-[-20%] w-[400px] md:w-[700px] h-[300px] md:h-[500px] bg-indigo-500/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        
        {/* Tombol Kembali */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-indigo-600 mb-8 transition-colors bg-white px-4 py-2.5 rounded-full shadow-sm border border-slate-200 hover:border-indigo-200 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </Link>
        </motion.div>
        
        {/* Kontainer Utama */}
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-200/60 relative">
          
          {/* ════ HEADER SECTION ════ */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 mb-12 border-b border-slate-100 pb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 md:w-20 md:h-20 bg-indigo-50 text-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-inner"
            >
              <BookOpen size={32} className="md:w-10 md:h-10" strokeWidth={1.5} />
            </motion.div>
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Syarat & Ketentuan
              </motion.h1>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </motion.div>
            </div>
          </div>

          {/* ════ CONTENT SECTION (TIMELINE UX) ════ */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-0">
            
            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <FileSignature size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">1. Penerimaan Syarat</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                Dengan mengakses, mendaftar, dan menggunakan platform pembelajaran Amania (termasuk pendaftaran Event dan pembelian E-Product), Anda menyatakan setuju dan tunduk sepenuhnya pada Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah satu poin dari ketentuan ini, Anda tidak diperkenankan menggunakan layanan kami.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <UserCheck size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">2. Pendaftaran & Autentikasi Akun</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                Pengguna diwajibkan memberikan informasi yang akurat, lengkap, dan terbaru saat membuat akun di Amania. Anda bertanggung jawab penuh atas aktivitas apa pun yang terjadi di bawah akun Anda, serta berkewajiban menjaga kerahasiaan kata sandi (password) Anda. Amania tidak bertanggung jawab atas kerugian yang diakibatkan oleh kelalaian Anda dalam menjaga akun.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <CreditCard size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">3. Kebijakan Pembelian & Pembayaran</h2>
              <ul className="space-y-3">
                {[
                  'Seluruh harga yang tertera untuk Katalog Event Premium dan E-Product Digital adalah harga final.',
                  'Pembayaran diproses secara aman melalui pihak ketiga (Tripay Payment Gateway). Pengguna wajib mengikuti instruksi pembayaran dan tenggat waktu yang diberikan oleh gateway.',
                  'Akses materi (link Zoom untuk Event atau tautan unduhan untuk E-Product) akan diberikan secara otomatis setelah sistem kami memverifikasi pembayaran Anda.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all duration-300 shadow-sm z-10">
                <RefreshCcw size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-rose-600 transition-colors tracking-tight">4. Kebijakan Pengembalian Dana (Refund)</h2>
              <div className="bg-rose-50/50 border border-rose-100 p-5 md:p-6 rounded-2xl text-rose-800 text-sm md:text-base font-medium leading-relaxed flex gap-4 items-start">
                <p>Mengingat sifat layanan kami yang berupa distribusi aset digital (E-Book, Modul, Template) dan akses kelas virtual secara instan, <strong>semua transaksi pembelian bersifat final dan tidak dapat dibatalkan atau dikembalikan (non-refundable)</strong>, kecuali terjadi kegagalan teknis murni dari server Amania yang menyebabkan produk gagal diakses dalam waktu 2x24 jam setelah pembayaran lunas.</p>
              </div>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 border-l-2 border-transparent group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <Copyright size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">5. Hak Kekayaan Intelektual</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                Seluruh materi E-Product, modul pembelajaran, rekaman webinar, dan konten artikel di dalam Amania adalah hak cipta penuh milik Amania dan kontributor resminya. Anda dilarang keras untuk menyalin, menyebarluaskan, mendistribusikan ulang, atau memperjualbelikan materi apa pun dari platform ini tanpa persetujuan tertulis secara sah dari kami. Pelanggaran terhadap hak cipta ini dapat diproses sesuai dengan hukum yang berlaku di Indonesia.
              </p>
            </motion.section>

          </motion.div>
        </div>
      </div>
    </div>
  );
}