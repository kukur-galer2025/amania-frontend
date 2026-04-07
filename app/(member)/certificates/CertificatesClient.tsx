"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, Loader2, ExternalLink, Search, 
  BookOpen, Clock, ChevronRight, FileBadge,
  CheckCircle2, User, Sparkles, ArrowRight, 
  Download, ShieldCheck, Filter, Lock, Gem, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function CertificatesClient() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'old'>('all');

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchMyCertificates = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Silakan login kembali");
          setLoading(false);
          return;
        }

        // 🔥 MENGGUNAKAN APIFETCH (Token sudah otomatis, jadi header manual tidak perlu lagi) 🔥
        const res = await apiFetch('/my-registrations');
        const json = await res.json();
        
        if (res.ok && json.success) {
          const validCertificates = json.data.filter((reg: any) => 
            reg.status === 'verified' && reg.event
          );
          setCertificates(validCertificates);
        }
      } catch (error) {
        toast.error("Gagal memuat data sertifikat");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCertificates();
  }, []);

  const filteredCertificates = certificates.filter(reg => 
    reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (filter === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (filter === 'old') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return 0;
  });

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#F4F4F9]">
      <Loader2 className="animate-spin text-[#6366F1]" size={36} />
      <span className="text-sm font-bold text-slate-500 tracking-widest uppercase">Memuat Ruang Sertifikat...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F9] pb-24 font-sans">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* HERO SECTION */}
        <div className="relative w-full rounded-[2rem] bg-[#0B0F19] overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#6366F1]/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/4 translate-y-1/4" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

          <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 flex flex-col md:flex-row md:items-center justify-between gap-10">
             <div className="max-w-2xl">
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-[#A5B4FC] text-[10px] font-bold uppercase tracking-widest mb-6 backdrop-blur-md shadow-inner">
                 <Sparkles size={14} className="text-[#818CF8]" /> Dashboard Peserta Amania
               </motion.div>
               <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                 Pusat Akses Sertifikat
               </motion.h1>
               <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[#94A3B8] text-sm md:text-base font-medium leading-relaxed max-w-xl">
                 Kelola seluruh pendaftaran, pantau status kelulusan, dan unduh E-Certificate Anda untuk memperkuat portofolio profesional dan karir Anda.
               </motion.p>
             </div>

             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="shrink-0">
                <Link href="/events" className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl text-sm font-bold transition-all shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] group border border-white/10">
                  <BookOpen size={18} /> Eksplorasi Katalog 
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
             </motion.div>
          </div>
        </div>

        {/* TOOLBAR PENCARIAN & FILTER */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4 relative z-20">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
            <input 
              type="text" 
              placeholder="Cari sertifikat program Anda..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
               <Filter size={18} />
            </div>
            <div className="flex p-1 w-full sm:w-auto bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto custom-scrollbar">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'recent', label: 'Terbaru' },
                { id: 'old', label: 'Terlama' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                    filter === tab.id 
                      ? 'bg-white text-[#6366F1] shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div>
          {certificates.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white border border-slate-200 border-dashed rounded-[2rem] p-16 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-transparent via-[#6366F1] to-transparent opacity-20" />
              <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3">
                <Award size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Piala Kosong</h3>
              <p className="text-slate-500 text-sm font-medium max-w-md mb-8 leading-relaxed">
                Anda belum menyelesaikan program apapun. Mulai perjalanan belajar Anda, kumpulkan ilmu, dan klaim sertifikat pertama Anda!
              </p>
              <Link href="/events" className="px-8 py-3.5 bg-[#0B0F19] text-white rounded-xl text-sm font-bold hover:bg-[#6366F1] transition-colors shadow-lg shadow-slate-900/20 flex items-center gap-2">
                Cari Program Kelas <ArrowRight size={16} />
              </Link>
            </div>
          ) : filteredCertificates.length === 0 ? (
            /* NOT FOUND STATE */
            <div className="py-24 text-center bg-white border border-slate-200 rounded-[2rem] shadow-sm">
              <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                 <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sertifikat tidak ditemukan</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Coba gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          ) : (
            <>
              {/* 🔥 NOTES G-DRIVE 🔥 */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-indigo-50/80 border border-indigo-100 p-4 md:p-5 rounded-2xl shadow-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0 border border-indigo-100">
                  <Info size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-indigo-900 mb-1">Panduan Pengambilan Sertifikat</h4>
                  <p className="text-xs text-indigo-800 leading-relaxed max-w-4xl">
                    Tautan <strong>"Unduh Sertifikat"</strong> akan mengarahkan Anda ke folder penyimpanan cloud (Google Drive). 
                    Silakan cari sertifikat Anda <strong>berdasarkan Nama</strong> yang sesuai dengan yang tercantum pada E-Ticket saat Anda mendaftar.
                  </p>
                </div>
              </motion.div>

              {/* COMPLEX GRID CARD DENGAN ANIMASI SMOOTH */}
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredCertificates.map((reg) => {
                    const isLocked = reg.event?.certificate_tier === 'premium' && reg.tier === 'free';

                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }} 
                        key={reg.id} 
                        className={`group bg-white rounded-3xl border border-slate-200 flex flex-col overflow-hidden relative ${isLocked ? 'opacity-80' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(99,102,241,0.1)] hover:border-[#6366F1]/30 transition-all duration-300'}`}
                      >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#6366F1] to-purple-500 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
                          {reg.event?.image ? (
                            <img 
                              src={`${STORAGE_URL}/${reg.event.image}`} // 🔥 Menggunakan URL Storage dari env
                              alt={reg.event.title} 
                              className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'grayscale' : 'group-hover:scale-110'}`} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-200/50">
                              <BookOpen size={40} />
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                          
                          <div className="absolute top-4 left-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-lg px-3 py-1.5 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle2 size={14} className="text-[#34D399]" /> Kelulusan Sah
                            </div>
                          </div>

                          <div className="absolute bottom-4 left-4 right-4">
                              <h3 className="text-lg font-extrabold text-white leading-tight line-clamp-2 drop-shadow-md">
                                {reg.event?.title || 'Program Telah Selesai'}
                              </h3>
                          </div>

                          {/* OVERLAY GEMBOK JIKA TERKUNCI */}
                          {isLocked && (
                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                               <div className="bg-white/90 p-3 rounded-full text-amber-600 shadow-xl border border-amber-200/50">
                                  <Lock size={32} />
                               </div>
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex-1 flex flex-col bg-white">
                          <div className="flex items-center justify-between mb-6">
                              <p className="text-[10px] font-bold text-[#6366F1] uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Resmi Amania
                              </p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                {new Date(reg.created_at).getFullYear()}
                              </p>
                          </div>
                          
                          <div className="mt-auto">
                            <div className="flex items-center gap-3 mb-6 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                              <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 text-[#6366F1] flex items-center justify-center shrink-0">
                                <User size={18} />
                              </div>
                              <div className="truncate">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Diberikan Kepada</p>
                                <p className="text-sm font-extrabold text-slate-900 truncate">{reg.name}</p>
                              </div>
                            </div>

                            {/* TOMBOL KONDISIONAL */}
                            {isLocked ? (
                              <button disabled className="w-full flex items-center justify-center px-5 py-3.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
                                <span className="flex items-center gap-2">
                                  <Gem size={16} className="text-amber-500" /> Sertifikat Khusus VIP
                                </span>
                              </button>
                            ) : reg.event?.certificate_link ? (
                              <a 
                                href={reg.event.certificate_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between px-5 py-3.5 bg-[#0B0F19] hover:bg-[#6366F1] text-white rounded-xl text-sm font-bold transition-all shadow-md group/btn"
                              >
                                <span className="flex items-center gap-2">
                                  <Download size={16} className="text-indigo-400 group-hover/btn:text-white transition-colors" /> Unduh Sertifikat
                                </span>
                                <ExternalLink size={14} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 transition-all" />
                              </a>
                            ) : (
                              <div className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold cursor-not-allowed">
                                <Clock size={16} className="text-amber-500" /> Sedang Diproses Admin
                              </div>
                            )}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 0px; width: 0px; }
      `}</style>
    </div>
  );
}