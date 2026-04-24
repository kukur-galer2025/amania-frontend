"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, XCircle, Loader2, Layers, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function AdminEProductCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/e-product-categories');
      const json = await res.json();
      if (res.ok && json.success) {
        setCategories(json.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
    } else {
      setEditingId(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingId(null), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama kategori tidak boleh kosong!");

    setIsSubmitting(true);
    const loadToast = toast.loading(editingId ? "Menyimpan perubahan..." : "Menambah kategori...");

    try {
      const url = editingId ? `/admin/e-product-categories/${editingId}` : '/admin/e-product-categories';
      const res = await apiFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        fetchCategories();
        closeModal();
      } else {
        toast.error(json.message || "Gagal menyimpan kategori.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan server.", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini? (Produk yang menggunakan kategori ini tidak akan terhapus, hanya status kategorinya menjadi kosong)")) return;

    const loadToast = toast.loading("Menghapus kategori...");
    try {
      const res = await apiFetch(`/admin/e-product-categories/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        fetchCategories();
      } else {
        toast.error(json.message || "Gagal menghapus kategori.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.", { id: loadToast });
    }
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Layers size={24} />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Kategori E-Produk</h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Master Data</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Cari kategori..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full md:w-56 transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shrink-0">
            <Plus size={16} /> <span className="hidden sm:block">Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] w-16">No</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Nama Kategori</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Slug Sistem</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-indigo-500" />Memuat data...</td></tr>
            ) : filteredCategories.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500"><Layers size={40} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">Belum ada kategori</p></td></tr>
            ) : (
              filteredCategories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-400">{index + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                  <td className="px-6 py-4"><span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-xs font-mono">{cat.slug}</span></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(cat)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
              
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-900">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"><XCircle size={20} /></button>
              </div>

              <div className="p-6">
                <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Nama Kategori <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" required value={name} onChange={(e) => setName(e.target.value)} 
                      placeholder="Cth: Teknologi & Programming" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" 
                    />
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" form="categoryForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}