"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Tag, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [name, setName] = useState('');
  
  // 🔥 STATE UNTUK MENAMPUNG ROLE USER YANG LOGIN 🔥
  const [userRole, setUserRole] = useState<string>('organizer'); 

  // State khusus untuk Custom Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ show: boolean, id: number | null }>({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Ambil data user dari localStorage saat komponen dimuat
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserRole(parsedUser.role || 'organizer');
    }
    fetchCategories(); 
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiFetch('/admin/article-categories');
      const data = await res.json();
      setCategories(data.data);
    } catch (err) {
      toast.error("Gagal menarik data kategori.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    const loadToast = toast.loading("Menambahkan kategori...");
    
    try {
      const res = await apiFetch('/admin/article-categories', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      
      if (res.ok) {
        setName('');
        fetchCategories();
        toast.success("Kategori berhasil ditambahkan!", { id: loadToast });
      } else {
        toast.error("Gagal menambahkan kategori.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Kesalahan server.", { id: loadToast });
    } finally {
      setBtnLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    setIsDeleting(true);
    const loadToast = toast.loading("Menghapus kategori...");
    
    try {
      const res = await apiFetch(`/admin/article-categories/${deleteModal.id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        toast.success("Kategori berhasil dihapus!", { id: loadToast });
        setDeleteModal({ show: false, id: null });
        fetchCategories();
      } else {
        toast.error("Gagal menghapus kategori.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan koneksi.", { id: loadToast });
    } finally {
      setIsDeleting(false);
    }
  };

  const isSuperadmin = userRole === 'superadmin';

  return (
    <>
      {/* CUSTOM DELETE MODAL */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setDeleteModal({ show: false, id: null })}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden z-10 p-6 md:p-8"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={28} strokeWidth={2} className="md:w-8 md:h-8" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-2">Hapus Kategori?</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Artikel yang menggunakan kategori ini mungkin akan terpengaruh.
                </p>
                
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => setDeleteModal({ show: false, id: null })}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 md:py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs md:text-sm rounded-xl transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 md:py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm rounded-xl transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 relative z-10 px-2 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mt-2 md:mt-0">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Kategori Artikel</h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Daftar kategori untuk mengelompokkan konten edukasi.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 🔥 SEMBUNYIKAN FORM TAMBAH JIKA BUKAN SUPERADMIN 🔥 */}
          {isSuperadmin && (
            <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 h-fit shadow-sm">
              <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-indigo-600 md:w-[18px] md:h-[18px]" /> Tambah Baru
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Nama Kategori</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Cth: Web Development"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 md:py-3 px-4 text-xs md:text-sm focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <button 
                  disabled={btnLoading}
                  className="w-full bg-indigo-600 text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {btnLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Simpan Kategori
                </button>
              </form>
            </div>
          )}

          {/* Kolom Tabel Kanan (Melebar penuh jika bukan Superadmin) */}
          <div className={`${isSuperadmin ? 'md:col-span-2' : 'md:col-span-3'} bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col`}>
            
            {/* Banner Informasi untuk Organizer */}
            {!isSuperadmin && (
               <div className="bg-amber-50/50 border-b border-amber-100 p-4 px-5 md:px-6 flex items-start gap-3">
                  <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={18} />
                  <div>
                     <h4 className="text-xs font-bold text-amber-800">Akses Terbatas</h4>
                     <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed mt-0.5">Sebagai Organizer, Anda hanya dapat melihat daftar kategori. Penambahan kategori baru hanya dapat dilakukan oleh Super Administrator.</p>
                  </div>
               </div>
            )}

            <div className="overflow-x-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse min-w-[400px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Kategori</th>
                    {/* Sembunyikan Header Aksi jika bukan Superadmin */}
                    {isSuperadmin && (
                      <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={isSuperadmin ? 2 : 1} className="p-8 md:p-10 text-center text-slate-400 text-xs md:text-sm"><Loader2 size={24} className="animate-spin mx-auto text-indigo-400 mb-2"/> Memuat data...</td></tr>
                  ) : categories.length === 0 ? (
                    <tr><td colSpan={isSuperadmin ? 2 : 1} className="p-8 md:p-10 text-center text-slate-400 text-xs md:text-sm">Belum ada kategori tersedia.</td></tr>
                  ) : (
                    categories.map((cat: any) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                              <Tag size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{cat.name}</p>
                              <p className="text-[9px] md:text-[10px] text-slate-400 font-mono tracking-tight truncate">{cat.slug}</p>
                            </div>
                          </div>
                        </td>
                        
                        {/* Sembunyikan Tombol Hapus jika bukan Superadmin */}
                        {isSuperadmin && (
                          <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                            <button 
                              onClick={() => setDeleteModal({ show: true, id: cat.id })}
                              className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} className="md:w-4 md:h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
      `}</style>
    </>
  );
}