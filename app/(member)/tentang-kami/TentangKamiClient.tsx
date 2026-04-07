"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, GraduationCap, Sparkles, 
  Github, Linkedin, Mail, Rocket, Target, Globe, Heart, Briefcase, Instagram
} from 'lucide-react';

export default function TentangKamiClient() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-16 md:pb-24 selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      
      {/* Background Pattern Lembut */}
      <div className="absolute inset-0 z-0 pointer-events-none h-[400px] md:h-[600px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-[-10%] w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-indigo-500/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 lg:pt-24 space-y-12 md:space-y-20">
        
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4 md:space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={10} className="md:w-3 md:h-3 text-indigo-500" /> Tentang Amania
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Membangun Ekosistem <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Belajar Masa Depan</span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-base lg:text-lg text-slate-500 font-medium leading-relaxed px-2 sm:px-0">
            Amania lahir dari sebuah keyakinan bahwa pendidikan teknologi berkualitas harus dapat diakses oleh siapa saja. Kami merancang ruang belajar yang interaktif, praktis, dan berorientasi pada industri.
          </motion.p>
        </div>

        {/* ========================================================================= */}
        {/* 2. NILAI INTI */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        >
          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 border border-blue-100">
              <Target size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Fokus Industri</h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">Kurikulum disusun menyesuaikan kebutuhan riil dunia kerja dan tren teknologi terkini.</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 border border-emerald-100">
              <Rocket size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Praktik Langsung</h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">Lebih dari sekadar teori. Anda akan membangun portofolio dari studi kasus nyata.</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 md:mb-6 border border-purple-100">
              <Heart size={20} className="md:w-6 md:h-6" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">Komunitas Inklusif</h3>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">Belajar bersama, tumbuh bersama. Kami membangun lingkungan yang saling mendukung di ekosistem Amania.</p>
          </div>
        </motion.div>

        {/* ========================================================================= */}
        {/* 3. PROFIL TIM MANAJEMEN (2 ORANG) */}
        {/* ========================================================================= */}
        <div className="pt-6 md:pt-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 md:mb-4">Tim di Balik Amania</h2>
            <p className="text-xs md:text-sm text-slate-500 font-medium px-4 sm:px-0">Kolaborasi visi strategis dan eksekusi teknis untuk menghadirkan platform terbaik.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            
            {/* PROFIL 1: CEO (Dr. Ir. Nurul Hidayat) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="relative bg-[#0B0F19] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 lg:p-10 overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center text-center"
            >
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-blue-500/20 blur-[60px] md:blur-[80px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/4" />
              
              <div className="relative z-10 mb-5 md:mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full p-1 shadow-[0_0_20px_rgba(59,130,246,0.3)] md:shadow-[0_0_30px_rgba(59,130,246,0.3)] mx-auto">
                  <div className="w-full h-full bg-slate-900 rounded-full border-[3px] border-slate-900 overflow-hidden relative group">
                    <img 
                      src="/images/nurul-hidayat.jpg" 
                      alt="Dr. Ir. Nurul Hidayat, S.Pt. M.Kom" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Nurul+Hidayat&background=0B0F19&color=60a5fa&bold=true&size=400"; }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg w-max">
                  <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 md:gap-1.5">
                    <Briefcase size={10} className="text-blue-400 md:w-3 md:h-3" /> Chief Executive Officer
                  </span>
                </div>
              </div>

              <div className="relative z-10 w-full">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                  Dr. Ir. Nurul Hidayat,<br className="hidden sm:block"/> S.Pt. M.Kom
                </h3>
                
                <div className="flex justify-center mb-4 md:mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-semibold backdrop-blur-sm">
                    <Globe size={12} className="text-blue-400 md:w-3.5 md:h-3.5" /> CEO Amania
                  </div>
                </div>

                <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                  Sebagai Chief Executive Officer, beliau memimpin visi besar Amania. Dengan rekam jejak akademis dan profesional yang kuat, beliau memastikan arah strategis perusahaan sejalan dengan kebutuhan transformasi edukasi digital di Indonesia.
                </p>

                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <a href="#" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                    <Linkedin size={14} className="md:w-4 md:h-4" />
                  </a>
                  <a href="#" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all">
                    <Mail size={14} className="md:w-4 md:h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* PROFIL 2: MANAGER (Prima Dzaky Hibatulloh) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="relative bg-[#0B0F19] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 lg:p-10 overflow-hidden shadow-2xl border border-slate-800 flex flex-col items-center text-center"
            >
              <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-500/20 blur-[60px] md:blur-[80px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/4" />
              
              <div className="relative z-10 mb-5 md:mb-6">
                <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-1 shadow-[0_0_20px_rgba(99,102,241,0.3)] md:shadow-[0_0_30px_rgba(99,102,241,0.3)] mx-auto">
                  <div className="w-full h-full bg-slate-900 rounded-full border-[3px] border-slate-900 overflow-hidden relative group">
                    <img 
                      src="/images/prima-dzaky.jpg" 
                      alt="Prima Dzaky Hibatulloh" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Prima+Dzaky&background=0B0F19&color=818cf8&bold=true&size=400"; }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-lg w-max">
                  <span className="text-[9px] md:text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1 md:gap-1.5">
                    <Code2 size={10} className="text-indigo-400 md:w-3 md:h-3" /> Manager & Dev
                  </span>
                </div>
              </div>

              <div className="relative z-10 w-full">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight mb-2">
                  Prima Dzaky<br className="hidden sm:block"/> Hibatulloh
                </h3>
                
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-semibold backdrop-blur-sm">
                    <Briefcase size={12} className="text-indigo-400 md:w-3.5 md:h-3.5" /> Manager Amania
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-semibold backdrop-blur-sm">
                    <GraduationCap size={12} className="text-purple-400 md:w-3.5 md:h-3.5" /> Informatika Unsoed
                  </div>
                </div>

                <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed mb-6 md:mb-8">
                  Sebagai Manager sekaligus Software Developer, Prima berfokus pada inovasi produk dan arsitektur sistem. Membangun infrastruktur Amania dengan tujuan menciptakan platform belajar yang responsif, stabil, dan ramah pengguna.
                </p>

                <div className="flex items-center justify-center gap-2 md:gap-3">
                  <a href="https://github.com/primadzakyhibatulloh" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-all">
                    <Github size={14} className="md:w-4 md:h-4" />
                  </a>
                  <a href="https://www.instagram.com/hibatulloh._/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all">
                    <Instagram size={14} className="md:w-4 md:h-4" />
                  </a>
                  <a href="mailto:primadzakyhibatulloh@gmail.com" className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 border border-white/10 text-slate-300 rounded-full hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all">
                    <Mail size={14} className="md:w-4 md:h-4" />
                  </a>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}