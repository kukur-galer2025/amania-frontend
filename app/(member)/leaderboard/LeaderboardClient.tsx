"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Loader2, Award, Search, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function LeaderboardClient() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'month' | 'week'>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // 🔥 MENGGUNAKAN APIFETCH 🔥
        const res = await apiFetch(`/leaderboard?filter=${activeFilter}`);
        const json = await res.json();
        
        if (json.success) {
          setLeaders(json.data);
          setCurrentPage(1);
        } else {
            toast.error("Gagal memuat papan peringkat");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeFilter]);

  const totalPages = Math.ceil(leaders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = leaders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const getAvatarUrl = (user: any) => {
    if (user.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar;
      return `${STORAGE_URL}/${user.avatar}`; // 🔥 Storage URL dinamis
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f8fafc&color=0f172a&size=128&bold=true`;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
        <Trophy size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2.5} />
      </div>
    );
    if (rank === 2) return (
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
        <Award size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2.5} />
      </div>
    );
    if (rank === 3) return (
      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm">
        <Award size={12} className="md:w-3.5 md:h-3.5" strokeWidth={2.5} />
      </div>
    );
    return (
      <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm font-semibold text-slate-400">
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-16 md:pb-24 relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* VERCEL-STYLE BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[400px] md:h-[600px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="absolute top-[-10%] w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-indigo-500/10 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-24 space-y-8 md:space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-2xl mx-auto space-y-4 md:space-y-5">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 bg-white border border-slate-200 rounded-full text-slate-600 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Hash size={10} className="md:w-3 md:h-3 text-indigo-500" /> Global Rankings Amania
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Papan Peringkat
          </h1>
          
          <p className="text-xs md:text-sm lg:text-base text-slate-500 font-medium leading-relaxed px-4 md:px-0">
            Pantau pembelajar paling aktif di Amania. Selesaikan kelas, kumpulkan pencapaian, dan jadikan nama Anda berada di posisi teratas.
          </p>

          <div className="flex justify-center pt-4 md:pt-6">
            <div className="bg-slate-100/80 backdrop-blur-md p-1 rounded-xl flex border border-slate-200/60 shadow-inner overflow-x-auto custom-scrollbar w-full sm:w-auto">
              {[
                { id: 'all', label: 'Semua Waktu' },
                { id: 'month', label: 'Bulan Ini' },
                { id: 'week', label: 'Minggu Ini' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`flex-1 sm:flex-none whitespace-nowrap px-4 md:px-6 py-2 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all duration-200 ${
                    activeFilter === tab.id 
                      ? 'bg-white text-indigo-600 shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div>
          {loading ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-3 md:gap-4">
              <Loader2 className="animate-spin text-indigo-600 md:w-7 md:h-7" size={24} />
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-widest">Memuat Data...</span>
            </div>
          ) : leaders.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-10 md:p-16 text-center shadow-sm max-w-2xl mx-auto">
               <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                 <Search size={20} className="md:w-6 md:h-6 text-slate-300" />
               </div>
               <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1">Belum Ada Data</h3>
               <p className="text-xs md:text-sm font-medium text-slate-500">Peringkat pada periode waktu ini masih kosong. Selesaikan event untuk mengisi posisi ini.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.02)] overflow-hidden">
              
              <div className="bg-slate-50/50 border-b border-slate-200 px-4 md:px-6 py-2.5 md:py-3.5 flex items-center justify-between text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                 <div className="flex items-center gap-4 md:gap-12">
                   <span className="w-6 md:w-8 text-center">Rank</span>
                   <span>Peserta</span>
                 </div>
                 <span className="hidden xs:block">Pencapaian</span>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPage + activeFilter}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  >
                    {currentData.map((user, index) => {
                      const rank = startIndex + index + 1; 
                      const isTop3 = rank <= 3;

                      return (
                        <div 
                          key={user.id} 
                          className="group flex items-center justify-between px-4 md:px-6 py-3 md:py-4 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 md:gap-10 overflow-hidden pr-2">
                            
                            <div className="w-6 md:w-8 flex justify-center shrink-0">
                              {getRankBadge(rank)}
                            </div>

                            <div className="flex items-center gap-2.5 md:gap-4 overflow-hidden">
                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-50">
                                <img 
                                  src={getAvatarUrl(user)} 
                                  alt={user.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <h4 className={`text-xs md:text-sm font-semibold leading-tight truncate ${isTop3 ? 'text-slate-900' : 'text-slate-700'}`}>
                                  {user.name}
                                </h4>
                                {/* Mobile display for stats */}
                                <p className="text-[9px] text-slate-500 font-medium xs:hidden mt-0.5">
                                   {user.registrations_count} Event Selesai
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 hidden xs:block pl-2">
                            <div className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 shadow-sm">
                              <span className={`text-[10px] md:text-xs font-bold ${isTop3 ? 'text-slate-900' : 'text-slate-600'}`}>
                                {user.registrations_count}
                              </span>
                              <span className="text-[8px] md:text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                Event{user.registrations_count > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="bg-white border-t border-slate-200 px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl md:rounded-b-2xl">
                  <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 order-2 sm:order-1">
                    Menampilkan <span className="font-bold text-slate-900">{currentPage}</span> dari {totalPages} halaman
                  </p>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-slate-200 text-[10px] md:text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Kembali
                    </button>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-slate-200 text-[10px] md:text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 0px; width: 0px; }
      `}</style>
    </div>
  );
}