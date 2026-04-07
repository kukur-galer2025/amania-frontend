"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Hash, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css'; 

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [readTime, setReadTime] = useState('5'); 
  const [isPublished, setIsPublished] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 🔥 STATE VALIDASI UNTUK 422 ERROR 🔥
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiFetch('/admin/article-categories');
        const data = await res.json();
        setCategories(data.data || []);
        if (data.data?.length > 0) setCategoryId(data.data[0].id);
      } catch (err) {
        toast.error("Gagal menarik daftar kategori");
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi File Size (Maks 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ditolak! Ukuran gambar maksimal adalah 5 MB.");
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }

      // Validasi Tipe File
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file tidak didukung! Gunakan JPG, PNG, atau WEBP.");
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (validationErrors.image) setValidationErrors(prev => ({ ...prev, image: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({}); // Reset error setiap submit

    if (!content || content === '<p><br></p>') {
      toast.error("Konten tidak boleh kosong!");
      setValidationErrors(prev => ({ ...prev, content: ["Konten artikel wajib diisi."] }));
      return;
    }

    setLoading(true);
    const loadToast = toast.loading("Menyimpan artikel...");
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('article_category_id', categoryId);
    formData.append('content', content);
    formData.append('tags', tags);
    formData.append('read_time', readTime);
    formData.append('is_published', isPublished.toString());
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await apiFetch('/admin/articles', {
        method: 'POST',
        body: formData
      });

      const resData = await res.json();

      if (res.ok && resData.success !== false) {
        toast.success("Artikel berhasil diterbitkan!", { id: loadToast });
        router.push('/admin/articles');
      } else {
        // 🔥 PENANGANAN ERROR VALIDASI (422) SPESIFIK 🔥
        let errorMessage = resData.message || "Gagal menyimpan artikel.";
        
        if (resData.errors && typeof resData.errors === 'object') {
           setValidationErrors(resData.errors);
           const errorsArray = Object.values(resData.errors) as string[][];
           if (errorsArray.length > 0 && errorsArray[0].length > 0) {
             errorMessage = errorsArray[0][0]; 
           }
        }
        
        toast.error(errorMessage, { id: loadToast });
      }
    } catch (err) {
      toast.error("Kesalahan koneksi ke server. Pastikan API menyala.", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 px-2 sm:px-0 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 mt-2 md:mt-0">
        <Link href="/admin/articles" className="p-1.5 md:p-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg md:rounded-xl shadow-sm group transition-all shrink-0">
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Tulis Artikel</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Publikasikan konten jurnal Amania terbaru.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* KOLOM KIRI (KONTEN) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm space-y-5 md:space-y-6">
            
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block flex items-center gap-1.5">
                <span className={validationErrors.title ? 'text-rose-500' : ''}>Judul Artikel</span>
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => { setTitle(e.target.value); if(validationErrors.title) setValidationErrors({...validationErrors, title: []}); }}
                placeholder="Masukkan judul artikel yang memikat..."
                className={`w-full rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-base md:text-xl font-bold focus:outline-none transition-all ${validationErrors.title ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'}`}
                required
              />
              {validationErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.title[0]}</p>}
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block flex items-center gap-1.5">
                <span className={validationErrors.content ? 'text-rose-500' : ''}>Isi Konten Utama</span>
              </label>
              <div className={`rounded-xl md:rounded-2xl overflow-hidden border bg-white ${validationErrors.content ? 'border-rose-400' : 'border-slate-200'}`}>
                <ReactQuill theme="snow" value={content} onChange={(val) => { setContent(val); if(validationErrors.content) setValidationErrors({...validationErrors, content: []}); }} modules={modules} placeholder="Tuliskan isi artikel Anda..." />
              </div>
              {validationErrors.content && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.content[0]}</p>}
            </div>

            <div className="pt-2 md:pt-4">
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <Hash size={12} className={`${validationErrors.tags ? 'text-rose-500' : 'text-indigo-500'} md:w-3.5 md:h-3.5`} /> 
                <span className={validationErrors.tags ? 'text-rose-500' : ''}>Tags (Pisahkan dengan koma)</span>
              </label>
              <input 
                type="text" 
                value={tags}
                onChange={(e) => { setTags(e.target.value); if(validationErrors.tags) setValidationErrors({...validationErrors, tags: []}); }}
                placeholder="Contoh: Teknologi, Tutorial, Edukasi"
                className={`w-full rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 md:px-5 text-xs md:text-sm font-semibold focus:outline-none transition-all ${validationErrors.tags ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
              />
              {validationErrors.tags && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.tags[0]}</p>}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (SETTING & PUBLISH) */}
        <div className="space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm space-y-5 md:space-y-6 lg:sticky lg:top-24">
            
            <div className="flex flex-row lg:flex-col gap-4 md:gap-6">
              <div className="flex-1">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block flex items-center gap-1.5">
                  <span className={validationErrors.article_category_id ? 'text-rose-500' : ''}>Kategori</span>
                </label>
                <select 
                  value={categoryId}
                  onChange={(e) => { setCategoryId(e.target.value); if(validationErrors.article_category_id) setValidationErrors({...validationErrors, article_category_id: []}); }}
                  className={`w-full rounded-xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-bold focus:outline-none ${validationErrors.article_category_id ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
                  required
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {validationErrors.article_category_id && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.article_category_id[0]}</p>}
              </div>

              <div className="flex-1">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block flex items-center gap-1.5">
                  <span className={validationErrors.read_time ? 'text-rose-500' : ''}>Waktu Baca (Menit)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
                    <Clock size={14} className={`md:w-4 md:h-4 ${validationErrors.read_time ? 'text-rose-500' : 'text-slate-400'}`} />
                  </div>
                  <input 
                    type="number"
                    value={readTime}
                    onChange={(e) => { setReadTime(e.target.value); if(validationErrors.read_time) setValidationErrors({...validationErrors, read_time: []}); }}
                    placeholder="Mnt"
                    className={`w-full rounded-xl py-2.5 md:py-3 pl-8 md:pl-11 pr-3 md:pr-4 text-xs md:text-sm font-bold focus:outline-none ${validationErrors.read_time ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
                  />
                </div>
                {validationErrors.read_time && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.read_time[0]}</p>}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <span className={validationErrors.image ? 'text-rose-500' : ''}>Thumbnail</span>
                </label>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">MAKS 5MB</span>
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-video rounded-xl md:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${validationErrors.image ? 'border-rose-400 bg-rose-50 hover:border-rose-500' : 'border-slate-200 hover:border-indigo-400 bg-slate-50'}`}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <>
                    <ImageIcon size={20} className={`md:w-6 md:h-6 mb-1.5 md:mb-2 transition-colors ${validationErrors.image ? 'text-rose-400' : 'text-slate-300 group-hover:text-indigo-500'}`} />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Pilih Gambar</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              {validationErrors.image && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.image[0]}</p>}
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">Status Visibilitas</label>
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <button type="button" onClick={() => setIsPublished(1)} className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${isPublished === 1 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Publik</button>
                <button type="button" onClick={() => setIsPublished(0)} className={`flex-1 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${isPublished === 0 ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400'}`}>Draft</button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 md:gap-3 disabled:opacity-70 group"
            >
              {loading ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : <Save size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" />}
              {loading ? 'MEMPROSES...' : 'TERBITKAN ARTIKEL'}
            </button>
          </div>
        </div>

      </form>
      <style jsx global>{`
        .ql-container { font-family: 'Inter', sans-serif; font-size: 0.9rem; min-height: 250px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
        @media (min-width: 768px) {
          .ql-container { font-size: 1rem; min-height: 350px; border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; }
        }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f8fafc; border-color: #e2e8f0 !important; }
        @media (min-width: 768px) {
          .ql-toolbar { border-top-left-radius: 1rem; border-top-right-radius: 1rem; }
        }
        .ql-container.ql-snow { border-color: #e2e8f0 !important; }
      `}</style>
    </div>
  );
}