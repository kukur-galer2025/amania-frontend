"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, FolderTree, Loader2, 
  Search, X, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function SkdTryoutCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  // State Modal Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Pastikan backend Laravel kamu punya endpoint ini
      const res = await apiFetch('/admin/tryout/skd/tryout-categories');
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data);
      } else {
        toast.error(json.message || 'Gagal memuat kategori');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat: any = null) => {
    if (cat) {
      setEditId(cat.id);
      setFormData({ name: cat.name });
    } else {
      setEditId(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ name: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Nama kategori wajib diisi!');
    
    setIsSaving(true);
    try {
      const url = editId 
        ? `/admin/tryout/skd/tryout-categories/${editId}` 
        : '/admin/tryout/skd/tryout-categories';
      const method = editId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method: method,
        body: JSON.stringify(formData)
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || 'Kategori berhasil disimpan');
        fetchCategories(); 
        handleCloseModal();
      } else {
        toast.error(json.message || 'Gagal menyimpan kategori');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setSelectedIdToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedIdToDelete) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/tryout-categories/${selectedIdToDelete}`, {
        method: 'DELETE'
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message || 'Kategori berhasil dihapus');
        fetchCategories(); 
      } else {
        toast.error(json.message || 'Gagal menghapus kategori');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setSelectedIdToDelete(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Kategori Tryout</h1>
          <p className="text-slate-500 font-medium text-sm">
            Kelola jenis paket tryout (CPNS, Kedinasan, BUMN, dll).
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Cari nama kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Kategori...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[1.5rem] border-2 border-slate-200 border-dashed">
          <FolderTree size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Kategori Tryout</h3>
          <p className="text-sm text-slate-500 mb-4">Buat kategori pertama Anda (misal: CPNS / Kedinasan).</p>
          <button onClick={() => handleOpenModal()} className="px-6 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold rounded-xl transition-colors">
            Buat Kategori
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap w-16 text-center">No</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Nama Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Slug URL</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={cat.id} className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-sm font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <FolderTree size={16} />
                        </div>
                        <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-500">
                        {cat.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(cat)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(cat.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORM CREATE/EDIT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-800">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Nama Kategori</label>
                    <input 
                      type="text" value={formData.name} onChange={(e) => setFormData({ name: e.target.value })} 
                      placeholder="Contoh: SKD CPNS 2026" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" 
                      required autoFocus
                    />
                    <p className="text-[10px] font-medium text-slate-500 mt-2">*Slug URL akan di-generate secara otomatis oleh sistem.</p>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm">Batal</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 text-sm">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Hapus Kategori Ini?"
        message="Peringatan! Menghapus kategori ini mungkin akan memutus relasi pada Paket Tryout yang sudah menggunakan kategori ini."
        confirmText="Ya, Hapus"
      />
    </div>
  );
}