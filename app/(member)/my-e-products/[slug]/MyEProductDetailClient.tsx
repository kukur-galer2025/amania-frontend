"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 ArrowLeft, FileText, Link as LinkIcon, DownloadCloud, 
 Layers, CheckCircle2, PlayCircle, Loader2, BookOpen,
 ChevronRight, Star, Award, LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';

export default function MyEProductDetailClient({ slug }: { slug: string }) {
 const router = useRouter();
 const [product, setProduct] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [activeMaterial, setActiveMaterial] = useState<any>(null);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 useEffect(() => {
 const fetchProductDetail = async () => {
 try {
 const res = await apiFetch(`/my-e-products/${slug}`, {
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` }
 });
 const json = await res.json();

 if (res.ok && json.success) {
 setProduct(json.data);
 if (json.data.materials && json.data.materials.length > 0) {
 setActiveMaterial(json.data.materials[0]);
 }
 } else {
 toast.error(json.message || 'Akses ditolak.');
 router.push('/my-e-products');
 }
 } catch (error) {
 toast.error('Gagal memuat ruang kelas.');
 router.push('/my-e-products');
 } finally {
 setLoading(false);
 }
 };
 fetchProductDetail();
 }, [slug]);

 const handleDownload = async () => {
 if (!activeMaterial) return;

 if (activeMaterial.type === 'link') {
 window.open(activeMaterial.link_url || activeMaterial.link, '_blank');
 } else {
 const tid = toast.loading("Menyiapkan file unduhan...");
 try {
 const res = await apiFetch(`/my-e-products/materials/${activeMaterial.id}/download`, {
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` }
 });

 if (!res.ok) {
 const errorData = await res.json();
 throw new Error(errorData.message ||"Gagal mengunduh file.");
 }

 const blob = await res.blob();
 const url = window.URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;

 const ext = activeMaterial.file_path.split('.').pop();
 const safeTitle = activeMaterial.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
 link.setAttribute('download', `Amania_${safeTitle}.${ext}`);

 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 window.URL.revokeObjectURL(url);

 toast.success("File berhasil diunduh ke perangkat!", { id: tid });
 } catch (error: any) {
 toast.error(error.message ||"Gagal mengunduh file.", { id: tid });
 }
 }
 };

 if (loading) return (
 <div className="min-h-[70vh] flex flex-col items-center justify-center w-full">
 <Loader2 size={40} className="animate-spin text-amber-600 mb-4"/>
 <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider animate-pulse uppercase">Membuka Ruang Belajar...</h2>
 </div>
 );

 if (!product) return null;

 const activeIndex = product.materials?.findIndex((m: any) => m.id === activeMaterial?.id) ?? 0;

 return (
 <div className="max-w-[1600px] mx-auto w-full relative z-10 animate-in fade-in duration-700 pb-20">
 
 {/* ════ BACKGROUND GLOW ════ */}
 <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-50 dark:bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
 
 <div className="flex flex-col lg:flex-row gap-8 items-start">
 
 {/* ════ 1. MAIN CONTENT AREA (LEFT) ════ */}
 <div className="flex-1 w-full min-w-0">
 <AnimatePresence mode="wait">
 {activeMaterial ? (
 <motion.div 
 key={activeMaterial.id}
 initial={{ opacity: 0, y: 15 }} 
 animate={{ opacity: 1, y: 0 }} 
 exit={{ opacity: 0, y: -15 }}
 className="bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col"
 >
 {/* 🔥 2A. HEADER & VIEWER TERINTEGRASI (FULL BLACK) 🔥 */}
 <div className="relative w-full bg-slate-950 overflow-hidden pt-8 pb-12 px-6 md:px-10 border-b border-slate-800">
 {/* Background Gradient */}
 <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-600/15 rounded-full blur-[80px]"></div>

 {/* --- BARIS 1: NAV & STATUS --- */}
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10 border-b border-slate-800 pb-5">
 <Link href="/my-e-products" className="shrink-0 group flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-transform duration-300 border border-slate-700">
 <ArrowLeft size={16} className="text-slate-400 dark:text-slate-400 group-hover:text-amber-400"/>
 <span className="text-xs font-bold text-slate-300 dark:text-slate-500 group-hover:text-white">Koleksi Saya</span>
 </Link>
 
 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 border border-emerald-800 rounded-full">
 <CheckCircle2 size={13} className="text-emerald-400"/>
 <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">Akses Resmi Terbuka</span>
 </div>
 </div>

 {/* --- BARIS 2: JUDUL PRODUK & MATERI --- */}
 <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
 <div className="text-left flex-1 min-w-0">
 {/* Judul Produk (Kecil di atas) */}
 <div className="flex items-center gap-2 text-amber-500/80 mb-2 truncate">
 <LayoutGrid size={13}/>
 <span className="text-xs font-medium tracking-tight truncate text-slate-400 dark:text-slate-400">{product.title}</span>
 </div>
 
 {/* Judul Materi Utama (Besar White) */}
 <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-4 tracking-tighter break-words">
 {activeMaterial.title}
 </h1>

 <div className="flex flex-wrap gap-3">
 <div className="inline-flex items-center gap-2 bg-slate-800 text-amber-400 px-3 py-1.5 rounded-full border border-slate-700 text-[10px] font-bold uppercase tracking-wider shadow-sm dark:shadow-black/10">
 {activeMaterial.type === 'link' ? <LinkIcon size={13}/> : <FileText size={13}/>}
 Materi {activeIndex + 1}
 </div>
 <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-400 text-xs py-1.5">
 <Award size={14} className="text-amber-500"/>
 <span>Eksklusif Amania</span>
 </div>
 </div>
 </div>
 
 {/* Product Cover Mini */}
 <div className="hidden md:block w-28 h-36 shrink-0 rounded-xl overflow-hidden shadow-2xl dark:shadow-black/25 border-2 border-slate-700 relative mt-2 bg-slate-900">
 {product.cover_image ? (
 <img src={`${STORAGE_URL}/${product.cover_image}`} alt="cover" className="w-full h-full object-cover"/>
 ) : (
 <div className="w-full h-full flex items-center justify-center text-slate-700 dark:text-slate-300"><FileText size={24}/></div>
 )}
 <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-white/20 to-transparent z-10"/>
 </div>
 </div>
 </div>

 {/* 🔥 2B. AREA AKSI UTAMA (CLEAN) 🔥 */}
 <div className="p-8 md:p-12 lg:p-16 flex flex-col items-center justify-center text-center bg-white dark:bg-[#111827]">
 <div className="max-w-2xl w-full">
 
 <div className="flex items-center justify-center gap-1.5 mb-5 text-amber-500">
 <Star size={16} className="fill-amber-500"/>
 <Star size={16} className="fill-amber-500"/>
 <Star size={16} className="fill-amber-500"/>
 <Star size={16} className="fill-amber-500"/>
 <Star size={16} className="fill-amber-500"/>
 </div>

 <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed mb-10 px-4">
 {activeMaterial.type === 'link' 
 ?"Materi ini tersedia melalui tautan eksternal yang aman dan terverifikasi. Klik tombol di bawah untuk membuka ruang penyimpanan atau video pembelajaran di tab baru."
 :"File materi Premium telah dioptimasi untuk perangkat Anda. Klik tombol di bawah untuk menyimpannya langsung ke penyimpanan lokal secara instan."
 }
 </p>

 <button 
 onClick={handleDownload}
 className="group relative inline-flex items-center justify-center gap-3.5 px-10 py-4 md:py-5 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-700 hover:to-amber-800 text-white rounded-[1rem] font-black text-sm md:text-base transition-transform duration-300 shadow-xl dark:shadow-black/20 shadow-amber-900/20 active:scale-[0.98] overflow-hidden w-full sm:w-auto"
 >
 <div className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
 {activeMaterial.type === 'link' ? <PlayCircle size={22} className="relative z-10"/> : <DownloadCloud size={22} className="relative z-10"/>}
 <span className="relative z-10">{activeMaterial.type === 'link' ?"Buka Tautan Materi":"Download File Materi"}</span>
 <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform"/>
 </button>

 </div>
 </div>
 </motion.div>
 ) : (
 <div className="bg-white dark:bg-[#111827] rounded-[2rem] md:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700/50 p-16 flex flex-col items-center justify-center text-center shadow-sm dark:shadow-black/10">
 <BookOpen size={48} className="text-slate-300 dark:text-slate-500 mb-5"/>
 <h3 className="text-xl font-black text-slate-900 dark:text-white">Kurikulum Belum Diunggah</h3>
 <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-sm max-w-sm">Mohon maaf, Admin belum mengunggah materi untuk produk ini. Silakan hubungi dukungan jika ini adalah kesalahan.</p>
 </div>
 )}
 </AnimatePresence>

 </div>

 {/* ════ 2. SIDEBAR KURIKULUM (RIGHT) ════ */}
 <div className="w-full lg:w-[360px] xl:w-[400px] shrink-0 lg:sticky lg:top-24">
 <div className="bg-white dark:bg-[#111827] rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-[0_15px_40px_rgba(0,0,0,0.03)] overflow-hidden">
 
 {/* Sidebar Header */}
 <div className="p-6 bg-slate-50 dark:bg-[#111827] border-b border-slate-100 dark:border-slate-700/50">
 <div className="flex gap-4 items-center">
 <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden shadow border border-slate-200/50 dark:border-slate-700/300 relative bg-slate-900">
 {product.cover_image ? <img src={`${STORAGE_URL}/${product.cover_image}`} alt="cover" className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-400"><FileText size={16}/></div>}
 <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-r from-white/40 to-transparent z-10"/>
 </div>
 <div>
 <h3 className="font-black text-slate-950 dark:text-white dark:text-white text-sm leading-tight mb-1">Daftar Isi Materi</h3>
 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
 <Layers size={12} className="text-amber-500"/> {product.materials?.length || 0} Konten Digital
 </p>
 </div>
 </div>
 </div>

 {/* Playlist List */}
 <div className="p-3 max-h-[450px] lg:max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1.5">
 {product.materials?.map((mat: any, index: number) => {
 const isActive = activeMaterial?.id === mat.id;
 return (
 <button
 key={mat.id}
 onClick={() => setActiveMaterial(mat)}
 className={`w-full text-left flex items-start gap-3.5 p-3.5 rounded-xl transition-transform duration-200 border group ${
 isActive 
 ? 'bg-slate-900 border-slate-800 shadow-md dark:shadow-black/15 text-white' 
 : 'bg-white dark:bg-[#111827] border-transparent hover:border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
 }`}
 >
 <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
 isActive ? 'bg-amber-50 dark:bg-amber-500 border-amber-400 text-slate-900 dark:text-white shadow-inner' : 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-400 group-hover:text-amber-500'
 }`}>
 {mat.type === 'link' ? <LinkIcon size={14} /> : <FileText size={14} />}
 </div>
 <div className="flex-1 min-w-0">
 <p className={`text-[13px] md:text-sm font-bold leading-snug break-words ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
 {mat.title}
 </p>
 <span className={`text-[9px] font-black uppercase tracking-[0.1em] mt-1 block ${isActive ? 'text-amber-400' : 'text-slate-400 dark:text-slate-400'}`}>
 Materi {index + 1}
 </span>
 </div>
 {isActive && <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-1"/>}
 </button>
 );
 })}
 </div>

 {/* Sidebar Footer */}
 <div className="p-4 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-slate-700/50 text-center">
 <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
 <BookOpen size={12}/> Hak Cipta Amania
 </p>
 </div>
 </div>
 </div>

 </div>

 <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar { width: 5px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
 `}</style>
 </div>
 );
}