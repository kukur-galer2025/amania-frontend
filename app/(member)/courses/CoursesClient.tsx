"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
 Search, GraduationCap, Clock, BookOpen, Video,
 User, Star, Filter, Loader2, ChevronRight, PlayCircle, Sparkles, Tag,
 BarChart3, ArrowRight, Crown, Users, Zap, TrendingUp
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import AdBanner from '@/app/components/AdBanner';

export default function CoursesClient() {
 const [courses, setCourses] = useState<any[]>([]);
 const [categories, setCategories] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('all');
 const [selectedLevel, setSelectedLevel] = useState('all');

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 useEffect(() => {
 const fetchData = async () => {
 setLoading(true);
 try {
 const [courseRes, catRes] = await Promise.all([
 apiFetch('/courses'),
 apiFetch('/course-categories')
 ]);
 const courseJson = await courseRes.json();
 const catJson = await catRes.json();
 if (courseRes.ok && courseJson.success) setCourses(courseJson.data);
 if (catRes.ok && catJson.success) setCategories(catJson.data);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

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

 const getLevelIcon = (lvl: string) => {
 switch (lvl) {
 case 'beginner': return <Zap size={10} />;
 case 'intermediate': return <TrendingUp size={10} />;
 case 'advanced': return <Crown size={10} />;
 default: return <BarChart3 size={10} />;
 }
 };

  const getLevelColor = (lvl: string) => {
  switch (lvl) {
  case 'beginner': return 'bg-emerald-500 dark:bg-emerald-500/90 text-white';
  case 'intermediate': return 'bg-amber-500 dark:bg-amber-500/90 text-white';
  case 'advanced': return 'bg-rose-500 dark:bg-rose-500/90 text-white';
  default: return 'bg-slate-700 dark:bg-[#0B1120]/90 text-white';
  }
  };

 const filteredCourses = courses.filter(c => {
 const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (c.instructor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
 const matchesCategory = selectedCategory === 'all' || c.course_category_id?.toString() === selectedCategory;
 const matchesLevel = selectedLevel === 'all' || c.level === selectedLevel;
 return matchesSearch && matchesCategory && matchesLevel;
 });

 return (
 <div className="min-h-screen pb-16 font-sans selection:bg-emerald-100 selection:text-emerald-900">

 {/* ═══ PREMIUM HERO SECTION ═══ */}
 <div className="relative overflow-hidden rounded-3xl mb-8 md:mb-12">
 {/* Gradient Background */}
 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900"/>
 
 {/* Subtle Grid Pattern */}
 <div className="absolute inset-0 opacity-20" style={{
 backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
 backgroundSize: '30px 30px'
 }} />
 
 {/* Ambient Glow Orbs */}
 <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 dark:bg-emerald-500/20 blur-[120px]"/>
 <div className="absolute bottom-[-40%] left-[-5%] w-[400px] h-[400px] rounded-full bg-teal-400/15 blur-[100px]"/>
 <div className="absolute top-[50%] left-[30%] w-[300px] h-[300px] rounded-full bg-cyan-500/10 blur-[80px]"/>

 <div className="relative px-6 md:px-12 py-12 md:py-16 lg:py-20">
 <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
 <div className="flex-1 max-w-2xl">
 {/* Badge */}
 <motion.div 
 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
 className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 dark:border-slate-700/20 mb-6"
 >
 <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center">
 <Sparkles size={11} className="text-emerald-300"/>
 </div>
 <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.2em]">Kursus Online Premium</span>
 </motion.div>

 {/* Title */}
 <motion.h1 
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5"
 >
 Kuasai Skill Baru<br />
 <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">dengan Kursus Terbaik</span>
 </motion.h1>

 <motion.p 
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
 className="text-sm md:text-base text-white/60 font-medium max-w-lg mb-8 leading-relaxed"
 >
 Video berkualitas HD dari instruktur profesional. Belajar kapan saja, di mana saja, dengan kurikulum terstruktur.
 </motion.p>

 {/* Stats pills */}
 <motion.div 
 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
 className="flex items-center gap-3 flex-wrap mb-8 md:mb-0"
 >
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 dark:border-slate-700/20">
 <PlayCircle size={14} className="text-emerald-300"/>
 <span className="text-xs font-bold text-white/80">{courses.length}+ Kursus</span>
 </div>
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 dark:border-slate-700/20">
 <Users size={14} className="text-teal-300"/>
 <span className="text-xs font-bold text-white/80">Instruktur Pro</span>
 </div>
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white/10 dark:border-slate-700/20">
 <Star size={14} className="text-amber-300 fill-amber-300"/>
 <span className="text-xs font-bold text-white/80">Rating 4.9</span>
 </div>
 </motion.div>
 </div>

 {/* Search Bar */}
 <motion.div 
 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
 className="w-full lg:w-[420px] shrink-0"
 >
 <div className="relative">
 <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-50 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
 <Search size={16} className="text-emerald-300"/>
 </div>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Cari kursus atau instruktur..."
 className="w-full bg-white/10 dark:bg-slate-800/30 backdrop-blur-xl rounded-2xl py-4 pl-16 pr-6 text-sm font-semibold text-white placeholder-white/40 focus:bg-white/20 dark:bg-slate-800/15 focus:ring-2 focus:ring-emerald-500/30 border border-white/10 dark:border-slate-700/20 outline-none shadow-2xl dark:shadow-black/25 shadow-black/20 transition-transform"
 />
 </div>
 </motion.div>
 </div>
 </div>
 </div>

 {/* PROMO BANNERS */}
 <AdBanner placement="course" className="pb-6 -mt-2" />

 {/* ═══ FILTERS ═══ */}
 <div className="flex flex-col gap-4 mb-8">
 {/* Category Chips */}
 <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
 <button
 onClick={() => setSelectedCategory('all')}
 className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-transform border whitespace-nowrap shrink-0 ${
 selectedCategory === 'all'
 ? 'bg-slate-900 text-white border-slate-900 shadow-lg dark:shadow-black/20 shadow-slate-900/20'
 : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-600 hover:shadow-sm dark:shadow-black/10'
 }`}
 >
 Semua Kategori
 </button>
 {categories.map(cat => (
 <button
 key={cat.id}
 onClick={() => setSelectedCategory(cat.id.toString())}
 className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-transform border whitespace-nowrap shrink-0 ${
 selectedCategory === cat.id.toString()
 ? 'bg-slate-900 text-white border-slate-900 shadow-lg dark:shadow-black/20 shadow-slate-900/20'
 : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:border-slate-600 dark:hover:border-slate-600 hover:shadow-sm dark:shadow-black/10'
 }`}
 >
 {cat.name}
 </button>
 ))}
 </div>

 {/* Level Filter */}
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#111827] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/50">
 <Filter size={13} className="text-slate-400 dark:text-slate-400 shrink-0"/>
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Level:</span>
 </div>
 <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
 {[
 { value: 'all', label: 'Semua' },
 { value: 'beginner', label: 'Pemula' },
 { value: 'intermediate', label: 'Menengah' },
 { value: 'advanced', label: 'Mahir' },
 ].map(level => (
 <button
 key={level.value}
 onClick={() => setSelectedLevel(level.value)}
 className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-transform whitespace-nowrap shrink-0 ${
 selectedLevel === level.value
 ? 'bg-emerald-600 text-white shadow-sm dark:shadow-black/10'
 : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-700/50'
 }`}
 >
 {level.label}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* ═══ COURSE GRID ═══ */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
 <Loader2 size={44} className="text-emerald-500"/>
 </motion.div>
 <p className="text-sm font-black text-emerald-500/70 uppercase tracking-[0.2em] animate-pulse">Memuat Kursus Premium...</p>
 </div>
 ) : filteredCourses.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
 <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 flex items-center justify-center">
 <GraduationCap size={40} className="text-slate-300 dark:text-slate-500"/>
 </div>
 <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Kursus Belum Tersedia</h3>
 <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">Kursus yang sesuai dengan pencarian Anda belum tersedia. Coba ubah filter atau cek kembali nanti.</p>
 {(searchQuery || selectedCategory !== 'all' || selectedLevel !== 'all') && (
 <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); }} className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-bold rounded-xl transition-transform">
 Reset Semua Filter
 </button>
 )}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
 <AnimatePresence mode="popLayout">
 {filteredCourses.map((course, idx) => (
 <motion.div
 key={course.id}
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ delay: idx * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
 layout
 >
 <Link href={`/courses/${course.slug}`} className="group block h-full">
 <div className="bg-white dark:bg-[#111827] rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)] hover:border-emerald-200/60 transition-transform duration-500 hover:-translate-y-1.5 h-full flex flex-col">
 
 {/* ── Thumbnail ── */}
 <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-700/50">
 {course.thumbnail ? (
 <img src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
 <GraduationCap size={48} className="text-emerald-300/70"/>
 </div>
 )}
 
 {/* Gradient overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
 
 {/* Play button overlay */}
  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-transform duration-500">
  <div className="w-14 h-14 rounded-full bg-white/30 dark:bg-slate-800/20 backdrop-blur-md border border-white/50 dark:border-slate-700/30 flex items-center justify-center shadow-2xl dark:shadow-black/25 group-hover:scale-100 scale-75 transition-transform duration-500">
  <PlayCircle size={28} className="text-white ml-0.5"/>
  </div>
 </div>

 {/* Top badges */}
 <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
 {/* Level badge */}
 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg dark:shadow-black/20 ${getLevelColor(course.level)}`}>
 {getLevelIcon(course.level)} {getLevelLabel(course.level)}
 </span>
 
 {/* Price badge */}
  {course.price === 0 ? (
  <span className="px-3 py-1.5 rounded-lg text-xs font-black shadow-lg dark:shadow-black/20 backdrop-blur-md bg-emerald-500 dark:bg-emerald-500/90 text-white">
  GRATIS
 </span>
 ) : (
 <div className="flex flex-col items-end gap-0.5">
 <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-lg dark:shadow-black/20">
 <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 line-through">{formatRupiah(course.price * 5)}</span>
 <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded">80%</span>
 </div>
 <span className="px-3 py-1.5 rounded-lg text-xs font-black shadow-lg dark:shadow-black/20 backdrop-blur-md bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white">
 {formatRupiah(course.price)}
 </span>
 </div>
 )}
 </div>
 </div>

 {/* ── Content ── */}
 <div className="p-5 flex flex-col flex-1">
 {/* Category tag */}
 <div className="flex items-center gap-1.5 mb-3">
 <div className="w-1 h-1 rounded-full bg-emerald-50 dark:bg-emerald-500"/>
 <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em]">{course.category?.name || 'Umum'}</span>
 </div>

 {/* Title */}
 <h3 className="text-[15px] md:text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-emerald-700 dark:text-emerald-400">
 {course.title}
 </h3>

 {/* Instructor */}
 <div className="flex items-center gap-2.5 mb-4">
 {(!course.instructor || course.instructor.role === 'superadmin' || course.instructor.name === 'Admin Amania') ? (
 <>
 <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
 <img src="/logo-mini.png" alt="Amania Official" className="w-4 h-4 object-contain dark:brightness-0 dark:invert" />
 </div>
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Amania Official</span>
 </>
 ) : (
 <>
 {course.instructor?.avatar ? (
 <img src={`${STORAGE_URL}/${course.instructor.avatar}`} alt={course.instructor.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700/50 shrink-0" />
 ) : (
 <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0">
 <User size={13} className="text-slate-400 dark:text-slate-400"/>
 </div>
 )}
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{course.instructor.name}</span>
 </>
 )}
 </div>

 {/* Rating */}
 {course.avg_rating > 0 ? (
 <div className="flex items-center gap-2 mb-4">
 <div className="flex items-center gap-0.5">
 {[1, 2, 3, 4, 5].map(star => (
 <Star
 key={star}
 size={13}
 className={star <= Math.round(course.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
 />
 ))}
 </div>
 <span className="text-xs font-black text-amber-600">{parseFloat(course.avg_rating).toFixed(1)}</span>
 <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">({course.reviews_count || 0})</span>
 </div>
 ) : (
 <div className="flex items-center gap-2 mb-4">
 <Star size={13} className="text-slate-350"/>
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
 </div>
 )}

 {/* Spacer for equal height */}
 <div className="flex-1"/>

 {/* Stats bar */}
 <div className="flex items-center gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
 <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <BookOpen size={13} className="text-emerald-400"/> {course.sections_count || 0} Bab
 </span>
 <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <Video size={13} className="text-indigo-400"/> {course.lessons_count || 0} Lesson
 </span>
 {course.total_duration > 0 && (
 <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <Clock size={13} className="text-amber-400"/> {course.total_duration}m
 </span>
 )}
 </div>
 </div>

 {/* ── CTA Bar ── */}
 <div className="px-5 pb-5">
 <div className="flex items-center justify-between bg-slate-50 dark:bg-[#111827] group-hover:bg-emerald-50 dark:hover:bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700/50 group-hover:border-emerald-100 dark:border-emerald-500/20 transition-transform duration-300">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:text-emerald-400">Lihat Detail</span>
 <ArrowRight size={14} className="text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform duration-300"/>
 </div>
 </div>
 </div>
 </Link>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 )}
 </div>
 );
}
