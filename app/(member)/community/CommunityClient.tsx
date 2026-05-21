"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { 
 MessageCircle, Users, Headset, 
 ArrowUpRight, ShieldCheck, Sparkles, Hash
} from 'lucide-react';

export default function CommunityClient() {
 
 const waNumber ="628122718132";
 const links = {
 group: `https://wa.me/${waNumber}?text=Halo%20Admin%20Amania,%20saya%20ingin%20bergabung%20ke%20grup%20diskusi...`,
 community: `https://wa.me/${waNumber}?text=Halo%20Admin%20Amania,%20saya%20ingin%20bergabung%20ke%20komunitas%20utama...`,
 admin: `https://wa.me/${waNumber}?text=Halo%20Admin%20Amania,%20saya%20membutuhkan%20bantuan%20terkait...`
 };

 const containerVariants: Variants = {
 hidden: { opacity: 0 },
 show: { opacity: 1, transition: { staggerChildren: 0.1 } }
 };

 const itemVariants: Variants = {
 hidden: { opacity: 0, y: 20 },
 show: { opacity: 1, y: 0, transition: { type:"spring", stiffness: 100 } }
 };

 return (
 <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B1120] font-sans pb-16 md:pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 relative">
 
 {/* Subtle Background Pattern */}
 <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[300px] md:h-[500px] flex justify-center">
 <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]"/>
 <div className="absolute top-[-10%] w-[300px] md:w-[500px] h-[200px] md:h-[300px] bg-indigo-50 dark:bg-indigo-500/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-normal"/>
 </div>

 <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 lg:pt-24 space-y-8 md:space-y-12">
 
 {/* HERO SECTION */}
 <div className="text-center max-w-2xl mx-auto space-y-4 md:space-y-5 px-2 md:px-0">
 <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
 <Hash size={12} className="text-indigo-500 md:w-3.5 md:h-3.5"/> Komunitas & Dukungan
 </div>
 
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight md:leading-tight">
 Tumbuh Bersama Amania
 </h1>
 
 <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed px-4 md:px-0">
 Jangan belajar sendirian. Bergabunglah dengan ratusan peserta lainnya untuk berdiskusi, berbagi wawasan, dan dapatkan bantuan teknis langsung dari tim ahli kami.
 </p>
 </div>

 {/* CARDS CONTAINER */}
 <motion.div 
 variants={containerVariants}
 initial="hidden"
 animate="show"
 className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 lg:gap-8 pt-4 md:pt-8"
 >
 
 {/* CARD 1: GRUP WA */}
 <motion.div variants={itemVariants} className="bg-white dark:bg-[#111827] flex flex-col rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-300 group">
 <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-5 md:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
 <MessageCircle size={20} className="md:w-6 md:h-6"/>
 </div>
 
 <div className="flex-1">
 <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 md:mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Ruang Diskusi</h3>
 <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">
 Grup WhatsApp interaktif khusus peserta Amania. Bertanya tentang koding, berbagi tips, dan selesaikan tantangan bersama-sama.
 </p>
 </div>

 <a 
 href={links.group} target="_blank" rel="noopener noreferrer"
 className="w-full inline-flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50 hover:border-blue-600 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-[11px] md:text-xs font-bold shadow-sm group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-all"
 >
 Gabung Grup Diskusi <ArrowUpRight size={14} className="md:w-4 md:h-4 opacity-70"/>
 </a>
 </motion.div>

 {/* CARD 2: KOMUNITAS UTAMA */}
 <motion.div variants={itemVariants} className="bg-white dark:bg-[#111827] flex flex-col rounded-2xl p-6 md:p-8 border-2 border-indigo-500 shadow-md shadow-indigo-500/10 dark:shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/20 dark:hover:shadow-indigo-500/10 transition-all duration-300 relative md:-translate-y-4 group order-first md:order-none">
 <div className="absolute -top-3 -right-3">
 <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-amber-400 text-white rounded-full border-[3px] border-white dark:border-[#111827] shadow-sm">
 <Sparkles size={14} className="md:w-4 md:h-4" fill="currentColor"/>
 </div>
 </div>

 <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-5 md:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
 <Users size={20} className="md:w-6 md:h-6"/>
 </div>
 
 <div className="flex-1">
 <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 md:mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Jejaring Komunitas</h3>
 <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6 md:mb-8">
 Saluran utama (Channel) untuk mendapatkan informasi event eksklusif, peluang karir, dan memperluas relasi di ekosistem Amania.
 </p>
 </div>

 <a 
 href={links.community} target="_blank" rel="noopener noreferrer"
 className="w-full inline-flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-700 text-white border border-transparent rounded-xl text-[11px] md:text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
 >
 Masuk Saluran Utama <ArrowUpRight size={14} className="md:w-4 md:h-4 opacity-70"/>
 </a>
 </motion.div>

 {/* CARD 3: ADMIN PUSAT */}
 <motion.div variants={itemVariants} className="bg-white dark:bg-[#111827] flex flex-col rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all duration-300 group">
 <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-5 md:mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
 <Headset size={20} className="md:w-6 md:h-6"/>
 </div>
 
 <div className="flex-1">
 <h3 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mb-1.5 md:mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Pusat Bantuan</h3>
 <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-5 md:mb-6">
 Hubungi Customer Support resmi Amania untuk kendala verifikasi tagihan, akses akun, klaim sertifikat, maupun keluhan lainnya.
 </p>
 </div>

 <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-5 bg-slate-50 dark:bg-slate-800/60 px-2.5 md:px-3 py-1.5 md:py-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
 <ShieldCheck size={12} className="md:w-3.5 md:h-3.5 text-emerald-500 shrink-0"/>
 <span className="text-[9px] md:text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Jam Kerja: 09.00 - 17.00 WIB</span>
 </div>

 <a 
 href={links.admin} target="_blank" rel="noopener noreferrer"
 className="w-full inline-flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/50 hover:border-emerald-600 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-50 dark:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl text-[11px] md:text-xs font-bold shadow-sm group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-600 dark:group-hover:text-white transition-all"
 >
 Hubungi Admin <ArrowUpRight size={14} className="md:w-4 md:h-4 opacity-70"/>
 </a>
 </motion.div>

 </motion.div>
 </div>
 </div>
 );
}