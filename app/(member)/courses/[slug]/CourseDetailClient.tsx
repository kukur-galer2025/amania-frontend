"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
 GraduationCap, Clock, BookOpen, Video, User, Tag,
 PlayCircle, ChevronDown, ChevronUp, Lock, Eye,
 Loader2, ArrowLeft, CheckCircle2, ShoppingCart, Sparkles, Star, BarChart3,
 X, ShieldCheck, Banknote, AlertCircle, Infinity as InfinityIcon, RefreshCw,
 Crown, Share2, Link as LinkIcon, Zap, Award, MessageSquare, ThumbsUp, Send, Users
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

const extractYouTubeId = (url: string): string | null => {
 if (!url) return null;
 const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
 return match ? match[1] : null;
};

const BENEFITS = [
  { icon: InfinityIcon, label: 'Akses Selamanya', desc: 'Sekali bayar, akses video seumur hidup.', gradient: 'from-amber-500 to-orange-500', bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10', border: 'border-amber-200/60 dark:border-amber-500/20' },
  { icon: RefreshCw, label: 'Update Berkala', desc: 'Gratis update materi jika ada pembaruan.', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10', border: 'border-blue-200/60 dark:border-blue-500/20' },
  { icon: ShieldCheck, label: 'Sertifikat Kelulusan', desc: 'Dapatkan sertifikat setelah menyelesaikan kursus.', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10', border: 'border-emerald-200/60 dark:border-emerald-500/20' },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
 return (
 <span className="inline-flex gap-0.5">
 {[1,2,3,4,5].map((s) => (
 <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : 'text-slate-200'} />
 ))}
 </span>
 );
}

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

 // Recommendations
 const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';
 const userData = typeof window !== 'undefined' ? JSON.parse(safeStorage.getItem('user') || 'null') : null;

 useEffect(() => {
 const fetchCourse = async () => {
 setLoading(true);
 try {
 const token = safeStorage.getItem('token');
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

 // Fetch Recommendations
 try {
 const recRes = await apiFetch('/courses');
 const recJson = await recRes.json();
 if (recRes.ok && recJson.success) {
 const allCourses = recJson.data || [];
 const filtered = allCourses.filter((c: any) => c.slug !== slug);
 // Sort by created_at desc (or just take first 2)
 setRecommendedCourses(filtered.slice(0, 2));
 }
 } catch (err) {
 console.error('Failed to fetch recommendations', err);
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
 case 'beginner': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20';
 case 'intermediate': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-100 dark:border-amber-500/20';
 case 'advanced': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20';
 default: return 'bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-700/50';
 }
 };

 const getLevelGradient = (lvl: string) => {
 switch (lvl) {
 case 'beginner': return 'from-emerald-500 to-teal-500';
 case 'intermediate': return 'from-amber-500 to-orange-500';
 case 'advanced': return 'from-rose-500 to-pink-500';
 default: return 'from-slate-500 to-slate-600';
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
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` }
 });
 const json = await res.json();

 if (res.ok && json.success) {
 setPaymentChannels(json.data);
 } else {
 setChannelError(json.message ||"Gagal mengambil data metode pembayaran.");
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
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` },
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
 const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/courses/${course?.id || slug}` : '';
 const handleCopyLink = () => {
 navigator.clipboard.writeText(shareUrl);
 toast.success('Link berhasil disalin!');
 setIsShareModalOpen(false);
 };

 if (loading) {
 return (
 <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
 <Loader2 size={48} className="text-emerald-500"/>
 </motion.div>
 <p className="text-sm font-black text-emerald-500/80 uppercase tracking-[0.3em] animate-pulse">Memuat Kursus Premium...</p>
 </div>
 );
 }

 if (!course) {
 return (
 <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
 <GraduationCap size={56} className="text-slate-300 dark:text-slate-500"/>
 <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Kursus Tidak Ditemukan</h2>
 <Link href="/courses" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">← Kembali ke Katalog</Link>
 </div>
 );
 }

 return (
 <div className="min-h-screen pb-32 lg:pb-16 font-sans selection:bg-emerald-100 selection:text-emerald-900 w-full flex flex-col relative bg-[#F8FAFC] dark:bg-[#0B1120] overflow-x-hidden">

 {/* ════ GLOBAL CSS ════ */}
 <style jsx global>{`
 @keyframes shimmer {
 100% { transform: translateX(100%); }
 }
 @keyframes pulse-glow {
 0%, 100% { box-shadow: 0 0 20px rgba(16,185,129,0.15); }
 50% { box-shadow: 0 0 40px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.1); }
 }
 @keyframes gradient-shift {
 0% { background-position: 0% 50%; }
 50% { background-position: 100% 50%; }
 100% { background-position: 0% 50%; }
 }
 .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
 .animate-gradient-shift { 
 background-size: 200% 200%;
 animation: gradient-shift 4s ease infinite; 
 }
 .glass-card {
 background: rgba(255,255,255,0.7);
 backdrop-filter: blur(20px);
 -webkit-backdrop-filter: blur(20px);
 }
 .dark .glass-card {
 background: rgba(30,41,59,0.7);
 }
 .glass-card-strong {
 background: rgba(255,255,255,0.85);
 backdrop-filter: blur(24px);
 -webkit-backdrop-filter: blur(24px);
 }
 .dark .glass-card-strong {
 background: rgba(15,23,42,0.85);
 }
 .custom-scrollbar::-webkit-scrollbar { width: 5px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
 `}</style>

 {/* AMBIENT GLOW - ENHANCED */}
 <div className="absolute top-0 left-0 right-0 h-[800px] z-0 pointer-events-none overflow-hidden">
 <div className="absolute top-[-30%] left-[5%] w-[70%] h-[90%] bg-emerald-50 dark:bg-emerald-500/[0.06] blur-[150px] rounded-full"/>
 <div className="absolute top-[5%] right-[5%] w-[50%] h-[70%] bg-teal-400/[0.05] blur-[130px] rounded-full"/>
 <div className="absolute top-[40%] left-[40%] w-[35%] h-[40%] bg-cyan-400/[0.04] blur-[120px] rounded-full"/>
 {/* Subtle dot grid */}
 <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
 </div>

 {/* HEADER NAV */}
 <div className="relative z-40 w-full pt-5 md:pt-8 bg-transparent">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
 <Link href="/courses" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm transition-transform duration-300 glass-card hover:bg-white dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800/50 shadow-sm dark:shadow-black/10 hover:shadow-md dark:shadow-black/15 px-4 sm:px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700/50 hover:border-emerald-200/60 group">
 <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/> <span className="hidden sm:inline">Katalog Kursus</span><span className="sm:hidden">Kembali</span>
 </Link>
 <button onClick={() => setIsShareModalOpen(true)} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm transition-transform duration-300 glass-card hover:bg-white dark:hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-800/50 shadow-sm dark:shadow-black/10 hover:shadow-md dark:shadow-black/15 px-4 sm:px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700/50 hover:border-emerald-200/60 group">
 <Share2 size={16} className="group-hover:rotate-12 transition-transform"/> <span className="hidden sm:inline">Bagikan</span>
 </button>
 </div>
 </div>

 {/* MAIN CONTENT */}
 <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 md:mt-10 w-full">
 <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

 {/* LEFT: Content */}
 <div className="flex-1 w-full min-w-0 flex flex-col gap-6 md:gap-8">

 {/* Hero Thumbnail - CINEMATIC */}
 <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700/50 shadow-[0_20px_60px_rgba(0,0,0,0.1)] group">
 {course.thumbnail ? (
 <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50">
 <GraduationCap size={80} className="text-emerald-200"/>
 </div>
 )}
 {/* Cinematic gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/5"/>
 <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"/>

 {/* Badges on thumbnail */}
 <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col gap-2">
 {isEnrolled && (
 <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg dark:shadow-black/20 flex items-center gap-1.5 w-fit border border-slate-200/30 dark:border-slate-700/20">
 <CheckCircle2 size={12} /> Terdaftar
 </motion.span>
 )}
 {isFree && !isEnrolled && (
 <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg dark:shadow-black/20 w-fit border border-slate-200/30 dark:border-slate-700/20">
 <Zap size={12} className="inline mr-1"/> Gratis
 </motion.span>
 )}
 </div>

 {/* Bottom info overlay */}
 <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 md:p-6">
 <div className="flex items-end justify-between gap-3">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border backdrop-blur-md ${getLevelColor(course.level)} bg-white dark:bg-slate-800/80`}>
 <BarChart3 size={11} /> {getLevelLabel(course.level)}
 </span>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800/80 backdrop-blur-md text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] sm:text-[11px] font-bold border border-emerald-100 dark:border-emerald-500/20">
 <Tag size={11} /> {course.category?.name || 'Umum'}
 </span>
 </div>
 {/* Play indicator removed */}
 </div>
 </div>
 </div>

 {/* Title & Meta - ENHANCED */}
 <div>
 <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="text-[22px] sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
 {course.title}
 </motion.h1>

 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
  className="flex items-center gap-3 mb-5">
  {(!course.instructor || course.instructor.role === 'superadmin' || course.instructor.name === 'Admin Amania') ? (
  <>
  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm dark:shadow-black/10">
  <img src="/logo-mini.png" alt="Amania Official" className="w-5 h-5 object-contain dark:brightness-0 dark:invert" />
  </div>
  <div>
  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Amania Official</p>
  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest">Amania Team</p>
  </div>
  </>
  ) : (
  <>
  {course.instructor?.avatar ? (
  <img src={`${STORAGE_URL}/${course.instructor.avatar}`} alt={course.instructor.name} className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-black/10" />
  ) : (
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200/60 flex items-center justify-center shadow-sm dark:shadow-black/10">
  <User size={18} className="text-emerald-500"/>
  </div>
  )}
  <div>
  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.instructor.name}</p>
  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-widest">Instruktur</p>
  </div>
  </>
  )}
  </motion.div>

 {/* Stats bar - ENHANCED */}
 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
 className="flex items-center gap-2 sm:gap-3 flex-wrap p-3.5 sm:p-4 glass-card-strong rounded-xl border border-slate-200 dark:border-slate-700/50 dark:border-slate-700 shadow-sm dark:shadow-black/10">
 {course.avg_rating > 0 ? (
 <>
 <div className="flex items-center gap-1.5">
 <div className="flex items-center gap-0.5">
 {[1,2,3,4,5].map(s => (
 <Star key={s} size={13} className={s <= Math.round(course.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
 ))}
 </div>
 <span className="text-sm font-black text-amber-600">{parseFloat(course.avg_rating).toFixed(1)}</span>
 <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">({course.reviews_count || 0})</span>
 </div>
 <div className="w-px h-4 bg-slate-200 hidden sm:block"/>
 </>
 ) : (
 <>
 <div className="flex items-center gap-1.5">
 <Star size={13} className="text-slate-300 dark:text-slate-500"/>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
 </div>
 <div className="w-px h-4 bg-slate-200 hidden sm:block"/>
 </>
 )}
 <div className="flex items-center gap-1.5">
 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60">
 <BookOpen size={12} className="text-emerald-500 dark:text-emerald-400"/>
 </div>
 <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{course.sections?.length || 0} Bab</span>
 </div>
 <div className="w-px h-4 bg-slate-200 hidden sm:block"/>
 <div className="flex items-center gap-1.5">
 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
 <Video size={12} className="text-indigo-500 dark:text-indigo-400"/>
 </div>
 <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{totalLessons} Lesson</span>
 </div>
 <div className="w-px h-4 bg-slate-200 hidden sm:block"/>
 <div className="flex items-center gap-1.5">
 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 flex items-center justify-center border border-amber-100 dark:border-amber-800/60">
 <Clock size={12} className="text-amber-500 dark:text-amber-400"/>
 </div>
 <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{totalDuration} Mnt</span>
 </div>
 {course.students_count > 0 && (
 <>
 <div className="w-px h-4 bg-slate-200 hidden sm:block"/>
 <div className="flex items-center gap-1.5">
 <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-500/10 dark:to-slate-600/10 flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
 <Users size={12} className="text-slate-500 dark:text-slate-400"/>
 </div>
 <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">{course.students_count} Siswa</span>
 </div>
 </>
 )}
 </motion.div>
 </div>

 {/* Description - ENHANCED */}
 <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
 className="glass-card-strong p-5 sm:p-7 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 dark:border-slate-700 shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative overflow-hidden">
 {/* Decorative accent */}
 <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-emerald-500/[0.04] to-transparent rounded-bl-[3rem] pointer-events-none"/>
 
 <div className="flex items-center gap-3 mb-5 md:mb-6 pb-4 md:pb-5 border-b border-slate-100 dark:border-slate-700/50 relative">
 <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/40 shrink-0 shadow-sm dark:shadow-black/10">
 <Sparkles size={18} />
 </div>
 <div>
 <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none mb-1">Tentang Kursus Ini</h2>
 <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Apa yang akan Anda pelajari</p>
 </div>
 </div>
 <div className="prose prose-sm prose-slate max-w-none break-normal whitespace-normal overflow-hidden text-slate-600 dark:text-slate-400 leading-relaxed [&_img]:rounded-xl [&_img]:shadow-md dark:shadow-black/15 [&_strong]:text-slate-800 dark:text-slate-200 [&_strong]:font-extrabold" dangerouslySetInnerHTML={{ __html: (course.description || '<p>Belum ada deskripsi.</p>').replace(/&nbsp;/g, ' ') }} />
 </motion.div>

 {/* Curriculum - ENHANCED */}
 <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
 className="glass-card-strong p-5 sm:p-7 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 dark:border-slate-700 shadow-[0_8px_40px_rgb(0,0,0,0.04)] relative overflow-hidden">
 {/* Decorative accent */}
 <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-indigo-500/[0.04] to-transparent rounded-bl-[3rem] pointer-events-none"/>
 
 <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 md:pb-5 border-b border-slate-100 dark:border-slate-700/50 relative">
 <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 shrink-0 shadow-sm dark:shadow-black/10">
 <BookOpen size={18} />
 </div>
 <div>
 <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none mb-1">Kurikulum</h2>
 <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">{course.sections?.length || 0} Bab • {totalLessons} Video • {totalDuration} Menit</p>
 </div>
 </div>

 {(course.sections || []).length === 0 ? (
 <p className="text-sm text-slate-400 dark:text-slate-400 text-center py-8 italic">Kurikulum belum tersedia.</p>
 ) : (
 <div className="space-y-2.5">
 {(course.sections || []).map((section: any, sIdx: number) => (
 <div key={section.id} className="border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden hover:border-emerald-200/60 group/section">
 <button
 onClick={() => toggleSection(section.id)}
 className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900/80 hover:from-emerald-50/30 hover:to-white dark:hover:from-slate-700/80 dark:hover:to-slate-800/80 transition-transform text-left"
 >
 <div className="flex items-center gap-3 min-w-0">
 <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getLevelGradient(course.level)} text-white flex items-center justify-center text-[11px] font-black shrink-0 shadow-sm dark:shadow-black/10`}>{sIdx + 1}</span>
 <div className="min-w-0">
 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{section.title}</h4>
 <p className="text-[10px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">{section.lessons?.length || 0} lesson</p>
 </div>
 </div>
 <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 shrink-0 ${expandedSections.has(section.id) ? 'bg-emerald-100 text-emerald-600 dark:text-emerald-400 rotate-0' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-400'}`}>
 {expandedSections.has(section.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </div>
 </button>

 <AnimatePresence>
 {expandedSections.has(section.id) && (
 <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
 <div className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-800">
 {(section.lessons || []).map((lesson: any, lIdx: number) => (
 <motion.div key={lesson.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: lIdx * 0.04 }}
 className="flex items-center gap-3 px-4 sm:px-5 py-3 hover:bg-emerald-50 dark:hover:bg-slate-700/50 group/lesson">
 <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0">
 {lesson.is_preview ? (
 <PlayCircle size={17} className="text-emerald-500 group-hover/lesson:scale-110 transition-transform"/>
 ) : (
 <Lock size={13} className="text-slate-300 dark:text-slate-500"/>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{lesson.title}</p>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 {lesson.is_preview && (
 <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/60">PREVIEW</span>
 )}
 {lesson.duration_minutes > 0 && (
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 flex items-center gap-1">
 <Clock size={10} /> {lesson.duration_minutes}m
 </span>
 )}
 </div>
 </motion.div>
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

 {/* ═══ RATING & REVIEWS SECTION - ENHANCED ═══ */}
 <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
 className="glass-card-strong rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 dark:border-slate-700 shadow-[0_8px_40px_rgb(0,0,0,0.04)] p-5 sm:p-7 md:p-8 relative overflow-hidden"
 >
 {/* Decorative accent */}
 <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-amber-500/[0.04] to-transparent rounded-bl-[3rem] pointer-events-none"/>
 
 <div className="flex items-center gap-3 mb-6 md:mb-8 relative">
 <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-500/10 dark:to-orange-500/10 rounded-xl flex items-center justify-center text-amber-500 dark:text-amber-400 border border-amber-200/40 shrink-0 shadow-sm dark:shadow-black/10">
 <MessageSquare size={18} />
 </div>
 <div>
 <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white leading-none mb-1">Rating & Ulasan</h2>
 <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Testimoni komunitas</p>
 </div>
 </div>

 {/* Rating Summary - ENHANCED */}
 <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 md:mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-amber-50/80 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-800/80 rounded-2xl border border-amber-100 dark:border-slate-700/50 shadow-inner">
 <div className="text-center shrink-0">
 <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-500 leading-none">{course.avg_rating || '0'}</p>
 <div className="flex items-center gap-0.5 mt-2 justify-center">
 {[1,2,3,4,5].map(s => (
 <Star key={s} size={15} className={s <= Math.round(course.avg_rating || 0) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]' : 'text-amber-200'} />
 ))}
 </div>
 <p className="text-[10px] text-amber-700 font-bold mt-1">{course.reviews_count || 0} ulasan</p>
 </div>
 <div className="flex-1 w-full">
 {[5,4,3,2,1].map(star => {
 const count = (course.reviews || []).filter((r: any) => r.rating === star).length;
 const total = course.reviews?.length || 1;
 const pct = Math.round((count / total) * 100) || 0;
 return (
 <div key={star} className="flex items-center gap-2 mb-1">
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-3.5">{star}</span>
 <Star size={10} className="text-amber-400 fill-amber-400 shrink-0"/>
 <div className="flex-1 h-[7px] bg-white dark:bg-[#111827] rounded-full overflow-hidden border border-amber-100 dark:border-amber-500/20">
 <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.6 }}
 className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"/>
 </div>
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 w-5 text-right">{count}</span>
 </div>
 );
 })}
 </div>
 </div>

 {/* Review Form (for enrolled users) */}
 {isEnrolled && (
 <div className="mb-6 md:mb-8 p-4 sm:p-5 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
 <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
 <Star size={14} className="text-amber-400 fill-amber-400"/>
 {course.user_review ? 'Update Ulasan Anda' : 'Beri Rating & Ulasan'}
 </h3>
 <div className="flex items-center gap-1 mb-4">
 {[1,2,3,4,5].map(star => (
 <button key={star} type="button" onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setReviewRating(star)} className="p-0.5 transition-transform hover:scale-125 duration-200">
 <Star size={28} className={` ${star <= (hoverRating || reviewRating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'text-slate-300 dark:text-slate-500 hover:text-amber-200'}`} />
 </button>
 ))}
 {reviewRating > 0 && <span className="text-sm font-black text-amber-600 ml-2">{reviewRating}/5</span>}
 </div>
 <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Tulis ulasan Anda tentang kursus ini (opsional)..." rows={3}
 className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-medium resize-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none mb-3 transition-transform"
 />
 <button onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0}
 className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-transform disabled:opacity-50 active:scale-95 shadow-[0_8px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
 >
 {submittingReview ? <Loader2 size={14} className="animate-spin"/> : <Star size={14} />}
 {submittingReview ? 'Menyimpan...' : course.user_review ? 'Update Review' : 'Kirim Review'}
 </button>
 </div>
 )}

 {/* Reviews List - ENHANCED */}
 {(course.reviews || []).length > 0 ? (
 <div className="space-y-3">
 {(course.reviews || []).slice(0, 10).map((review: any, idx: number) => (
 <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.05 }}
 className="flex gap-3 p-4 glass-card rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-emerald-100 dark:border-emerald-800/80 hover:shadow-[0_4px_20px_rgba(16,185,129,0.06)] transition-transform duration-300 group/review">
 <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm dark:shadow-black/10 group-hover/review:scale-105 transition-transform">
 {(review.user?.name || 'A').charAt(0).toUpperCase()}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1.5 flex-wrap">
 <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{review.user?.name || 'Anonim'}</span>
 <div className="flex items-center gap-0.5 bg-gradient-to-r from-amber-50 to-orange-50 px-2 py-0.5 rounded-md border border-amber-100 dark:border-amber-800/60">
 {[1,2,3,4,5].map(s => (
 <Star key={s} size={10} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
 ))}
 </div>
 </div>
 {review.comment && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{review.comment}</p>}
 <p className="text-[9px] text-slate-400 dark:text-slate-400 mt-1.5 font-bold uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="text-center py-10 bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700/50 border-dashed">
 <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700/50">
 <ThumbsUp size={24} className="text-slate-300 dark:text-slate-500"/>
 </div>
 <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Belum ada ulasan</p>
 <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">Jadilah yang pertama memberikan rating!</p>
 </div>
 )}
 </motion.div>

 </div>

 {/* RIGHT: Checkout Sidebar - ENHANCED */}
 <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 mt-2 md:mt-0 z-30">
 {/* Glow behind */}
 <div className="hidden lg:block absolute -inset-3 bg-gradient-to-b from-emerald-500/[0.05] via-teal-500/[0.04] to-transparent rounded-[3rem] blur-2xl pointer-events-none"/>
 
 <div className="glass-card-strong rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-700/50 dark:border-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.07)] overflow-hidden relative flex flex-col w-full hover:shadow-[0_25px_70px_rgba(0,0,0,0.09)] transition-shadow duration-500">

 {/* Animated accent line */}
 <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-shift"/>

 <div className="p-5 sm:p-6 md:p-8 relative z-10 bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90">
 {/* Ownership indicator */}
 {isEnrolled ? (
 <div className="inline-flex items-center gap-2 mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-black/10">
 <CheckCircle2 size={15} strokeWidth={2.5} />
 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Akses Terbuka</p>
 </div>
 ) : (
 <div className="inline-flex items-center gap-2 mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-black/10">
 <GraduationCap size={14} />
 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Investasi Pendidikan</p>
 </div>
 )}

 {/* Price with strikethrough */}
 {!isFree && !isEnrolled && (
 <div className="flex items-center gap-2 mb-1.5">
 <span className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-400 line-through decoration-rose-500/60 decoration-2">{formatRupiah(course.price * 5)}</span>
 <span className="text-[8px] md:text-[9px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 rounded-md shadow-sm dark:shadow-black/10 uppercase tracking-widest">80% OFF</span>
 </div>
 )}
 <p className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-2 ${isFree || isEnrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500' : 'text-slate-900 dark:text-white'}`}>
 {isEnrolled ? 'Terdaftar' : formatRupiah(course.price)}
 </p>

 {!isFree && !isEnrolled && <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">Pembayaran 1x via Tripay. Aman & Terenkripsi.</p>}
 {isFree && !isEnrolled && <p className="text-[11px] md:text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-6">Akses kursus premium gratis khusus Anda.</p>}
 {isEnrolled && <p className="text-[11px] md:text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-6">Anda sudah bisa mengakses seluruh materi.</p>}

 {/* CTA Buttons (Desktop) */}
 <div className="hidden lg:flex flex-col gap-2.5 w-full">
 {isEnrolled ? (
 <Link href={`/learn/${slug}`} className="relative w-full py-4 rounded-xl font-black text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.4)] transition-transform flex items-center justify-center gap-2 overflow-hidden group active:scale-[0.98]">
 <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-shimmer"></span>
 <PlayCircle size={18} className="shrink-0 relative z-10"/> <span className="relative z-10">Lanjut Belajar</span>
 </Link>
 ) : (
 <button onClick={handleOpenPaymentModal} disabled={enrolling} className="relative w-full py-4 rounded-xl font-black text-white text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:shadow-[0_12px_35px_rgba(5,150,105,0.4)] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 overflow-hidden group/btn active:scale-[0.98]">
 <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
 {enrolling ? <Loader2 size={18} className="animate-spin shrink-0 relative z-10"/> : <Banknote size={18} className="shrink-0 text-emerald-100 relative z-10"/>}
 <span className="relative z-10">{isFree ? 'Klaim Gratis Sekarang' : 'Beli Kursus Ini'}</span>
 </button>
 )}
 </div>

 {/* Trust Sign */}
 {!isEnrolled && (
 <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest text-center">
 <Lock size={11} className="shrink-0"/> Pembayaran Terenkripsi Aman
 </div>
 )}
 </div>

 {/* Benefits - ENHANCED */}
 <div className="border-t border-slate-100 dark:border-slate-700/50 p-5 sm:p-6 md:p-7 flex flex-col gap-3.5 w-full relative z-10 bg-gradient-to-b from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-900/50">
 {BENEFITS.map((b, idx) => (
 <motion.div key={b.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.08 }}
 className="flex gap-3 w-full min-w-0 items-start group/benefit hover:bg-white/5 dark:hover:bg-slate-700/500 dark:hover:bg-slate-800/50 p-2 -m-2 rounded-xl">
 <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center shrink-0 shadow-sm dark:shadow-black/10 group-hover/benefit:scale-110 transition-transform`}>
 <b.icon size={16} strokeWidth={2.5} />
 </div>
 <div className="flex-1 min-w-0 pt-0.5">
 <p className="font-bold text-slate-900 dark:text-white text-xs md:text-sm mb-0.5">{b.label}</p>
 <p className="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </div>

 </div>
 </div>

 {/* Rekomendasi Kursus (Full Width - Boxed) */}
 {recommendedCourses.length > 0 && (
 <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-8 mb-12 w-full">
 <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
 <div>
 <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
 <Sparkles size={20} className="text-emerald-500"/>
 </div>
 Rekomendasi Kursus
 </h2>
 <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5 ml-12">Tingkatkan skill Anda dengan kursus pilihan kami.</p>
 </div>
 <Link href="/courses" className="shrink-0 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-colors flex items-center gap-2 border border-slate-200 dark:border-slate-700/50">
 Lihat Semua <ArrowLeft size={16} className="rotate-180"/>
 </Link>
 </div>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
 {recommendedCourses.slice(0, 4).map((rec) => (
 <Link key={rec.id} href={`/courses/${rec.slug}`} className="group block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)] hover:border-emerald-200/60 transition-all duration-500 hover:-translate-y-1.5 h-full flex flex-col">
 <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700/50">
 {rec.thumbnail ? (
 <img src={`${STORAGE_URL}/${rec.thumbnail}`} alt={rec.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-800"><GraduationCap size={40} className="text-emerald-300 dark:text-slate-600"/></div>
 )}
 {/* Gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
 
 <div className="absolute top-3 right-3 flex items-start">
 {rec.price === 0 ? (
 <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-lg backdrop-blur-md">GRATIS</span>
 ) : (
 <span className="px-2.5 py-1 bg-white dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white text-[10px] font-black rounded-lg shadow-lg border border-slate-100 dark:border-slate-700">{formatRupiah(rec.price)}</span>
 )}
 </div>
 </div>
 <div className="p-4 flex-1 flex flex-col">
 <div className="flex items-center gap-1.5 mb-2.5">
 <div className="w-1 h-1 rounded-full bg-emerald-500"/>
 <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{rec.category?.name || 'Umum'}</span>
 </div>
 <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-snug">{rec.title}</h3>
 <div className="mt-auto flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-700/50 pt-3">
 <div className="flex items-center gap-1.5"><BookOpen size={12}/> {rec.sections_count || rec.sections?.length || 0} Bab</div>
 <div className="flex items-center gap-1.5"><Star size={12} className={rec.avg_rating > 0 ? "text-amber-400 fill-amber-400" : "text-slate-300"}/> {rec.avg_rating > 0 ? parseFloat(rec.avg_rating).toFixed(1) : 'Baru'}</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </motion.div>
 )}

 {/* 🔥 MOBILE STICKY BOTTOM BAR - ENHANCED 🔥 */}
 <div className="fixed bottom-0 left-0 right-0 glass-card-strong border-t border-slate-200 dark:border-slate-700/50 p-3 pb-safe z-[50] lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex items-center justify-between gap-2.5 w-full">
 <div className="shrink-0 flex flex-col justify-center min-w-0 pl-1 w-[35%]">
 {!isFree && !isEnrolled && (
 <div className="flex items-center gap-1 mb-0.5">
 <span className="text-[10px] font-bold text-slate-300 dark:text-slate-500 line-through">{formatRupiah(course.price * 5)}</span>
 <span className="text-[7px] font-black text-white bg-gradient-to-r from-rose-500 to-pink-500 px-1 py-0.5 rounded">80%</span>
 </div>
 )}
 <p className={`text-sm sm:text-base font-black tracking-tight leading-none truncate w-full ${isFree || isEnrolled ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500' : 'text-slate-900 dark:text-white'}`}>
 {isEnrolled ? 'Terdaftar ✓' : formatRupiah(course.price)}
 </p>
 </div>

 <div className="flex-1 flex gap-2 justify-end w-[65%]">
 {isEnrolled ? (
 <Link href={`/learn/${slug}`} className="w-full py-2.5 rounded-xl font-black text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md dark:shadow-black/15">
 <PlayCircle size={14} className="shrink-0"/> <span className="truncate">Lanjut Belajar</span>
 </Link>
 ) : (
 <button onClick={handleOpenPaymentModal} disabled={enrolling} className="flex-1 py-2.5 rounded-xl font-black text-white text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 shadow-[0_4px_15px_rgba(5,150,105,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-70 active:scale-95 transition-transform overflow-hidden relative group">
 <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></span>
 {enrolling ? <Loader2 size={14} className="animate-spin shrink-0 relative z-10"/> : <Banknote size={16} className="shrink-0 text-emerald-100 relative z-10"/>}
 <span className="truncate relative z-10">{isFree ? 'Klaim Gratis' : 'Beli Kursus'}</span>
 </button>
 )}
 </div>
 </div>

 {/* 🔥 MODAL PEMILIHAN PEMBAYARAN TRIPAY 🔥 */}
 <AnimatePresence>
 {isPaymentModalOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 w-full h-full">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-md w-full h-full"/>
 <motion.div initial={{ opacity: 0, y: 80, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 80, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="relative bg-white dark:bg-[#111827] rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.2)] w-full md:w-[600px] max-h-[95vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
 
 {/* Accent line */}
 <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-gradient-shift shrink-0"/>
 
 <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-slate-50/50 to-white w-full shrink-0">
 <div className="min-w-0 pr-4">
 <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white truncate w-full">Metode Pembayaran</h3>
 <p className="text-[9px] md:text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest truncate w-full">Sistem Terenkripsi Aman</p>
 </div>
 <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:bg-rose-500/10 dark:hover:bg-rose-950 hover:border-rose-200 shrink-0">
 <X size={18} strokeWidth={2.5} />
 </button>
 </div>
 <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar bg-gradient-to-b from-slate-50/30 to-white w-full">
 {isLoadingChannels ? (
 <div className="flex flex-col items-center justify-center py-12 gap-4 w-full">
 <Loader2 size={40} className="text-emerald-600 dark:text-emerald-400 animate-spin"/>
 <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 animate-pulse uppercase tracking-widest">Menghubungkan Gateway...</p>
 </div>
 ) : channelError ? (
 <div className="text-center py-10 w-full">
 <AlertCircle size={40} className="text-rose-400 mx-auto mb-4"/>
 <p className="text-slate-900 dark:text-white font-black text-base md:text-lg mb-2">Terjadi Kesalahan</p>
 <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm px-4">{channelError}</p>
 </div>
 ) : Object.keys(groupedChannels).length === 0 ? (
 <div className="text-center py-10 w-full">
 <AlertCircle size={40} className="text-slate-300 dark:text-slate-500 mx-auto mb-4"/>
 <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">Metode pembayaran tidak tersedia saat ini.</p>
 </div>
 ) : (
 <div className="space-y-5 md:space-y-6 w-full">
 {(Object.entries(groupedChannels) as [string, any[]][]).map(([groupName, channels]) => (
 <div key={groupName} className="w-full">
 <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2.5 ml-1">{groupName}</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2.5 w-full">
 {channels.map((channel: any) => (
 <button key={channel.code} onClick={() => setSelectedChannel(channel.code)} className={`flex items-center gap-3 p-3 md:p-3.5 rounded-xl border-2 text-left transition-transform w-full min-w-0 active:scale-[0.98] ${selectedChannel === channel.code ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10/80 shadow-md dark:shadow-black/15 shadow-emerald-100' : 'border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#111827] hover:border-emerald-200 shadow-sm dark:shadow-black/10'}`}>
 <div className="w-11 h-8 md:w-14 md:h-10 shrink-0 bg-white dark:bg-[#111827] rounded-lg flex items-center justify-center px-1.5 md:px-2 py-1 border border-slate-100 dark:border-slate-700/50/60 dark:border-slate-800">
 <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain"/>
 </div>
 <div className="flex-1 min-w-0">
 <p className={`text-xs md:text-sm font-bold truncate w-full ${selectedChannel === channel.code ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>
 {channel.name}
 </p>
 </div>
 {selectedChannel === channel.code && <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0"/>}
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 <div className="p-4 sm:p-5 md:p-6 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 w-full shrink-0">
 <div className="text-center sm:text-left w-full sm:w-auto min-w-0">
 <p className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1 truncate w-full flex items-center justify-center sm:justify-start gap-1"><ShieldCheck size={11} /> Tagihan Terenkripsi</p>
 <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none truncate w-full">{formatRupiah(course.price)}</p>
 </div>

 <button onClick={() => handleProcessCheckout()} disabled={!selectedChannel || enrolling || !!channelError} className="w-full sm:w-auto px-6 sm:px-8 py-3 md:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 dark:text-slate-400 disabled:shadow-none text-white rounded-xl font-black text-sm transition-transform shadow-[0_8px_24px_rgba(5,150,105,0.25)] hover:shadow-[0_12px_30px_rgba(5,150,105,0.35)] flex items-center justify-center gap-2 active:scale-[0.98] shrink-0 min-w-0">
 {enrolling ? <><Loader2 size={16} className="animate-spin shrink-0"/> <span className="truncate">Memproses...</span></> : <><Banknote size={16} className="shrink-0 text-emerald-100"/><span className="truncate">Selesaikan Pembayaran</span></>}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 {/* 🔥 SHARE MODAL WITH BROADCAST 🔥 */}
 <AnimatePresence>
 {isShareModalOpen && (() => {
 const cleanDesc = course.description 
 ? course.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g,"'").replace(/\s+/g, ' ').trim().substring(0, 150) + '...'
 : 'Kursus premium dari Amania.id!';
 const bcText = `🎓 *${course.title}*\n\n${cleanDesc}\n\n📚 ${(course.sections || []).length} Bab · ${totalLessons} Lesson\n⭐ Rating: ${course.avg_rating || 0}/5\n💰 ${course.price === 0 ? 'GRATIS!' : formatRupiah(course.price) + ' (Diskon 80%)'}\n\n🔗 Daftar sekarang:\n${shareUrl}\n\n_Powered by Amania.id_`;
 const waUrl = `https://wa.me/?text=${encodeURIComponent(bcText)}`;
 const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(bcText)}`;
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShareModalOpen(false)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-md"/>
 <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.2)] overflow-hidden">
 <button onClick={() => setIsShareModalOpen(false)} className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:text-white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700/50 rounded-full z-10 backdrop-blur-sm">
 <X size={16} />
 </button>

 {/* Preview Card */}
 <div className="relative aspect-[2.2/1] overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
 {course.thumbnail && (
 <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover opacity-25"/>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>
 <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
 <span className="text-[8px] sm:text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1 block">Bagikan Kursus</span>
 <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">{course.title}</h3>
 <div className="flex items-center gap-3 mt-2">
 <span className="text-[9px] sm:text-[10px] font-bold text-white/70 flex items-center gap-1"><BookOpen size={10} /> {(course.sections || []).length} Bab</span>
 <span className="text-[9px] sm:text-[10px] font-bold text-white/70 flex items-center gap-1"><Video size={10} /> {totalLessons} Lesson</span>
 {course.avg_rating > 0 ? (
 <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 flex items-center gap-1">
 <Star size={10} className="fill-amber-300"/> {parseFloat(course.avg_rating).toFixed(1)}
 </span>
 ) : (
 <span className="text-[9px] sm:text-[10px] font-bold text-white/50 flex items-center gap-1">
 <Star size={10} /> Baru
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Broadcast Preview */}
 <div className="p-4 sm:p-5">
 <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Preview Broadcast</p>
 <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 sm:p-4 text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line max-h-28 overflow-y-auto custom-scrollbar">
 {bcText}
 </div>
 </div>

 {/* Action Buttons */}
 <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2">
 <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-sm rounded-xl transition-transform shadow-md dark:shadow-black/15 flex items-center justify-center gap-2 active:scale-95">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
 Bagikan via WhatsApp
 </a>
 <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm rounded-xl transition-transform shadow-md dark:shadow-black/15 flex items-center justify-center gap-2 active:scale-95">
 <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
 Bagikan via Telegram
 </a>
 <button onClick={handleCopyLink} className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-2 active:scale-95">
 <LinkIcon size={16} /> Salin Link
 </button>
 </div>
 </motion.div>
 </div>
 );
 })()}
 </AnimatePresence>

 </div>
 );
}
