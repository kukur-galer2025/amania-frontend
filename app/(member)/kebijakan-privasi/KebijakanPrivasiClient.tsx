"use client";

import React from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  ShieldCheck, ArrowLeft, FileText, 
  Database, Activity, Lock, MessageCircle 
} from 'lucide-react';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

export default function KebijakanPrivasiClient() {
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
              <ShieldCheck size={32} className="md:w-10 md:h-10" strokeWidth={1.5} />
            </motion.div>
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                Kebijakan Privasi
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
                <FileText size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">1. Pendahuluan</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                Selamat datang di Amania. Kami sangat menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan platform edukasi kami.
              </p>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <Database size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">2. Informasi yang Kami Kumpulkan</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium mb-4">Kami dapat mengumpulkan data pribadi berikut untuk keperluan operasional layanan:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Nama lengkap dan alamat email saat Anda mendaftar.',
                  'Nomor telepon untuk keperluan verifikasi dan komunikasi penting.',
                  'Data transaksi (kami TIDAK menyimpan data kartu, ini diproses aman oleh Tripay).',
                  'Data riwayat keikutsertaan Event/Webinar dan progres akses E-Product.'
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs md:text-sm text-slate-600 font-medium leading-relaxed hover:border-indigo-100 transition-colors">
                    {item}
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <Activity size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors tracking-tight">3. Penggunaan Informasi</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium mb-4">Informasi yang dikumpulkan digunakan semata-mata untuk:</p>
              <ul className="space-y-3">
                {[
                  'Memberikan akses ke layanan Katalog E-Product, Event & Webinar, serta Artikel.',
                  'Memproses pembayaran dan verifikasi transaksi digital Anda.',
                  'Mengirimkan notifikasi terkait akun, pembelian, atau pembaruan sistem.',
                  'Meningkatkan kualitas layanan dan pengalaman pengguna di platform Amania.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2"></span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 pb-12 border-l-2 border-slate-100 last:border-0 last:pb-0 group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm z-10">
                <Lock size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors tracking-tight">4. Keamanan Data</h2>
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 md:p-6 rounded-2xl text-emerald-800 text-sm md:text-base font-medium leading-relaxed flex gap-4 items-start">
                <ShieldCheck size={24} className="text-emerald-600 shrink-0 hidden sm:block" />
                <p>Kami mengimplementasikan standar keamanan yang ketat untuk melindungi data Anda dari akses, perubahan, atau penghancuran yang tidak sah. Data kata sandi (password) Anda dienkripsi secara satu arah menggunakan standar keamanan industri terenkripsi (Bcrypt).</p>
              </div>
            </motion.section>

            <motion.section variants={fadeInUp} className="relative pl-8 md:pl-12 border-l-2 border-transparent group">
              <div className="absolute left-[-17px] top-0 w-8 h-8 bg-slate-50 border-2 border-slate-200 text-slate-400 rounded-full flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all duration-300 shadow-sm z-10">
                <MessageCircle size={14} />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight">5. Hubungi Kami</h2>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base font-medium">
                Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui WhatsApp di <a href="https://wa.me/628985477864" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"> +62 898-5477-864 </a> atau melalui menu Pusat Bantuan.
              </p>
            </motion.section>

          </motion.div>
        </div>
      </div>
    </div>
  );
}