"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { 
  Target, ArrowRight, BookOpen, 
  Zap, BarChart3, ShieldCheck, Cpu, 
  Users, PlayCircle, Star, Quote, Award, Clock, Sparkles
} from 'lucide-react';

// 🔥 FIX: Typed as Variants and cast ease array to avoid TS error
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as any } }
};

export default function TryoutLandingClient() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* =========================================
          🔥 ANIMASI INTRO (CLEAN & PREMIUM) 🔥
      ============================================= */}
      <AnimatePresence>
        {showIntro && (
          <motion.div 
            initial={{ opacity: 1 }} 
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }} 
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }} 
            className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute w-[400px] h-[400px] bg-sky-100/50 blur-[100px] rounded-full" />
            
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative z-10 flex flex-col items-center px-6 text-center">
              <div className="w-24 h-24 mb-8 bg-white border border-sky-100 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-sky-200/50 relative">
                <Target size={40} className="text-orange-500 absolute" />
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="w-full h-full border-[3px] border-sky-50 border-t-sky-500 rounded-[2rem]" />
              </div>
              <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                Amania <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-orange-500">Evaluation</span>
              </motion.h2>
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.2, ease: "easeInOut" }} className="h-1 bg-gradient-to-r from-sky-400 to-orange-400 rounded-full w-full max-w-[150px] mt-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: showIntro ? 0 : 1 }} transition={{ duration: 1 }} className="w-full overflow-hidden bg-slate-50/30">
        
        {/* =========================================
            SECTION 1: HERO (SEAMLESS GRADIENT)
        ============================================= */}
        <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center min-h-[85vh]">
          {/* Premium Background Mesh & Glow */}
          <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 bg-white">
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[60%] bg-sky-200/40 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-orange-100/40 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-[0.03] pointer-events-none"></div>
            {/* Seamless fade to bottom */}
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50/50 to-transparent"></div>
          </div>
          
          <motion.div 
            variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col items-center text-center max-w-5xl mx-auto w-full relative z-10"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 bg-white/60 backdrop-blur-xl border border-sky-100 rounded-full text-sky-700 text-xs font-black uppercase tracking-widest mb-10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Engine CAT BKN v2.0
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-black text-slate-900 tracking-tight leading-[1.05] mb-8 w-full">
              Simulasi SKD Akurat. <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-orange-500">
                NIP Menanti Anda.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-base md:text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-3xl mx-auto px-4 sm:px-0">
              Ukur kemampuan TWK, TIU, dan TKP Anda secara <strong className="text-sky-600">real-time</strong> dengan sistem berstandar nasional. Temukan kelemahan Anda dan tembus *Passing Grade* tahun ini.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full px-6 sm:px-0">
              <Link href="/tryouts/katalog" className="w-full sm:w-auto px-10 py-4 md:py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-[1.25rem] font-black transition-all duration-300 shadow-[0_10px_40px_-10px_rgba(249,115,22,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(249,115,22,0.8)] flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0 text-base">
                Mulai Berlatih <ArrowRight size={20} />
              </Link>
              <Link href="/tryouts/katalog" className="w-full sm:w-auto px-10 py-4 md:py-5 bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 hover:border-sky-200 rounded-[1.25rem] font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:-translate-y-1 active:translate-y-0">
                Coba Gratis <PlayCircle size={20} className="text-sky-500" />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* =========================================
            SECTION 2: STATISTIK (OVERLAPPING HERO)
        ============================================= */}
        {/* Menggunakan margin negative (-mt-24) agar menumpuk mulus dengan Hero */}
 <section className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto -mt-20 md:-mt-28 mb-20 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/80 backdrop-blur-2xl border border-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.1)]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x-0 md:divide-x divide-slate-100">
              {[
                { value: '30+', label: 'Instansi CPNS', icon: Users, color: 'text-sky-500' },
                { value: '99%', label: 'Akurasi Sistem', icon: Target, color: 'text-orange-500' },
                { value: '10+', label: 'Sekolah Kedinasan', icon: Award, color: 'text-sky-500' },
                { value: '24/7', label: 'Akses Server', icon: Clock, color: 'text-orange-500' },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center justify-center group">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <stat.icon size={32} strokeWidth={2} className={stat.color} />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 tracking-tight">{stat.value}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* =========================================
            SECTION 3: BENTO GRID FITUR (NO HARD BORDERS)
        ============================================= */}
        <section className="py-10 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
            <span className="inline-block px-4 py-1.5 bg-sky-50 text-sky-600 font-black text-xs uppercase tracking-widest rounded-full mb-4">Fitur Premium</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Lebih Dari Sekadar <br className="hidden md:block"/>Latihan Biasa</h2>
            <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Kami membangun teknologi evaluasi yang mensimulasikan tekanan dan metrik penilaian seleksi sesungguhnya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Kartu 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-2 bg-gradient-to-br from-sky-600 to-blue-700 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden flex flex-col justify-between min-h-[380px] shadow-[0_20px_40px_-15px_rgba(2,132,199,0.3)] group text-white">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] group-hover:bg-white/20 transition-colors" />
              <Cpu size={48} strokeWidth={1.5} className="text-orange-300 mb-8 relative z-10" />
              <div className="relative z-10 max-w-lg">
                <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">Penilaian Berstandar BKN</h3>
                <p className="text-sky-100 font-medium text-sm md:text-base leading-relaxed">
                  Mendukung kalkulasi skoring bertingkat (1-5 poin) khusus untuk soal Tes Karakteristik Pribadi (TKP) secara otomatis tanpa celah.
                </p>
              </div>
            </motion.div>

            {/* Kartu 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-sky-100 transition-colors flex flex-col justify-between min-h-[380px] group">
              <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BarChart3 size={32} className="text-sky-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 tracking-tight">Grafik Evaluasi Detail</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Ketahui letak kelemahan Anda di TWK, TIU, maupun TKP melalui radar analisis pasca ujian.
                </p>
              </div>
            </motion.div>

            {/* Kartu 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 hover:border-orange-100 transition-colors flex flex-col justify-between min-h-[380px] group">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} className="text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 tracking-tight">Anti-Kecurangan</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Latih fokus dan integritas dengan peringatan batas waktu dan pantauan layar otomatis.
                </p>
              </div>
            </motion.div>

            {/* Kartu 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="md:col-span-2 bg-gradient-to-br from-slate-50 to-white rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden flex flex-col justify-between min-h-[380px] border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] group">
              <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform">
                <Sparkles size={32} className="text-orange-500" />
              </div>
              <div className="relative z-10 max-w-xl">
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Pembahasan & Trik Cepat</h3>
                <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">
                  Akses rahasia ke modul pembahasan komprehensif yang disusun oleh praktisi ASN. Dirancang untuk memangkas waktu pengerjaan soal TIU logika Anda.
                </p>
              </div>
              <div className="absolute right-[-5%] bottom-[-20%] opacity-[0.03] pointer-events-none">
                <BookOpen size={400} />
              </div>
            </motion.div>

          </div>
        </section>

        {/* =========================================
            SECTION 4: ALUR (SEAMLESS PURE WHITE)
        ============================================= */}
        <section className="bg-white py-24 md:py-32 w-full px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 md:mb-28">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Langkah Pasti Menuju NIP</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto">Sistem kami memandu Anda dari nol hingga siap tempur di hari ujian.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
              {/* Garis Horizontal Tipis (Soft) */}
              <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-[1px] bg-slate-200" />
              
              {[
                { title: "Pilih Paket", desc: "Tentukan tryout SKD Kedinasan atau CPNS sesuai formasi target.", step: "1" },
                { title: "Mulai Simulasi", desc: "Kerjakan 110 soal dalam 100 menit dengan UI CAT.", step: "2" },
                { title: "Evaluasi Skor", desc: "Lihat hasil instan. Apakah memenuhi Passing Grade?", step: "3" },
                { title: "Pelajari Trik", desc: "Review kesalahan dari pembahasan cerdas kami.", step: "4" },
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  key={i} className="flex flex-col items-center text-center relative z-10 group"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] rounded-[2rem] flex items-center justify-center text-2xl font-black text-sky-500 mb-8 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 group-hover:-translate-y-2">
                    {item.step}
                  </div>
                  <h4 className="text-lg md:text-xl font-bold text-slate-900 mb-3 tracking-tight">{item.title}</h4>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-[220px]">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 5: TESTIMONI (OVERLAPPING CARDS)
        ============================================= */}
        <section className="py-24 md:py-32 bg-slate-50/50 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
              <div className="max-w-2xl">
                <span className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 font-black text-xs uppercase tracking-widest rounded-full mb-4">Kisah Sukses</span>
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Dipercaya Ribuan Pejuang NIP</h2>
              </div>
              <Link href="/tryouts/katalog" className="text-sky-600 font-bold text-sm flex items-center gap-2 hover:gap-4 transition-all">
                Mulai Kisah Suksesmu <ArrowRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
              {[
                { review: "TWK-nya bener-bener update dengan isu terkini. Ngebantu banget pas ujian asli karena tipenya mirip parah!" },
                { review: "UI CBT-nya persis aslinya dan smooth banget. Alhamdulillah saya bisa lolos perangkap TIU berkat pembahasan cepatnya." },
                { review: "Skoring TKP-nya paling masuk akal dibanding web lain. Pembahasannya juga to the point dan gampang dipahami. Recommended!" }
              ].map((item, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: idx * 0.15 }}
                  key={idx} 
                  className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col h-full group hover:-translate-y-2 transition-transform duration-500"
                >
                  <Quote size={50} strokeWidth={1.5} className="text-sky-100 absolute top-8 right-8 rotate-12 transition-transform duration-500 group-hover:rotate-0" />

                  <div className="flex gap-1 mb-8 relative z-10">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={18} className="text-orange-400 fill-orange-400" />
                    ))}
                  </div>

                  <p className="text-slate-600 font-medium text-base leading-relaxed relative z-10">
                    "{item.review}"
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 6: CTA RAKSASA (SOFT FLOATING CARD)
        ============================================= */}
        <section className="py-24 md:py-40 px-4 sm:px-6 lg:px-8 w-full bg-slate-50/30">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-white rounded-[3rem] md:rounded-[4rem] p-10 sm:p-16 md:p-28 relative overflow-hidden flex flex-col items-center text-center w-full shadow-[0_40px_80px_-20px_rgba(2,132,199,0.15)] max-w-6xl mx-auto border border-white"
          >
            {/* Soft Glow inside CTA */}
            <div className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.1)_0%,transparent_70%)] pointer-events-none"></div>
            
            <div className="relative z-10 space-y-8 max-w-3xl flex flex-col items-center">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-sky-50 border border-sky-100 rounded-full text-sky-600 text-xs font-black uppercase tracking-widest shadow-sm mb-2">
                <Sparkles size={16} className="text-orange-500" /> Akses Premium
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05]">
                Amankan Kursimu <br className="hidden sm:block"/>Hari Ini Juga.
              </h2>
              <p className="text-slate-500 font-medium text-base md:text-xl leading-relaxed max-w-2xl mx-auto px-4">
                Akses ribuan soal berkualitas standar Nasional. Berlatihlah secara konsisten dan jadilah salah satu dari mereka yang sukses.
              </p>
              <div className="pt-6 w-full flex justify-center">
                <Link href="/tryouts/katalog" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-12 py-5 md:py-6 bg-sky-600 hover:bg-sky-700 text-white rounded-[1.5rem] font-black transition-all shadow-[0_10px_40px_-10px_rgba(2,132,199,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(2,132,199,0.8)] active:scale-95 group text-lg">
                  Mulai Berlangganan <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

      </motion.div>
    </>
  );
}
