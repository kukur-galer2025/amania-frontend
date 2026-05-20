"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap, Clock, BookOpen, Video, User, Tag,
  PlayCircle, ChevronDown, ChevronUp, Lock, Eye,
  Loader2, ArrowLeft, CheckCircle2, ShoppingCart, Sparkles, Star, BarChart3,
  X, ShieldCheck, Banknote, AlertCircle, Infinity as InfinityIcon, RefreshCw,
  Crown, Share2, Link as LinkIcon
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const BENEFITS = [
  { icon: InfinityIcon, label: 'Akses Selamanya', desc: 'Sekali bayar, akses video seumur hidup.', bg: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
  { icon: RefreshCw, label: 'Update Berkala', desc: 'Gratis update materi jika ada pembaruan.', bg: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
  { icon: ShieldCheck, label: 'Sertifikat Kelulusan', desc: 'Dapatkan sertifikat setelah menyelesaikan kursus.', bg: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-200' },
];

export default function CourseDetailClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  // Tripay Payment
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [channelError, setChannelError] = useState<string | null>(null);

  // Share
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Review/Rating
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {};
        if (token && token !== 'null' && token !== 'undefined') {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await apiFetch(`/courses/${slug}`, { headers });
        const json = await res.json();
        if (res.ok && json.success) {
          setCourse(json.data);
          if (json.data.sections?.length > 0) {
            setExpandedSections(new Set([json.data.sections[0].id]));
          }
          // Load existing user review if any
          if (json.data.user_review) {
            setReviewRating(json.data.user_review.rating);
            setReviewComment(json.data.user_review.comment || '');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  const formatRupiah = (number: number) => {
    if (number === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const getLevelLabel = (lvl: string) => {
    switch (lvl) {
      case 'beginner': return 'Pemula';
      case 'intermediate': return 'Menengah';
      case 'advanced': return 'Mahir';
      default: return lvl;
    }
  };

  const getLevelColor = (lvl: string) => {
    switch (lvl) {
      case 'beginner': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'intermediate': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'advanced': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  // ⭐ SUBMIT REVIEW
  const handleSubmitReview = async () => {
    if (reviewRating === 0) { toast.error('Pilih rating bintang terlebih dahulu!'); return; }
    setSubmittingReview(true);
    try {
      const res = await apiFetch(`/courses/${slug}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Review berhasil disimpan! ⭐');
        // Refresh course data
        const courseRes = await apiFetch(`/courses/${slug}`);
        const courseJson = await courseRes.json();
        if (courseRes.ok && courseJson.success) setCourse(courseJson.data);
      } else {
        toast.error(json.message || 'Gagal menyimpan review.');
      }
    } catch { toast.error('Terjadi kesalahan.'); }
    finally { setSubmittingReview(false); }
  };

  // 🔥 OPEN TRIPAY PAYMENT MODAL 🔥
  const handleOpenPaymentModal = async () => {
    if (!userData) {
      toast.error('Silakan masuk terlebih dahulu.');
      sessionStorage.setItem('redirectAfterLogin', `/courses/${slug}`);
      router.push('/login'); return;
    }

    // If free => direct checkout
    if (course.price === 0) {
      handleProcessCheckout('FREE');
      return;
    }

    setIsPaymentModalOpen(true);
    setIsLoadingChannels(true);
    setChannelError(null);

    try {
      const res = await apiFetch('/checkout/payment-channels', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setPaymentChannels(json.data);
      } else {
        setChannelError(json.message || "Gagal mengambil data metode pembayaran.");
      }
    } catch {
      setChannelError("Terjadi kesalahan jaringan.");
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // 🔥 PROCESS CHECKOUT VIA TRIPAY 🔥
  const handleProcessCheckout = async (methodOverride?: string) => {
    const finalMethod = methodOverride || selectedChannel;

    if (!finalMethod && course.price > 0) {
      toast.error("Pilih metode pembayaran terlebih dahulu!");
      return;
    }

    setEnrolling(true);
    const tid = toast.loading('Menyiapkan akses kursus...');

    try {
      const res = await apiFetch('/checkout/course', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ course_id: course.id, method: finalMethod })
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.message?.toLowerCase().includes('sudah memiliki') || json.message?.toLowerCase().includes('already')) {
          toast.success('Anda sudah memiliki kursus ini!', { id: tid, icon: '🎓' });
          setIsPaymentModalOpen(false);
          router.push(`/learn/${slug}`);
        } else {
          toast.error(json.message || 'Gagal memproses pesanan.', { id: tid });
        }
        setEnrolling(false); return;
      }

      if (json.is_free) {
        toast.success('Kursus gratis berhasil diklaim!', { id: tid });
        setIsPaymentModalOpen(false);
        router.push(`/learn/${slug}`);
        setEnrolling(false); return;
      }

      if (json.checkout_url) {
        toast.success('Membuka gerbang pembayaran...', { id: tid });
        window.location.href = json.checkout_url;
      } else {
        toast.error('Gateway tidak tersedia.', { id: tid }); setEnrolling(false);
      }
    } catch { toast.error('Kesalahan koneksi.', { id: tid }); setEnrolling(false); }
  };

  // Group channels
  const groupedChannels = paymentChannels.reduce((acc, channel) => {
    if (channel.active) {
      if (!acc[channel.group]) acc[channel.group] = [];
      acc[channel.group].push(channel);
    }
    return acc;
  }, {} as Record<string, any[]>);

  const totalLessons = (course?.sections || []).reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);
  const totalDuration = (course?.sections || []).reduce((sum: number, s: any) =>
    sum + (s.lessons || []).reduce((lSum: number, l: any) => lSum + (l.duration_minutes || 0), 0), 0);

  const isFree = course?.price === 0;
  const isEnrolled = course?.is_enrolled;

  // Share
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link berhasil disalin!');
    setIsShareModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
          <Loader2 size={48} className="text-emerald-500" />
        </motion.div>
        <p className="text-sm font-black text-emerald-500/80 uppercase tracking-[0.3em] animate-pulse">Memuat Kursus Premium...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <GraduationCap size={56} className="text-slate-300" />
        <h2 className="text-xl font-bold text-slate-700">Kursus Tidak Ditemukan</h2>
        <Link href="/courses" className="text-sm font-bold text-emerald-600 hover:underline">← Kembali ke Katalog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 lg:pb-16 font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full flex flex-col relative bg-slate-50 overflow-x-hidden">

      {/* AMBIENT GLOW */}
      <div className="absolute top-0 left-0 right-0 h-[600px] z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[60%] h-[80%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[60%] bg-teal-400/10 blur-[100px] rounded-full" />
      </div>

      {/* HEADER NAV */}
      <div className="relative z-40 w-full pt-6 md:pt-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-xs md:text-sm transition-colors bg-white/60 hover:bg-white backdrop-blur-md shadow-sm px-5 py-2.5 rounded-full border border-slate-200/60">
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Katalog Kursus</span><span className="sm:hidden">Kembali</span>
          </Link>
          <button onClick={() => setIsShareModalOpen(true)} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-xs md:text-sm transition-colors bg-white/60 hover:bg-white backdrop-blur-md shadow-sm px-5 py-2.5 rounded-full border border-slate-200/60">
            <Share2 size={16} /> <span className="hidden sm:inline">Bagikan</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-10 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT: Content */}
          <div className="flex-1 w-full min-w-0 flex flex-col gap-6 md:gap-8">

            {/* Hero Thumbnail */}
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden aspect-video bg-slate-100 border border-slate-200 shadow-lg group">
              {course.thumbnail ? (
                <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                  <GraduationCap size={80} className="text-emerald-200" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

              {/* Badges on thumbnail */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {isEnrolled && (
                  <span className="bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 w-fit border border-white/20">
                    <CheckCircle2 size={14} /> Terdaftar
                  </span>
                )}
                {isFree && !isEnrolled && (
                  <span className="bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg w-fit border border-white/20">
                    100% Gratis
                  </span>
                )}
              </div>

              {/* Play overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border backdrop-blur-md ${getLevelColor(course.level)} bg-white/80`}>
                    <BarChart3 size={12} /> {getLevelLabel(course.level)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md text-emerald-700 rounded-lg text-[11px] font-bold border border-emerald-100">
                    <Tag size={12} /> {course.category?.name || 'Umum'}
                  </span>
                </div>
              </div>
            </div>

            {/* Title & Meta */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {course.title}
              </h1>

              {/* Instructor */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <User size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{course.instructor?.name || 'Amania Team'}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Instruktur</p>
                </div>
              </div>

              {/* Stats bar */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                {(course.avg_rating > 0) && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= Math.round(course.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                        ))}
                      </div>
                      <span className="text-sm font-black text-amber-600">{course.avg_rating}</span>
                      <span className="text-xs text-slate-400 font-medium">({course.reviews_count || 0})</span>
                    </div>
                    <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                  </>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-500" />
                  <span className="text-sm font-bold text-slate-700">{course.sections?.length || 0} Bab</span>
                </div>
                <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-indigo-500" />
                  <span className="text-sm font-bold text-slate-700">{totalLessons} Lesson</span>
                </div>
                <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-slate-700">{totalDuration} Menit</span>
                </div>
                {course.students_count > 0 && (
                  <>
                    <div className="w-px h-5 bg-slate-200 hidden sm:block" />
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      <span className="text-sm font-bold text-slate-700">{course.students_count} Siswa</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100/50 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 leading-none mb-1">Tentang Kursus Ini</h2>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Apa yang akan Anda pelajari</p>
                </div>
              </div>
              <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description || '<p>Belum ada deskripsi.</p>' }} />
            </motion.div>

            {/* Curriculum */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 leading-none mb-1">Kurikulum</h2>
                  <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">{course.sections?.length || 0} Bab • {totalLessons} Video • {totalDuration} Menit</p>
                </div>
              </div>

              {(course.sections || []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8 italic">Kurikulum belum tersedia.</p>
              ) : (
                <div className="space-y-3">
                  {(course.sections || []).map((section: any, sIdx: number) => (
                    <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">{sIdx + 1}</span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-800 truncate">{section.title}</h4>
                            <p className="text-[10px] font-medium text-slate-400 mt-0.5">{section.lessons?.length || 0} lesson</p>
                          </div>
                        </div>
                        {expandedSections.has(section.id) ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.has(section.id) && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="divide-y divide-slate-100">
                              {(section.lessons || []).map((lesson: any) => (
                                <div key={lesson.id} className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-slate-50/50 transition-colors">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                                    {lesson.is_preview ? (
                                      <PlayCircle size={18} className="text-emerald-500" />
                                    ) : (
                                      <Lock size={14} className="text-slate-300" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">{lesson.title}</p>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {lesson.is_preview && (
                                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">PREVIEW</span>
                                    )}
                                    {lesson.duration_minutes > 0 && (
                                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                        <Clock size={11} /> {lesson.duration_minutes}m
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ═══ RATING & REVIEWS SECTION ═══ */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-8"
            >
              <h2 className="text-lg md:text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Star size={20} className="text-amber-400 fill-amber-400" /> Rating & Ulasan
              </h2>

              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                <div className="text-center">
                  <p className="text-4xl md:text-5xl font-black text-amber-600">{course.avg_rating || 0}</p>
                  <div className="flex items-center gap-0.5 mt-1.5 justify-center">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={16} className={s <= Math.round(course.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-amber-200'} />
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 font-bold mt-1">{course.reviews_count || 0} ulasan</p>
                </div>
                <div className="flex-1 w-full">
                  {[5,4,3,2,1].map(star => {
                    const count = (course.reviews || []).filter((r: any) => r.rating === star).length;
                    const total = course.reviews?.length || 1;
                    const pct = Math.round((count / total) * 100) || 0;
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-500 w-4">{star}</span>
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border border-amber-100">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review Form (for enrolled users) */}
              {isEnrolled && (
                <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-black text-slate-800 mb-3">{course.user_review ? 'Update Ulasan Anda' : 'Beri Rating & Ulasan'}</h3>
                  <div className="flex items-center gap-1 mb-4">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(star)} className="p-0.5 transition-transform hover:scale-110">
                        <Star size={28} className={`transition-colors ${star <= (hoverRating || reviewRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                    {reviewRating > 0 && <span className="text-sm font-black text-amber-600 ml-2">{reviewRating}/5</span>}
                  </div>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Tulis ulasan Anda tentang kursus ini (opsional)..." rows={3}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none mb-3"
                  />
                  <button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    {submittingReview ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                    {submittingReview ? 'Menyimpan...' : course.user_review ? 'Update Review' : 'Kirim Review'}
                  </button>
                </div>
              )}

              {/* Reviews List */}
              {(course.reviews || []).length > 0 ? (
                <div className="space-y-4">
                  {(course.reviews || []).slice(0, 10).map((review: any) => (
                    <div key={review.id} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0">
                        {(review.user?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-bold text-slate-800">{review.user?.name || 'Anonim'}</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={11} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-xs text-slate-600 leading-relaxed">{review.comment}</p>}
                        <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6 italic">Belum ada ulasan. Jadilah yang pertama memberikan rating!</p>
              )}
            </motion.div>
          </div>

          {/* RIGHT: Checkout Sidebar */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 mt-4 md:mt-0 z-30">
            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden relative flex flex-col w-full">

              <div className="p-6 md:p-8 relative z-10 bg-gradient-to-b from-white to-slate-50">
                {/* Ownership indicator */}
                {isEnrolled ? (
                  <div className="inline-flex items-center gap-2 mb-5 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-2 rounded-xl w-fit shadow-sm">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Akses Terbuka</p>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 mb-5 bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-2 rounded-xl w-fit shadow-sm">
                    <GraduationCap size={14} />
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Investasi Pendidikan</p>
                  </div>
                )}

                {/* Price with strikethrough */}
                {!isFree && !isEnrolled && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm md:text-base font-bold text-slate-400 line-through">{formatRupiah(course.price * 5)}</span>
                    <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">80% OFF</span>
                  </div>
                )}
                <p className={`text-3xl md:text-4xl font-black tracking-tighter mb-2 ${isFree || isEnrolled ? 'text-emerald-500' : 'text-slate-900'}`}>
                  {isEnrolled ? 'Terdaftar' : formatRupiah(course.price)}
                </p>

                {!isFree && !isEnrolled && <p className="text-xs md:text-sm font-medium text-slate-500 mb-6">Pembayaran 1x via Tripay. Aman & Terenkripsi.</p>}
                {isFree && !isEnrolled && <p className="text-xs md:text-sm font-medium text-emerald-600 mb-6">Akses kursus premium gratis khusus Anda.</p>}
                {isEnrolled && <p className="text-xs md:text-sm font-medium text-emerald-600 mb-6">Anda sudah bisa mengakses seluruh materi.</p>}

                {/* CTA Buttons (Desktop) */}
                <div className="hidden lg:flex flex-col gap-3 w-full">
                  {isEnrolled ? (
                    <Link href={`/learn/${slug}`} className="relative w-full py-4 md:py-5 rounded-2xl font-black text-white text-sm md:text-base bg-emerald-500 hover:bg-emerald-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 overflow-hidden group">
                      <PlayCircle size={20} className="shrink-0" /> Lanjut Belajar
                    </Link>
                  ) : (
                    <button onClick={handleOpenPaymentModal} disabled={enrolling} className="relative w-full py-4 rounded-2xl font-black text-white text-sm md:text-base bg-emerald-600 hover:bg-emerald-700 shadow-[0_10px_30px_rgba(5,150,105,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 overflow-hidden group/btn">
                      {enrolling ? <Loader2 size={20} className="animate-spin shrink-0" /> : <Banknote size={20} className="shrink-0 text-emerald-100" />}
                      <span>{isFree ? 'Klaim Gratis Sekarang' : 'Beli Kursus Ini'}</span>
                    </button>
                  )}
                </div>

                {/* Trust Sign */}
                {!isEnrolled && (
                  <div className="hidden lg:flex items-center justify-center gap-2 mt-5 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                    <Lock size={12} className="shrink-0" /> Pembayaran Terenkripsi Aman
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-slate-50/50 border-t border-slate-100 p-6 md:p-8 flex flex-col gap-4 w-full relative z-10">
                {BENEFITS.map((b) => (
                  <div key={b.label} className="flex gap-3 md:gap-4 w-full min-w-0 items-start">
                    <div className={`w-10 h-10 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center shrink-0`}>
                      <b.icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-bold text-slate-900 text-xs md:text-sm mb-0.5">{b.label}</p>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🔥 MOBILE STICKY BOTTOM BAR 🔥 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 pb-safe z-[50] lg:hidden shadow-[0_-15px_40px_rgba(0,0,0,0.1)] flex items-center justify-between gap-2.5 w-full">
        <div className="shrink-0 flex flex-col justify-center min-w-0 pl-1 w-[35%]">
          {!isFree && !isEnrolled && (
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] font-bold text-slate-300 line-through">{formatRupiah(course.price * 5)}</span>
              <span className="text-[7px] font-black text-rose-600 bg-rose-50 px-1 py-0.5 rounded">80%</span>
            </div>
          )}
          <p className={`text-sm sm:text-base font-black tracking-tight leading-none truncate w-full ${isFree || isEnrolled ? 'text-emerald-500' : 'text-slate-900'}`}>
            {isEnrolled ? 'Terdaftar ✓' : formatRupiah(course.price)}
          </p>
        </div>

        <div className="flex-1 flex gap-2 justify-end w-[65%]">
          {isEnrolled ? (
            <Link href={`/learn/${slug}`} className="w-full py-2.5 rounded-xl font-black text-white text-xs bg-emerald-500 flex items-center justify-center gap-1.5 active:scale-95 transition-transform">
              <PlayCircle size={14} className="shrink-0" /> <span className="truncate">Lanjut Belajar</span>
            </Link>
          ) : (
            <button onClick={handleOpenPaymentModal} disabled={enrolling} className="flex-1 py-2.5 rounded-xl font-black text-white text-xs sm:text-sm bg-emerald-600 shadow-[0_4px_15px_rgba(5,150,105,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-70 active:scale-95 transition-transform overflow-hidden">
              {enrolling ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Banknote size={16} className="shrink-0 text-emerald-100" />}
              <span className="truncate">{isFree ? 'Klaim Gratis' : 'Beli Kursus'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 🔥 MODAL PEMILIHAN PEMBAYARAN TRIPAY 🔥 */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-full h-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm w-full h-full" />
            <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 100, scale: 0.95 }} className="relative bg-white rounded-2xl sm:rounded-[2rem] shadow-2xl w-full md:w-[600px] max-h-[95vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 w-full shrink-0">
                <div className="min-w-0 pr-4">
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 truncate w-full">Metode Pembayaran</h3>
                  <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest truncate w-full">Sistem Terenkripsi Aman</p>
                </div>
                <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors shrink-0">
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50 w-full">
                {isLoadingChannels ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 w-full">
                    <Loader2 size={40} className="text-emerald-600 animate-spin" />
                    <p className="text-xs md:text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Menghubungkan Gateway...</p>
                  </div>
                ) : channelError ? (
                  <div className="text-center py-10 w-full">
                    <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
                    <p className="text-slate-900 font-black text-base md:text-lg mb-2">Terjadi Kesalahan</p>
                    <p className="text-slate-500 font-medium text-xs md:text-sm px-4">{channelError}</p>
                  </div>
                ) : Object.keys(groupedChannels).length === 0 ? (
                  <div className="text-center py-10 w-full">
                    <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium text-xs md:text-sm">Metode pembayaran tidak tersedia saat ini.</p>
                  </div>
                ) : (
                  <div className="space-y-5 md:space-y-6 w-full">
                    {(Object.entries(groupedChannels) as [string, any[]][]).map(([groupName, channels]) => (
                      <div key={groupName} className="w-full">
                        <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">{groupName}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                          {channels.map((channel: any) => (
                            <button key={channel.code} onClick={() => setSelectedChannel(channel.code)} className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 text-left transition-all w-full min-w-0 ${selectedChannel === channel.code ? 'border-emerald-600 bg-emerald-50 shadow-md' : 'border-slate-200 bg-white hover:border-emerald-300 shadow-sm'}`}>
                              <div className="w-12 h-8 md:w-14 md:h-10 shrink-0 bg-white rounded-lg flex items-center justify-center px-1.5 md:px-2 py-1 border border-slate-100">
                                <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs md:text-sm font-bold truncate w-full ${selectedChannel === channel.code ? 'text-emerald-800' : 'text-slate-700'}`}>
                                  {channel.name}
                                </p>
                              </div>
                              {selectedChannel === channel.code && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5 md:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 w-full shrink-0">
                <div className="text-center sm:text-left w-full sm:w-auto min-w-0">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate w-full flex items-center justify-center sm:justify-start gap-1"><ShieldCheck size={12} /> Tagihan Terenkripsi</p>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none truncate w-full">{formatRupiah(course.price)}</p>
                </div>

                <button onClick={() => handleProcessCheckout()} disabled={!selectedChannel || enrolling || !!channelError} className="w-full sm:w-auto px-8 py-3.5 md:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none text-white rounded-xl font-black text-sm transition-all shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_20px_rgba(5,150,105,0.4)] flex items-center justify-center gap-2 active:scale-95 shrink-0 min-w-0">
                  {enrolling ? <><Loader2 size={18} className="animate-spin shrink-0" /> <span className="truncate">Memproses...</span></> : <><Banknote size={18} className="shrink-0 text-emerald-100" /><span className="truncate">Selesaikan Pembayaran</span></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔥 SHARE MODAL WITH BROADCAST 🔥 */}
      <AnimatePresence>
        {isShareModalOpen && (() => {
          const bcText = `🎓 *${course.title}*\n\n${course.description ? course.description.replace(/<[^>]+>/g, '').substring(0, 150) + '...' : 'Kursus premium dari Amania Nusantara!'}\n\n📚 ${(course.sections || []).length} Bab · ${totalLessons} Lesson\n⭐ Rating: ${course.avg_rating || 0}/5\n💰 ${course.price === 0 ? 'GRATIS!' : formatRupiah(course.price) + ' (Diskon 80%)'}\n\n🔗 Daftar sekarang:\n${shareUrl}\n\n_Powered by Amania Nusantara_`;
          const waUrl = `https://wa.me/?text=${encodeURIComponent(bcText)}`;
          const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(bcText)}`;
          return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShareModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
              <button onClick={() => setIsShareModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 bg-white/80 hover:bg-slate-100 rounded-full transition-colors z-10 backdrop-blur-sm">
                <X size={16} />
              </button>

              {/* Preview Card */}
              <div className="relative aspect-[2/1] overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
                {course.thumbnail && (
                  <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover opacity-30" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1 block">Bagikan Kursus</span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-white/70 flex items-center gap-1"><BookOpen size={11} /> {(course.sections || []).length} Bab</span>
                    <span className="text-[10px] font-bold text-white/70 flex items-center gap-1"><Video size={11} /> {totalLessons} Lesson</span>
                    {course.avg_rating > 0 && <span className="text-[10px] font-bold text-amber-300 flex items-center gap-1"><Star size={11} className="fill-amber-300" /> {course.avg_rating}</span>}
                  </div>
                </div>
              </div>

              {/* Broadcast Preview */}
              <div className="p-5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Preview Broadcast</p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] text-slate-600 leading-relaxed font-medium whitespace-pre-line max-h-32 overflow-y-auto custom-scrollbar">
                  {bcText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 pb-5 flex flex-col gap-2.5">
                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Bagikan via WhatsApp
                </a>
                <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 active:scale-95">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  Bagikan via Telegram
                </a>
                <button onClick={handleCopyLink} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors border border-slate-200 flex items-center justify-center gap-2 active:scale-95">
                  <LinkIcon size={16} /> Salin Link
                </button>
              </div>
            </motion.div>
          </div>
          );
        })()}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}
