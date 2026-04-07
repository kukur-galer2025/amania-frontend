"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, CheckCircle2, Hash, Clock, AlertTriangle 
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-slate-50 animate-pulse rounded-xl md:rounded-2xl border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css'; 

export default function EditArticleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState(''); 
  const [readTime, setReadTime] = useState('5'); 
  const [isPublished, setIsPublished] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

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
    const fetchData = async () => {
      // 🔥 Biarkan loading skeleton berputar sampai Next.js selesai membaca URL 🔥
      if (!articleId) return; 

      try {
        const [catRes, artRes] = await Promise.all([
          apiFetch('/admin/article-categories'),
          apiFetch(`/admin/articles/${articleId}`) 
        ]);

        if (catRes.ok) {
            const catData = await catRes.json();
            setCategories(catData.data || []);
        }

        if (!artRes.ok) {
            toast.error("Data artikel tidak ditemukan.");
            setFetching(false);
            return;
        }

        const artData = await artRes.json();
        
        if (artData.success || artData.data) {
          const article = artData.data;
          
          setTitle(article.title || '');
          setCategoryId(article.article_category_id?.toString() || '');
          setContent(article.content || '');
          setReadTime(article.read_time?.toString() || '5');
          setIsPublished(article.is_published ? 1 : 0);

          // 🔥 Tangani format tags dari Laravel dengan aman 🔥
          let parsedTags = '';
          if (article.tags) {
             if (Array.isArray(article.tags)) {
                 parsedTags = article.tags.join(', ');
             } else if (typeof article.tags === 'string') {
                 try {
                     const t = JSON.parse(article.tags);
                     parsedTags = Array.isArray(t) ? t.join(', ') : article.tags;
                 } catch {
                     parsedTags = article.tags;
                 }
             }
          }
          setTags(parsedTags);

          if (article.image) {
            setImagePreview(`${STORAGE_URL}/${article.image}`);
          }
        }
      } catch (err) {
        toast.error("Terjadi kesalahan jaringan saat memuat artikel");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [articleId]); // Efek ini akan berjalan ulang jika articleId sudah terbaca

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File ditolak! Ukuran gambar maksimal adalah 5 MB.");
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }

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
    if (!articleId) return;

    setValidationErrors({}); 

    if (!content || content === '<p><br></p>') {
      toast.error("Konten utama tidak boleh kosong!");
      setValidationErrors(prev => ({ ...prev, content: ["Konten utama wajib diisi."] }));
      return;
    }

    const loadToast = toast.loading("Menyimpan perubahan...");
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('article_category_id', categoryId);
    formData.append('content', content);
    formData.append('tags', tags); 
    formData.append('read_time', readTime);
    formData.append('is_published', isPublished.toString());

    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await apiFetch(`/admin/articles/${articleId}`, {
        method: 'POST', 
        body: formData
      });

      const resData = await res.json();

      if (res.ok && resData.success !== false) {
        toast.success("Pembaruan berhasil!", { id: loadToast });
        setShowSuccessModal(true);
        setTimeout(() => router.push('/admin/articles'), 1500);
      } else {
        let errorMsg = resData.message || "Gagal memperbarui artikel";
        
        if (resData.errors && typeof resData.errors === 'object') {
           setValidationErrors(resData.errors);
           const errorsArray = Object.values(resData.errors) as string[][];
           if (errorsArray.length > 0 && errorsArray[0].length > 0) {
             errorMsg = errorsArray[0][0]; 
           }
        }
        
        toast.error(errorMsg, { id: loadToast });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem atau koneksi terputus.", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-pulse px-4 md:px-6 pt-4">
      <div className="h-8 md:h-10 bg-slate-200 rounded-xl w-1/2 md:w-1/3"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 h-72 md:h-96 bg-slate-200 rounded-[24px] md:rounded-[32px]"></div>
        <div className="h-72 md:h-96 bg-slate-200 rounded-[24px] md:rounded-[32px]"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-0 space-y-5 md:space-y-6 animate-in fade-in duration-300 pb-20">
      
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 mt-2 md:mt-0">
        <Link href="/admin/articles" className="p-1.5 md:p-2 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg md:rounded-xl transition-all shadow-sm group shrink-0">
          <ArrowLeft size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Edit Artikel</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">Sempurnakan konten artikel Anda untuk dipublikasikan.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* KOLOM KIRI */}
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
                className={`w-full rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-base md:text-xl font-bold focus:outline-none transition-all ${validationErrors.title ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-white'}`}
                required
              />
              {validationErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.title[0]}</p>}
            </div>
            
            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block flex items-center gap-1.5">
                <span className={validationErrors.content ? 'text-rose-500' : ''}>Konten Utama</span>
              </label>
              <div className={`rounded-xl md:rounded-2xl overflow-hidden border bg-white ${validationErrors.content ? 'border-rose-400' : 'border-slate-200'}`}>
                <ReactQuill theme="snow" value={content} onChange={(val) => { setContent(val); if(validationErrors.content) setValidationErrors({...validationErrors, content: []}); }} modules={modules} />
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
                placeholder="Laravel, Edukasi, Tips"
                className={`w-full rounded-xl md:rounded-2xl py-2.5 md:py-3.5 px-4 md:px-5 text-xs md:text-sm font-semibold focus:outline-none transition-all ${validationErrors.tags ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
              />
              {validationErrors.tags && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.tags[0]}</p>}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN */}
        <div className="space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[32px] border border-slate-200 shadow-sm space-y-5 md:space-y-6 lg:sticky lg:top-24">
            
            <div className="flex flex-row lg:flex-col gap-4 md:gap-6">
              <div className="flex-1">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">
                  <span className={validationErrors.article_category_id ? 'text-rose-500' : ''}>Kategori</span>
                </label>
                <select 
                  value={categoryId} 
                  onChange={(e) => { setCategoryId(e.target.value); if(validationErrors.article_category_id) setValidationErrors({...validationErrors, article_category_id: []}); }}
                  className={`w-full rounded-xl py-2.5 md:py-3 px-3 md:px-4 text-xs md:text-sm font-bold focus:outline-none ${validationErrors.article_category_id ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
                  required
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                {validationErrors.article_category_id && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.article_category_id[0]}</p>}
              </div>

              <div className="flex-1">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">
                  <span className={validationErrors.read_time ? 'text-rose-500' : ''}>Waktu Baca (Mnt)</span>
                </label>
                <div className="relative">
                   <Clock size={14} className={`absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 md:w-4 md:h-4 ${validationErrors.read_time ? 'text-rose-500' : 'text-slate-400'}`} />
                   <input 
                    type="number"
                    value={readTime}
                    onChange={(e) => { setReadTime(e.target.value); if(validationErrors.read_time) setValidationErrors({...validationErrors, read_time: []}); }}
                    className={`w-full rounded-xl py-2.5 md:py-3 pl-9 md:pl-11 pr-3 md:pr-4 text-xs md:text-sm font-bold focus:outline-none ${validationErrors.read_time ? 'bg-rose-50 border-rose-400 text-rose-900 focus:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-indigo-500'}`}
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
                  <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                ) : (
                  <>
                    <ImageIcon size={20} className={`md:w-6 md:h-6 mb-1.5 md:mb-2 transition-colors ${validationErrors.image ? 'text-rose-400' : 'text-slate-300 group-hover:text-indigo-500'}`} />
                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Ganti Gambar</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
              {validationErrors.image && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.image[0]}</p>}
            </div>

            <div>
              <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 md:mb-3 block">Visibilitas</label>
              <div className="flex gap-2 p-1 md:p-1.5 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <button type="button" onClick={() => setIsPublished(1)} className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${isPublished === 1 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Publik</button>
                <button type="button" onClick={() => setIsPublished(0)} className={`flex-1 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${isPublished === 0 ? 'bg-white text-slate-600 shadow-sm' : 'text-slate-400'}`}>Draft</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 md:gap-3 disabled:opacity-70 group">
              {loading ? <Loader2 className="animate-spin md:w-[18px] md:h-[18px]" size={16} /> : <Save size={16} className="md:w-[18px] md:h-[18px] group-hover:scale-110 transition-transform" />}
              {loading ? 'MEMPROSES...' : 'SIMPAN PERUBAHAN'}
            </button>
          </div>
        </div>
      </form>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 10 }} className="relative bg-white rounded-3xl md:rounded-[40px] p-8 md:p-10 text-center max-w-sm w-full z-10 shadow-2xl">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircle2 size={32} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Berhasil Diupdate!</h3>
              <p className="text-slate-500 text-xs md:text-sm font-medium">Perubahan telah aman tersimpan.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-container { border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; font-family: inherit; font-size: 0.9rem; min-height: 250px; }
        @media (min-width: 768px) {
          .ql-container { min-height: 300px; font-size: 1rem; border-bottom-left-radius: 1rem; border-bottom-right-radius: 1rem; }
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