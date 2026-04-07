"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Edit3, Trash2, Image as ImageIcon, Loader2, 
  AlertCircle, Search, ChevronLeft, ChevronRight, Inbox
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State untuk Pencarian dan Paginasi
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchArticles = async () => {
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/admin/articles');
      const data = await res.json();
      setArticles(data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil daftar artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const openDeleteModal = (id: number) => {
    setSelectedArticleId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedArticleId) return;
    
    setIsDeleting(true);
    const loadToast = toast.loading("Menghapus artikel...");
    
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(`/admin/articles/${selectedArticleId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success("Artikel berhasil dihapus", { id: loadToast });
        fetchArticles();
      } else {
        toast.error("Gagal menghapus artikel", { id: loadToast });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi", { id: loadToast });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setSelectedArticleId(null);
    }
  };

  // Logika Filter dan Pencarian
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const searchLower = searchQuery.toLowerCase();
      return (
        article.title?.toLowerCase().includes(searchLower) ||
        article.category?.name?.toLowerCase().includes(searchLower) ||
        article.author?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [articles, searchQuery]);

  // Reset ke halaman 1 saat mulai mencari
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Logika Paginasi
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5 md:space-y-6 animate-in fade-in duration-500 pb-20 px-2 sm:px-0">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 md:mt-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Kelola Artikel</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Manajemen konten berita dan jurnal Amania.</p>
        </div>
        <Link 
          href="/admin/articles/create"
          className="bg-indigo-600 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-all shadow-md md:shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group w-full sm:w-auto"
        >
          <Plus size={16} className="md:w-[18px] md:h-[18px] group-hover:rotate-90 transition-transform" /> Tulis Artikel Baru
        </Link>
      </div>

      {/* 2. FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
         <div className="relative w-full sm:w-80 md:w-96 group">
            <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Cari judul, kategori..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-xs md:text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
            />
         </div>
         <div className="hidden sm:block">
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 md:px-3 py-1.5 rounded-lg border border-slate-200">
              Total {filteredArticles.length} Konten
            </span>
         </div>
      </div>

      {/* 3. DATA TABLE AREA (Responsive Horizontal Scroll) */}
      <div className="bg-white rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Info Artikel</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Kategori</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em]">Status</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-wider md:tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-500" size={28} />
                      <span className="text-xs md:text-sm font-bold text-slate-400 tracking-wider">Menyinkronkan Database...</span>
                    </div>
                  </td>
                </tr>
              ) : currentArticles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 md:p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Inbox size={40} strokeWidth={1.5} className="md:w-12 md:h-12" />
                      <p className="font-bold text-base md:text-lg text-slate-600">Tidak ada data</p>
                      <p className="text-xs md:text-sm">Coba sesuaikan kata kunci pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentArticles.map((article: any) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 md:px-8 py-3 md:py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-100 rounded-lg md:rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm relative">
                          {article.image ? (
                            <img src={`${STORAGE_URL}/${article.image}`} alt="cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16} className="md:w-5 md:h-5" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-slate-900 line-clamp-2 md:line-clamp-1 group-hover:text-indigo-600 transition-colors leading-snug">{article.title}</p>
                          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5 md:mt-1 uppercase tracking-wider flex items-center gap-1.5 md:gap-2">
                             Oleh {article.author?.name?.split(' ')[0] || 'Admin'} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {article.read_time || 5} Min Read
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-8 py-3 md:py-5 whitespace-nowrap">
                      <span className="px-2 md:px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md md:rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-tight">
                        {article.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 md:px-8 py-3 md:py-5 whitespace-nowrap">
                      {article.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] md:text-[10px] font-bold border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> <span className="hidden sm:inline">Published</span><span className="sm:hidden">Publik</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full bg-amber-50 text-amber-500 text-[9px] md:text-[10px] font-bold border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Draft
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-8 py-3 md:py-5 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 md:gap-2">
                        <Link 
                          href={`/admin/articles/edit?id=${article.id}`} 
                          className="p-1.5 md:p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-lg md:rounded-xl transition-all shadow-sm group/btn"
                        >
                          <Edit3 size={16} className="md:w-[18px] md:h-[18px] group-hover/btn:scale-110 transition-transform" />
                        </Link>
                        <button 
                          onClick={() => openDeleteModal(article.id)} 
                          className="p-1.5 md:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg md:rounded-xl transition-all shadow-sm group/btn"
                        >
                          <Trash2 size={16} className="md:w-[18px] md:h-[18px] group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. PAGINATION CONTROLS */}
        {!loading && filteredArticles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 md:px-8 py-4 md:py-5 gap-3 md:gap-4">
            <p className="text-[10px] md:text-xs text-slate-500 font-medium">
              Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredArticles.length)}</span> dari <span className="font-bold text-slate-900">{filteredArticles.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
              <div className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-slate-700 shadow-sm min-w-[60px] md:min-w-[100px] text-center uppercase tracking-widest">
                 {currentPage} / {totalPages || 1}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg md:rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM DELETE MODAL */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isDeleting && setIsDeleteModalOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white rounded-3xl md:rounded-[40px] p-6 md:p-10 shadow-2xl max-w-sm w-full z-10 border border-slate-100" >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 border border-rose-100">
                <AlertCircle size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 text-center mb-2 leading-tight">Hapus Artikel?</h3>
              <p className="text-slate-500 text-center text-xs md:text-sm mb-8 md:mb-10 leading-relaxed font-medium">
                Tindakan ini tidak bisa dibatalkan. Konten akan dihapus selamanya dari Amania.
              </p>
              <div className="flex gap-3 md:gap-4">
                <button disabled={isDeleting} onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200" >
                  Batal
                </button>
                <button disabled={isDeleting} onClick={handleDelete} className="flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 flex items-center justify-center gap-2" >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'Ya, Hapus'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
      `}</style>
    </div>
  );
}