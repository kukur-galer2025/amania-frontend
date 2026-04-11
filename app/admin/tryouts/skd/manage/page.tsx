"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Loader2, 
  Search, Package, Clock, FileText, Flame, Calendar, Filter, ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
// 🔥 IMPORT KOMPONEN MODAL CANTIK 🔥
import ConfirmModal from '@/app/components/ConfirmModal';

export default function ManageSkdTryoutsPage() {
  const [tryouts, setTryouts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // STATE FILTER & SEARCH
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest'

  // STATE UNTUK MODAL HAPUS
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resTryouts, resCategories] = await Promise.all([
        apiFetch('/admin/tryout/skd/tryouts'),
        apiFetch('/admin/tryout/skd/tryout-categories')
      ]);

      const jsonTryouts = await resTryouts.json();
      const jsonCategories = await resCategories.json();

      if (resTryouts.ok && jsonTryouts.success) {
        setTryouts(jsonTryouts.data);
      } else {
        toast.error(jsonTryouts.message || 'Gagal memuat tryout');
      }

      if (resCategories.ok && jsonCategories.success) {
        setCategories(jsonCategories.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Kesalahan jaringan. Pastikan backend jalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // FUNGSI MEMBUKA MODAL
  const handleDeleteClick = (id: number) => {
    setSelectedIdToDelete(id);
    setDeleteModalOpen(true);
  };

  // FUNGSI EKSEKUSI HAPUS
  const confirmDelete = async () => {
    if (!selectedIdToDelete) return;
    
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/tryouts/${selectedIdToDelete}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Tryout berhasil dihapus');
        fetchData(); 
        setDeleteModalOpen(false);
      } else {
        toast.error(json.message || 'Gagal menghapus tryout');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleting(false);
      setSelectedIdToDelete(null);
    }
  };

  // 🔥 FILTER LOGIC 🔥
  const processedTryouts = tryouts
    .filter(t => {
      // Filter Pencarian Text
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      // Filter Kategori
      const matchCategory = filterCategory === 'all' || t.skd_tryout_category_id?.toString() === filterCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      // Sorting
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const formatDateStr = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // HELPER WARNA KATEGORI DINAMIS
  const getCategoryColor = (categoryName: string) => {
    if (!categoryName) return 'bg-slate-50 text-slate-600 border-slate-200';
    const lowerName = categoryName.toLowerCase();
    if (lowerName.includes('cpns')) return 'bg-sky-50 text-sky-600 border-sky-100';
    if (lowerName.includes('dinas')) return 'bg-amber-50 text-amber-600 border-amber-100';
    if (lowerName.includes('bumn')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    return 'bg-indigo-50 text-indigo-600 border-indigo-100'; 
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      
      {/* HEADER & TOMBOL TAMBAH */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Kelola Tryout SKD</h1>
          <p className="text-slate-500 font-medium text-sm max-w-xl leading-relaxed">
            Buat "Wadah" ujiannya dulu di sini. Setelah tryout dibuat, Anda bisa langsung mengelola dan memasukkan soal ke dalamnya.
          </p>
        </div>
        <Link 
          href="/admin/tryouts/skd/manage/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} strokeWidth={3} /> Buat Tryout Baru
        </Link>
      </div>

      {/* 🔥 AREA PENCARIAN & FILTER 🔥 */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Cari judul tryout..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter Kategori */}
        <div className="relative w-full md:w-48 shrink-0">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {categories.map(c => (
              <option key={c.id} value={c.id.toString()}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Sortir Urutan */}
        <div className="relative w-full md:w-48 shrink-0">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>

      </div>

      {/* GRID DATA TRYOUT */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Tryout...</p>
        </div>
      ) : processedTryouts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-slate-200 border-dashed">
          <Package size={56} className="text-slate-300 mb-5" />
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {tryouts.length === 0 ? 'Belum Ada Tryout' : 'Tryout Tidak Ditemukan'}
          </h3>
          <p className="text-sm font-medium text-slate-500 mb-6 text-center max-w-sm">
            {tryouts.length === 0 
              ? 'Anda belum memiliki tryout ujian sama sekali. Klik tombol di bawah untuk mulai membuat.' 
              : 'Tidak ada tryout yang cocok dengan kata kunci atau filter pencarian Anda.'}
          </p>
          {tryouts.length === 0 ? (
            <Link href="/admin/tryouts/skd/manage/create" className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              Buat Tryout Pertama
            </Link>
          ) : (
            <button onClick={() => { setSearchQuery(''); setFilterCategory('all'); }} className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {processedTryouts.map((t) => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={t.id} className={`bg-white rounded-[1.5rem] p-6 border shadow-sm transition-all flex flex-col relative overflow-hidden group hover:shadow-xl ${t.is_active ? 'border-slate-200 hover:border-indigo-300' : 'border-slate-200 opacity-80'}`}
              >
                
                {/* LENCANA DRAFT (Jika tidak aktif) */}
                {!t.is_active && (
                  <div className="absolute top-0 left-0 right-0 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest py-1.5 text-center border-b border-slate-200">
                    Draft / Disembunyikan
                  </div>
                )}

                <div className={`flex justify-between items-start mb-4 ${!t.is_active ? 'mt-4' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    
                    {/* 🔥 LENCANA KATEGORI DINAMIS 🔥 */}
                    {t.category && (
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(t.category.name)}`}>
                        {t.category.name}
                      </span>
                    )}

                    {(t.is_hots == 1 || t.is_hots === true) && (
                      <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-rose-50 text-rose-600 border-rose-100">
                        <Flame size={12} strokeWidth={3} /> HOTS
                      </span>
                    )}
                  </div>
                  
                  {/* Tombol Aksi Cepat */}
                  <div className="flex gap-2">
                    <Link href={`/admin/tryouts/skd/manage/${t.id}/edit`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      <Edit3 size={16}/>
                    </Link>
                    <button onClick={() => handleDeleteClick(t.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>

                {/* Judul Tryout */}
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-5 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                  {t.title}
                </h3>
                
                {/* Informasi Singkat */}
                <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <Clock size={16} className="text-indigo-400"/> {t.duration_minutes} Menit Waktu Pengerjaan
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <FileText size={16} className="text-emerald-400"/> {t.questions_count || 0} Soal Telah Dibuat
                  </div>
                </div>

                {/* AREA HARGA & DISKON */}
                <div className="mb-6 mt-auto">
                  {t.price == 0 ? (
                    <div className="text-lg font-black text-emerald-500 bg-emerald-50 px-4 py-2 rounded-xl inline-block">GRATIS</div>
                  ) : (
                    <div className="flex flex-col">
                      {t.discount_price !== null && t.discount_price < t.price ? (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-400 line-through decoration-rose-400/50 decoration-2">
                              {formatRupiah(t.price)}
                            </span>
                            <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-md">SALE</span>
                          </div>
                          <span className="text-xl font-black text-slate-900">{formatRupiah(t.discount_price)}</span>
                          
                          {(t.discount_start_date || t.discount_end_date) && (
                            <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg w-max border border-amber-100">
                              <Calendar size={12} />
                              {t.discount_end_date ? `Diskon s.d ${formatDateStr(t.discount_end_date)}` : `Diskon Berjalan`}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xl font-black text-slate-900">{formatRupiah(t.price)}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* TOMBOL MENUJU KELOLA SOAL */}
                <div className="pt-5 border-t border-slate-100">
                  <Link 
                    href={`/admin/tryouts/skd/questions?skd_tryout_id=${t.id}`}
                    className={`w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95 ${
                      t.is_active 
                      ? 'bg-slate-900 hover:bg-indigo-600 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Kelola Daftar Soal
                  </Link>
                </div>
                
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Hapus Tryout Ini?"
        message="Tindakan ini tidak bisa dibatalkan. Seluruh bank soal, pengaturan harga, dan data peserta yang terkait dengan Tryout ini akan terhapus secara permanen."
        confirmText="Ya, Hapus Permanen"
      />
    </div>
  );
}