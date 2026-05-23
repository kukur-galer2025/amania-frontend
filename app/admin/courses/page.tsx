"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit, Trash2, Image as ImageIcon,
  GraduationCap, CheckCircle2, XCircle, Loader2, PackageSearch,
  Eye, EyeOff, Tag, User, AlertTriangle, AlertCircle, ArrowUpRight, BookOpen, Video, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function AdminCoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [level, setLevel] = useState('beginner');
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courseRes, catRes] = await Promise.all([
        apiFetch('/admin/courses'),
        apiFetch('/admin/course-categories')
      ]);

      const courseJson = await courseRes.json();
      const catJson = await catRes.json();

      if (courseRes.ok && courseJson.success) setCourses(courseJson.data);
      if (catRes.ok && catJson.success) setCategories(catJson.data);
    } catch {
      toast.error('Gagal mengambil data kursus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = () => {
    setTitle('');
    setCategoryId('');
    setDescription('');
    setPrice('');
    setLevel('beginner');
    setIsPublished(false);
    setThumbnail(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) { toast.error("Kategori wajib dipilih!"); return; }

    const numPrice = Number(price);
    if (numPrice > 0 && numPrice < 1000) {
      toast.error("Harga tidak valid! Batas terendah absolut adalah Rp 1.000.");
      return;
    }

    if (!description || description.trim() === '<p><br></p>') {
      toast.error("Deskripsi kursus tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Membuat draft kursus...");

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('course_category_id', categoryId);
      formData.append('description', description);
      formData.append('price', price.toString());
      formData.append('level', level);
      formData.append('is_published', isPublished ? '1' : '0');

      if (thumbnail) formData.append('thumbnail', thumbnail);

      const res = await apiFetch('/admin/courses', {
        method: 'POST',
        body: formData,
      }, true);

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Draft Dibuat! Mengarahkan ke Kelola Materi...", { id: loadToast });
        closeModal();
        router.push(`/admin/courses/edit?id=${json.data.id}`);
      } else {
        toast.error(json.message || "Gagal menyimpan kursus.", { id: loadToast });
      }
    } catch {
      toast.error("Terjadi kesalahan server.", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setCourseToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setDeleteModalOpen(false);
    const id = courseToDelete;

    const loadToast = toast.loading("Menghapus kursus...");
    try {
      const res = await apiFetch(`/admin/courses/${id}`, { method: 'DELETE' });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success("Kursus berhasil dihapus!", { id: loadToast });
        fetchData();
      } else {
        toast.error("Gagal menghapus kursus.", { id: loadToast });
      }
    } catch {
      toast.error("Terjadi kesalahan sistem.", { id: loadToast });
    } finally {
      setCourseToDelete(null);
    }
  };

  const formatRupiah = (number: number) => {
    if (number === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getLevelBadge = (lvl: string) => {
    switch (lvl) {
      case 'beginner': return { label: 'Pemula', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'intermediate': return { label: 'Menengah', bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'advanced': return { label: 'Mahir', bg: 'bg-rose-50 text-rose-600 border-rose-100' };
      default: return { label: lvl, bg: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6 md:space-y-8 bg-slate-50 min-h-[80vh] pb-10 rounded-2xl">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-3">
            <GraduationCap size={12} /> Kursus Online
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Kelola Kursus</h1>
          <p className="text-sm text-slate-500 mt-1">Manajemen kursus video online Amania dengan materi YouTube embed.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari kursus..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-full transition-all"
            />
          </div>
          <button onClick={openModal} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] shrink-0">
            <Plus size={16} /> Tambah Kursus
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Info Kursus</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Kategori</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Level</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Harga</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Materi</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-5 font-black uppercase tracking-widest text-[10px] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400"><Loader2 size={32} className="animate-spin mx-auto mb-3 text-emerald-500" /><span className="font-bold">Memuat kursus...</span></td></tr>
              ) : filteredCourses.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-500"><PackageSearch size={48} className="mx-auto mb-4 text-slate-300" /><p className="font-bold text-slate-700 text-base">Belum Ada Kursus</p><p className="text-xs">Klik "Tambah Kursus" untuk mulai membuat kursus pertama.</p></td></tr>
              ) : (
                filteredCourses.map((course) => {
                  const levelBadge = getLevelBadge(course.level);
                  return (
                    <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                            {course.thumbnail ? <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover" /> : <Video size={24} className="text-slate-300" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[250px] md:max-w-[300px] text-base">{course.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1"><User size={12} /> {course.instructor?.name || 'Sistem'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg shadow-sm">
                          <Tag size={14} className="text-emerald-500" /> {course.category?.name || 'Belum diatur'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${levelBadge.bg}`}>
                          {levelBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-black px-3 py-1.5 rounded-lg border ${course.price === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {formatRupiah(course.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            <BookOpen size={12} /> {course.sections_count ?? 0} bab
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                            <Video size={12} /> {course.lessons_count ?? 0} lesson
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {course.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 text-xs font-bold border border-sky-100"><Eye size={14} /> Publik</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200"><EyeOff size={14} /> Draft</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/courses/edit?id=${course.id}`} className="px-4 py-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors border border-emerald-100" title="Kelola Materi & Edit">
                            <Edit size={14} /> Kelola
                          </Link>
                          <button onClick={() => handleDeleteClick(course.id)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 shadow-sm" title="Hapus Permanen"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH KURSUS */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#f8fafc] rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]">

              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><GraduationCap size={20} /></div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Buat Kursus Baru</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Langkah 1: Informasi Dasar Kursus</p>
                  </div>
                </div>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors"><XCircle size={24} /></button>
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 p-6 md:p-8">
                <form id="courseForm" onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 md:gap-8">

                  <div className="flex-1 space-y-6">
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-5">
                      <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-2 flex items-center gap-2"><GraduationCap size={16} className="text-emerald-500" /> Informasi Utama</h3>

                      <div>
                        <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul Kursus <span className="text-rose-500">*</span></label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cth: Belajar React.js dari Nol sampai Pro" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kategori <span className="text-rose-500">*</span></label>
                          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-inner appearance-none">
                            <option value="" disabled>-- Pilih --</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Level <span className="text-rose-500">*</span></label>
                          <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-inner appearance-none">
                            <option value="beginner">Pemula</option>
                            <option value="intermediate">Menengah</option>
                            <option value="advanced">Mahir</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Harga (Rp) <span className="text-rose-500">*</span></label>
                          <input type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Isi 0 untuk Gratis" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                        </div>
                      </div>

                      <AnimatePresence>
                        {Number(price) === 0 && String(price) !== '' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2 items-center overflow-hidden">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                            <p className="text-xs font-bold text-emerald-700">Kursus ini akan tersedia secara <strong className="uppercase">Gratis</strong> untuk semua pengguna.</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="pt-2">
                        <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Deskripsi Kursus <span className="text-rose-500">*</span></label>
                        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 shadow-sm transition-all">
                          <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} placeholder="Jelaskan apa yang akan dipelajari siswa dalam kursus ini..." className="min-h-[200px]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-5">
                      <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><ImageIcon size={16} className="text-emerald-500" /> Thumbnail Kursus</h3>

                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Cover Image</label>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Maks 10MB</span>
                        </div>
                        <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 rounded-2xl p-4 text-center transition-colors group">
                          <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files ? e.target.files[0] : null;
                            if (file && file.size > 10 * 1024 * 1024) { toast.error("Ukuran file maks 10 MB!"); e.target.value = ''; setThumbnail(null); return; }
                            setThumbnail(file);
                          }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <ImageIcon className="mx-auto h-8 w-8 text-slate-300 group-hover:text-emerald-400 mb-2 transition-colors" />
                          <p className="text-xs font-bold text-slate-700">{thumbnail ? thumbnail.name : 'Klik atau seret gambar'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP (Rekomendasi 16:9)</p>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 w-full my-2" />

                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Video size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-emerald-900 mb-1">Video YouTube Embed</h4>
                        <p className="text-[10px] text-emerald-600 font-medium">Anda dapat menambahkan section (bab) dan lesson (video YouTube) dalam jumlah tak terbatas setelah draft ini disimpan.</p>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0 rounded-b-[2rem]">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors shadow-sm">Batalkan</button>
                <button type="submit" form="courseForm" disabled={isSubmitting} className="flex items-center gap-2 px-8 py-3 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:shadow-none active:scale-95">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                  {isSubmitting ? 'Memproses...' : 'Lanjut ke Kelola Materi'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Hapus Kursus Permanen?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus kursus ini beserta <strong className="text-rose-500">SEMUA MATERI</strong> (section & lesson)? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30">
                  Ya, Hapus!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background-color: #f8fafc; border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; padding: 12px 16px !important; }
        .ql-container.ql-snow { border: none !important; font-family: inherit !important; font-size: 0.875rem !important; }
        .ql-editor { min-height: 200px; padding: 16px !important; color: #334155; line-height: 1.6; }
        .ql-editor p { margin-bottom: 0.5em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
