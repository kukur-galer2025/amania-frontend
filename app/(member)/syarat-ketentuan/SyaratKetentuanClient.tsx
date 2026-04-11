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
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-16 md:pb-24 relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none h-[400px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-[-10%] w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-orange-500/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-orange-600 hover:text-orange-700 mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-orange-100 hover:shadow-md group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </Link>
        </motion.div>
        
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-6 mb-12 border-b border-slate-100 pb-10">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: "spring" }}
              className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center shrink-0 border border-orange-200 shadow-inner"
            >
              <BookOpen size={32} className="md:w-10 md:h-10" />
            </motion.div>
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                Syarat & Ketentuan
              </motion.h1>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Pembaruan Terakhir: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </motion.div>
            </div>
          </div>

          {/* Content Section with Timeline/Stepper UX */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-0">
            
            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-10 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-sm z-10">
                <FileSignature size={14} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">1. Penerimaan Syarat</h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                Dengan mengakses dan menggunakan platform Amania, Anda menyetujui untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda dilarang menggunakan layanan kami.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-10 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-sm z-10">
                <UserCheck size={14} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">2. Pendaftaran Akun</h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                Pengguna diwajibkan memberikan informasi yang akurat dan valid saat mendaftar. Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi dan semua aktivitas yang terjadi di bawah akun mereka.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-10 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-sm z-10">
                <CreditCard size={14} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">3. Pembelian & Pembayaran</h2>
              <ul className="space-y-3 mt-4">
                {[
                  'Semua harga yang tertera di platform adalah final.',
                  'Pembayaran diproses melalui pihak ketiga (Tripay Payment Gateway). Pengguna wajib mengikuti instruksi pembayaran yang diberikan.',
                  'Layanan (E-Product / Paket Tryout) akan otomatis aktif setelah sistem kami menerima konfirmasi pembayaran berhasil.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0 mt-2"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-10 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all duration-300 shadow-sm z-10">
                <RefreshCcw size={14} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-rose-600 transition-colors">4. Kebijakan Pengembalian Dana (Refund)</h2>
              <div className="bg-rose-50 border border-rose-100 p-4 md:p-5 rounded-2xl text-rose-800 text-sm md:text-base font-medium leading-relaxed">
                Mengingat sifat produk kami yang berupa produk digital dan layanan akses langsung (Tryout CBT / E-Book), <strong>semua pembelian bersifat final dan tidak dapat dibatalkan atau diuangkan kembali (non-refundable)</strong>, kecuali terjadi kesalahan sistem dari pihak Amania yang menyebabkan produk gagal diakses dalam 2x24 jam setelah pembayaran berhasil.
              </div>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 border-l-2 border-transparent group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-white border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all duration-300 shadow-sm z-10">
                <Copyright size={14} />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-orange-600 transition-colors">5. Hak Kekayaan Intelektual</h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base font-medium">
                Seluruh materi, naskah soal, modul, dan konten di dalam Amania adalah hak cipta milik Amania. Pengguna dilarang keras menyebarluaskan, menjual ulang, atau mereproduksi konten tanpa izin tertulis dari kami.
              </p>
            </motion.section>

          </motion.div>
        </div>
      </div>
    </div>
  );
}