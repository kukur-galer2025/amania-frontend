"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, 
  Settings, BookOpen, FileText, Video, Trash2, 
  AlertTriangle, CheckCircle2, Layers, Link as LinkIcon, UploadCloud, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 
import Link from 'next/link';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css';

export default function EditEProductClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'detail' | 'material'>('detail');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // State: Detail E-Product (Nilai awal tegas mencegah React Warning)
  const [title, setTitle] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number | string>('');
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // State: Materi (Materials)
  const [materials, setMaterials] = useState<any[]>([]);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<'file' | 'link'>('file');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [matLink, setMatLink] = useState('');
  const matFileRef = useRef<HTMLInputElement>(null);

  const [isUploadingMat, setIsUploadingMat] = useState(false);

  // State Modal Delete
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: number | null}>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchData = async () => {
    if (!productId) {
      toast.error("ID Produk tidak ditemukan!");
      setFetching(false);
      return;
    }
    try {
      const [prodRes, catRes] = await Promise.all([
        apiFetch(`/admin/e-products/${productId}`),
        apiFetch('/admin/e-product-categories')
      ]);

      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      if (catRes.ok && catJson.success) setCategories(catJson.data);

      if (prodRes.ok && prodJson.success) {
        const prod = prodJson.data;
        // 🔥 Tambahkan null coalescing '??' untuk mencegah React Warning 🔥
        setTitle(prod.title ?? '');
        setCategoryId(prod.e_product_category_id ?? '');
        setDescription(prod.description ?? '');
        setPrice(prod.price ?? '');
        setIsPublished(prod.is_published ? true : false);
        if (prod.cover_image) setCoverPreview(`${STORAGE_URL}/${prod.cover_image}`);
        
        // Load Materials
        setMaterials(prod.materials || []);
      }
    } catch (error) {
      toast.error("Gagal sinkronisasi data produk");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) return toast.error("Cover maksimal 10MB!");
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleMatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // 🔥 VALIDASI FRONTEND: MAKS 50MB 🔥
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Ukuran file terlalu besar! Maksimal 50MB.");
        e.target.value = '';
        setMatFile(null);
        return;
      }
      setMatFile(file);
    }
  };

  const handleSaveProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!productId) return;

    if (!title || !categoryId || !description) {
      toast.error("Lengkapi form Informasi Utama!");
      setActiveTab('detail');
      return;
    }

    setSaving(true);
    const loadToast = toast.loading("Menyimpan perubahan...");

    const formData = new FormData();
    // 🔥 PERBAIKAN: _method PUT dihapus agar tidak bentrok dengan Laravel Route::post
    formData.append('title', title);
    formData.append('e_product_category_id', categoryId);
    formData.append('description', description);
    formData.append('price', price.toString() || '0');
    formData.append('is_published', isPublished ? '1' : '0');
    
    if (coverImage) formData.append('cover_image', coverImage);

    try {
      const res = await apiFetch(`/admin/e-products/${productId}`, {
        method: 'POST', // Kirim murni sebagai POST
        body: formData
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Informasi produk disimpan!", { id: loadToast });
        fetchData();
      } else {
        toast.error(json.message || "Gagal menyimpan", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem", { id: loadToast });
    } finally {
      setSaving(false);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    if (matType === 'file' && !matFile) return toast.error("Pilih file terlebih dahulu!");
    if (matType === 'link' && !matLink) return toast.error("URL Google Drive/Video wajib diisi!");

    setIsUploadingMat(true);
    const loadToast = toast.loading("Mengunggah materi...");

    const fd = new FormData();
    fd.append('e_product_id', productId);
    fd.append('title', matTitle);
    fd.append('type', matType);
    
    if (matType === 'file' && matFile) {
      fd.append('file', matFile);
    } else if (matType === 'link') {
      fd.append('link', matLink);
    }

    try {
      const res = await apiFetch('/admin/e-product-materials', {
        method: 'POST',
        body: fd
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success("Materi berhasil ditambahkan!", { id: loadToast });
        setMatTitle(''); setMatLink(''); setMatFile(null);
        if (matFileRef.current) matFileRef.current.value = '';
        fetchData();
      } else {
        toast.error(json.message || "Gagal mengunggah materi.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Gagal koneksi atau file terlalu besar.", { id: loadToast });
    } finally {
      setIsUploadingMat(false);
    }
  };

  const confirmDeleteMat = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/e-product-materials/${deleteModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Materi dihapus!");
        fetchData();
      } else {
        toast.error("Gagal menghapus materi.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  if (fetching) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
      <span className="text-sm font-medium text-slate-500">Memuat data produk...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-2 sm:px-4 md:px-0 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border-[6px] border-rose-50/50">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Materi?</h3>
              <p className="text-sm text-slate-500 mb-6">File atau tautan ini akan dihapus secara permanen dan tidak dapat dipulihkan.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({ isOpen: false, id: null })} disabled={isDeleting} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                <button onClick={confirmDeleteMat} disabled={isDeleting} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-rose-200">
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-slate-500 mb-2">
            <Link href="/admin/e-products" className="hover:text-slate-900 transition-colors">Katalog E-Produk</Link>
            <span className="mx-1">/</span>
            <span className="text-slate-900 font-medium">Edit Produk</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">{title || 'Memuat...'}</h1>
        </div>
        <button onClick={() => handleSaveProduct()} disabled={saving} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-md shadow-indigo-200">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Simpan Profil Produk
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-6 overflow-x-auto custom-scrollbar">
          {[
            { id: 'detail', label: 'Profil Produk', icon: Settings },
            { id: 'material', label: 'Kelola Materi (File/Link)', icon: BookOpen }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap border-b-2 py-4 px-1 text-sm font-bold flex items-center gap-2 transition-colors`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: INFORMASI PRODUK */}
        {activeTab === 'detail' && (
          <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul Produk <span className="text-rose-500">*</span></label>
                  <input type="text" value={title || ''} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kategori <span className="text-rose-500">*</span></label>
                    <select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner appearance-none cursor-pointer">
                      <option value="" disabled>Pilih Kategori</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Harga (Rp) <span className="text-rose-500">*</span></label>
                    <input type="number" min="0" value={price !== null ? price : ''} onChange={(e) => setPrice(e.target.value)} required placeholder="0 untuk Gratis" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Deskripsi / Sales Copy <span className="text-rose-500">*</span></label>
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-sm transition-all">
                    <ReactQuill theme="snow" value={description || ''} onChange={setDescription} className="min-h-[200px]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 lg:sticky lg:top-24">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><ImageIcon size={16} className="text-indigo-500"/> Cover Produk</h3>
                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-2xl p-4 text-center transition-colors group aspect-[3/4] flex flex-col items-center justify-center overflow-hidden cursor-pointer" onClick={() => coverRef.current?.click()}>
                  {coverPreview ? (
                    <img src={coverPreview} className="w-full h-full object-cover rounded-xl" alt="Cover" />
                  ) : (
                    <div className="text-slate-400 group-hover:text-indigo-500 transition-colors">
                      <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                      <span className="text-xs font-bold block">Klik untuk ganti</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" ref={coverRef} onChange={handleCoverChange} className="hidden" />
                </div>
                
                <div className="h-px bg-slate-100 my-4" />

                <div className={`p-4 rounded-xl border transition-colors flex items-start gap-3 cursor-pointer select-none shadow-sm ${isPublished ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`} onClick={() => setIsPublished(!isPublished)}>
                  <input type="checkbox" checked={isPublished} readOnly className="w-4 h-4 text-emerald-600 rounded border-slate-300 mt-0.5 pointer-events-none" />
                  <div>
                    <p className={`text-sm font-bold ${isPublished ? 'text-emerald-800' : 'text-slate-700'}`}>Publikasikan</p>
                    <p className={`text-[10px] mt-1 ${isPublished ? 'text-emerald-600' : 'text-slate-500'}`}>Tampilkan produk di katalog.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.form>
        )}

        {/* TAB 2: MATERI & FILE */}
        {activeTab === 'material' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Form Tambah Materi */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h3 className="text-sm md:text-base font-black text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" /> Tambah Materi Baru
              </h3>
              
              <div className="mb-5 p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                  <AlertTriangle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] md:text-xs text-indigo-700 leading-relaxed font-medium">
                    Upload file (ZIP/PDF/RAR) dibatasi maksimal <strong className="text-rose-600">50 MB</strong> per file. Untuk file video atau file raksasa, gunakan Link Google Drive / YouTube.
                  </p>
              </div>

              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-slate-500 mb-1.5 flex items-center gap-1.5"><FileText size={12} className="text-slate-400" /> Judul Materi</label>
                  <input type="text" value={matTitle || ''} onChange={(e) => setMatTitle(e.target.value)} placeholder="Contoh: Source Code Aplikasi" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                </div>
                
                <div>
                  <label className="text-[11px] font-black text-slate-500 mb-1.5 flex items-center gap-1.5"><Settings size={12} className="text-slate-400" /> Tipe Materi</label>
                  <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                     <button type="button" onClick={() => setMatType('file')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex justify-center items-center gap-1.5 ${matType === 'file' ? 'bg-white shadow-sm border border-slate-200 text-indigo-700' : 'text-slate-500'}`}><UploadCloud size={14}/> Upload File</button>
                     <button type="button" onClick={() => setMatType('link')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex justify-center items-center gap-1.5 ${matType === 'link' ? 'bg-white shadow-sm border border-slate-200 text-indigo-700' : 'text-slate-500'}`}><LinkIcon size={14}/> G-Drive / Web</button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-500 mb-1.5 flex items-center gap-1.5">
                    {matType === 'file' ? 'Pilih File (Maks 50MB)' : 'Masukkan Tautan URL'}
                  </label>
                  {matType === 'file' ? (
                    <input type="file" ref={matFileRef} onChange={handleMatFileChange} accept=".pdf,.zip,.rar" className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-slate-50 p-1.5 rounded-xl border border-slate-200 border-dashed" required />
                  ) : (
                    <input type="url" value={matLink || ''} onChange={(e) => setMatLink(e.target.value)} placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
                  )}
                </div>
                
                <button type="submit" disabled={isUploadingMat} className="w-full mt-2 bg-slate-900 text-white py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm flex justify-center items-center gap-2">
                  {isUploadingMat ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Tambahkan Ke Kurikulum
                </button>
              </form>
            </div>

            {/* List Materi */}
            <div className="lg:col-span-2">
               <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                 <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                   Daftar Materi <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] border border-slate-200">{materials.length} File</span>
                 </h4>
                 
                 {materials.length === 0 ? (
                   <div className="flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                     <div className="w-16 h-16 bg-white border border-slate-200 text-slate-300 rounded-full flex items-center justify-center mb-3 shadow-sm"><BookOpen size={24} /></div>
                     <p className="text-sm font-bold text-slate-700">Materi Kosong</p>
                     <p className="text-xs text-slate-500 mt-1 max-w-xs">Tambahkan file PDF, ZIP, atau Link GDrive melalui form di samping agar pembeli bisa mengunduhnya.</p>
                   </div>
                 ) : (
                   <div className="grid gap-3 md:gap-4">
                     {materials.map((m, i) => (
                       <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
                         <div className="flex items-center gap-4 overflow-hidden pr-3">
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${m.type === 'link' ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                               {m.type === 'link' ? <LinkIcon size={20} /> : <FileText size={20} />}
                             </div>
                             <div className="truncate">
                               <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                 {m.type === 'link' ? 'External Link' : 'File Upload'}
                               </p>
                               <h4 className="text-sm font-bold text-slate-900 truncate">{m.title}</h4>
                             </div>
                         </div>
                         <button onClick={() => setDeleteModal({ isOpen: true, id: m.id })} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200 shrink-0">
                           <Trash2 size={18} />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .ql-container { font-family: 'Inter', sans-serif; font-size: 0.9rem; min-height: 250px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f8fafc; padding: 0.75rem !important; }
        .ql-editor { line-height: 1.6; padding: 1.5rem !important; }
      `}</style>
    </div>
  );
}