"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap, Clock, BookOpen, Video, ChevronDown, ChevronUp,
  PlayCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight,
  ChevronLeft, Menu, X, Check, Lock, FileText, Download, Type,
  Sun, Moon
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

export default function LearnClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [isDark, setIsDark] = useState(true);

  // Theme classes helper
  const t = {
    bg: isDark ? 'bg-slate-950' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-slate-900',
    textMuted: isDark ? 'text-slate-400' : 'text-slate-500',
    textFaint: isDark ? 'text-slate-500' : 'text-slate-400',
    textDim: isDark ? 'text-slate-600' : 'text-slate-400',
    bar: isDark ? 'bg-slate-900' : 'bg-white',
    barBorder: isDark ? 'border-slate-800' : 'border-slate-200',
    hover: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
    sidebar: isDark ? 'bg-slate-900' : 'bg-white',
    sidebarHover: isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50',
    sectionBg: isDark ? 'bg-slate-900/40' : 'bg-slate-50',
    sectionBorder: isDark ? 'border-slate-800/50' : 'border-slate-200/80',
    lessonBorder: isDark ? 'border-slate-800/30' : 'border-slate-100',
    pill: isDark ? 'bg-slate-800' : 'bg-slate-100',
    pillTrack: isDark ? 'bg-slate-700' : 'bg-slate-200',
    iconBg: isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-200 text-slate-400',
    activeBg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
    contentBg: isDark ? 'bg-black' : 'bg-white',
    btnSecondary: isDark ? 'text-slate-400 bg-slate-900 hover:bg-slate-800 border-slate-800' : 'text-slate-600 bg-white hover:bg-slate-50 border-slate-200 shadow-sm',
    openBtn: isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-lg',
    mobileSidebar: isDark ? 'bg-slate-900' : 'bg-white',
  };

  useEffect(() => {
    const fetchCourseLearn = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/my-courses/${slug}/learn`);
        const json = await res.json();
        if (res.ok && json.success) {
          setCourseData(json.data);
          const completed = new Set<number>((json.data.completed_lessons || []).map((l: any) => l.id || l));
          setCompletedLessons(completed);
          const allSections = json.data.sections || [];
          setExpandedSections(new Set(allSections.map((s: any) => s.id)));
          const allLessons = allSections.flatMap((s: any) => s.lessons || []);
          const firstIncomplete = allLessons.find((l: any) => !completed.has(l.id));
          setActiveLessonId(firstIncomplete?.id || allLessons[0]?.id || null);
        } else if (res.status === 403 || res.status === 401) {
          toast.error('Anda belum memiliki akses ke kursus ini.');
          router.push(`/courses/${slug}`);
        }
      } catch {
        toast.error('Gagal memuat kursus.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseLearn();
  }, [slug, router]);

  const allLessons = useMemo(() => {
    if (!courseData) return [];
    return (courseData.sections || []).flatMap((s: any) => (s.lessons || []).map((l: any) => ({ ...l, sectionTitle: s.title })));
  }, [courseData]);

  const activeLesson = useMemo(() => allLessons.find((l: any) => l.id === activeLessonId), [allLessons, activeLessonId]);
  const activeLessonIndex = useMemo(() => allLessons.findIndex((l: any) => l.id === activeLessonId), [allLessons, activeLessonId]);
  const progress = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;

  const handleMarkComplete = async () => {
    if (!activeLessonId) return;
    setMarkingComplete(true);
    try {
      const res = await apiFetch(`/my-courses/${slug}/progress`, {
        method: 'POST',
        body: JSON.stringify({ lesson_id: activeLessonId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCompletedLessons(prev => { const next = new Set(prev); next.add(activeLessonId); return next; });
        toast.success('Lesson selesai! ✓');
      }
    } catch {
      toast.error('Gagal memperbarui progress.');
    } finally {
      setMarkingComplete(false);
    }
  };

  const goToLesson = (lessonId: number) => {
    setActiveLessonId(lessonId);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => { if (activeLessonIndex < allLessons.length - 1) goToLesson(allLessons[activeLessonIndex + 1].id); };
  const goPrev = () => { if (activeLessonIndex > 0) goToLesson(allLessons[activeLessonIndex - 1].id); };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId); else next.add(sectionId);
      return next;
    });
  };

  const getLessonIcon = (lesson: any) => {
    const type = lesson.type || 'video';
    if (type === 'text') return <Type size={12} />;
    if (type === 'file') return <FileText size={12} />;
    return <PlayCircle size={12} />;
  };

  const getLessonTypeLabel = (type: string) => {
    if (type === 'text') return 'ARTIKEL';
    if (type === 'file') return 'FILE';
    return 'VIDEO';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-emerald-400" />
        </div>
        <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase tracking-widest`}>Memuat halaman belajar...</p>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 text-center ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <GraduationCap size={56} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
        <h2 className={`text-xl font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Kursus Tidak Ditemukan</h2>
        <Link href="/my-courses" className="text-sm font-bold text-emerald-500 hover:underline">← Kembali ke Kursus Saya</Link>
      </div>
    );
  }

  const ytId = activeLesson ? extractYouTubeId(activeLesson.youtube_url) : null;
  const lessonType = activeLesson?.type || 'video';

  // ── SIDEBAR CONTENT ──
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-4 py-3.5 border-b ${t.barBorder} flex items-center justify-between shrink-0`}>
        <div>
          <h3 className={`text-sm font-black ${t.text}`}>Kurikulum</h3>
          <p className={`text-[10px] font-bold ${t.textFaint} mt-0.5`}>{completedLessons.size}/{allLessons.length} selesai</p>
        </div>
        <button onClick={() => isMobile ? setMobileSidebarOpen(false) : setSidebarOpen(false)} className={`p-1.5 ${t.hover} rounded-lg transition-colors`}>
          <X size={16} className={t.textMuted} />
        </button>
      </div>

      {/* Progress */}
      <div className={`px-4 py-3 border-b ${t.sectionBorder} shrink-0`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] font-bold ${t.textFaint}`}>Progress</span>
          <span className="text-[10px] font-black text-emerald-500">{progress}%</span>
        </div>
        <div className={`w-full h-1.5 ${t.pillTrack} rounded-full overflow-hidden`}>
          <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
      </div>

      {/* Sections & Lessons */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {(courseData.sections || []).map((section: any, sIdx: number) => (
          <div key={section.id}>
            <button
              onClick={() => toggleSection(section.id)}
              className={`w-full px-4 py-3 flex items-center justify-between ${t.sectionBg} border-b ${t.sectionBorder} ${t.sidebarHover} transition-colors`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-6 h-6 rounded-md ${t.pill} ${isDark ? 'text-slate-400' : 'text-slate-500'} flex items-center justify-center text-[10px] font-black shrink-0`}>{sIdx + 1}</span>
                <div className="min-w-0 text-left">
                  <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'} truncate`}>{section.title}</p>
                  <p className={`text-[10px] ${t.textDim} font-medium`}>{(section.lessons || []).length} lesson</p>
                </div>
              </div>
              {expandedSections.has(section.id) ? <ChevronUp size={14} className={t.textDim + ' shrink-0'} /> : <ChevronDown size={14} className={t.textDim + ' shrink-0'} />}
            </button>

            <AnimatePresence>
              {expandedSections.has(section.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  {(section.lessons || []).map((lesson: any) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessons.has(lesson.id);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goToLesson(lesson.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b ${t.lessonBorder} ${isActive ? `${t.activeBg} border-l-2 border-l-emerald-500` : `${t.sidebarHover} border-l-2 border-l-transparent`}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-emerald-500/20 text-emerald-500' : t.iconBg}`}>
                          {isCompleted ? <Check size={10} strokeWidth={3} /> : getLessonIcon(lesson)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] truncate ${isActive ? 'font-bold text-emerald-500' : isCompleted ? `font-medium ${t.textFaint}` : `font-medium ${t.textMuted}`}`}>{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${lesson.type === 'text' ? 'bg-sky-500/15 text-sky-500' : lesson.type === 'file' ? 'bg-amber-500/15 text-amber-500' : `${t.pill} ${t.textFaint}`}`}>
                              {getLessonTypeLabel(lesson.type || 'video')}
                            </span>
                            {lesson.duration_minutes > 0 && (
                              <span className={`text-[10px] ${t.textDim} flex items-center gap-0.5`}><Clock size={9} /> {lesson.duration_minutes}m</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  // ── LESSON CONTENT RENDERER ──
  const renderLessonContent = () => {
    if (!activeLesson) {
      return (
        <div className={`w-full aspect-video flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
          <div className="text-center">
            <GraduationCap size={48} className={`mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
            <p className={`text-sm font-bold ${t.textMuted}`}>Pilih lesson untuk mulai belajar</p>
          </div>
        </div>
      );
    }

    if (lessonType === 'video') {
      return (
        <div className="aspect-video bg-black relative">
          {ytId ? (
            <iframe
              key={ytId}
              src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-500">
              <div className="text-center">
                <Video size={48} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm font-bold">Video belum tersedia</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (lessonType === 'text') {
      return (
        <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} min-h-[50vh]`}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <Type size={16} />
              </div>
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Materi Artikel</span>
            </div>
            <div
              className={`prose max-w-none ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white' : 'prose-slate prose-p:text-slate-600 prose-headings:text-slate-900'} prose-lg prose-headings:font-black prose-a:text-emerald-500 prose-img:rounded-xl`}
              dangerouslySetInnerHTML={{ __html: activeLesson.text_content || `<p class="${isDark ? 'text-slate-500' : 'text-slate-400'} italic">Konten belum tersedia.</p>` }}
            />
          </div>
        </div>
      );
    }

    if (lessonType === 'file') {
      return (
        <div className={`${isDark ? 'bg-slate-900' : 'bg-white'} min-h-[50vh] flex items-center justify-center`}>
          <div className="max-w-md mx-auto px-4 sm:px-6 text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileText size={36} className="text-white" />
            </div>
            <h3 className={`text-xl font-black ${t.text} mb-2`}>File Lampiran</h3>
            <p className={`text-sm ${t.textMuted} mb-1 font-medium`}>{activeLesson.file_name || 'File tersedia'}</p>
            <p className={`text-xs ${t.textFaint} mb-8`}>Download file materi untuk mempelajari konten lesson ini.</p>
            <a
              href={`${API_URL}/courses/lessons/${activeLesson.id}/download?token=${typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95"
            >
              <Download size={18} />
              Download File
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>

      {/* ── TOP BAR ── */}
      <div className={`${t.bar} border-b ${t.barBorder} px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 shadow-sm`}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Link href={`/courses/${slug}`} className={`p-1.5 sm:p-2 ${t.hover} rounded-lg transition-colors shrink-0`}>
            <ChevronLeft size={18} className={t.textMuted} />
          </Link>
          <div className="min-w-0">
            <h1 className={`text-xs sm:text-sm font-bold ${t.text} truncate`}>{courseData.title}</h1>
            <p className={`text-[9px] sm:text-[10px] font-bold ${t.textFaint} mt-0.5`}>{completedLessons.size} / {allLessons.length} lesson selesai</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-1.5 sm:p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-amber-400' : 'hover:bg-slate-100 text-slate-400 hover:text-indigo-500'}`}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Progress pill */}
          <div className={`hidden sm:flex items-center gap-2 ${t.pill} rounded-full px-3 py-1.5`}>
            <div className={`w-16 sm:w-20 h-1.5 ${t.pillTrack} rounded-full overflow-hidden`}>
              <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
            <span className="text-[10px] font-black text-emerald-500">{progress}%</span>
          </div>

          {/* Sidebar toggle */}
          <button
            onClick={() => { setSidebarOpen(!sidebarOpen); setMobileSidebarOpen(!mobileSidebarOpen); }}
            className={`p-1.5 sm:p-2 ${t.hover} rounded-lg transition-colors`}
          >
            {(sidebarOpen || mobileSidebarOpen) ? <X size={18} className={t.textMuted} /> : <Menu size={18} className={t.textMuted} />}
          </button>
        </div>
      </div>

      <div className="flex relative">

        {/* ── MAIN CONTENT ── */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:mr-[360px]' : ''}`}>

          {/* Lesson Content */}
          <div className={t.contentBg}>
            <div className="max-w-6xl mx-auto">
              {renderLessonContent()}
            </div>
          </div>

          {/* Lesson Info + Controls */}
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5 md:space-y-6">
            {activeLesson && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{activeLesson.sectionTitle}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${lessonType === 'text' ? 'bg-sky-500/15 text-sky-500' : lessonType === 'file' ? 'bg-amber-500/15 text-amber-500' : `${t.pill} ${t.textFaint}`}`}>
                        {getLessonTypeLabel(lessonType)}
                      </span>
                    </div>
                    <h2 className={`text-lg sm:text-xl md:text-2xl font-black ${t.text} tracking-tight`}>{activeLesson.title}</h2>
                    {activeLesson.duration_minutes > 0 && (
                      <p className={`text-xs font-bold ${t.textFaint} mt-2 flex items-center gap-1`}><Clock size={12} /> {activeLesson.duration_minutes} menit</p>
                    )}
                  </div>

                  {/* Mark Complete */}
                  {completedLessons.has(activeLessonId!) ? (
                    <div className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} rounded-xl border shrink-0`}>
                      <CheckCircle2 size={18} />
                      <span className="text-sm font-bold">Selesai ✓</span>
                    </div>
                  ) : (
                    <button onClick={handleMarkComplete} disabled={markingComplete} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 active:scale-95 shrink-0">
                      {markingComplete ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                      Tandai Selesai
                    </button>
                  )}
                </div>

                {/* Navigation */}
                <div className={`flex items-center justify-between gap-2 pt-5 border-t ${t.barBorder}`}>
                  <button onClick={goPrev} disabled={activeLessonIndex <= 0} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold ${t.btnSecondary} rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed border`}>
                    <ArrowLeft size={14} /> <span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <span className={`text-xs font-bold ${t.textDim} hidden sm:block`}>
                    Lesson {activeLessonIndex + 1} dari {allLessons.length}
                  </span>
                  <button onClick={goNext} disabled={activeLessonIndex >= allLessons.length - 1} className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20">
                    <span className="hidden sm:inline">Selanjutnya</span> <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className={`hidden lg:block fixed right-0 top-0 w-[360px] h-screen ${t.sidebar} border-l ${t.barBorder} z-20 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <SidebarContent />
        </aside>

        {/* Toggle button when sidebar closed */}
        {!sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className={`hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-20 p-3 ${t.openBtn} border rounded-full shadow-lg transition-all`}>
            <BookOpen size={18} className={t.textMuted} />
          </button>
        )}

        {/* ── MOBILE SIDEBAR OVERLAY ── */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" />
              <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className={`fixed right-0 top-0 w-[85vw] max-w-[340px] h-screen ${t.mobileSidebar} shadow-2xl z-50 lg:hidden`}>
                <SidebarContent isMobile />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: ${isDark ? '#475569' : '#94a3b8'}; }
        .prose img { max-width: 100%; height: auto; }
        .prose h2 { font-size: 1.4em; margin-top: 1.5em; }
        .prose h3 { font-size: 1.2em; }
        .prose ul, .prose ol { padding-left: 1.5em; }
      `}</style>
    </div>
  );
}
