"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Image as ImageIcon, 
  FileText, CheckCircle2, XCircle, Loader2, PackageSearch, 
  Eye, EyeOff, UploadCloud
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

// 🔥 IMPORT REACT QUILL VERSI BARU (COMPATIBLE DENGAN REACT 19) 🔥
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; 
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }); 

export default function AdminEProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // State Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); 
  const [price, setPrice] = useState<number | string>('');
  const [isPublished, setIsPublished] = useState(true);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [filePath, setFilePath] = useState<File | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/e-products');
      const json = await res.json();
      if (res.ok && json.success) {
        setProducts(json.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data E-Produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openModal = (product: any = null) => {
    if (product) {
      setEditingId(product.id);
      setTitle(product.title);
      setDescription(product.description);
      setPrice(product.price);
      setIsPublished(product.is_published);
      setCoverImage(null);
      setFilePath(null);
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setPrice('');
      setIsPublished(true);
      setCoverImage(null);
      setFilePath(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingId(null), 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingId && !filePath) {
      toast.error("File asli (E-Book/Template) wajib diupload untuk produk baru!");
      return;
    }
    
    if (!description || description.trim() === '<p><br></p>') {
        toast.error("Deskripsi produk tidak boleh kosong!");
        return;
    }

    setIsSubmitting(true);
    const loadToast = toast.loading(editingId ? "Menyimpan perubahan..." : "Mengunggah produk baru...");

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description); 
      formData.append('price', price.toString());
      formData.append('is_published', isPublished ? '1' : '0');
      
      if (coverImage) formData.append('cover_image', coverImage);
      if (filePath) formData.append('file_path', filePath);

      const url = editingId ? `/admin/e-products/${editingId}` : '/admin/e-products';
      
      const res = await apiFetch(url, {
        method: 'POST', 
        body: formData,
      }, true); 

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        fetchProducts();
        closeModal();
      } else {
        toast.error(json.message || "Gagal menyimpan produk.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan server.", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah kamu yakin ingin menghapus produk digital ini beserta file fisiknya secara permanen?")) return;

    const loadToast = toast.loading("Menghapus produk...");
    try {
      const res = await apiFetch(`/admin/e-products/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Produk berhasil dihapus!", { id: loadToast });
        fetchProducts();
      } else {
        toast.error("Gagal menghapus produk.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.", { id: loadToast });
    }
  };

  const formatRupiah = (number: number) => {
    if (number === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // 🔥 KONFIGURASI TOOLBAR REACT QUILL 🔥
  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Katalog Digital</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola E-Book, Template, dan Modul Premium Amania.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shrink-0">
            <Plus size={16} /> <span className="hidden sm:block">Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Info Produk</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Harga</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Diunggah Oleh</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-indigo-500" />Memuat katalog...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500"><PackageSearch size={40} className="mx-auto mb-3 text-slate-300" /><p className="font-semibold text-slate-700">Belum ada produk</p></td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                          {product.cover_image ? <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-400" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[250px]">{product.title}</p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><FileText size={10} /> DIGITAL ASSET</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`font-bold ${product.price === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>{formatRupiah(product.price)}</span></td>
                    <td className="px-6 py-4">
                      {product.is_published ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100"><Eye size={14} /> Publik</span> : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200"><EyeOff size={14} /> Draft</span>}
                    </td>
                    <td className="px-6 py-4"><span className="text-xs font-semibold text-slate-600">{product.author?.name || 'Sistem'}</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(product)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH/EDIT PRODUK */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingId ? 'Edit E-Produk' : 'Unggah Produk Baru'}</h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><XCircle size={20} /></button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form id="productForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Judul Produk <span className="text-rose-500">*</span></label>
                      <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cth: Template Notion Event Organizer" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Harga (Rp) <span className="text-rose-500">*</span></label>
                        <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Isi 0 jika Gratis" className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Status Publikasi</label>
                        <select value={isPublished ? '1' : '0'} onChange={(e) => setIsPublished(e.target.value === '1')} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer">
                          <option value="1">Publik (Bisa Dibeli)</option>
                          <option value="0">Draft (Sembunyikan)</option>
                        </select>
                      </div>
                    </div>

                    {/* 🔥 AREA REACT QUILL 🔥 */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Deskripsi & Info <span className="text-rose-500">*</span></label>
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                        <ReactQuill 
                          theme="snow" 
                          value={description} 
                          onChange={setDescription} 
                          modules={quillModules}
                          placeholder="Tuliskan deskripsi produk yang menarik di sini..."
                          className="min-h-[150px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Area Upload */}
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14}/> Cover Gambar (Opsional)</label>
                      <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setCoverImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 cursor-pointer" />
                      {/* 🔥 INFORMASI MAKSIMAL 10MB DITAMBAHKAN DI SINI 🔥 */}
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        *Maksimal ukuran 10MB. {editingId && 'Abaikan jika tidak ingin mengganti cover yang lama.'}
                      </p>
                    </div>
                    <div className="h-px bg-indigo-100 w-full" />
                    <div>
                      <label className="block text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wider flex items-center gap-2"><UploadCloud size={14}/> File Asli (ZIP/RAR/PDF) {editingId ? '' : <span className="text-rose-500">*</span>}</label>
                      <input type="file" accept=".zip,.rar,.pdf" onChange={(e) => setFilePath(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
                      {editingId ? <p className="text-[10px] text-slate-500 mt-1.5">*Abaikan jika tidak ingin mengganti file master yang lama.</p> : <p className="text-[10px] text-slate-500 mt-1.5">*Ini adalah file rahasia yang otomatis diunduh pembeli setelah bayar.</p>}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" form="productForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background-color: #f8fafc;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          padding: 12px 16px !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit !important;
          font-size: 0.875rem !important;
        }
        .ql-editor {
          min-height: 150px;
          padding: 16px !important;
          color: #334155;
        }
        .ql-editor p { margin-bottom: 0.5em; }
      `}</style>
    </div>
  );
}