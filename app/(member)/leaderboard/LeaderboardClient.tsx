"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Loader2, Award, Search, Hash, BookOpen, ShoppingBag, Target, Crown, Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function LeaderboardClient() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'month' | 'week'>('all');
  const [activeCategory, setActiveCategory] = useState<'all' | 'event' | 'eproduct'>('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/leaderboard?filter=${activeFilter}&category=${activeCategory}`);
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
  }, [activeFilter, activeCategory]);

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
      return `${STORAGE_URL}/${user.avatar}`; 
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f8fafc&color=0f172a&size=128&bold=true`;
  };

  // 🔥 DESAIN LENCANA RANKING PREMIUM 🔥
  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/40 border border-amber-200 shrink-0">
        <Crown size={18} className="md:w-5 md:h-5" strokeWidth={2.5} />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center animate-pulse">
           <Star size={8} className="text-amber-500" fill="currentColor" />
        </div>
      </div>
    );
    if (rank === 2) return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-slate-200 via-slate-400 to-slate-500 flex items-center justify-center text-white shadow-lg shadow-slate-400/30 border border-slate-200 shrink-0">
        <Trophy size={16} className="md:w-5 md:h-5" strokeWidth={2.5} />
      </div>
    );
    if (rank === 3) return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-300 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 border border-orange-200 shrink-0">
        <Award size={16} className="md:w-5 md:h-5" strokeWidth={2.5} />
      </div>
    );
    return (
      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs md:text-sm font-black text-slate-500 border border-slate-200 shrink-0">
        {rank}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16 md:pb-24 relative selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* LUXURY BACKGROUND PATTERN */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[500px] md:h-[700px] flex justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className="absolute top-[-10%] w-[300px] md:w-[700px] h-[300px] md:h-[500px] bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 blur-[80px] md:blur-[120px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 lg:pt-24 space-y-8 md:space-y-12">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-4 md:space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-full text-indigo-600 text-[10px] md:text-xs font-black uppercase tracking-widest shadow-sm">
            <Trophy size={14} className="text-amber-500" /> Hall of Fame
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            <span className="text-slate-900">Amania</span> <br className="xs:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
              Global Rankings
            </span>
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm md:text-base text-slate-500 font-medium leading-relaxed px-2 md:px-10 max-w-2xl mx-auto">
            Pantau posisi elit para pembelajar paling aktif. Selesaikan event, koleksi e-produk premium, dan raih posisi puncak di Amania!
          </motion.p>

          {/* 🔥 LUXURY FILTER CONTROLS 🔥 */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex flex-col gap-4 pt-6 max-w-xl mx-auto">
            
            {/* Filter 1: Kategori Peringkat */}
            <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-[1.25rem] flex border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full relative z-20">
              {[
                { id: 'all', label: 'Global', icon: Target, activeColor: 'text-indigo-700', activeBg: 'bg-indigo-50 border-indigo-100 shadow-indigo-500/10' },
                { id: 'event', label: 'Event', icon: BookOpen, activeColor: 'text-blue-700', activeBg: 'bg-blue-50 border-blue-100 shadow-blue-500/10' },
                { id: 'eproduct', label: 'E-Produk', icon: ShoppingBag, activeColor: 'text-emerald-700', activeBg: 'bg-emerald-50 border-emerald-100 shadow-emerald-500/10' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-2 md:px-4 py-3 rounded-xl text-[11px] md:text-sm font-bold transition-all duration-300 border ${
                    activeCategory === cat.id 
                      ? `${cat.activeColor} ${cat.activeBg} shadow-sm scale-100` 
                      : 'text-slate-500 border-transparent hover:bg-slate-100/50 hover:text-slate-800 scale-95 hover:scale-100'
                  }`}
                >
                  <cat.icon size={16} className={activeCategory === cat.id ? '' : 'text-slate-400'} />
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Filter 2: Waktu */}
            <div className="flex justify-center">
              <div className="bg-slate-200/50 backdrop-blur-sm p-1 rounded-xl flex border border-slate-300/30 w-full sm:w-auto">
                {[
                  { id: 'all', label: 'Sepanjang Masa' },
                  { id: 'month', label: 'Bulan Ini' },
                  { id: 'week', label: 'Minggu Ini' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id as any)}
                    className={`flex-1 sm:flex-none whitespace-nowrap px-5 py-2 rounded-lg text-[10px] md:text-xs font-black transition-all duration-200 uppercase tracking-widest ${
                      activeFilter === tab.id 
                        ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        </div>

        {/* DATA TABLE */}
        <div className="relative z-20">
          {loading ? (
            <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 border border-slate-100">
                 <Loader2 className="animate-spin text-indigo-600" size={28} />
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sinkronisasi Data...</span>
            </div>
          ) : leaders.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-[2rem] p-12 md:p-20 text-center shadow-xl shadow-slate-200/50 max-w-2xl mx-auto">
               <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                 <Search size={32} className="text-slate-300" />
               </div>
               <h3 className="text-lg md:text-xl font-black text-slate-900 mb-2">Area Peringkat Kosong</h3>
               <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md mx-auto">Posisi peringkat pada kategori dan periode ini masih kosong. Ambil kesempatan untuk menjadi yang pertama!</p>
            </motion.div>
          ) : (
            <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 overflow-hidden">
              
              <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 px-5 md:px-8 py-4 flex items-center justify-between text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">
                 <div className="flex items-center gap-5 md:gap-14">
                   <span className="w-8 md:w-10 text-center">Rank</span>
                   <span>Peserta Amania</span>
                 </div>
                 <span className="hidden xs:block pr-2 text-right">
                   {activeCategory === 'event' ? 'Total Event' : activeCategory === 'eproduct' ? 'Total E-Produk' : 'Total Pencapaian'}
                 </span>
              </div>

              <div className="flex flex-col divide-y divide-slate-100/80">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentPage + activeFilter + activeCategory}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  >
                    {currentData.map((user, index) => {
                      const rank = startIndex + index + 1; 
                      const isTop3 = rank <= 3;
                      
                      const eventCount = user.registrations_count || 0;
                      const eProductCount = user.e_products_count || 0;

                      return (
                        <div 
                          key={user.id} 
                          className={`group flex items-center justify-between px-5 md:px-8 py-4 md:py-5 hover:bg-slate-50/50 transition-all duration-300 ${isTop3 ? 'bg-gradient-to-r from-slate-50/50 to-transparent' : ''}`}
                        >
                          <div className="flex items-center gap-4 md:gap-10 overflow-hidden pr-2">
                            
                            {/* Ranking Badge */}
                            <div className="w-8 md:w-10 flex justify-center shrink-0">
                              {getRankBadge(rank)}
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-3 md:gap-5 overflow-hidden">
                              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full overflow-hidden border-2 shrink-0 bg-slate-50 shadow-sm transition-transform duration-300 group-hover:scale-105 ${isTop3 ? 'border-amber-400' : 'border-slate-200'}`}>
                                <img 
                                  src={getAvatarUrl(user)} 
                                  alt={user.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="truncate">
                                <h4 className={`text-sm md:text-base font-black leading-tight truncate transition-colors ${isTop3 ? 'text-slate-900 group-hover:text-amber-600' : 'text-slate-700 group-hover:text-indigo-600'}`}>
                                  {user.name}
                                </h4>
                                
                                {/* 🔥 MOBILE VIEW BADGE (Menghilang jika 0) 🔥 */}
                                <div className="xs:hidden mt-1.5 flex items-center gap-2 flex-wrap">
                                  {(activeCategory === 'all' || activeCategory === 'event') && eventCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[9px] font-bold text-blue-700">
                                      <BookOpen size={10} /> {eventCount} Event
                                    </span>
                                  )}
                                  {(activeCategory === 'all' || activeCategory === 'eproduct') && eProductCount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded text-[9px] font-bold text-emerald-700">
                                      <ShoppingBag size={10} /> {eProductCount} E-Produk
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 🔥 DESKTOP VIEW BADGE (Menghilang jika 0) 🔥 */}
                          <div className="shrink-0 hidden xs:flex items-center justify-end gap-2.5 pl-2">
                            
                            {(activeCategory === 'all' || activeCategory === 'event') && eventCount > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 shadow-sm text-blue-700 transition-transform hover:-translate-y-0.5">
                                <span className="text-xs font-black">{eventCount}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Event</span>
                                <BookOpen size={14} className="sm:hidden" />
                              </div>
                            )}
                            
                            {(activeCategory === 'all' || activeCategory === 'eproduct') && eProductCount > 0 && (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 shadow-sm text-emerald-700 transition-transform hover:-translate-y-0.5">
                                <span className="text-xs font-black">{eProductCount}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">E-Produk</span>
                                <ShoppingBag size={14} className="sm:hidden" />
                              </div>
                            )}
                            
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-slate-50/50 border-t border-slate-200 px-5 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-widest order-2 sm:order-1">
                    Halaman <span className="font-black text-slate-900">{currentPage}</span> dari {totalPages}
                  </p>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      Kembali
                    </button>
                    
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-900 text-xs font-bold text-white hover:bg-indigo-600 hover:border-indigo-600 disabled:bg-slate-200 disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-md shadow-slate-900/20 active:scale-95"
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