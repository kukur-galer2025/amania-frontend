"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap, Clock, BookOpen, Video, ChevronDown, ChevronUp, Award,
  PlayCircle, CheckCircle2, Loader2, ArrowLeft, ArrowRight,
  ChevronLeft, Menu, X, Check, Lock, FileText, Download, Type,
  Sun, Moon, MessageSquare, Send, Trash2, Bot, Sparkles, ArrowDown, Mic, Target
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';
import ExamClient from './ExamClient';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useRef } from 'react';

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
  
  const [showExam, setShowExam] = useState(false);
  
  // Q&A State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'materi' | 'diskusi' | 'mentor'>('materi');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // AI Mentor State
  const [aiChatHistory, setAiChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [aiQuestion, setAiQuestion] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showConfirmClearAi, setShowConfirmClearAi] = useState(false);
  const [showConfirmDeleteComment, setShowConfirmDeleteComment] = useState<number | null>(null);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Browser Anda tidak mendukung fitur Voice-to-Text.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
         setAiQuestion(prev => prev + (prev ? ' ' : '') + finalTranscript);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const clearAiChats = () => {
    setShowConfirmClearAi(true);
  };

  const executeClearAiChats = async () => {
    try {
      const res = await apiFetch(`/courses/lessons/${activeLessonId}/mentor-chats`, { method: 'DELETE' });
      if (res.ok) {
        setAiChatHistory([]);
        toast.success('Memori AI berhasil di-reset.');
      }
    } catch {
      toast.error('Gagal mereset memori AI.');
    } finally {
      setShowConfirmClearAi(false);
    }
  };

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

  useEffect(() => {
    if (activeLessonId) {
      fetchComments();
      fetchAiMentorChats();
      setActiveTab('materi');
      setAiChatHistory([]);
      setAiQuestion('');
    }
  }, [activeLessonId]);

  const fetchAiMentorChats = async () => {
    try {
      const res = await apiFetch(`/courses/lessons/${activeLessonId}/mentor-chats`);
      const json = await res.json();
      if (res.ok && json.success) {
        const mappedHistory = json.data.map((chat: any) => ({
          role: chat.role === 'model' ? 'ai' : 'user',
          content: chat.content
        }));
        setAiChatHistory(mappedHistory);
      }
    } catch {
      console.error('Failed to fetch AI mentor chats');
    }
  };

  const fetchComments = async () => {
    try {
      const res = await apiFetch(`/courses/lessons/${activeLessonId}/comments`);
      const json = await res.json();
      if (res.ok && json.success) {
        setComments(json.data);
      }
    } catch {
      console.error('Failed to fetch comments');
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await apiFetch(`/courses/lessons/${activeLessonId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: newComment, parent_id: replyingTo })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNewComment('');
        setReplyingTo(null);
        fetchComments();
        toast.success('Komentar terkirim!');
      }
    } catch {
      toast.error('Gagal mengirim komentar.');
    }
  };

  const deleteComment = (id: number) => {
    setShowConfirmDeleteComment(id);
  };

  const executeDeleteComment = async (id: number) => {
    try {
      const res = await apiFetch(`/courses/lessons/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchComments();
        toast.success('Komentar dihapus.');
      }
    } catch {
      toast.error('Gagal menghapus.');
    } finally {
      setShowConfirmDeleteComment(null);
    }
  };

  const sendAiMessage = async (text: string) => {
    if (!text.trim() || isAiLoading) return;
    
    const userQ = text;
    setAiChatHistory(prev => [...prev, { role: 'user', content: userQ }]);
    setAiQuestion('');
    setIsAiLoading(true);

    try {
      const res = await apiFetch(`/courses/lessons/${activeLessonId}/mentor`, {
        method: 'POST',
        body: JSON.stringify({ question: userQ })
      });
      
      if (!res.ok) {
         throw new Error('Network error');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      setAiChatHistory(prev => [...prev, { role: 'ai', content: '' }]);
      setIsAiLoading(false); // Disable spinner since typing starts

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { done, value } = await reader.read();
          isDone = done;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.substring(6).trim();
                if (dataStr === '[DONE]') {
                  isDone = true;
                  break;
                }
                if (dataStr) {
                  try {
                    const data = JSON.parse(dataStr);
                    if (data.chunk) {
                      setAiChatHistory(prev => {
                        const newHistory = [...prev];
                        const lastIdx = newHistory.length - 1;
                        if (newHistory[lastIdx].role === 'ai') {
                          newHistory[lastIdx] = {
                            ...newHistory[lastIdx],
                            content: newHistory[lastIdx].content + data.chunk
                          };
                        }
                        return newHistory;
                      });
                    }
                  } catch (e) {
                    // Ignore partial JSON chunks
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      toast.error('Gagal menghubungi AI Mentor.');
      setAiChatHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'ai' && last.content === '') {
          const newH = [...prev];
          newH[newH.length - 1].content = 'Maaf, gagal terhubung ke server AI.';
          return newH;
        }
        return [...prev, { role: 'ai', content: 'Maaf, gagal terhubung ke server AI.' }];
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const submitAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendAiMessage(aiQuestion);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollDown(!isAtBottom);
    }
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [aiChatHistory]);

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
    setShowExam(false);
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToExam = () => {
    setActiveLessonId(null);
    setShowExam(true);
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
        
        {/* Ujian Akhir Button in Sidebar */}
        {courseData.has_exam && (
          <div className="mt-4 px-4 pb-6">
            <button
              onClick={goToExam}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all border-2 ${showExam ? 'bg-amber-500/10 border-amber-500 text-amber-500' : `${t.sectionBg} border-slate-200 hover:border-amber-400 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${showExam ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                 <Award size={16} />
              </div>
              <div className="text-left">
                 <p className="text-xs font-black uppercase tracking-widest">Syarat Kelulusan</p>
                 <p className="text-sm font-bold">Ujian Akhir</p>
              </div>
            </button>
          </div>
        )}
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
              href={`${API_URL}/courses/lessons/${activeLesson.id}/download?token=${typeof window !== 'undefined' ? safeStorage.getItem('token') || '' : ''}`}
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

          {/* Certificate button */}
          {courseData.certificate && (
            <a 
              href={`${API_URL}/my-courses/${slug}/certificate?token=${typeof window !== 'undefined' ? safeStorage.getItem('token') || '' : ''}`} 
              target="_blank" 
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 text-[10px] font-black hover:scale-105 transition-all"
            >
              <Award size={14} /> Sertifikat
            </a>
          )}

          {/* Progress pill */}
          <div className={`hidden sm:flex items-center gap-2 ${t.pill} rounded-full px-3 py-1.5`}>
            <div className={`w-16 sm:w-20 h-1.5 ${t.pillTrack} rounded-full overflow-hidden`}>
              <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
            </div>
            <span className="text-[10px] font-black text-emerald-500">{progress}%</span>
          </div>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`hidden lg:flex p-1.5 sm:p-2 ${t.hover} rounded-lg transition-colors`}
          >
            {sidebarOpen ? <X size={18} className={t.textMuted} /> : <Menu size={18} className={t.textMuted} />}
          </button>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className={`lg:hidden flex p-1.5 sm:p-2 ${t.hover} rounded-lg transition-colors`}
          >
            <Menu size={18} className={t.textMuted} />
          </button>
        </div>
      </div>

      <div className="flex relative">

        {/* ── MAIN CONTENT ── */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:mr-[360px]' : ''}`}>

          {showExam ? (
            <ExamClient slug={slug} isDark={isDark} onPassed={() => {
              // Refresh course data to fetch certificate if generated
              window.location.reload();
            }} />
          ) : (
            <>
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
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {lessonType === 'video' && (
                        <button 
                          onClick={() => {
                            setActiveTab('mentor');
                            sendAiMessage('✨ Tolong buatkan rangkuman materi dari video pelajaran ini secara detail beserta poin-poin pentingnya.');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold text-xs rounded-lg transition-colors border border-indigo-200"
                        >
                          <Sparkles size={14} className="text-amber-500" />
                          AI: Rangkum Video Ini
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setActiveTab('mentor');
                          sendAiMessage('🎯 Tolong berikan saya 1 pertanyaan pilihan ganda yang menantang untuk menguji pemahaman saya tentang materi ini. Jangan beritahu jawabannya dulu. Tunggu saya menjawab, lalu koreksi dan berikan penjelasannya.');
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs rounded-lg transition-colors border border-rose-200"
                      >
                        <Target size={14} className="text-rose-500" />
                        AI: Uji Pemahaman Saya
                      </button>
                    </div>
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

                {/* Tabs */}
                <div className={`flex items-center gap-4 border-b ${t.barBorder} mt-8 overflow-x-auto custom-scrollbar`}>
                  <button onClick={() => setActiveTab('materi')} className={`pb-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'materi' ? 'border-emerald-500 text-emerald-500' : 'border-transparent ' + t.textMuted}`}>
                    Ringkasan Materi
                  </button>
                  <button onClick={() => setActiveTab('diskusi')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'diskusi' ? 'border-emerald-500 text-emerald-500' : 'border-transparent ' + t.textMuted}`}>
                    Ruang Diskusi <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'diskusi' ? 'bg-emerald-500 text-white' : t.pill}`}>{comments.length}</span>
                  </button>
                  <button onClick={() => setActiveTab('mentor')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'mentor' ? 'border-indigo-500 text-indigo-500' : 'border-transparent ' + t.textMuted}`}>
                    <Bot size={16} /> Tanya AI Mentor <Sparkles size={12} className="text-amber-400" />
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'materi' && (
                  <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none py-4 text-sm`}>
                    {activeLesson.description ? (
                      <div dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
                    ) : (
                      <p className={t.textFaint + ' italic'}>Tidak ada ringkasan materi.</p>
                    )}
                  </div>
                )}

                {activeTab === 'diskusi' && (
                  <div className="py-4 space-y-6">
                    <form onSubmit={submitComment} className="mb-8 relative">
                      {replyingTo && (
                         <div className="flex justify-between items-center bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-t-xl text-xs font-bold border border-emerald-500/20 border-b-0">
                           <span>Membalas komentar...</span>
                           <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-emerald-400"><X size={14}/></button>
                         </div>
                      )}
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ada yang ingin ditanyakan atau didiskusikan?"
                        className={`w-full p-4 text-sm ${t.bg} ${t.text} border ${t.barBorder} rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${replyingTo ? 'rounded-t-none border-t-0' : ''}`}
                        rows={3}
                      />
                      <button type="submit" disabled={!newComment.trim()} className="absolute right-3 bottom-3 p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 disabled:opacity-50">
                        <Send size={16} />
                      </button>
                    </form>

                    <div className="space-y-6">
                      {comments.length === 0 ? (
                         <div className={`text-center py-8 ${t.textMuted}`}>
                           <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                           <p className="text-sm font-medium">Belum ada diskusi di lesson ini.</p>
                         </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold shrink-0">
                                {comment.user?.name?.charAt(0).toUpperCase()}
                             </div>
                             <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                   <span className={`font-bold text-sm ${t.text}`}>{comment.user?.name}</span>
                                   {(comment.user?.role === 'superadmin' || comment.user?.role === 'creator') && (
                                      <span className="text-[9px] px-1.5 py-0.5 bg-sky-500 text-white font-bold rounded">Instruktur</span>
                                   )}
                                   <span className={`text-[10px] ${t.textFaint}`}>{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className={`text-sm ${t.textMuted} whitespace-pre-wrap`}>{comment.body}</p>
                                <div className="flex items-center gap-4 mt-2">
                                   <button onClick={() => setReplyingTo(comment.id)} className="text-xs font-bold text-emerald-500 hover:underline">Balas</button>
                                   <button onClick={() => deleteComment(comment.id)} className="text-xs font-bold text-red-500 hover:underline">Hapus</button>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                   <div className="mt-4 space-y-4 border-l-2 border-emerald-500/20 pl-4">
                                      {comment.replies.map((reply: any) => (
                                         <div key={reply.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-500/20 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
                                                {reply.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className={`font-bold text-sm ${t.text}`}>{reply.user?.name}</span>
                                                  {(reply.user?.role === 'superadmin' || reply.user?.role === 'creator') && (
                                                      <span className="text-[9px] px-1.5 py-0.5 bg-sky-500 text-white font-bold rounded">Instruktur</span>
                                                  )}
                                                  <span className={`text-[10px] ${t.textFaint}`}>{new Date(reply.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className={`text-sm ${t.textMuted} whitespace-pre-wrap`}>{reply.body}</p>
                                                <button onClick={() => deleteComment(reply.id)} className="text-xs font-bold text-red-500 hover:underline mt-2">Hapus</button>
                                            </div>
                                         </div>
                                      ))}
                                   </div>
                                )}
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'mentor' && (
                  <div className={`py-6 space-y-6 max-w-3xl border ${isDark ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-100 bg-indigo-50'} rounded-2xl p-6 mt-4 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                          <Bot size={24} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-black ${t.text}`}>AI Mentor</h3>
                          <p className={`text-xs font-medium ${t.textFaint}`}>Asisten cerdas 24/7</p>
                        </div>
                      </div>
                    </div>

                    <div 
                      ref={chatContainerRef}
                      onScroll={handleScroll}
                      className="space-y-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 relative"
                    >
                      {aiChatHistory.length === 0 ? (
                        <div className="text-center py-10 opacity-70">
                           <Sparkles size={32} className="mx-auto mb-3 text-indigo-400" />
                           <p className={`text-sm font-bold ${t.text}`}>Halo! Ada yang membingungkan dari lesson ini?</p>
                           <p className={`text-xs ${t.textMuted} mt-1`}>Silakan ketik pertanyaan Anda di bawah, saya siap membantu.</p>
                        </div>
                      ) : (
                        aiChatHistory.map((msg, idx) => (
                          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs ${msg.role === 'user' ? 'bg-slate-700' : 'bg-indigo-500'}`}>
                              {msg.role === 'user' ? 'U' : <Bot size={14} />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl min-w-0 max-w-[85%] overflow-x-auto custom-scrollbar text-sm ${msg.role === 'user' ? 'bg-slate-700 text-white rounded-tr-sm' : `${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 shadow-sm'} rounded-tl-sm`}`}>
                              {msg.role === 'user' ? (
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                              ) : (
                                (() => {
                                  let mainText = msg.content;
                                  let suggestions: string[] = [];
                                  if (msg.content.includes('|||')) {
                                    const parts = msg.content.split('|||');
                                    mainText = parts[0];
                                    const suggestionsStr = parts[1] || '';
                                    suggestions = suggestionsStr.split('|').map(s => s.trim()).filter(s => s);
                                  }

                                  return (
                                    <div className="flex flex-col gap-3 w-full min-w-0">
                                      <div className={`prose prose-sm max-w-none break-words ${isDark ? 'prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-indigo-400' : 'prose-slate prose-p:text-slate-700 prose-headings:text-slate-900 prose-a:text-indigo-600'} prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0`}>
                                        <ReactMarkdown
                                          remarkPlugins={[remarkGfm]}
                                          components={{
                                            code({node, inline, className, children, ...props}: any) {
                                              const match = /language-(\w+)/.exec(className || '')
                                              return !inline && match ? (
                                                <div className="w-full overflow-x-auto custom-scrollbar my-3 rounded-lg">
                                                  <SyntaxHighlighter
                                                    {...props}
                                                    children={String(children).replace(/\n$/, '')}
                                                    style={vscDarkPlus}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    customStyle={{ margin: 0, padding: '1rem', fontSize: '12px', background: '#0d1117' }}
                                                  />
                                                </div>
                                              ) : (
                                                <code {...props} className={`${className} ${isDark ? 'bg-slate-700 text-indigo-300' : 'bg-slate-100 text-indigo-600'} px-1.5 py-0.5 rounded text-[11px] font-mono whitespace-pre-wrap break-all`}>
                                                  {children}
                                                </code>
                                              )
                                            }
                                          }}
                                        >
                                          {mainText}
                                        </ReactMarkdown>
                                      </div>
                                      
                                      {suggestions.length > 0 && !isAiLoading && idx === aiChatHistory.length - 1 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {suggestions.map((sug, i) => (
                                            <button
                                              key={i}
                                              onClick={() => sendAiMessage(sug)}
                                              className={`text-xs px-3 py-1.5 rounded-full border ${isDark ? 'border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-300' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700'} transition-all hover:scale-105 text-left`}
                                            >
                                              {sug}
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      
                      {isAiLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs bg-indigo-500">
                            <Bot size={14} />
                          </div>
                          <div className={`px-5 py-4 rounded-2xl max-w-[85%] text-sm rounded-tl-sm flex items-center gap-2 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className={t.textMuted}>AI sedang memikirkan jawaban...</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Anchor for scrolling to bottom */}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Scroll to bottom button */}
                    {showScrollDown && (
                      <button 
                        onClick={scrollToBottom}
                        className="absolute bottom-28 left-1/2 transform -translate-x-1/2 bg-indigo-500/90 backdrop-blur-sm hover:bg-indigo-600 text-white rounded-full p-2 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all hover:scale-110 z-10 animate-bounce"
                      >
                        <ArrowDown size={20} />
                      </button>
                    )}

                    <div className="flex justify-end mb-2">
                      <button 
                        onClick={clearAiChats}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-rose-500 hover:bg-rose-50/50 font-bold text-[11px] rounded-lg transition-colors border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={13} />
                        Mulai Topik Baru
                      </button>
                    </div>

                    <form onSubmit={submitAiQuestion} className="relative flex items-center">
                      <textarea
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        placeholder="Ketik pertanyaan Anda tentang materi ini..."
                        className={`w-full p-4 pr-24 text-sm ${isDark ? 'bg-slate-900 text-white border-slate-700 focus:ring-indigo-500' : 'bg-white text-slate-900 border-slate-200 focus:ring-indigo-500'} border rounded-xl focus:outline-none focus:ring-2 resize-none shadow-sm`}
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submitAiQuestion(e as unknown as React.FormEvent);
                          }
                        }}
                      />
                      <div className="absolute right-3 bottom-3 flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={toggleListening}
                          className={`p-2 rounded-lg transition-colors shadow-md ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          <Mic size={16} />
                        </button>
                        <button 
                          type="submit" 
                          disabled={!aiQuestion.trim() || isAiLoading} 
                          className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 disabled:opacity-50 transition-colors shadow-md shadow-indigo-500/20"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
          </>
          )}
        </div>

        {/* ── DESKTOP SIDEBAR ── */}
        <aside className={`hidden lg:block fixed right-0 top-0 w-[360px] h-screen ${t.sidebar} border-l ${t.barBorder} z-20 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {SidebarContent({ isMobile: false })}
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
                {SidebarContent({ isMobile: true })}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── CUSTOM MODALS ── */}
        <AnimatePresence>
          {showConfirmClearAi && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border p-6 rounded-2xl shadow-2xl max-w-sm w-full`}>
                <h3 className={`text-lg font-bold mb-2 ${t.text}`}>Mulai Topik Baru?</h3>
                <p className={`text-sm mb-6 ${t.textMuted}`}>Seluruh riwayat obrolan di materi ini akan dihapus permanen. Anda yakin?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConfirmClearAi(false)} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>Batal</button>
                  <button onClick={executeClearAiChats} className="px-4 py-2 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30">Hapus Riwayat</button>
                </div>
              </motion.div>
            </div>
          )}
          {showConfirmDeleteComment && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} border p-6 rounded-2xl shadow-2xl max-w-sm w-full`}>
                <h3 className={`text-lg font-bold mb-2 ${t.text}`}>Hapus Komentar?</h3>
                <p className={`text-sm mb-6 ${t.textMuted}`}>Komentar ini akan dihapus secara permanen. Anda yakin?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConfirmDeleteComment(null)} className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>Batal</button>
                  <button onClick={() => executeDeleteComment(showConfirmDeleteComment)} className="px-4 py-2 text-sm font-bold bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors shadow-lg shadow-rose-500/30">Hapus Komentar</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

      <style jsx global>{`
        button:not(:disabled), a, [role="button"] { cursor: pointer !important; }
        button:disabled { cursor: not-allowed !important; }
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
