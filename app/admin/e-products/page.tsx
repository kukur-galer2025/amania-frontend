"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, Image as ImageIcon, 
  FileText, CheckCircle2, XCircle, Loader2, PackageSearch, 
  Eye, EyeOff, Layers, Info, User, AlertTriangle, CreditCard, SmartphoneNfc, Store, AlertCircle, ArrowUpRight,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 🔥 WAJIB UNTUK REDIRECT 🔥

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false }); 

export default function AdminEProductsPage() {
  const router = useRouter();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State Modal Utama (Hanya untuk BIKIN BARU)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal Info Tripay
  const [isTripayInfoOpen, setIsTripayInfoOpen] = useState(false);

  // State Form Draft
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(''); 
  const [description, setDescription] = useState(''); 
  const [price, setPrice] = useState<number | string>('');
  const [isPublished, setIsPublished] = useState(false); // Default Draft
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch('/admin/e-products'),
        apiFetch('/admin/e-product-categories')
      ]);
      
      const prodJson = await prodRes.json();
      const catJson = await catRes.json();
      
      if (prodRes.ok && prodJson.success) setProducts(prodJson.data);
      if (catRes.ok && catJson.success) setCategories(catJson.data);
      
    } catch (error) {
      toast.error('Gagal mengambil data sistem');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setTitle('');
    setCategoryId('');
    setDescription('');
    setPrice('');
    setIsPublished(false);
    setCoverImage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
        toast.error("Kategori wajib dipilih!");
        return;
    }

    const numPrice = Number(price);
    if (numPrice > 0 && numPrice < 1000) {
      toast.error("Harga tidak valid! Batas terendah absolut Tripay (QRIS/OVO/DANA) adalah Rp 1.000.");
      return;
    }
    
    if (!description || description.trim() === '<p><br></p>') {
        toast.error("Deskripsi produk tidak boleh kosong!");
        return;
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Membuat draft E-Produk...");

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('e_product_category_id', categoryId); 
      formData.append('description', description); 
      formData.append('price', price.toString());
      formData.append('is_published', isPublished ? '1' : '0');
      
      if (coverImage) formData.append('cover_image', coverImage);

      const res = await apiFetch('/admin/e-products', {
        method: 'POST', 
        body: formData,
      }, true); 

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Draft Dibuat! Mengarahkan ke Kelola Materi...", { id: loadToast });
        closeModal();
        
        // 🔥 OTOMATIS REDIRECT KE HALAMAN EDIT MATERI 🔥
        router.push(`/admin/e-products/edit?id=${json.data.id}`);
        
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
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini beserta SEMUA MATERINYA secara permanen?")) return;

    const loadToast = toast.loading("Menghapus produk...");
    try {
      const res = await apiFetch(`/admin/e-products/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Produk berhasil dihapus!", { id: loadToast });
        fetchData();
      } else {
        toast.error("Gagal menghapus produk.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: loadToast });
    }
  };

  const formatRupiah = (number: number) => {
    if (number === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
    <div className="space-y-6 md:space-y-8 bg-slate-50 min-h-[80vh] pb-10 rounded-2xl">
      
      {/* ════ HEADER SECTION ════ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-3">
            <Layers size={12} /> Master Data
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Katalog E-Produk</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen E-Book, Template, dan Modul Digital Amania.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full transition-all"
            />
          </div>
          <button onClick={openModal} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)] shrink-0">
            <Plus size={16} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* ════ TABLE SECTION ════ */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Info Produk</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Kategori</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Harga (Rp)</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Kelola Materi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-indigo-500" /><span className="font-bold">Memuat katalog...</span></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500"><PackageSearch size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700 text-base">Katalog Kosong</p><p className="text-xs">Belum ada produk yang ditambahkan.</p></td></tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                          {product.cover_image ? <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[250px] md:max-w-[300px] text-base">{product.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1"><User size={12}/> {product.author?.name || 'Sistem'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-lg shadow-sm">
                            <Layers size={14} className="text-indigo-500"/> {product.category?.name || 'Belum diatur'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`font-black px-3 py-1.5 rounded-lg border ${product.price === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {formatRupiah(product.price)}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.is_published ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold border border-sky-100"><Eye size={14} /> Publik</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200"><EyeOff size={14} /> Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 🔥 TOMBOL MENGARAH KE HALAMAN EDIT 🔥 */}
                        <Link href={`/admin/e-products/edit?id=${product.id}`} className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors border border-indigo-100" title="Kelola Materi & Edit">
                          <Edit size={14} /> Kelola Materi
                        </Link>
                        
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Hapus Permanen"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ════ PAGINATION FOOTER ════ */}
        {!loading && filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4 gap-3">
            <div className="hidden sm:block min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate w-full">
                Menampilkan <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> dari <span className="font-bold text-slate-900">{filteredProducts.length}</span> produk digital
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <ChevronLeft size={14} className="mr-1 text-slate-400" /> <span className="hidden sm:inline">Sebelumnya</span><span className="sm:hidden">Prev</span>
              </button>
              
              <div className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 shadow-sm min-w-[70px] text-center">
                 {currentPage} / {totalPages || 1}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="relative inline-flex items-center rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex-1 sm:flex-none justify-center"
              >
                <span className="hidden sm:inline">Selanjutnya</span><span className="sm:hidden">Next</span> <ChevronRight size={14} className="ml-1 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════ MODAL TAMBAH PRODUK (DRAFT SAJA) ════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#f8fafc] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                     <PackageSearch size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Buat E-Produk Baru</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Langkah 1: Informasi Dasar Produk</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors border border-transparent hover:border-rose-100"><XCircle size={24} /></button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8">
                <form id="productForm" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 md:gap-8">
                  
                  {/* Kiri: Basic Info & Editor */}
                  <div className="flex-1 space-y-6">
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-5">
                      <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-2 flex items-center gap-2"><FileText size={16} className="text-indigo-500"/> Informasi Utama</h3>
                      
                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul Produk <span className="text-rose-500">*</span></label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cth: E-Book Panduan Investasi Saham" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kategori <span className="text-rose-500">*</span></label>
                          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer shadow-inner appearance-none">
                            <option value="" disabled>-- Pilih --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Harga (Rp) <span className="text-rose-500">*</span></label>
                            <button type="button" onClick={() => setIsTripayInfoOpen(true)} className="text-indigo-500 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded-md transition-colors" title="Lihat S&K Tripay">
                              <Info size={14} />
                            </button>
                          </div>
                          <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Isi 0 untuk Gratis" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                        </div>
                      </div>

                      {/* 🔥 PERINGATAN LOGIKA HARGA TRIPAY 🔥 */}
                      <AnimatePresence>
                        {(Number(price) > 0 && Number(price) < 1000) && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex gap-3 items-start overflow-hidden">
                            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-rose-700">Harga Terlalu Rendah!</p>
                              <p className="text-[11px] text-rose-600 mt-1">Batas minimum mutlak Tripay adalah <strong>Rp 1.000</strong>. Sistem akan menolak produk ini.</p>
                            </div>
                          </motion.div>
                        )}
                        
                        {(Number(price) >= 1000 && Number(price) < 10000) && (
                          <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 items-start overflow-hidden">
                            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-700">Perhatian Channel Pembayaran</p>
                              <p className="text-[11px] text-amber-600 mt-1">Dengan harga ini, pembeli <strong>tidak dapat</strong> menggunakan Virtual Account (VA), Alfamart, atau Indomaret. Hanya QRIS dan E-Wallet yang tersedia.</p>
                            </div>
                          </motion.div>
                        )}

                        {Number(price) === 0 && String(price) !== '' && (
                           <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2 items-center overflow-hidden">
                             <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                             <p className="text-xs font-bold text-emerald-700">Produk ini akan dibagikan secara <strong className="uppercase">Gratis</strong> (Bebas Checkout).</p>
                           </motion.div>
                        )}
                      </AnimatePresence>

                      {/* AREA REACT QUILL */}
                      <div className="pt-2">
                        <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Deskripsi / Sales Copy <span className="text-rose-500">*</span></label>
                        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 shadow-sm transition-all">
                          <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} placeholder="Yakinkan calon pembeli dengan deskripsi yang menarik..." className="min-h-[200px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kanan: Upload Cover & Info */}
                  <div className="w-full lg:w-80 shrink-0 space-y-6">
                    
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-5">
                      <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><ImageIcon size={16} className="text-indigo-500"/> Cover Produk</h3>
                      
                      {/* COVER UPLOAD */}
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Cover Image</label>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Maks 10MB</span>
                        </div>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-2xl p-4 text-center transition-colors group">
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            if (file && file.size > 10 * 1024 * 1024) { toast.error("Ukuran file cover maks 10 MB!"); e.target.value = ''; setCoverImage(null); return; }
                            setCoverImage(file);
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-300 group-hover:text-indigo-400 mb-2 transition-colors" />
                          <p className="text-xs font-bold text-slate-700">{coverImage ? coverImage.name : 'Klik atau seret gambar'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (Rekomendasi 2:3)</p>
                        </div>
                      </div>
                      
                      <div className="h-px bg-slate-100 w-full my-2" />
                      
                      {/* INFO MATERI */}
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Layers size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-indigo-900 mb-1">Materi Multi-File</h4>
                        <p className="text-[10px] text-indigo-600 font-medium">Anda dapat mengunggah file (PDF/ZIP) dan menyematkan link (Drive/Youtube) dalam jumlah tak terbatas setelah draft ini disimpan.</p>
                      </div>
                    </div>
                    
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-[2rem]">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors shadow-sm">Batalkan</button>
                <button type="submit" form="productForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-[0_4px_15px_rgba(79,70,229,0.3)] disabled:opacity-70 disabled:shadow-none active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                  {isSubmitting ? 'Memproses...' : 'Lanjut ke Kelola Materi'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔥 MODAL POPUP INFO S&K TRIPAY 🔥 */}
      <AnimatePresence>
        {isTripayInfoOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTripayInfoOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Kebijakan Harga Tripay</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Payment Gateway Rules</p>
                  </div>
                </div>
                <button onClick={() => setIsTripayInfoOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"><XCircle size={20} /></button>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed text-left">
                Platform Amania menggunakan Tripay sebagai pemroses pembayaran. Berikut adalah batas minimum transaksi agar <strong>seluruh channel berfungsi normal</strong> tanpa ditolak server (Bad Request):
              </p>

              <div className="space-y-3 mb-8">
                {/* Rule 1: VA & Retail */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shrink-0 shadow-sm"><CreditCard size={20} className="text-slate-600"/></div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Virtual Account & Alfamart/Indomaret</p>
                    <p className="text-xs text-slate-500 mt-1 mb-2">BCA, BNI, BRI, Mandiri, Alfamart, Indomaret.</p>
                    <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-black px-2.5 py-1 rounded-md">Minimal Harga: Rp 10.000</span>
                  </div>
                </div>

                {/* Rule 2: E-Wallet & QRIS */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-white p-2 rounded-lg border border-indigo-100 shrink-0 shadow-sm"><SmartphoneNfc size={20} className="text-indigo-600"/></div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">E-Wallet & QRIS</p>
                    <p className="text-xs text-slate-500 mt-1 mb-2">OVO, DANA, ShopeePay, dan QRIS All Payment.</p>
                    <span className="inline-block bg-indigo-200 text-indigo-800 text-[10px] font-black px-2.5 py-1 rounded-md">Minimal Harga: Rp 1.000</span>
                  </div>
                </div>

                {/* Rule 3: Retail Alfamidi */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-4 items-start">
                  <div className="bg-white p-2 rounded-lg border border-emerald-100 shrink-0 shadow-sm"><Store size={20} className="text-emerald-600"/></div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-slate-900">Gerai Alfamidi</p>
                    <p className="text-xs text-slate-500 mt-1 mb-2">Khusus pembayaran melalui kasir Alfamidi.</p>
                    <span className="inline-block bg-emerald-200 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md">Minimal Harga: Rp 5.000</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 text-left">
                <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  <strong>Catatan Khusus:</strong> Pembayaran melalui kasir Indomaret, Alfamart, dan Alfamidi akan dikenakan tambahan biaya administrasi sebesar <strong>Rp 3.000</strong> yang ditanggung oleh pembeli.
                </p>
              </div>

              <button onClick={() => setIsTripayInfoOpen(false)} className="w-full mt-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">
                Saya Mengerti
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ════ STYLES ════ */}
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
          min-height: 200px;
          padding: 16px !important;
          color: #334155;
          line-height: 1.6;
        }
        .ql-editor p { margin-bottom: 0.5em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}