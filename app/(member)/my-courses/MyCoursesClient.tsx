"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
 GraduationCap, PlayCircle, Clock, BookOpen, Video,
 Loader2, Search, Filter, CheckCircle2, ArrowRight, Sparkles,
 Star, X, MessageSquare
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';

export default function MyCoursesClient() {
 const [courses, setCourses] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('all');

 // Rating modal
 const [ratingModal, setRatingModal] = useState<any>(null);
 const [reviewRating, setReviewRating] = useState(0);
 const [reviewComment, setReviewComment] = useState('');
 const [hoverRating, setHoverRating] = useState(0);
 const [submittingReview, setSubmittingReview] = useState(false);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 const fetchMyCourses = async () => {
 setLoading(true);
 try {
 const res = await apiFetch('/my-courses');
 const json = await res.json();
 if (res.ok && json.success) setCourses(json.data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchMyCourses(); }, []);

 const getProgress = (course: any) => {
 const total = course.total_lessons || 0;
 const completed = course.completed_lessons || 0;
 if (total === 0) return 0;
 return Math.round((completed / total) * 100);
 };

 const getStatus = (course: any) => {
 const progress = getProgress(course);
 if (progress === 100) return 'completed';
 if (progress > 0) return 'in_progress';
 return 'not_started';
 };

 const filteredCourses = courses.filter(c => {
 if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
 if (statusFilter !== 'all') {
 const status = getStatus(c);
 if (statusFilter === 'in_progress' && status !== 'in_progress') return false;
 if (statusFilter === 'completed' && status !== 'completed') return false;
 if (statusFilter === 'not_started' && status !== 'not_started') return false;
 }
 return true;
 });

 // Open rating modal
 const openRatingModal = (course: any, e: React.MouseEvent) => {
 e.preventDefault();
 e.stopPropagation();
 setRatingModal(course);
 setReviewRating(course.user_review?.rating || 0);
 setReviewComment(course.user_review?.comment || '');
 };

 // Submit review
 const handleSubmitReview = async () => {
 if (!ratingModal || reviewRating === 0) {
 toast.error('Pilih rating bintang terlebih dahulu!');
 return;
 }
 setSubmittingReview(true);
 try {
 const res = await apiFetch(`/courses/${ratingModal.slug}/reviews`, {
 method: 'POST',
 body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
 });
 const json = await res.json();
 if (res.ok && json.success) {
 toast.success('Review berhasil disimpan! ⭐');
 setRatingModal(null);
 fetchMyCourses(); // Refresh to sync review data
 } else {
 toast.error(json.message || 'Gagal menyimpan review.');
 }
 } catch {
 toast.error('Terjadi kesalahan.');
 } finally {
 setSubmittingReview(false);
 }
 };

 const stats = {
 total: courses.length,
 in_progress: courses.filter(c => getStatus(c) === 'in_progress').length,
 completed: courses.filter(c => getStatus(c) === 'completed').length,
 };

 return (
 <div className="min-h-screen">
 {/* Hero */}
 <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-10 mb-8 shadow-xl dark:shadow-black/20">
 <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_30%_20%,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"/>
 <div className="relative z-10">
 <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em] bg-white dark:bg-slate-800/30 px-3 py-1.5 rounded-full backdrop-blur-sm mb-4">
 <GraduationCap size={12} /> Kursus Saya
 </span>
 <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-1">Lanjutkan Perjalanan</h1>
 <p className="text-lg sm:text-xl font-black text-emerald-200">Belajar Anda</p>

 <div className="flex items-center gap-4 sm:gap-6 mt-6 sm:mt-8">
 <div className="text-center"><p className="text-2xl sm:text-3xl font-black text-white">{stats.total}</p><p className="text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Total</p></div>
 <div className="text-center"><p className="text-2xl sm:text-3xl font-black text-white">{stats.in_progress}</p><p className="text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Dipelajari</p></div>
 <div className="text-center"><p className="text-2xl sm:text-3xl font-black text-white">{stats.completed}</p><p className="text-[9px] sm:text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Selesai</p></div>
 </div>
 </div>
 </div>

 {/* Filters */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
 <div className="relative flex-1 w-full sm:max-w-xs">
 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400"/>
 <input type="text" placeholder="Cari kursus..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"/>
 </div>
 <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
 {[
 { value: 'all', label: 'Semua' },
 { value: 'in_progress', label: 'Sedang Dipelajari' },
 { value: 'completed', label: 'Selesai' },
 { value: 'not_started', label: 'Belum Dimulai' },
 ].map(f => (
 <button key={f.value} onClick={() => setStatusFilter(f.value)}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-transform border whitespace-nowrap shrink-0 ${statusFilter === f.value
 ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg dark:shadow-black/20 shadow-emerald-200'
 : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-600'}`}
 >{f.label}</button>
 ))}
 </div>
 </div>

 {/* Course Grid */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <Loader2 size={44} className="animate-spin text-emerald-500"/>
 <p className="text-sm font-bold text-slate-400 dark:text-slate-400">Memuat kursus...</p>
 </div>
 ) : filteredCourses.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
 <GraduationCap size={56} className="text-slate-300 dark:text-slate-500"/>
 <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
 {courses.length === 0 ? 'Belum Ada Kursus' : 'Tidak Ada Hasil'}
 </h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
 {courses.length === 0
 ? 'Anda belum memiliki kursus. Jelajahi katalog untuk menemukan kursus yang menarik!'
 : 'Tidak ada kursus yang sesuai dengan filter Anda.'}
 </p>
 {courses.length === 0 && (
 <Link href="/courses" className="mt-4 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg dark:shadow-black/20 shadow-emerald-200 flex items-center gap-2">
 <Sparkles size={16} /> Jelajahi Kursus
 </Link>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
 {filteredCourses.map((course, idx) => {
 const progress = getProgress(course);
 const status = getStatus(course);
 return (
 <motion.div
 key={course.id}
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05, duration: 0.4 }}
 >
 <Link href={`/learn/${course.slug}`} className="group block">
 <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm dark:shadow-black/10 hover:shadow-xl dark:shadow-black/20 hover:shadow-slate-200 dark:shadow-none hover:border-slate-200 dark:border-slate-700/50 transition-transform duration-500 hover:-translate-y-1">
 {/* Thumbnail */}
 <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700/50">
 {course.thumbnail ? (
 <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
 <GraduationCap size={48} className="text-emerald-300"/>
 </div>
 )}
 {/* Status overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
 <span className="text-white text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-slate-800/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
 <PlayCircle size={14} /> Lanjut Belajar
 </span>
 </div>
 {/* Status badge */}
 <div className="absolute top-3 right-3">
 {status === 'completed' ? (
 <span className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-emerald-50 dark:bg-emerald-500 text-white shadow-lg dark:shadow-black/20 flex items-center gap-1">
 <CheckCircle2 size={12} /> Selesai
 </span>
 ) : status === 'in_progress' ? (
 <span className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-amber-50 dark:bg-amber-500 text-white shadow-lg dark:shadow-black/20">
 {progress}%
 </span>
 ) : (
 <span className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-slate-600 text-white shadow-lg dark:shadow-black/20">
 Baru
 </span>
 )}
 </div>
 </div>

 {/* Content */}
 <div className="p-5">
 <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-emerald-700 dark:text-emerald-400">
 {course.title}
 </h3>

 {/* Progress bar */}
 <div className="mb-4">
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
 {course.completed_lessons || 0}/{course.total_lessons || 0} lesson
 </span>
 <span className={`text-[10px] font-black ${progress === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
 {progress}%
 </span>
 </div>
 <div className="w-full h-2 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
 <motion.div
 className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-50 dark:bg-emerald-500' : 'bg-indigo-500 dark:bg-indigo-400'}`}
 initial={{ width: 0 }}
 animate={{ width: `${progress}%` }}
 transition={{ delay: idx * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
 />
 </div>
 </div>

 {/* Stats + Rating button */}
 <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
 <div className="flex items-center gap-3">
 <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <BookOpen size={13} className="text-slate-400 dark:text-slate-400"/> {course.sections_count || 0} Bab
 </span>
 <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <Video size={13} className="text-slate-400 dark:text-slate-400"/> {course.total_lessons || 0} Lesson
 </span>
 </div>
 {/* Rating button */}
 <button
 onClick={(e) => openRatingModal(course, e)}
 className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-transform active:scale-95 ${
 course.user_review
 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-200 hover:bg-amber-100'
 : 'bg-slate-50 dark:bg-[#111827] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-50 dark:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400 hover:border-emerald-200'
 }`}
 title={course.user_review ? 'Edit Review' : 'Beri Rating'}
 >
 <Star size={11} className={course.user_review ? 'fill-amber-400 text-amber-400' : ''} />
 {course.user_review ? `${course.user_review.rating}/5` : 'Rating'}
 </button>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 );
 })}
 </div>
 )}

 {/* ═══ RATING MODAL ═══ */}
 <AnimatePresence>
 {ratingModal && (
 <>
 <motion.div
 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
 onClick={() => setRatingModal(null)}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 20 }}
 className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 w-auto sm:w-full sm:max-w-md bg-white dark:bg-[#111827] rounded-2xl shadow-2xl dark:shadow-black/25 z-50 overflow-hidden"
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
 <div className="flex items-center gap-2">
 <Star size={18} className="text-amber-400 fill-amber-400"/>
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 {ratingModal.user_review ? 'Edit Review' : 'Beri Rating'}
 </h3>
 </div>
 <button onClick={() => setRatingModal(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700/50 rounded-lg">
 <X size={18} className="text-slate-400 dark:text-slate-400"/>
 </button>
 </div>

 {/* Body */}
 <div className="px-6 py-5">
 {/* Course title */}
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-5 line-clamp-2">{ratingModal.title}</p>

 {/* Stars */}
 <div className="flex items-center justify-center gap-2 mb-5">
 {[1, 2, 3, 4, 5].map(star => (
 <button
 key={star}
 type="button"
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(0)}
 onClick={() => setReviewRating(star)}
 className="p-1 transition-transform hover:scale-125 active:scale-95"
 >
 <Star
 size={32}
 className={` ${star <= (hoverRating || reviewRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
 />
 </button>
 ))}
 </div>
 {reviewRating > 0 && (
 <p className="text-center text-sm font-black text-amber-600 mb-4">{reviewRating}/5 Bintang</p>
 )}

 {/* Comment */}
 <div className="mb-1">
 <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block flex items-center gap-1">
 <MessageSquare size={12} /> Komentar (opsional)
 </label>
 <textarea
 value={reviewComment}
 onChange={e => setReviewComment(e.target.value)}
 placeholder="Tulis pengalaman Anda tentang kursus ini..."
 rows={3}
 className="w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-xl px-4 py-3 text-sm font-medium resize-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none"
 />
 </div>
 </div>

 {/* Footer */}
 <div className="px-6 py-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-end gap-3">
 <button onClick={() => setRatingModal(null)} className="px-4 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300">
 Batal
 </button>
 <button
 onClick={handleSubmitReview}
 disabled={submittingReview || reviewRating === 0}
 className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 dark:bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-transform disabled:opacity-50 active:scale-95 shadow-lg dark:shadow-black/20 shadow-amber-500/20"
 >
 {submittingReview ? <Loader2 size={14} className="animate-spin"/> : <Star size={14} />}
 {submittingReview ? 'Menyimpan...' : ratingModal.user_review ? 'Update Review' : 'Kirim Review'}
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 );
}
