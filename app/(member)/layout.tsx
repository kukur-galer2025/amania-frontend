"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Trophy, Award, MessageSquare, 
  User, LogOut, Bell, ChevronRight, Search, 
  LayoutDashboard, Newspaper, Sparkles, LogIn, Ticket,
  CalendarHeart, Info, Receipt, Settings2, Calendar, 
  CheckCircle2, AlertCircle, ArrowRight, Menu, X, Loader2, HelpCircle, ShoppingCart, FileText,
  MonitorPlay // 🔥 IKON BARU UNTUK WEBINAR 🔥
} from 'lucide-react';
import { apiFetch } from '../utils/api'; 

const STATIC_PAGES = [
  { id: 'sp-1', title: 'Beranda / Dashboard', link: '/beranda', icon: Home },
  // 🔥 PERUBAHAN TEKS & IKON KATALOG PROGRAM MENJADI WEBINAR / EVENT 🔥
  { id: 'sp-2', title: 'Webinar / Event', link: '/events', icon: MonitorPlay },
  { id: 'sp-2b', title: 'E-Produk Premium', link: '/e-products', icon: ShoppingCart },
  { id: 'sp-3', title: 'Artikel & Jurnal', link: '/articles', icon: Newspaper },
  { id: 'sp-4', title: 'Tiket Aktif', link: '/dashboard/ticket', icon: Ticket },
  { id: 'sp-5', title: 'Kelas Saya', link: '/my-events', icon: CalendarHeart },
  { id: 'sp-5b', title: 'Koleksi E-Produk', link: '/my-e-products', icon: FileText },
  { id: 'sp-6', title: 'Kalender Jadwal', link: '/calendar', icon: Calendar },
  { id: 'sp-7', title: 'Riwayat Transaksi', link: '/transactions', icon: Receipt },
  { id: 'sp-8', title: 'Papan Peringkat', link: '/leaderboard', icon: Trophy },
  { id: 'sp-9', title: 'Sertifikat Kelulusan', link: '/certificates', icon: Award },
  { id: 'sp-10', title: 'Komunitas / Diskusi', link: '/community', icon: MessageSquare },
  { id: 'sp-11', title: 'Tentang Amania', link: '/tentang-kami', icon: Info },
  { id: 'sp-13', title: 'Pengaturan Profil', link: '/profil', icon: User },
];

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showMobileSearchInput, setShowMobileSearchInput] = useState(false); 
  const [pageResults, setPageResults] = useState<any[]>([]);
  const [eventResults, setEventResults] = useState<any[]>([]);
  const [articleResults, setArticleResults] = useState<any[]>([]);
  
  // 🔥 STATE BARU UNTUK E-PRODUK 🔥
  const [eProductResults, setEProductResults] = useState<any[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);

  const [logoutState, setLogoutState] = useState<{ isLoggingOut: boolean, msg: string, type: 'success' | 'error' }>({
    isLoggingOut: false,
    msg: '',
    type: 'success'
  });

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const handleLogout = (reason: 'manual' | 'expired' = 'manual') => {
    setLogoutState({
      isLoggingOut: true,
      msg: reason === 'expired' ? 'Sesi Anda telah habis. Membawa Anda ke halaman login...' : 'Sesi Anda telah berakhir. Sampai jumpa kembali!',
      type: reason === 'expired' ? 'error' : 'success'
    });

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);

    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  useEffect(() => {
    setIsMounted(true);
    
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    const isTokenValid = token && token !== 'null' && token !== 'undefined' && token.length > 10;
    const isUserStrValid = userStr && userStr !== 'null' && userStr !== 'undefined';

    if (isTokenValid && isUserStrValid) {
      try {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.name) {
          setUserData(parsedUser);
          fetchNotifications(); 
        } else {
          throw new Error('Data user tidak lengkap atau corrupt');
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUserData(null);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUserData(null);
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setShowMobileSearchInput(false); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowMobileSearchInput(false); 
  }, [pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      
      if (res.status === 401) {
        handleLogout('expired');
        return;
      }

      const json = await res.json();
      if (res.ok && json.success) {
        setNotifications(json.notifications);
        setUnreadCount(json.unread_count);
      }
    } catch (error) { 
      console.error("Gagal ambil notifikasi", error); 
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setUnreadCount(0);
      await apiFetch('/notifications/read', { method: 'POST' });
      fetchNotifications(); 
    } catch (error) { console.error(error); }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds} detik lalu`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getAvatarSource = () => {
    if (userData?.avatar) {
      if (userData.avatar.startsWith('http')) return userData.avatar;
      return `${STORAGE_URL}/${userData.avatar}`;
    }
    return `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=4f46e5&color=fff&bold=true`;
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setShowSearchDropdown(false);
      // 🔥 RESET SEMUA STATE PENCARIAN 🔥
      setPageResults([]); setEventResults([]); setArticleResults([]); setEProductResults([]);
      return;
    }

    setShowSearchDropdown(true);
    setIsSearching(true);

    const delayDebounceFn = setTimeout(async () => {
      const queryLower = searchQuery.toLowerCase();
      const localPages = STATIC_PAGES.filter(p => p.title.toLowerCase().includes(queryLower));
      setPageResults(localPages.slice(0, 3));

      try {
        const res = await apiFetch(`/global-search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();

        if (res.ok && json.success) {
          setEventResults(json.events || []);
          setArticleResults(json.articles || []);
          // 🔥 TANGKAP HASIL PENCARIAN E-PRODUK 🔥
          setEProductResults(json.eproducts || []);
        } else {
          setEventResults([]); setArticleResults([]); setEProductResults([]);
        }
      } catch (error) {
        setEventResults([]); setArticleResults([]); setEProductResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      router.push(`/events?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setShowMobileSearchInput(false);
      setSearchQuery('');
    }
  };

  const NavLink = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/beranda');
    return (
      <Link href={href} className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive ? 'bg-white border border-slate-200 text-indigo-600 shadow-sm' : 'border border-transparent text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}`}>
        <div className="flex items-center gap-3 relative z-10">
          <Icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors'} />
          <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'} transition-colors`}>{label}</span>
        </div>
        {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />}
      </Link>
    );
  };

  if (!isMounted) return null;

  return (
    // 🔥 PERBAIKAN: Menghapus overflow-x-hidden agar layout sticky tidak tergencet 🔥
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans relative w-full">
      
      {/* OVERLAY ANIMASI LOGOUT FULL SCREEN */}
      <AnimatePresence>
        {logoutState.isLoggingOut && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="bg-white p-10 md:p-14 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden"
            >
              <div className={`absolute top-0 w-full h-2 ${logoutState.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${logoutState.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${logoutState.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                {logoutState.type === 'success' ? (
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                ) : (
                  <AlertCircle size={48} strokeWidth={2.5} />
                )}
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                {logoutState.type === 'success' ? 'Logout Berhasil' : 'Sesi Kedaluwarsa'}
              </h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 px-2">
                {logoutState.msg}
              </p>
              
              <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">
                <Loader2 size={16} className="animate-spin" /> Memuat...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY MENU MOBILE */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-slate-50 border-r border-slate-200 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-200/60 shrink-0 bg-white/50 backdrop-blur-sm">
          <Link href="/beranda" className="flex items-center gap-3 group">
             <img src="/logo-amania.png" alt="Logo Amania" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform" />
             <span className="text-xl font-black tracking-tight text-slate-900 mt-1">Amania</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 lg:hidden text-slate-400 hover:text-slate-700 bg-slate-100 rounded-md transition-colors">
             <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-6 pb-8">
          <div className="px-4 mb-8">
            {userData ? (
              <Link href="/profil" className="block p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center text-center group hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100 transition-all duration-300">
                <div className="relative mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-100 border-[3px] border-white shadow-md ring-2 ring-slate-100 group-hover:ring-indigo-300 transition-all duration-300">
                     <img src={getAvatarSource()} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="w-full min-w-0">
                  <h4 className="text-[14px] md:text-[15px] font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{userData.name}</h4>
                  <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-widest truncate mt-0.5">{userData.role}</p>
                </div>
                <div className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100/80 rounded-xl text-[10px] md:text-[11px] font-bold text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-slate-200 group-hover:border-indigo-600 shadow-sm">
                  <Settings2 size={14} /> Kelola Profil
                </div>
              </Link>
            ) : (
              <div className="p-5 bg-slate-900 rounded-2xl shadow-sm text-center">
                <Sparkles size={24} className="text-amber-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Mode Tamu</h4>
                <p className="text-[10px] text-slate-400 mb-5 leading-relaxed">Login untuk akses fitur penuh Amania.</p> 
                <Link href="/login" className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors shadow-sm">
                  <LogIn size={14} /> Masuk / Daftar
                </Link>
              </div>
            )}
          </div>

          <nav className="px-3 space-y-6 flex-1">
            <div>
              <p className="px-3 mb-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Navigasi Utama</p>
              <div className="space-y-0.5">
                <NavLink icon={Home} label="Beranda" href="/beranda" />
                {/* 🔥 TEKS DIGANTI DI SINI 🔥 */}
                <NavLink icon={MonitorPlay} label="Webinar / Event" href="/events" />
                <NavLink icon={ShoppingCart} label="E-Produk Premium" href="/e-products" />
                <NavLink icon={Newspaper} label="Artikel & Jurnal" href="/articles" />
              </div>
            </div>

            <div>
              <p className="px-3 mb-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Ruang Pembelajaran</p>
              <div className="space-y-0.5">
                {userData && <NavLink icon={Ticket} label="Tiket Aktif" href="/dashboard/ticket" />}
                <NavLink icon={CalendarHeart} label="Kelas Saya" href="/my-events" />
                {userData && <NavLink icon={FileText} label="Koleksi E-Produk" href="/my-e-products" />}
                <NavLink icon={Award} label="Sertifikat Kelulusan" href="/certificates" />
                <NavLink icon={Calendar} label="Kalender" href="/calendar" />
                <NavLink icon={Receipt} label="Riwayat Transaksi" href="/transactions" />
              </div>
            </div>

            <div>
              <p className="px-3 mb-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Reputasi & Jaringan</p>
              <div className="space-y-0.5">
                <NavLink icon={Trophy} label="Papan Peringkat" href="/leaderboard" />
                <NavLink icon={MessageSquare} label="Komunitas" href="/community" />
              </div>
            </div>

            <div>
              <p className="px-3 mb-2 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400">Pusat Informasi</p>
              <div className="space-y-0.5">
                <NavLink icon={Info} label="Tentang Amania" href="/tentang-kami" />
                <NavLink icon={HelpCircle} label="Pusat Bantuan & FAQ" href="/support" />
              </div>
            </div>
          </nav>

          {userData && (
            <div className="px-4 mt-8 pb-4">
              <button onClick={() => handleLogout('manual')} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group border border-transparent hover:border-rose-100">
                <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-bold">Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 w-full min-h-screen flex flex-col relative bg-slate-50/50">
        
        {/* Header Bar Responsif */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 lg:hidden text-slate-500 hover:bg-slate-100 rounded-md transition-colors">
              <Menu size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <div className="text-slate-400">
                {pathname === '/beranda' ? <Home size={16} /> : 
                 pathname.startsWith('/tentang-kami') ? <Info size={16} /> : 
                 pathname.startsWith('/profil') ? <User size={16} /> : 
                 <LayoutDashboard size={16} />}
              </div>
              <ChevronRight size={14} className="text-slate-300" /> 
              <span className="text-slate-700 font-bold capitalize">
                {pathname.split('/')[1]?.replace('-', ' ') || 'Beranda'}
              </span>
            </div>
            {/* Logo Mobile Only */}
            <div className="sm:hidden font-black text-slate-900 tracking-tight text-lg">Amania</div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* 🔥 MESIN PENCARI PINTAR 🔥 */}
            <div className="relative group" ref={searchRef}>
              
              {/* Desktop Search Bar */}
              <div className="hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchEnter}
                  placeholder="Pencarian global..." 
                  className="bg-slate-50 border border-slate-200 rounded-md py-1.5 pl-9 pr-3 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 lg:w-56 focus:lg:w-72 transition-all duration-300 outline-none shadow-inner" 
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                   <span className="text-[9px] font-bold text-slate-300 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">↵</span>
                </div>
              </div>

              {/* Mobile Search Button */}
              <button 
                onClick={() => {
                  setShowMobileSearchInput(!showMobileSearchInput);
                  setTimeout(() => document.getElementById('mobile-search')?.focus(), 100);
                }} 
                className="md:hidden p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 rounded-full transition-colors"
              >
                {showMobileSearchInput ? <X size={18} className="text-slate-600" /> : <Search size={18} />}
              </button>

              {/* Mobile Search Input Overlay */}
              <AnimatePresence>
                {showMobileSearchInput && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 w-[280px] sm:w-[320px] bg-white p-3 rounded-xl shadow-xl border border-slate-200 z-50 md:hidden"
                  >
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500" size={16} />
                      <input 
                        id="mobile-search"
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchEnter}
                        placeholder="Ketik lalu Enter..." 
                        className="w-full bg-slate-50 border border-indigo-200 rounded-lg py-2.5 pl-9 pr-3 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none shadow-inner" 
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DROPDOWN HASIL PENCARIAN */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-[60px] md:top-11 w-[300px] md:w-[340px] bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {isSearching ? 'Mencari...' : 'Hasil Pencarian'}
                      </p>
                      {searchQuery && <p className="text-[11px] font-semibold text-indigo-600 leading-none truncate max-w-[150px]">"{searchQuery}"</p>}
                    </div>
                    
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      
                      {/* 1. HALAMAN SISTEM */}
                      {pageResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <LayoutDashboard size={12}/> Halaman Sistem
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {pageResults.map((page) => {
                              const PageIcon = page.icon;
                              return (
                                <Link 
                                  key={page.id} href={page.link} 
                                  onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group/item"
                                >
                                  <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 group-hover/item:bg-white group-hover/item:shadow-sm border border-transparent group-hover/item:border-slate-200 transition-all">
                                    <PageIcon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-semibold text-slate-700 leading-tight truncate group-hover/item:text-slate-900 transition-colors">{page.title}</h4>
                                  </div>
                                  <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-slate-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* 2. KATALOG PROGRAM / EVENT */}
                      {eventResults.length > 0 && (
                        <div className="p-2 border-t border-slate-100">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                            <MonitorPlay size={12}/> Webinar / Event
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {eventResults.map((event) => (
                              <Link 
                                key={event.id} href={event.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-inner">
                                  <img src={`${STORAGE_URL}/${event.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" alt={event.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-slate-900 leading-tight truncate group-hover/item:text-indigo-600 transition-colors">{event.title}</h4>
                                  <p className="text-[9px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                                    <Calendar size={10} className="text-slate-400 shrink-0"/> {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-indigo-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 3. 🔥 KATALOG E-PRODUK PREMIUM 🔥 */}
                      {eProductResults.length > 0 && (
                        <div className="p-2 border-t border-slate-100">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                            <ShoppingCart size={12}/> E-Produk Premium
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {eProductResults.map((ep) => (
                              <Link 
                                key={ep.id} href={ep.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-inner" style={{ aspectRatio: '2 / 3' }}>
                                  {ep.image ? (
                                    <img src={`${STORAGE_URL}/${ep.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" alt={ep.title} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={20} /></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-slate-900 leading-tight truncate group-hover/item:text-amber-600 transition-colors">{ep.title}</h4>
                                  <p className="text-[9px] font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                    <User size={10} className="text-slate-400 shrink-0"/> <span className="truncate">{ep.author_name}</span> • <span className={`font-bold ${ep.formatted_price === 'Gratis' ? 'text-emerald-500' : 'text-slate-700'}`}>{ep.formatted_price}</span>
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-amber-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 4. ARTIKEL & BERITA */}
                      {articleResults.length > 0 && (
                        <div className="p-2 border-t border-slate-100">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                            <Newspaper size={12}/> Artikel & Berita
                          </p>
                          <div className="mt-1 space-y-0.5">
                            {articleResults.map((article) => (
                              <Link 
                                key={article.id} href={article.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-3.5 p-3 rounded-lg hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-10 h-10 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-inner">
                                  <img src={`${STORAGE_URL}/${article.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" alt={article.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs font-semibold text-slate-900 leading-tight truncate group-hover/item:text-rose-600 transition-colors">{article.title}</h4>
                                  <p className="text-[9px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                                    <User size={10} className="text-slate-400 shrink-0"/> {article.author_name}
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-rose-500 group-hover/item:translate-x-0.5 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAMPILAN LOADING */}
                      {isSearching && eventResults.length === 0 && articleResults.length === 0 && eProductResults.length === 0 && (
                         <div className="p-6 flex items-center justify-center text-slate-400 gap-2">
                           <Loader2 size={16} className="animate-spin text-indigo-500" />
                           <span className="text-[11px] font-medium">Menyinkronkan data...</span>
                         </div>
                      )}

                      {/* TAMPILAN KOSONG */}
                      {!isSearching && pageResults.length === 0 && eventResults.length === 0 && articleResults.length === 0 && eProductResults.length === 0 && (
                        <div className="p-8 flex flex-col items-center justify-center text-center text-slate-400">
                          <Search size={28} className="mb-3 text-slate-300" />
                          <p className="text-xs font-medium text-slate-600">Tidak ada hasil untuk "{searchQuery}"</p>
                          <p className="text-[10px] mt-1 text-slate-500">Coba gunakan kata kunci yang lebih umum.</p>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* NOTIFIKASI BELL */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white translate-x-1/4 -translate-y-1/4">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                    className="absolute right-0 top-12 w-[300px] md:w-[340px] bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pemberitahuan</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Tandai dibaca</button>
                      )}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center text-slate-400">
                          <Bell size={28} className="mb-3 text-slate-300" />
                          <p className="text-xs font-medium">Belum ada notifikasi baru.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isUnread = notif.read_at === null;
                          const status = notif.data?.status; 
                          
                          const Icon = status === 'verified' ? CheckCircle2 : (status === 'rejected' ? AlertCircle : Info);
                          const iconColor = status === 'verified' ? 'text-emerald-500' : (status === 'rejected' ? 'text-rose-500' : 'text-indigo-500');
                          const bgIcon = status === 'verified' ? 'bg-emerald-50' : (status === 'rejected' ? 'bg-rose-50' : 'bg-indigo-50');

                          let targetUrl = notif.data?.url || '/dashboard/ticket';

                          return (
                            <Link 
                              key={notif.id} href={targetUrl} 
                              onClick={() => { if (isUnread) handleMarkAllAsRead(); setShowNotifications(false); }} 
                              className={`flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors relative ${isUnread ? 'bg-indigo-50/30' : ''}`}
                            >
                              {isUnread && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-indigo-500" />}
                              <div className={`w-9 h-9 rounded-full ${bgIcon} ${iconColor} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold text-slate-900 mb-0.5 line-clamp-1">{notif.data?.title || notif.data?.event_name}</p>
                                <p className={`text-[11px] leading-relaxed ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{notif.data?.message}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-2">{formatTimeAgo(notif.created_at)}</p>
                              </div>
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        <div className="flex-1 w-full py-6 md:py-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
            {children}
          </div>
        </div>

        <footer className="bg-white border-t border-slate-200 mt-auto w-full z-10 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-3">
                <img src="/logo-amania.png" alt="Amania" className="h-5 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <span className="text-xs font-bold text-slate-500">© {new Date().getFullYear()} Amania.id</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium text-center md:text-left max-w-xs">
                Platform pembelajaran komprehensif untuk pengembangan karir profesional.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] font-bold text-slate-500">
              <Link href="/kebijakan-privasi" className="hover:text-indigo-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="/syarat-ketentuan" className="hover:text-indigo-600 transition-colors">Syarat & Ketentuan</Link>
              <Link href="/tentang-kami" className="hover:text-indigo-600 transition-colors">Tentang Kami</Link>
              <Link href="/support" className="hover:text-indigo-600 transition-colors">Pusat Bantuan</Link>
            </div>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
      `}</style>
    </div>
  );
}