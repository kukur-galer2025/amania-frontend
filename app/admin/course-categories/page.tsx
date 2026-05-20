"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Tag, Loader2,
  CheckCircle2, XCircle, PackageSearch, FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function AdminCourseCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/course-categories');
      const json = await res.json();
      if (res.ok && json.success) setCategories(json.data);
    } catch {
      toast.error('Gagal mengambil data kategori kursus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (category?: any) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadToast = toast.loading(editingId ? 'Mengupdate kategori...' : 'Membuat kategori...');

    try {
      const url = editingId ? `/admin/course-categories/${editingId}` : '/admin/course-categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ name, description }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(editingId ? 'Kategori berhasil diupdate!' : 'Kategori berhasil dibuat!', { id: loadToast });
        closeModal();
        fetchData();
      } else {
        toast.error(json.message || 'Gagal menyimpan kategori.', { id: loadToast });
      }
    } catch {
      toast.error('Terjadi kesalahan server.', { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Kursus di bawah kategori ini TIDAK akan ikut terhapus.')) return;

    const loadToast = toast.loading('Menghapus kategori...');
    try {
      const res = await apiFetch(`/admin/course-categories/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Kategori berhasil dihapus!', { id: loadToast });
        fetchData();
      } else {
        toast.error(json.message || 'Gagal menghapus kategori.', { id: loadToast });
      }
    } catch {
      toast.error('Terjadi kesalahan sistem.', { id: loadToast });
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8 bg-slate-50 min-h-[80vh] pb-10 rounded-2xl">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-3">
            <Tag size={12} /> Kursus Online
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Kategori Kursus</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen kategori kursus online Amania.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] shrink-0">
            <Plus size={16} /> Tambah Kategori
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] w-12">#</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Nama Kategori</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Deskripsi</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Jumlah Kursus</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-emerald-500" /><span className="font-bold">Memuat kategori...</span></td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500"><FolderOpen size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700 text-base">Belum Ada Kategori</p><p className="text-xs">Klik "Tambah Kategori" untuk membuat yang pertama.</p></td></tr>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                          <Tag size={18} />
                        </div>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-[300px] truncate">{cat.description || <span className="text-slate-300 italic">Tidak ada deskripsi</span>}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                        {cat.courses_count ?? 0} kursus
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(cat)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100" title="Hapus">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden">

              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">{editingId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Kursus Online</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors"><XCircle size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nama Kategori <span className="text-rose-500">*</span></label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Cth: Web Development" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Deskripsi</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat kategori (opsional)" rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner resize-none" />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:opacity-70 active:scale-95">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                    {isSubmitting ? 'Memproses...' : editingId ? 'Simpan Perubahan' : 'Buat Kategori'}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
