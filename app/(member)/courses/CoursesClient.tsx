"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import {
 Search, GraduationCap, Clock, BookOpen, Video,
 User, Star, Filter, Loader2, ChevronRight, PlayCircle, Sparkles, Tag,
 BarChart3, ArrowRight, Crown, Users, Zap, TrendingUp, LayoutGrid, List, SlidersHorizontal, X, Check
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
 const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
 const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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

 {/* --- PREMIUM HERO SECTION --- */}
 <div className="relative overflow-hidden rounded-3xl mb-8 md:mb-12">
 {/* Gradient Background */}
 <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-900"/>
 
 {/* Subtle Grid Pattern */}
 <div className="absolute inset-0 opacity-20" style={{
 backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
 backgroundSize: '30px 30px'
 }} />
 
 <div className="relative px-6 md:px-12 py-12 md:py-16 lg:py-20">
 <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
 <div className="flex-1 max-w-2xl">
 {/* Badge */}
 <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 dark:border-slate-700/20 mb-6">
 <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center">
 <Sparkles size={11} className="text-emerald-300"/>
 </div>
 <span className="text-[11px] font-bold text-white/90 uppercase tracking-[0.2em]">Kursus Online Premium</span>
 </div>

 {/* Title */}
 <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-5">
 Kuasai Skill Baru<br />
 <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">dengan Kursus Terbaik</span>
 </h1>

 <p className="text-sm md:text-base text-white/60 font-medium max-w-lg mb-8 leading-relaxed">
 Video berkualitas HD dari instruktur profesional. Belajar kapan saja, di mana saja, dengan kurikulum terstruktur.
 </p>

 {/* Stats pills */}
 <div className="flex items-center gap-3 flex-wrap mb-8 md:mb-0">
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 dark:border-slate-700/20">
 <PlayCircle size={14} className="text-emerald-300"/>
 <span className="text-xs font-bold text-white/80">{courses.length}+ Kursus</span>
 </div>
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 dark:border-slate-700/20">
 <Users size={14} className="text-teal-300"/>
 <span className="text-xs font-bold text-white/80">Instruktur Pro</span>
 </div>
 <div className="flex items-center gap-2 bg-white/10 dark:bg-slate-800/30 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10 dark:border-slate-700/20">
 <Star size={14} className="text-amber-300 fill-amber-300"/>
 <span className="text-xs font-bold text-white/80">Rating 4.9</span>
 </div>
 </div>
 </div>

 {/* Search Bar */}
 <div className="w-full lg:w-[420px] shrink-0">
 <div className="relative">
  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
  <Search size={16} className="text-emerald-400"/>
  </div>
  <input
  type="text"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Cari kursus atau instruktur..."
  className="w-full bg-white/10 dark:bg-slate-800/30 backdrop-blur-md rounded-xl py-4 pl-16 pr-6 text-sm font-semibold text-white placeholder-white/40 focus:bg-white/20 dark:bg-slate-800/15 focus:ring-2 focus:ring-emerald-500/30 border border-white/10 dark:border-slate-700/20 outline-none transition-colors"
  />
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* PROMO BANNERS */}
 <AdBanner placement="course" className="pb-6 -mt-2" />

 {/* --- FILTERS --- */}
 <div className="max-w-7xl mx-auto px-5 w-full">
 <div className="flex flex-col gap-4 mb-8">
  {/* Top Row: Categories & View Toggle */}
  <div className="flex flex-row items-center justify-between gap-3 sm:gap-4">
   {/* Mobile Filter Button */}
   <button
    onClick={() => setIsMobileFilterOpen(true)}
    className="flex-1 sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-xl"
   >
    <SlidersHorizontal size={16} />
    Filter
    {(selectedCategory !== 'all' || selectedLevel !== 'all') && (
    <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1"></span>
    )}
   </button>

   {/* Desktop Category Chips */}
   <div className="hidden sm:flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0">
   <button
   onClick={() => setSelectedCategory('all')}
   className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border whitespace-nowrap shrink-0 ${
   selectedCategory === 'all'
   ? 'bg-slate-900 text-white border-slate-900'
   : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
   }`}
   >
   Semua Kategori
   </button>
   {categories.map(cat => (
   <button
   key={cat.id}
   onClick={() => setSelectedCategory(cat.id.toString())}
   className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors border whitespace-nowrap shrink-0 ${
   selectedCategory === cat.id.toString()
   ? 'bg-slate-900 text-white border-slate-900'
   : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
   }`}
   >
   {cat.name}
   </button>
   ))}
   </div>

   {/* View Mode Toggle */}
   <div className="flex items-center justify-end gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-700/50 shrink-0">
   <button 
   onClick={() => setViewMode('grid')}
   className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
   title="Tampilan Grid"
   >
   <LayoutGrid size={16} className="md:w-5 md:h-5" />
   </button>
   <button 
   onClick={() => setViewMode('list')}
   className={`p-1.5 md:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
   title="Tampilan List"
   >
   <List size={16} className="md:w-5 md:h-5" />
   </button>
   </div>
  </div>

  {/* Bottom Row: Level Filter (Desktop Only) */}
  <div className="hidden sm:flex items-center gap-3">
  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mr-1">Filter Level:</span>
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
  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 ${
  selectedLevel === level.value
  ? 'bg-emerald-600 text-white'
  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
  }`}
  >
  {level.label}
  </button>
  ))}
  </div>
  </div>
 </div>

 {/* --- COURSE GRID --- */}
 {loading ? (
 <div className="flex flex-col items-center justify-center py-24 gap-4">
 <div>
 <Loader2 size={44} className="text-emerald-500 animate-spin"/>
 </div>
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
 <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedLevel('all'); }} className="px-6 py-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-bold rounded-lg transition-colors">
 Reset Semua Filter
 </button>
 )}
 </div>
 ) : (
 <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6" : "grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4"}>
 
 {filteredCourses.map((course, idx) => (
 <div key={course.id}>
 <Link href={`/courses/${course.slug}`} className="group block h-full">
  <div className={`bg-white dark:bg-[#0B1120] rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 h-full flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
  
  {/* -- Thumbnail -- */}
  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border-slate-100 dark:border-slate-800 ${viewMode === 'list' ? 'w-24 sm:w-2/5 lg:w-[260px] aspect-[3/4] sm:aspect-[16/10] border-r border-b-0' : 'w-full aspect-video border-b'}`}>
  {course.thumbnail ? (
  <img loading="lazy" src={`${STORAGE_URL}/${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
 <GraduationCap size={48} className="text-slate-300 dark:text-slate-600"/>
 </div>
 )}
 
  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
  
  {/* Play button overlay */}
   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
   <div className="w-14 h-14 rounded-full bg-white/30 dark:bg-slate-800/20 backdrop-blur-md border border-white/50 dark:border-slate-700/30 flex items-center justify-center">
   <PlayCircle size={28} className="text-white ml-0.5"/>
   </div>
  </div>

 {/* Top badges */}
 <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-0">
 {/* Level badge */}
 <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded sm:rounded-lg text-[8px] sm:text-[10px] font-black uppercase tracking-wider shadow-lg dark:shadow-black/20 w-max ${getLevelColor(course.level)}`}>
 {getLevelIcon(course.level)} <span className="hidden sm:inline">{getLevelLabel(course.level)}</span>
 </span>
 
 {/* Price badge */}
  {course.price === 0 ? (
  <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded sm:rounded-lg text-[9px] sm:text-xs font-black shadow-lg dark:shadow-black/20 bg-emerald-500 dark:bg-emerald-500/90 text-white w-max">
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

 {/* -- Content -- */}
 <div className="p-3 sm:p-5 flex flex-col flex-1">
 {/* Category tag */}
 <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-3">
 <div className="w-1 h-1 rounded-full bg-emerald-50 dark:bg-emerald-500 shrink-0"/>
 <span className="text-[8px] sm:text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest truncate">{course.category?.name || 'Umum'}</span>
 </div>

 {/* Title */}
 <h3 className="text-xs sm:text-[15px] md:text-base font-bold text-slate-900 dark:text-white leading-snug mb-2 sm:mb-3 line-clamp-2 group-hover:text-emerald-700 dark:text-emerald-400 tracking-tight">
 {course.title}
 </h3>

 {/* Instructor */}
 <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
 {(!course.instructor || course.instructor.role === 'superadmin' || course.instructor.name === 'Admin Amania') ? (
 <>
 <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
 <img loading="lazy" src="/logo-mini.png" alt="Amania Official" className="w-3 h-3 sm:w-4 sm:h-4 object-contain dark:brightness-0 dark:invert" />
 </div>
 <span className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 truncate">Amania Official</span>
 </>
 ) : (
 <>
 {course.instructor?.avatar ? (
 <img loading="lazy" src={`${STORAGE_URL}/${course.instructor.avatar}`} alt={course.instructor.name} className="w-5 h-5 sm:w-7 sm:h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700/50 shrink-0" />
 ) : (
 <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center shrink-0">
 <User size={13} className="text-slate-400 dark:text-slate-400"/>
 </div>
 )}
 <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{course.instructor.name}</span>
 </>
 )}
 </div>

 {/* Rating */}
 {course.avg_rating > 0 ? (
 <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
 <div className="flex items-center gap-0.5">
 {[1, 2, 3, 4, 5].map(star => (
 <Star
 key={star}
 size={10}
 className={`sm:w-[13px] sm:h-[13px] ${star <= Math.round(course.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
 />
 ))}
 </div>
 <span className="text-[10px] sm:text-xs font-black text-amber-600">{parseFloat(course.avg_rating).toFixed(1)}</span>
 <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-400 font-medium">({course.reviews_count || 0})</span>
 </div>
 ) : (
 <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
 <Star size={10} className="sm:w-[13px] sm:h-[13px] text-slate-350"/>
 <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
 </div>
 )}

 {/* Spacer for equal height */}
 {viewMode === 'grid' && <div className="flex-1"/>}

 {/* Stats bar */}
 <div className={`flex items-center flex-wrap gap-2 sm:gap-4 pt-2 sm:pt-4 border-t border-slate-100 dark:border-slate-700/50 ${viewMode === 'list' ? 'pb-0' : ''}`}>
 <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <BookOpen size={13} className="text-emerald-400 w-3 h-3 sm:w-auto"/> {course.sections_count || 0} <span className="hidden sm:inline">Bab</span>
 </span>
 <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <Video size={13} className="text-indigo-400 w-3 h-3 sm:w-auto"/> {course.lessons_count || 0} <span className="hidden sm:inline">Lesson</span>
 </span>
 {course.total_duration > 0 && (
 <span className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400">
 <Clock size={13} className="text-amber-400 w-3 h-3 sm:w-auto"/> {course.total_duration}m
 </span>
 )}
 </div>
 </div>

 {/* -- CTA Bar -- */}
 {viewMode === 'grid' && (
 <div className="px-5 pb-5 hidden sm:block">
 <div className="flex items-center justify-between bg-slate-50 dark:bg-[#111827] group-hover:bg-emerald-50 dark:hover:bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3 border border-slate-100 dark:border-slate-700/50 group-hover:border-emerald-100 dark:border-emerald-500/20 transition-transform duration-300">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-700 dark:text-emerald-400">Lihat Detail</span>
 <ArrowRight size={14} className="text-slate-400 dark:text-slate-400 group-hover:text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform duration-300"/>
 </div>
 </div>
 )}
 </div>
 </Link>
 </div>
 ))}
 </div>
 )}
 
 {/* Mobile Filter Modal */}
 {isMobileFilterOpen && (
 <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-900 sm:hidden">
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
 <h3 className="font-bold text-slate-900 dark:text-white">Filter Kursus</h3>
 <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
 <X size={20} />
 </button>
 </div>
 
 {/* Content */}
 <div className="flex-1 overflow-y-auto p-5 space-y-6">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Kategori</h4>
 <div className="flex flex-wrap gap-2">
 <button
 onClick={() => setSelectedCategory('all')}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
 selectedCategory === 'all'
 ? 'bg-emerald-600 text-white border-emerald-600'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
 }`}
 >
 Semua Kategori
 </button>
 {categories.map(cat => (
 <button
 key={cat.id}
 onClick={() => setSelectedCategory(cat.id.toString())}
 className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
 selectedCategory === cat.id.toString()
 ? 'bg-emerald-600 text-white border-emerald-600'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
 }`}
 >
 {cat.name}
 </button>
 ))}
 </div>
 </div>
 
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Tingkat Kesulitan</h4>
 <div className="flex flex-col gap-2">
 {[
 { value: 'all', label: 'Semua Level' },
 { value: 'beginner', label: 'Pemula' },
 { value: 'intermediate', label: 'Menengah' },
 { value: 'advanced', label: 'Mahir' },
 ].map(level => (
 <button
 key={level.value}
 onClick={() => setSelectedLevel(level.value)}
 className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
 selectedLevel === level.value
 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
 : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
 }`}
 >
 {level.label}
 {selectedLevel === level.value && <Check size={18} className="text-emerald-600 dark:text-emerald-400" />}
 </button>
 ))}
 </div>
 </div>
 </div>
 
 {/* Footer */}
 <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
 <button
 onClick={() => setIsMobileFilterOpen(false)}
 className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-emerald-500/25"
 >
 Terapkan Filter
 </button>
 </div>
 </div>
 )}
 </div>
 </div>
 );
}
