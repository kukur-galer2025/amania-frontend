"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2, GraduationCap, Trash2, Plus,
  ChevronDown, ChevronUp, Video, BookOpen, Edit, XCircle,
  CheckCircle2, Eye, EyeOff, Image as ImageIcon, Grip,
  PlayCircle, Clock, ExternalLink, AlertCircle, FileText, Type, Upload, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import CourseExamManager from './CourseExamManager';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Helper: extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function AdminCourseEditPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // Course info
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [level, setLevel] = useState('beginner');
  const [isPublished, setIsPublished] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [existingThumbnail, setExistingThumbnail] = useState('');

  // Sections & Lessons
  const [sections, setSections] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Lesson modal
  const [lessonModal, setLessonModal] = useState<{ isOpen: boolean; sectionId: number | null; editingLesson: any | null }>({ isOpen: false, sectionId: null, editingLesson: null });
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'text' | 'file'>('video');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');
  const [lessonTextContent, setLessonTextContent] = useState('');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonIsPreview, setLessonIsPreview] = useState(false);
  const [lessonSaving, setLessonSaving] = useState(false);

  // Section modal
  const [sectionModal, setSectionModal] = useState<{ isOpen: boolean; editing: any | null }>({ isOpen: false, editing: null });
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionSaving, setSectionSaving] = useState(false);

  // Deletion modals state
  const [deleteSectionModalOpen, setDeleteSectionModalOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);

  const [deleteLessonModalOpen, setDeleteLessonModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchCourse = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, catRes] = await Promise.all([
        apiFetch(`/admin/courses/${courseId}`),
        apiFetch('/admin/course-categories')
      ]);
      const courseJson = await courseRes.json();
      const catJson = await catRes.json();

      if (courseRes.ok && courseJson.success) {
        const c = courseJson.data;
        setTitle(c.title);
        setCategoryId(c.course_category_id?.toString() || '');
        setDescription(c.description || '');
        setPrice(c.price ?? '');
        setLevel(c.level || 'beginner');
        setIsPublished(!!c.is_published);
        setExistingThumbnail(c.thumbnail || '');
        setSections(c.sections || []);
        // Expand all sections by default
        const allIds = new Set<number>((c.sections || []).map((s: any) => s.id));
        setExpandedSections(allIds);
      } else {
        toast.error('Gagal memuat data kursus');
      }

      if (catRes.ok && catJson.success) setCategories(catJson.data);
    } catch {
      toast.error('Terjadi kesalahan server');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  // Save course info
  const handleSaveCourse = async () => {
    if (!title.trim()) { toast.error('Judul kursus wajib diisi!'); return; }
    setSaving(true);
    const loadToast = toast.loading('Menyimpan perubahan kursus...');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('course_category_id', categoryId);
      formData.append('description', description);
      formData.append('price', price.toString());
      formData.append('level', level);
      formData.append('is_published', isPublished ? '1' : '0');
      // _method: PUT dihapus agar tidak bentrok dengan Laravel Route::post
      if (thumbnail) formData.append('thumbnail', thumbnail);

      const res = await apiFetch(`/admin/courses/${courseId}`, { method: 'POST', body: formData }, true);
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Kursus berhasil diupdate!', { id: loadToast });
        if (json.data?.thumbnail) setExistingThumbnail(json.data.thumbnail);
      } else {
        toast.error(json.message || 'Gagal menyimpan kursus.', { id: loadToast });
      }
    } catch {
      toast.error('Terjadi kesalahan server.', { id: loadToast });
    } finally {
      setSaving(false);
    }
  };

  // Section CRUD
  const openSectionModal = (section?: any) => {
    if (section) {
      setSectionTitle(section.title);
      setSectionModal({ isOpen: true, editing: section });
    } else {
      setSectionTitle('');
      setSectionModal({ isOpen: true, editing: null });
    }
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) { toast.error('Judul section wajib diisi!'); return; }
    setSectionSaving(true);
    try {
      const isEdit = sectionModal.editing;
      const url = isEdit
        ? `/admin/courses/${courseId}/sections/${isEdit.id}`
        : `/admin/courses/${courseId}/sections`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ title: sectionTitle, order: sections.length + 1 }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(isEdit ? 'Section diupdate!' : 'Section ditambahkan!');
        setSectionModal({ isOpen: false, editing: null });
        fetchCourse();
      } else {
        toast.error(json.message || 'Gagal menyimpan section.');
      }
    } catch {
      toast.error('Terjadi kesalahan server.');
    } finally {
      setSectionSaving(false);
    }
  };

  const handleDeleteSectionClick = (sectionId: number) => {
    setSectionToDelete(sectionId);
    setDeleteSectionModalOpen(true);
  };

  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    setDeleteSectionModalOpen(false);
    const sectionId = sectionToDelete;

    try {
      const res = await apiFetch(`/admin/courses/${courseId}/sections/${sectionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) { toast.success('Section dihapus!'); fetchCourse(); }
      else toast.error('Gagal menghapus section.');
    } catch { toast.error('Terjadi kesalahan server.'); } finally { setSectionToDelete(null); }
  };

  // Lesson CRUD
  const openLessonModal = (sectionId: number, lesson?: any) => {
    setLessonTitle(lesson?.title || '');
    setLessonType(lesson?.type || 'video');
    setLessonYoutubeUrl(lesson?.youtube_url || '');
    setLessonTextContent(lesson?.text_content || '');
    setLessonFile(null);
    setLessonDuration(lesson?.duration_minutes?.toString() || '');
    setLessonIsPreview(lesson?.is_preview || false);
    setLessonModal({ isOpen: true, sectionId, editingLesson: lesson || null });
  };

  const handleSaveLesson = async () => {
    if (!lessonTitle.trim()) { toast.error('Judul lesson wajib diisi!'); return; }

    // Type-specific validation
    if (lessonType === 'video') {
      if (!lessonYoutubeUrl.trim()) { toast.error('YouTube URL wajib diisi untuk tipe Video!'); return; }
      const ytId = extractYouTubeId(lessonYoutubeUrl);
      if (!ytId) { toast.error('Format YouTube URL tidak valid!'); return; }
    } else if (lessonType === 'text') {
      if (!lessonTextContent.trim() || lessonTextContent === '<p><br></p>') { toast.error('Konten teks wajib diisi untuk tipe Artikel!'); return; }
    } else if (lessonType === 'file') {
      if (!lessonModal.editingLesson && !lessonFile) { toast.error('File wajib diupload untuk tipe File!'); return; }
      if (lessonFile && lessonFile.size > 50 * 1024 * 1024) { toast.error('Ukuran file maksimal 50MB!'); return; }
    }

    setLessonSaving(true);
    try {
      const isEdit = lessonModal.editingLesson;
      const sectionId = lessonModal.sectionId;
      const currentSection = sections.find(s => s.id === sectionId);
      const lessonOrder = isEdit ? isEdit.order : ((currentSection?.lessons?.length || 0) + 1);

      // Use FormData for file upload support
      const formData = new FormData();
      formData.append('title', lessonTitle);
      formData.append('type', lessonType);
      formData.append('duration_minutes', (Number(lessonDuration) || 0).toString());
      formData.append('is_preview', lessonIsPreview ? '1' : '0');
      formData.append('order', lessonOrder.toString());

      if (lessonType === 'video') {
        formData.append('youtube_url', lessonYoutubeUrl);
      } else if (lessonType === 'text') {
        formData.append('text_content', lessonTextContent);
      } else if (lessonType === 'file' && lessonFile) {
        formData.append('file_upload', lessonFile);
      }

      if (!isEdit) {
        formData.append('course_section_id', (sectionId || '').toString());
      }

      const url = isEdit
        ? `/admin/courses/${courseId}/lessons/${isEdit.id}`
        : `/admin/courses/${courseId}/lessons`;

      const res = await apiFetch(url, { method: 'POST', body: formData }, true);
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(isEdit ? 'Lesson diupdate!' : 'Lesson ditambahkan!');
        setLessonModal({ isOpen: false, sectionId: null, editingLesson: null });
        fetchCourse();
      } else {
        toast.error(json.message || 'Gagal menyimpan lesson.');
      }
    } catch {
      toast.error('Terjadi kesalahan server.');
    } finally {
      setLessonSaving(false);
    }
  };

  const handleDeleteLessonClick = (lessonId: number) => {
    setLessonToDelete(lessonId);
    setDeleteLessonModalOpen(true);
  };

  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;
    setDeleteLessonModalOpen(false);
    const lessonId = lessonToDelete;

    try {
      const res = await apiFetch(`/admin/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) { toast.success('Lesson dihapus!'); fetchCourse(); }
      else toast.error('Gagal menghapus lesson.');
    } catch { toast.error('Terjadi kesalahan server.'); } finally { setLessonToDelete(null); }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const totalLessons = sections.reduce((sum, s) => sum + (s.lessons?.length || 0), 0);
  const totalDuration = sections.reduce((sum, s) => sum + (s.lessons || []).reduce((lSum: number, l: any) => lSum + (l.duration_minutes || 0), 0), 0);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-emerald-500" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat data kursus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 bg-slate-50 min-h-[80vh] pb-10 rounded-2xl">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses" className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-1">
              <GraduationCap size={12} /> Kelola Kursus
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate max-w-[400px]">{title || 'Edit Kursus'}</h1>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-600 border border-slate-200">
              <BookOpen size={12} /> {sections.length} bab
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 rounded-lg text-[11px] font-bold text-indigo-600 border border-indigo-100">
              <Video size={12} /> {totalLessons} lesson
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 rounded-lg text-[11px] font-bold text-amber-600 border border-amber-100">
              <Clock size={12} /> {totalDuration} menit
            </span>
          </div>
          <button onClick={handleSaveCourse} disabled={saving} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] disabled:opacity-70 active:scale-95">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Menyimpan...' : 'Simpan Kursus'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">

        {/* LEFT: Course Info */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2"><GraduationCap size={16} className="text-emerald-500" /> Info Kursus</h3>

            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul <span className="text-rose-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Masukkan judul kursus yang menarik" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" />
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Judul yang menarik dan deskriptif, maks 255 karakter</p>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kategori <span className="text-rose-500">*</span></label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-inner appearance-none">
                <option value="" disabled>-- Pilih Kategori --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Pilih kategori yang paling sesuai dengan materi kursus</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Level</label>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all cursor-pointer shadow-inner appearance-none">
                  <option value="beginner">Pemula</option>
                  <option value="intermediate">Menengah</option>
                  <option value="advanced">Mahir</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10} /> Tingkat kesulitan</p>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Harga (Rp)</label>
                <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Gratis" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10} /> 0 = Gratis</p>
              </div>
            </div>

            {/* Publish toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                {isPublished ? <Eye size={18} className="text-sky-500" /> : <EyeOff size={18} className="text-slate-400" />}
                <div>
                  <p className="text-sm font-bold text-slate-800">{isPublished ? 'Publik' : 'Draft'}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{isPublished ? 'Kursus terlihat oleh user' : 'Hanya admin yang bisa melihat'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPublished ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Thumbnail</label>
              {existingThumbnail && !thumbnail && (
                <div className="mb-3 rounded-xl overflow-hidden border border-slate-200">
                  <img src={`${STORAGE_URL}/${existingThumbnail}`} alt="Thumbnail" className="w-full h-32 object-cover" />
                </div>
              )}
              <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 rounded-xl p-3 text-center transition-colors group cursor-pointer">
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 10 * 1024 * 1024) { toast.error('Thumbnail maks 10MB! Silakan kompres gambar Anda.'); e.target.value = ''; return; }
                  setThumbnail(file);
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <ImageIcon className="mx-auto h-6 w-6 text-slate-300 group-hover:text-emerald-400 mb-1 transition-colors" />
                <p className="text-[11px] font-bold text-slate-600">{thumbnail ? thumbnail.name : 'Pilih atau ganti thumbnail'}</p>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Format: JPG, PNG, WEBP. Maks: 10MB. Rasio 16:9 direkomendasikan</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Deskripsi</label>
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 shadow-sm transition-all">
                <ReactQuill theme="snow" value={description} onChange={setDescription} modules={quillModules} placeholder="Deskripsi kursus..." className="min-h-[150px]" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Section & Lesson Manager */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-emerald-500" /> Kurikulum Kursus</h3>
              <button onClick={() => openSectionModal()} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm">
                <Plus size={14} /> Tambah Section
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-base font-bold text-slate-700 mb-1">Belum Ada Section</p>
                <p className="text-xs text-slate-500 mb-6">Mulai dengan membuat section (bab) pertama untuk kursus ini.</p>
                <button onClick={() => openSectionModal()} className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm">
                  <Plus size={14} className="inline mr-1" /> Buat Section Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div key={section.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    {/* Section Header */}
                    <div
                      className="flex items-center justify-between px-5 py-4 bg-white cursor-pointer hover:bg-slate-50/80 transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">
                          {sIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{section.title}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{section.lessons?.length || 0} lesson</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={(e) => { e.stopPropagation(); openSectionModal(section); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Section">
                          <Edit size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSectionClick(section.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Section">
                          <Trash2 size={14} />
                        </button>
                        {expandedSections.has(section.id) ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Lessons */}
                    <AnimatePresence>
                      {expandedSections.has(section.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-4 space-y-2 border-t border-slate-100 pt-3">
                            {(section.lessons || []).length === 0 ? (
                              <p className="text-xs text-slate-400 text-center py-4 italic">Belum ada lesson di section ini.</p>
                            ) : (
                              (section.lessons || []).map((lesson: any, lIdx: number) => {
                                const ytId = lesson.type === 'video' ? extractYouTubeId(lesson.youtube_url) : null;
                                const lType = lesson.type || 'video';
                                return (
                                  <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${lType === 'text' ? 'bg-sky-50 text-sky-500' : lType === 'file' ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-500'}`}>
                                      {lType === 'text' ? <Type size={13} /> : lType === 'file' ? <FileText size={13} /> : (lIdx + 1)}
                                    </div>
                                    {ytId && (
                                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                                        <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                          <PlayCircle size={14} className="text-white" />
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-slate-800 truncate">{lesson.title}</p>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${lType === 'text' ? 'bg-sky-50 text-sky-600 border border-sky-100' : lType === 'file' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
                                          {lType === 'text' ? 'ARTIKEL' : lType === 'file' ? 'FILE' : 'VIDEO'}
                                        </span>
                                        {lesson.duration_minutes > 0 && (
                                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5"><Clock size={10} /> {lesson.duration_minutes} menit</span>
                                        )}
                                        {lesson.is_preview && (
                                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">PREVIEW</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                      <button onClick={() => openLessonModal(section.id, lesson)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                        <Edit size={13} />
                                      </button>
                                      <button onClick={() => handleDeleteLessonClick(lesson.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <button onClick={() => openLessonModal(section.id)} className="w-full flex items-center justify-center gap-2 p-3 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 border-dashed rounded-xl transition-colors mt-2">
                              <Plus size={14} /> Tambah Lesson
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>

          <CourseExamManager courseId={courseId!} />
        </div>
      </div>

      {/* SECTION MODAL */}
      <AnimatePresence>
        {sectionModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSectionModal({ isOpen: false, editing: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><BookOpen size={20} /></div>
                  <h2 className="text-lg font-black text-slate-900">{sectionModal.editing ? 'Edit Section' : 'Tambah Section Baru'}</h2>
                </div>
                <button onClick={() => setSectionModal({ isOpen: false, editing: null })} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors"><XCircle size={20} /></button>
              </div>
              <div className="p-6 md:p-8 space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul Section / Bab <span className="text-rose-500">*</span></label>
                  <input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Cth: Bab 1 — Pengenalan React" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-inner" onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSection(); }} />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setSectionModal({ isOpen: false, editing: null })} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                  <button onClick={handleSaveSection} disabled={sectionSaving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm disabled:opacity-70 active:scale-95">
                    {sectionSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {sectionSaving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LESSON MODAL */}
      <AnimatePresence>
        {lessonModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLessonModal({ isOpen: false, sectionId: null, editingLesson: null })} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
              <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lessonType === 'text' ? 'bg-sky-100 text-sky-600' : lessonType === 'file' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {lessonType === 'text' ? <Type size={20} /> : lessonType === 'file' ? <FileText size={20} /> : <Video size={20} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">{lessonModal.editingLesson ? 'Edit Lesson' : 'Tambah Lesson Baru'}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {lessonType === 'text' ? 'Artikel / Teks' : lessonType === 'file' ? 'File Lampiran' : 'Video YouTube'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setLessonModal({ isOpen: false, sectionId: null, editingLesson: null })} className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-500 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors"><XCircle size={20} /></button>
              </div>

              <div className="overflow-y-auto flex-1 p-5 sm:p-6 md:p-8 space-y-5">

                {/* Lesson Type Selector */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Tipe Konten <span className="text-rose-500">*</span></label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'video' as const, label: 'Video', icon: <Video size={16} />, color: 'indigo' },
                      { val: 'text' as const, label: 'Artikel', icon: <Type size={16} />, color: 'sky' },
                      { val: 'file' as const, label: 'File', icon: <FileText size={16} />, color: 'amber' },
                    ].map(t => (
                      <button
                        key={t.val}
                        type="button"
                        onClick={() => setLessonType(t.val)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                          lessonType === t.val
                            ? t.color === 'indigo' ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                            : t.color === 'sky' ? 'border-sky-500 bg-sky-50 text-sky-600'
                            : 'border-amber-500 bg-amber-50 text-amber-600'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Video: YouTube embed | Artikel: Rich text | File: PDF, ZIP, dll</p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Judul Lesson <span className="text-rose-500">*</span></label>
                  <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Cth: Apa itu React?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10} /> Nama lesson yang akan ditampilkan di kurikulum</p>
                </div>

                {/* VIDEO CONTENT */}
                {lessonType === 'video' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">YouTube URL <span className="text-rose-500">*</span></label>
                      <input type="text" value={lessonYoutubeUrl} onChange={(e) => setLessonYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner font-mono" />
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Support: youtube.com/watch?v=xxx, youtu.be/xxx, atau ID langsung. Bisa unlisted.</p>
                    </div>

                    {extractYouTubeId(lessonYoutubeUrl) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <div className="aspect-video bg-black">
                          <iframe src={`https://www.youtube.com/embed/${extractYouTubeId(lessonYoutubeUrl)}`} referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
                        </div>
                        <div className="px-4 py-2 bg-slate-50 flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                          <CheckCircle2 size={12} /> Video YouTube berhasil terdeteksi
                        </div>
                      </motion.div>
                    )}

                    {lessonYoutubeUrl && !extractYouTubeId(lessonYoutubeUrl) && (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-600">
                        <AlertCircle size={14} /> URL YouTube tidak valid. Periksa kembali format URL.
                      </div>
                    )}
                  </>
                )}

                {/* TEXT CONTENT */}
                {lessonType === 'text' && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Konten Artikel <span className="text-rose-500">*</span></label>
                    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 shadow-sm transition-all">
                      <ReactQuill theme="snow" value={lessonTextContent} onChange={setLessonTextContent} modules={quillModules} placeholder="Tulis konten artikel/materi..." className="min-h-[200px]" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Tulis materi penjelasan, catatan, atau teori. Support formatting teks.</p>
                  </div>
                )}

                {/* FILE CONTENT */}
                {lessonType === 'file' && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Upload File <span className="text-rose-500">*</span></label>
                    {lessonModal.editingLesson?.file_name && !lessonFile && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                        <FileText size={18} className="text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-amber-800 truncate">{lessonModal.editingLesson.file_name}</p>
                          <p className="text-[10px] text-amber-600">File saat ini. Upload baru untuk mengganti.</p>
                        </div>
                      </div>
                    )}
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50 rounded-xl p-6 text-center transition-colors group cursor-pointer">
                      <input type="file" onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 50 * 1024 * 1024) { toast.error('File maks 50MB!'); e.target.value = ''; return; }
                        setLessonFile(file);
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <Upload className="mx-auto h-8 w-8 text-slate-300 group-hover:text-amber-400 mb-2 transition-colors" />
                      <p className="text-xs font-bold text-slate-600">{lessonFile ? lessonFile.name : 'Klik atau drag file ke sini'}</p>
                      {lessonFile && <p className="text-[10px] text-emerald-600 font-bold mt-1">{(lessonFile.size / 1024 / 1024).toFixed(1)} MB</p>}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1"><Info size={10} /> Format: PDF, ZIP, DOC, PPT, dll. Maks: 50MB. Siswa bisa download file ini.</p>
                  </div>
                )}

                {/* Duration & Preview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Durasi (menit)</label>
                    <input type="number" min="0" value={lessonDuration} onChange={(e) => setLessonDuration(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner" />
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Info size={10} /> Estimasi waktu</p>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl w-full cursor-pointer hover:bg-slate-100 transition-colors">
                      <input type="checkbox" checked={lessonIsPreview} onChange={(e) => setLessonIsPreview(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Preview Gratis</p>
                        <p className="text-[9px] text-slate-400 font-medium">Bisa diakses tanpa beli</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-8 py-4 sm:py-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                <button onClick={() => setLessonModal({ isOpen: false, sectionId: null, editingLesson: null })} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button onClick={handleSaveLesson} disabled={lessonSaving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm disabled:opacity-70 active:scale-95">
                  {lessonSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {lessonSaving ? 'Menyimpan...' : 'Simpan Lesson'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS SECTION */}
      <AnimatePresence>
        {deleteSectionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteSectionModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Hapus Section / Bab?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus section ini beserta <strong className="text-rose-500">SEMUA LESSON</strong> di dalamnya? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteSectionModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={confirmDeleteSection} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30">
                  Ya, Hapus!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL KONFIRMASI HAPUS LESSON */}
      <AnimatePresence>
        {deleteLessonModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteLessonModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Hapus Lesson?</h2>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin menghapus lesson ini secara permanen?
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setDeleteLessonModalOpen(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={confirmDeleteLesson} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-rose-500/30">
                  Ya, Hapus!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e2e8f0 !important; background-color: #f8fafc; padding: 8px 12px !important; }
        .ql-container.ql-snow { border: none !important; font-family: inherit !important; font-size: 0.875rem !important; }
        .ql-editor { min-height: 150px; padding: 12px !important; color: #334155; line-height: 1.6; }
        .ql-editor p { margin-bottom: 0.5em; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
