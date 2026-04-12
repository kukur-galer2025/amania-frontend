"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Menu, X, User, Receipt, LogOut, ChevronDown, ArrowLeft,
  Home, ShoppingBag, BookOpen, Award
} from 'lucide-react';

export default function TryoutsLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  // Cek user login
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUserData(JSON.parse(userStr));

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
    router.push('/login');
  };

  // 🔥 NavLink Desktop (Sky Blue Active State) 🔥
  const NavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: any }) => {
    const isActive = pathname === href || (href !== '/tryouts' && pathname.startsWith(href));
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2.5 rounded-2xl ${
          isActive 
            ? 'bg-sky-600 text-white shadow-md shadow-sky-200' 
            : 'text-slate-600 hover:bg-white/60 hover:text-sky-700 hover:shadow-sm'
        }`}
      >
        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-sky-100' : 'text-slate-400'} /> 
        {label}
      </Link>
    );
  };

  // 🔥 NavLink Mobile (Sky Blue Soft Theme) 🔥
  const MobileNavLink = ({ href, label, icon: Icon }: { href: string, label: string, icon: any }) => {
    const isActive = pathname === href || (href !== '/tryouts' && pathname.startsWith(href));
    return (
      <Link 
        href={href} 
        onClick={() => setIsMobileMenuOpen(false)} 
        className={`flex items-center gap-3 font-bold px-4 py-3.5 rounded-2xl transition-colors ${
          isActive 
            ? 'bg-sky-600 text-white shadow-md' 
            : 'text-slate-600 hover:bg-sky-50/80 hover:text-sky-700'
        }`}
      >
        <div className={`p-1.5 rounded-xl ${isActive ? 'bg-sky-500 text-white' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
        </div>
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-orange-500 selection:text-white relative">
      
      {/* =========================================
          NAVBAR (SKY BLUE GLASSMORPHISM)
      ============================================= */}
      <nav className="fixed top-0 left-0 right-0 bg-sky-50/80 backdrop-blur-xl border-b border-sky-100/50 z-[100] shadow-[0_4px_30px_-10px_rgba(2,132,199,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20 lg:h-24">
          
          {/* KIRI: Logo Amania Evaluation */}
          <Link href="/tryouts" className="flex items-center gap-3 group">
             <div className="w-12 h-12 bg-white rounded-[16px] flex items-center justify-center text-orange-500 shadow-lg shadow-sky-200 group-hover:scale-105 group-hover:rotate-3 transition-all shrink-0 border border-sky-100">
               <Target size={24} strokeWidth={2.5} />
             </div>
             <div className="flex-col hidden sm:flex">
               <span className="font-black text-slate-900 text-xl tracking-tight leading-none group-hover:text-sky-700 transition-colors">Amania</span>
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none mt-1">Evaluation</span>
             </div>
          </Link>

          {/* TENGAH: Ke-4 Menu Utama Selalu Tampil (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 h-full">
            <NavLink href="/tryouts" label="Beranda" icon={Home} />
            <NavLink href="/tryouts/katalog" label="Katalog" icon={ShoppingBag} />
            <NavLink href="/tryouts/belajarku" label="Belajarku" icon={BookOpen} />
            <NavLink href="/tryouts/history" label="history" icon={Award} />
          </div>

          {/* KANAN: Tombol Kembali & Profil */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/beranda" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-sky-700 bg-white/60 hover:bg-white px-4 py-3 rounded-2xl transition-all border border-sky-100/50 shadow-sm">
              <ArrowLeft size={16} /> Web Utama
            </Link>

            {userData ? (
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-white border border-sky-100 hover:border-sky-300 hover:bg-sky-50 p-1.5 pr-4 rounded-[18px] transition-all shadow-sm active:scale-95"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-600 text-white font-black rounded-[14px] flex items-center justify-center text-sm shadow-inner">
                    {userData.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-slate-700 max-w-[100px] truncate">{userData.name?.split(' ')[0]}</span>
                  <ChevronDown size={16} strokeWidth={3} className={`text-sky-400 ml-1 transition-transform duration-300 ${isProfileOpen ? '-rotate-180 text-sky-600' : ''}`} />
                </button>

                {/* Dropdown Profil (Desktop) */}
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2, type: "spring", bounce: 0.4 }}
                      className="absolute right-0 top-16 w-64 bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(2,132,199,0.15)] rounded-[2rem] overflow-hidden py-2"
                    >
                      <div className="px-6 py-5 border-b border-slate-50 bg-sky-50/30">
                        <p className="text-base font-black text-slate-900 truncate">{userData.name}</p>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-1">Peserta Tryout</p>
                      </div>
                      
                      <div className="p-3 flex flex-col gap-1">
                        <Link href="/transactions" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-2xl transition-colors">
                          <Receipt size={18} className="text-sky-400" /> Transaksi Utama
                        </Link>
                        
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-2xl transition-colors group">
                          <LogOut size={18} className="text-rose-400 group-hover:text-rose-600" /> Keluar Akun
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/login" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-[16px] text-sm font-black transition-all shadow-lg shadow-orange-200 active:scale-95">
                Masuk / Daftar
              </Link>
            )}
          </div>

          {/* Hamburger Mobile */}
          <button className="lg:hidden p-3 text-sky-600 hover:bg-white rounded-2xl transition-colors active:scale-95 bg-white/60 border border-sky-100 shadow-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Menu Mobile Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 top-[80px] bg-slate-900/20 backdrop-blur-sm z-[90] lg:hidden h-[calc(100vh-80px)]"
              />
              
              {/* Sidebar Menu Panel */}
              <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="absolute top-[80px] right-0 w-[85%] sm:w-[350px] lg:hidden bg-white/95 backdrop-blur-xl border-l border-slate-200 overflow-hidden shadow-2xl z-[100] h-[calc(100vh-80px)]"
              >
                <div className="flex flex-col px-5 py-6 h-full overflow-y-auto">
                  
                  {/* User Badge Mobile */}
                  {userData && (
                    <div className="flex items-center gap-4 mb-8 p-4 bg-sky-50/80 rounded-3xl border border-sky-100/50">
                      <div className="w-12 h-12 bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center text-lg shadow-md shrink-0">
                        {userData.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{userData.name}</p>
                        <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Peserta Tryout</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mb-8">
                    <MobileNavLink href="/tryouts" label="Beranda" icon={Home} />
                    <MobileNavLink href="/tryouts/katalog" label="Katalog Tryout" icon={ShoppingBag} />
                    <MobileNavLink href="/tryouts/belajarku" label="Dashboard Belajarku" icon={BookOpen} />
                    <MobileNavLink href="/tryouts/history" label="History Nilai" icon={Award} />
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
                    <Link href="/beranda" className="flex items-center justify-center gap-2 py-4 bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-100 transition-colors">
                      <ArrowLeft size={18} /> Web Utama
                    </Link>
                    {userData ? (
                      <>
                        <Link href="/transactions" className="flex items-center justify-center gap-2 py-4 border border-sky-100 text-sky-700 bg-sky-50 rounded-2xl font-bold hover:bg-sky-100 transition-colors">
                          <Receipt size={18} /> Transaksi Utama
                        </Link>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 py-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                          <LogOut size={18} /> Keluar Akun
                        </button>
                      </>
                    ) : (
                      <Link href="/login" className="block w-full text-center py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black transition-colors shadow-lg shadow-orange-200">
                        Masuk / Daftar Sekarang
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacing untuk Navbar fixed */}
      <div className="h-[80px] lg:h-[96px] shrink-0"></div>

      {/* =========================================
          AREA KONTEN DINAMIS
      ============================================= */}
      <main className="flex-1 w-full flex flex-col relative z-10">
        {children}
      </main>

      {/* =========================================
          FOOTER KHUSUS PORTAL TRYOUT
      ============================================= */}
      <footer className="bg-sky-950 text-sky-200 py-12 lg:py-16 border-t border-sky-900 mt-auto shrink-0 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start gap-3">
            <div className="flex items-center gap-2 text-white font-black text-xl group cursor-default">
              <Target size={24} strokeWidth={2.5} className="text-orange-500 group-hover:rotate-90 transition-transform duration-500" /> Amania Evaluation
            </div>
            <p className="text-xs font-medium max-w-sm text-sky-400 leading-relaxed">
              Pusat simulasi ujian SKD CPNS dan Sekolah Kedinasan terbaik di Indonesia dengan Engine Computer Assisted Test (CAT) mandiri.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-white">
            <Link href="/support" className="hover:text-orange-400 transition-colors py-2">Pusat Bantuan</Link>
            <Link href="/syarat-ketentuan" className="hover:text-orange-400 transition-colors py-2">Syarat & Ketentuan</Link>
            <Link href="/kebijakan-privasi" className="hover:text-orange-400 transition-colors py-2">Kebijakan Privasi</Link>
            <Link href="/tentang-kami" className="hover:text-orange-400 transition-colors py-2">Tentang Kami</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-sky-800 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-sky-500 font-bold">
            © {new Date().getFullYear()} Amania Nusantara. All Rights Reserved.
          </span>
          <span className="text-[10px] font-mono text-sky-300 flex items-center gap-2 bg-sky-900/50 px-3 py-1.5 rounded-full border border-sky-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" /> Server Status: Optimal
          </span>
        </div>
      </footer>

    </div>
  );
}