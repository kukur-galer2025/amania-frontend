"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Target, BookOpen, Layers, FileQuestion, 
  Award, ArrowLeft, Menu, X, LayoutDashboard, MonitorPlay, FolderTree 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SKD_PAGES = [
  { title: 'Dashboard SKD', link: '/admin/tryouts/skd/dashboard', icon: LayoutDashboard },
  { title: 'Kategori Tryout', link: '/admin/tryouts/skd/tryout-categories', icon: FolderTree }, // 🔥 MENU BARU DITAMBAHKAN DI SINI 🔥
  { title: 'Sub-Kategori Materi', link: '/admin/tryouts/skd/categories', icon: Layers },
  { title: 'Kelola Tryout', link: '/admin/tryouts/skd/manage', icon: BookOpen },
  { title: 'Bank Soal SKD', link: '/admin/tryouts/skd/questions', icon: FileQuestion },
  { title: 'Hasil & Riwayat', link: '/admin/tryouts/skd/results', icon: Award },
];

export default function SkdWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Animasi saat kembali ke Portal Utama Tryout
  const handleBackToPortal = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.push('/admin/tryouts');
    }, 800);
  };

  const NavItem = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/admin/tryouts/skd');
    
    return (
      <Link 
        href={href} 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-md' 
            : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600 transition-colors'} />
          <span className={`text-sm font-bold leading-none tracking-wide ${isActive ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
        </div>
        {isActive && <motion.div layoutId="activeTryoutPill" className="w-1.5 h-4 rounded-full bg-white/30" />}
      </Link>
    );
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full bg-white rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex font-sans overflow-hidden relative">
      
      {/* ══ OVERLAY ANIMASI KELUAR KE PORTAL ══ */}
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-slate-900"
          >
             <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
             <p className="mt-6 font-black text-slate-600 animate-pulse tracking-widest text-sm uppercase">Kembali ke Portal Modul...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ OVERLAY MOBILE MENU ══ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
          />
        )}
      </AnimatePresence>

      {/* ══ SIDEBAR KHUSUS SKD ══ */}
      <aside className={`absolute lg:relative top-0 left-0 h-full w-72 bg-slate-50 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-200 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        
        {/* Header Sidebar SKD */}
        <div className="px-6 py-6 border-b border-slate-200 bg-indigo-600/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-indigo-700">
            <MonitorPlay size={24} strokeWidth={2.5} />
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest leading-tight">Modul SKD</h2>
              <p className="text-[10px] font-bold text-indigo-500">CPNS & Kedinasan</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigasi */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Navigasi Modul</p>
          {SKD_PAGES.map((page) => (
            <NavItem key={page.link} icon={page.icon} label={page.title} href={page.link} />
          ))}
        </div>

        {/* Tombol Keluar (Kembali ke Portal Tryout) */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <button 
            type="button"
            onClick={handleBackToPortal} 
            className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl font-bold transition-all text-sm group shadow-sm"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Ganti Modul Ujian
          </button>
        </div>
      </aside>

      {/* ══ MAIN CONTENT AREA ══ */}
      <main className="flex-1 min-w-0 h-full flex flex-col relative bg-[#F8FAFC]">
        
        {/* Tombol Hamburger Khusus Mobile (Muncul jika layar kecil) */}
        <div className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center gap-3 shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-slate-800">Menu Modul SKD</span>
        </div>

        {/* Area Konten Dinamis Tryout
            flex-1 dan overflow-y-auto memastikan hanya area ini yang bisa di-scroll 
        */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}