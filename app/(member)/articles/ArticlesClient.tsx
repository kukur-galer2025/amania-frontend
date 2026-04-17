"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Calendar, ChevronRight, BookOpen, 
  ChevronLeft, Clock, TrendingUp, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

// Helper untuk cuplikan teks
const getSnippet = (html: string) => {
  if (!html) return "";
  
  // 1. Hapus semua tag HTML (<p>, <strong>, dll)
  let text = html.replace(/<[^>]+>/g, ' ');
  
  // 2. Decode HTML Entities secara manual (Aman untuk Next.js SSR)
  text = text.replace(/&amp;nbsp;/g, ' ')
             .replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");

  // 3. Bersihkan spasi ganda yang tersisa
  text = text.replace(/\s+/g, ' ').trim();
  
  return text.length > 130 ? text.substring(0, 130) + '...' : text;
};

export default function ArticlesClient() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // 1 Headline + 6 List Berita per halaman

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await apiFetch('/articles');
        const data = await res.json();
        if (data.success) {
          const sorted = data.data.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setArticles(sorted);
        }
      } catch (error) {
        console.error("Gagal mengambil artikel", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const categories = ['Semua', ...Array.from(new Set(articles.map(a => a.category?.name).filter(Boolean)))];

  // Filter Data
  let processedArticles = [...articles];
  if (selectedCategory !== 'Semua') {
    processedArticles = processedArticles.filter(a => a.category?.name === selectedCategory);
  }
  if (searchQuery) {
    processedArticles = processedArticles.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  // Pagination Logic
  const totalPages = Math.ceil(processedArticles.length / itemsPerPage);
  const currentArticles = processedArticles.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const popularArticles = articles.slice(0, 4);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 selection:text-blue-900 pb-16 md:pb-20 overflow-x-hidden">
      
      {/* 🔥 PERBAIKAN Z-INDEX DI SINI AGAR TIDAK MENEMBUS SIDEBAR 🔥 */}
      <div className="border-b border-slate-200 sticky top-0 z-20 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 md:py-6 w-full">
          <Link href="/beranda" className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 transition-colors mb-2 md:mb-3">
             <ChevronLeft size={14}/> Beranda Utama
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-2 md:gap-3 break-words">
             <img src="/logo-amania.png" alt="Amania" className="h-6 md:h-8 w-auto object-contain shrink-0" />
             Amania <span className="text-red-600 shrink-0">News</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">Kabar terbaru seputar teknologi, edukasi, dan karir.</p>
        </div>
        
        {/* Navigasi Kategori Horizontal ala Portal Berita */}
        <div className="max-w-6xl mx-auto px-4 lg:px-8 w-full">
          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar py-2.5 md:py-3 border-t border-slate-100 w-full">
            {categories.map((cat: any) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ${
                  selectedCategory === cat 
                  ? 'text-red-600 border-b-2 border-red-600 pb-1' 
                  : 'text-slate-500 hover:text-slate-900 pb-1'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 flex flex-col lg:flex-row gap-8 md:gap-12 w-full min-w-0">
        
        {/* KOLOM KIRI (KONTEN UTAMA - 70%) */}
        <main className="w-full lg:w-[70%] min-w-0">
          
          {/* SEARCH BAR MOBILE ONLY */}
          <div className="lg:hidden mb-6 relative">
            <input 
              type="text" 
              placeholder="Cari berita..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {loading ? (
             <div className="space-y-6 md:space-y-8 animate-pulse">
                <div className="w-full aspect-video md:aspect-[16/9] bg-slate-200 rounded-xl"></div>
                <div className="h-6 md:h-8 bg-slate-200 w-3/4 rounded-md"></div>
                <div className="h-4 bg-slate-200 w-full rounded-md"></div>
             </div>
          ) : processedArticles.length === 0 ? (
            <div className="py-16 md:py-20 text-center border-y border-slate-200 px-4">
              <Search size={40} className="md:w-12 md:h-12 mx-auto text-slate-300 mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 md:mb-2">Berita Tidak Ditemukan</h3>
              <p className="text-xs md:text-sm text-slate-500">Tidak ada artikel yang cocok dengan kata kunci "{searchQuery}".</p>
            </div>
          ) : (
            <>
              {/* HEADLINE (Hanya tampil di Halaman 1 jika ada data) */}
              {currentPage === 1 && currentArticles.length > 0 && (
                <div className="mb-8 md:mb-12 border-b border-slate-200 pb-8 md:pb-10 w-full min-w-0">
                  {/* 🔥 PERUBAHAN: TAUTAN MENGARAH KE DYNAMIC ROUTE [slug] 🔥 */}
                  <Link href={`/articles/${currentArticles[0].slug}`} className="group block w-full">
                    <div className="w-full aspect-video md:aspect-[16/9] bg-slate-100 mb-4 md:mb-5 relative overflow-hidden rounded-xl md:rounded-none shrink-0">
                      {currentArticles[0].image ? (
                        <img src={`${STORAGE_URL}/${currentArticles[0].image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Headline" />
                      ) : (
                        <div className="w-full h-full flex justify-center items-center text-slate-300"><BookOpen size={48} className="md:w-16 md:h-16" strokeWidth={1}/></div>
                      )}
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 md:px-3 rounded-md md:rounded-none shadow-md">
                        {currentArticles[0].category?.name || 'Utama'}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-slate-500 mb-2 md:mb-3 uppercase tracking-wider px-1 md:px-0">
                      {/* 🔥 MENAMPILKAN PENULIS (ORGANIZER) 🔥 */}
                      <span className="text-blue-600 flex items-center gap-1 line-clamp-1 max-w-[120px] md:max-w-none">
                         <User size={10} /> {currentArticles[0].author?.name || 'Redaksi'}
                      </span>
                      <span className="hidden xs:inline">•</span><span className="xs:hidden">|</span>
                      <span>{formatDate(currentArticles[0].created_at)}</span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2 md:mb-4 group-hover:text-blue-600 transition-colors px-1 md:px-0 break-words w-full">
                      {currentArticles[0].title}
                    </h2>
                    
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed line-clamp-3 md:line-clamp-none px-1 md:px-0 break-words w-full">
                      {getSnippet(currentArticles[0].content)}
                    </p>
                  </Link>
                </div>
              )}

              {/* LIST BERITA (Kumpulan Artikel Sisanya) */}
              <div className="space-y-0 w-full min-w-0">
                <h3 className="text-base md:text-lg font-black uppercase border-l-4 border-red-600 pl-2.5 md:pl-3 mb-4 md:mb-6 text-slate-900">
                  {currentPage === 1 ? 'Berita Lainnya' : `Indeks Berita - Halaman ${currentPage}`}
                </h3>

                <AnimatePresence mode="popLayout">
                  {currentArticles.slice(currentPage === 1 ? 1 : 0).map((article: any, index: number) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      key={article.id}
                      className="w-full min-w-0"
                    >
                      {/* 🔥 PERUBAHAN: TAUTAN MENGARAH KE DYNAMIC ROUTE [slug] 🔥 */}
                      <Link href={`/articles/${article.slug}`} className="group flex flex-col sm:flex-row gap-4 md:gap-5 py-5 md:py-6 border-b border-slate-200 hover:bg-slate-50 transition-colors px-1 md:px-2 rounded-xl md:rounded-none min-w-0">
                        
                        {/* Thumbnail */}
                        <div className="w-full sm:w-[200px] md:w-[240px] aspect-video sm:aspect-[4/3] bg-slate-100 shrink-0 overflow-hidden relative rounded-xl md:rounded-lg">
                          {article.image ? (
                            <img src={`${STORAGE_URL}/${article.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Thumbnail" />
                          ) : (
                            <div className="w-full h-full flex justify-center items-center text-slate-300"><BookOpen size={24} className="md:w-8 md:h-8" /></div>
                          )}
                          <div className="absolute bottom-2 right-2 sm:hidden bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {article.read_time || 5} Min
                          </div>
                        </div>

                        {/* Konten Kanan */}
                        <div className="flex flex-col flex-1 py-1 min-w-0 w-full overflow-hidden">
                          <span className="text-[9px] md:text-[10px] font-black text-red-600 uppercase tracking-widest mb-1.5 md:mb-2 block truncate">
                            {article.category?.name || 'Umum'}
                          </span>
                          
                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 leading-snug md:leading-tight mb-2 md:mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 md:line-clamp-3 break-words w-full">
                            {article.title}
                          </h4>
                          
                          <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-3 md:mb-4 leading-relaxed break-words w-full">
                            {getSnippet(article.content)}
                          </p>

                          <div className="mt-auto flex items-center flex-wrap gap-2 md:gap-3 text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            {/* 🔥 MENAMPILKAN PENULIS PADA LIST 🔥 */}
                            <span className="flex items-center gap-1 md:gap-1.5 text-indigo-500 truncate max-w-[100px] md:max-w-none">
                               <User size={10} className="md:w-3 md:h-3"/> {article.author?.name || 'Redaksi'}
                            </span>
                            <span className="hidden sm:inline">|</span>
                            <span className="flex items-center gap-1 md:gap-1.5"><Calendar size={10} className="md:w-3 md:h-3"/> {formatDate(article.created_at)}</span>
                            <span className="hidden sm:inline">|</span>
                            <span className="hidden sm:flex items-center gap-1 md:gap-1.5"><Clock size={10} className="md:w-3 md:h-3"/> {article.read_time || 5} Min</span>
                          </div>
                        </div>

                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* PAGINATION KOMPAS STYLE */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-8 md:mt-12 border-t border-slate-200 pt-6 md:pt-8 overflow-x-auto pb-4 w-full">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                    className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center border border-slate-300 text-slate-500 rounded-md md:rounded-none hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} className="md:w-4 md:h-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i} onClick={() => handlePageChange(i + 1)}
                      className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center text-xs md:text-sm font-bold rounded-md md:rounded-none transition-colors ${
                        currentPage === i + 1 
                        ? 'bg-slate-900 text-white border border-slate-900' 
                        : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-900 hover:text-slate-900'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                    className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center border border-slate-300 text-slate-500 rounded-md md:rounded-none hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} className="md:w-4 md:h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </main>

        {/* KOLOM KANAN (SIDEBAR - 30%) */}
        <aside className="w-full lg:w-[30%] border-t border-slate-200 lg:border-t-0 pt-8 lg:pt-0 min-w-0">
          <div className="lg:sticky lg:top-24 w-full">
            
            {/* WIDGET PENCARIAN - Desktop Only */}
            <div className="hidden lg:block mb-8 md:mb-10">
              <h3 className="text-sm font-black uppercase border-b-2 border-slate-900 pb-2 mb-4 text-slate-900 flex items-center gap-2">
                <Search size={16}/> Cari Berita
              </h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Masukkan kata kunci..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 py-3 pl-4 pr-10 text-sm focus:outline-none focus:border-blue-600 transition-colors"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* WIDGET TERPOPULER */}
            <div className="mb-10 w-full min-w-0">
              <h3 className="text-base md:text-lg font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-5 md:mb-6 inline-block w-full flex items-center gap-2">
                <TrendingUp size={18} className="text-red-600 shrink-0"/> Terpopuler
              </h3>
              
              <div className="space-y-0 w-full">
                {popularArticles.map((article: any, idx: number) => (
                  // 🔥 PERUBAHAN: TAUTAN MENGARAH KE DYNAMIC ROUTE [slug] 🔥
                  <Link href={`/articles/${article.slug}`} key={idx} className="group flex gap-3 md:gap-4 py-3 md:py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors w-full min-w-0">
                    <div className="text-2xl md:text-3xl font-black text-slate-200 group-hover:text-red-600 transition-colors mt-0.5 md:mt-0 shrink-0">
                      0{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden w-full">
                      <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1 truncate w-full">
                        {article.category?.name || 'Umum'}
                      </span>
                      <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 md:line-clamp-3 break-words w-full">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
                {popularArticles.length === 0 && !loading && (
                   <p className="text-xs text-slate-500 text-center py-4">Belum ada berita terpopuler.</p>
                )}
              </div>
            </div>

            {/* Kotak Iklan / Banner Edukasi */}
            <div className="bg-slate-900 p-5 md:p-6 text-white text-center rounded-xl md:rounded-2xl shadow-lg w-full shrink-0">
              <img src="/logo-amania.png" alt="Amania" className="mx-auto mb-3 md:mb-4 h-10 md:h-12 w-auto object-contain brightness-0 invert" />
              <h5 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 break-words">Tingkatkan Karir IT Anda</h5>
              <p className="text-xs md:text-sm text-slate-400 mb-5 md:mb-6 leading-relaxed px-2 md:px-0 break-words">Akses ratusan kelas premium dan bootcamp eksklusif bersama Amania.</p>
              <Link href="/events" className="block w-full py-2.5 md:py-3 bg-blue-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors rounded-lg md:rounded-xl shadow-sm">
                Lihat Katalog Kelas
              </Link>
            </div>

          </div>
        </aside>

      </div>

      <style jsx global>{`
        /* CSS KHUSUS GAYA EDITORIAL RESPONSIVE */
        .prose-news { 
          font-family: 'Inter', system-ui, sans-serif; 
          font-size: 1rem; 
          line-height: 1.7; 
          color: #334155; 
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          overflow-x: hidden;
        }
        @media (min-width: 768px) {
          .prose-news { font-size: 1.125rem; line-height: 1.8; }
        }
        .prose-news p { margin-bottom: 1.25rem; }
        .prose-news h2 { 
          font-size: 1.5rem; 
          font-weight: 800; 
          color: #0f172a; 
          margin-top: 2.5rem; 
          margin-bottom: 1rem; 
          line-height: 1.3;
        }
        @media (min-width: 768px) {
           .prose-news h2 { font-size: 1.75rem; margin-top: 3rem; }
        }
        .prose-news h3 { 
          font-size: 1.25rem; 
          font-weight: 700; 
          color: #0f172a; 
          margin-top: 2rem; 
          margin-bottom: 1rem; 
        }
        @media (min-width: 768px) {
           .prose-news h3 { font-size: 1.5rem; }
        }
        .prose-news blockquote { 
          font-size: 1.125rem; 
          font-style: italic; 
          color: #0f172a; 
          border-left: 3px solid #ef4444; 
          padding-left: 1rem; 
          margin: 2rem 0; 
          background: #f8fafc;
          padding-top: 1rem; padding-bottom: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        @media (min-width: 768px) {
           .prose-news blockquote { font-size: 1.25rem; background: transparent; padding-top: 0; padding-bottom: 0; border-left-width: 4px; padding-left: 1.5rem; margin: 2.5rem 0;}
        }
        .prose-news img { 
          margin: 2rem 0; 
          width: 100%; 
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
        }
        .prose-news ul, .prose-news ol { 
          margin-bottom: 1.25rem; 
          padding-left: 1.25rem; 
        }
        .prose-news li { margin-bottom: 0.5rem; }
        .prose-news strong { color: #0f172a; font-weight: 700; }
        .prose-news a { color: #2563eb; text-decoration: underline; text-underline-offset: 4px; font-weight: 500; word-break: break-all; }
      `}</style>
    </div>
  );
}