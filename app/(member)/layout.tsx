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
  MonitorPlay
} from 'lucide-react';
import { apiFetch } from '../utils/api'; 

const STATIC_PAGES = [
  { id: 'sp-1', title: 'Beranda / Dashboard', link: '/beranda', icon: Home },
  { id: 'sp-2', title: 'Webinar / Event', link: '/events', icon: MonitorPlay },
  { id: 'sp-2b', title: 'E-Produk Premium', link: '/e-products', icon: ShoppingCart },
  { id: 'sp-3', title: 'Artikel & Jurnal', link: '/articles', icon: Newspaper },
  { id: 'sp-4', title: 'Tiket Aktif', link: '/dashboard/ticket', icon: Ticket },
  { id: 'sp-5', title: 'Event Saya', link: '/my-events', icon: CalendarHeart },
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
    return `https://ui-avatars.com/api/?name=${userData?.name || 'User'}&background=4F46E5&color=fff&bold=true`; 
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setShowSearchDropdown(false);
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
      <Link href={href} className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-white border border-slate-200/50 text-indigo-700 shadow-[0_2px_15px_-3px_rgba(79,70,229,0.1)]' : 'border border-transparent text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'}`}>
        <div className="flex items-center gap-3.5 relative z-10">
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-400 transition-colors'} />
          <span className={`text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'} transition-colors`}>{label}</span>
        </div>
        {isActive && <motion.div layoutId="activeNav" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
      </Link>
    );
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-800 flex font-sans relative w-full overflow-hidden">
      
      {/* Abstract Ambient Orbs - Membuat BG tidak polos */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/40 blur-[100px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-50/40 blur-[80px] pointer-events-none z-0"></div>

      {/* OVERLAY ANIMASI LOGOUT FULL SCREEN */}
      <AnimatePresence>
        {logoutState.isLoggingOut && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] bg-white/60 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="bg-white/90 p-10 md:p-14 rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] border border-white flex flex-col items-center text-center max-w-sm w-full relative overflow-hidden backdrop-blur-md"
            >
              <div className={`absolute top-0 w-full h-2 ${logoutState.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-15 ${logoutState.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner ${logoutState.type === 'success' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
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
              
              <div className="flex items-center gap-3 text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest">
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
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - GLASSMORPHISM */}
      <aside className={`fixed top-0 left-0 h-screen w-[270px] bg-white/70 backdrop-blur-2xl border-r border-white/60 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-[4px_0_24px_rgba(0,0,0,0.05)]' : '-translate-x-full'}`}>
        <div className="h-[72px] px-8 flex items-center justify-between border-b border-slate-200/40 shrink-0 bg-transparent">
          <Link href="/beranda" className="flex items-center gap-3 group">
             <img src="/logo-amania.png" alt="Logo Amania" className="h-8 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
             <span className="text-[22px] font-black tracking-tight text-slate-900 mt-1">Amania</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 lg:hidden text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors">
             <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-8 pb-8">
          <div className="px-5 mb-10">
            {userData ? (
              <Link href="/profil" className="block p-5 bg-white/80 border border-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center group hover:border-indigo-100 hover:shadow-[0_8px_30px_rgba(79,70,229,0.08)] transition-all duration-300">
                <div className="relative mb-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 border-[3px] border-white shadow-md ring-2 ring-slate-100 group-hover:ring-indigo-300 transition-all duration-300">
                     <img src={getAvatarSource()} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="w-full min-w-0">
                  <h4 className="text-[15px] font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{userData.name}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest truncate mt-1">{userData.role}</p>
                </div>
                <div className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-50/80 rounded-xl text-[11px] font-bold text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-all border border-slate-100 group-hover:border-indigo-100 shadow-sm">
                  <Settings2 size={14} /> Kelola Profil
                </div>
              </Link>
            ) : (
              <div className="p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-[0_12px_40px_-10px_rgba(30,27,75,0.4)] text-center relative overflow-hidden group border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-indigo-500/30"></div>
                <Sparkles size={26} className="text-indigo-300 mx-auto mb-3 drop-shadow-sm" />
                <h4 className="text-sm font-bold text-white mb-1.5 tracking-wide">Mode Tamu</h4>
                <p className="text-[11px] text-slate-300 mb-6 leading-relaxed px-1 font-medium">Masuk untuk menikmati akses penuh Amania.</p> 
                <Link href="/login" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:shadow-lg transition-all duration-300">
                  <LogIn size={15} /> Masuk / Daftar
                </Link>
              </div>
            )}
          </div>

          <nav className="px-4 space-y-8 flex-1">
            <div>
              <p className="px-3.5 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Navigasi Utama</p>
              <div className="space-y-1">
                <NavLink icon={Home} label="Beranda" href="/beranda" />
                <NavLink icon={MonitorPlay} label="Webinar / Event" href="/events" />
                <NavLink icon={ShoppingCart} label="E-Produk Premium" href="/e-products" />
                <NavLink icon={Newspaper} label="Artikel & Jurnal" href="/articles" />
              </div>
            </div>

            <div>
              <p className="px-3.5 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Ruang Pembelajaran</p>
              <div className="space-y-1">
                {userData && <NavLink icon={Ticket} label="Tiket Aktif" href="/dashboard/ticket" />}
                <NavLink icon={CalendarHeart} label="Event Saya" href="/my-events" />
                {userData && <NavLink icon={FileText} label="Koleksi E-Produk" href="/my-e-products" />}
                <NavLink icon={Award} label="Sertifikat Kelulusan" href="/certificates" />
                <NavLink icon={Calendar} label="Kalender" href="/calendar" />
                <NavLink icon={Receipt} label="Riwayat Transaksi" href="/transactions" />
              </div>
            </div>

            <div>
              <p className="px-3.5 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Reputasi & Jaringan</p>
              <div className="space-y-1">
                <NavLink icon={Trophy} label="Papan Peringkat" href="/leaderboard" />
                <NavLink icon={MessageSquare} label="Komunitas" href="/community" />
              </div>
            </div>

            <div>
              <p className="px-3.5 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Pusat Informasi</p>
              <div className="space-y-1">
                <NavLink icon={Info} label="Tentang Amania" href="/tentang-kami" />
                <NavLink icon={HelpCircle} label="Pusat Bantuan & FAQ" href="/support" />
              </div>
            </div>
          </nav>

          {userData && (
            <div className="px-5 mt-10 pb-4">
              <button onClick={() => handleLogout('manual')} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors group border border-transparent hover:border-rose-100">
                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold tracking-wide">Keluar Akun</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-[270px] w-full min-h-screen flex flex-col relative z-10">
        
        {/* Header Bar Responsif - Glassmorphism */}
        <header className="h-[72px] bg-white/60 backdrop-blur-2xl border-b border-white/60 flex items-center justify-between px-5 md:px-10 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 lg:hidden text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
              <Menu size={22} />
            </button>
            
            <div className="hidden sm:flex items-center gap-2.5 text-sm">
              <div className="text-slate-400">
                {pathname === '/beranda' ? <Home size={18} /> : 
                 pathname.startsWith('/tentang-kami') ? <Info size={18} /> : 
                 pathname.startsWith('/profil') ? <User size={18} /> : 
                 <LayoutDashboard size={18} />}
              </div>
              <ChevronRight size={14} className="text-slate-300" /> 
              <span className="text-slate-800 font-bold capitalize tracking-wide">
                {pathname.split('/')[1]?.replace('-', ' ') || 'Beranda'}
              </span>
            </div>
            {/* Logo Mobile Only */}
            <div className="sm:hidden font-black text-slate-900 tracking-tight text-xl">Amania</div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            {/* MESIN PENCARI PINTAR */}
            <div className="relative group" ref={searchRef}>
              
              <div className="hidden md:block">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchEnter}
                  placeholder="Pencarian global..." 
                  className="bg-white/80 border border-slate-200/60 rounded-full py-2 pl-10 pr-4 text-[13px] text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 w-52 lg:w-64 focus:lg:w-80 transition-all duration-300 outline-none shadow-sm placeholder-slate-400" 
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                   <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">↵</span>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowMobileSearchInput(!showMobileSearchInput);
                  setTimeout(() => document.getElementById('mobile-search')?.focus(), 100);
                }} 
                className="md:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-full transition-all"
              >
                {showMobileSearchInput ? <X size={20} className="text-slate-800" /> : <Search size={20} />}
              </button>

              {/* Mobile Search Input Overlay */}
              <AnimatePresence>
                {showMobileSearchInput && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-14 w-[290px] sm:w-[340px] bg-white/95 backdrop-blur-xl p-3.5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 z-50 md:hidden"
                  >
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                      <input 
                        id="mobile-search"
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchEnter}
                        placeholder="Ketik lalu Enter..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-[13px] text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-400 outline-none placeholder-slate-400 shadow-inner" 
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
                    className="absolute right-0 top-[65px] md:top-[50px] w-[320px] md:w-[380px] bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {isSearching ? 'Mencari...' : 'Hasil Pencarian'}
                      </p>
                      {searchQuery && <p className="text-[11px] font-semibold text-indigo-600 leading-none truncate max-w-[150px]">"{searchQuery}"</p>}
                    </div>
                    
                    <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      
                      {pageResults.length > 0 && (
                        <div className="p-2.5">
                          <p className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <LayoutDashboard size={12}/> Halaman Sistem
                          </p>
                          <div className="mt-1 space-y-1">
                            {pageResults.map((page) => {
                              const PageIcon = page.icon;
                              return (
                                <Link 
                                  key={page.id} href={page.link} 
                                  onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group/item"
                                >
                                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 group-hover/item:bg-white group-hover/item:shadow-sm border border-transparent group-hover/item:border-slate-200 transition-all">
                                    <PageIcon size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[13px] font-bold text-slate-700 leading-tight truncate group-hover/item:text-slate-900 transition-colors">{page.title}</h4>
                                  </div>
                                  <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-slate-400 group-hover/item:translate-x-1 transition-all shrink-0" />
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {eventResults.length > 0 && (
                        <div className="p-2.5 border-t border-slate-50">
                          <p className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                            <MonitorPlay size={12}/> Webinar / Event
                          </p>
                          <div className="mt-1 space-y-1">
                            {eventResults.map((event) => (
                              <Link 
                                key={event.id} href={event.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                                  <img src={`${STORAGE_URL}/${event.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" alt={event.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate group-hover/item:text-indigo-600 transition-colors">{event.title}</h4>
                                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 mt-1.5">
                                    <Calendar size={12} className="text-slate-400 shrink-0"/> {new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-indigo-500 group-hover/item:translate-x-1 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {eProductResults.length > 0 && (
                        <div className="p-2.5 border-t border-slate-50">
                          <p className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                            <ShoppingCart size={12}/> E-Produk Premium
                          </p>
                          <div className="mt-1 space-y-1">
                            {eProductResults.map((ep) => (
                              <Link 
                                key={ep.id} href={ep.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm" style={{ aspectRatio: '2 / 3' }}>
                                  {ep.image ? (
                                    <img src={`${STORAGE_URL}/${ep.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" alt={ep.title} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><FileText size={20} /></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate group-hover/item:text-slate-700 transition-colors">{ep.title}</h4>
                                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 mt-1.5">
                                    <User size={12} className="text-slate-400 shrink-0"/> <span className="truncate">{ep.author_name}</span> • <span className={`font-bold ${ep.formatted_price === 'Gratis' ? 'text-emerald-600' : 'text-slate-800'}`}>{ep.formatted_price}</span>
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-slate-500 group-hover/item:translate-x-1 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {articleResults.length > 0 && (
                        <div className="p-2.5 border-t border-slate-50">
                          <p className="px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Newspaper size={12}/> Artikel & Berita
                          </p>
                          <div className="mt-1 space-y-1">
                            {articleResults.map((article) => (
                              <Link 
                                key={article.id} href={article.link} 
                                onClick={() => { setShowSearchDropdown(false); setShowMobileSearchInput(false); setSearchQuery(''); }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item"
                              >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-sm">
                                  <img src={`${STORAGE_URL}/${article.image}`} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" alt={article.title} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-[13px] font-bold text-slate-900 leading-tight truncate group-hover/item:text-slate-600 transition-colors">{article.title}</h4>
                                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 mt-1.5">
                                    <User size={12} className="text-slate-400 shrink-0"/> {article.author_name}
                                  </p>
                                </div>
                                <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover/item:opacity-100 group-hover/item:text-slate-500 group-hover/item:translate-x-1 transition-all shrink-0" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {isSearching && eventResults.length === 0 && articleResults.length === 0 && eProductResults.length === 0 && (
                         <div className="p-8 flex items-center justify-center text-slate-500 gap-3">
                           <Loader2 size={18} className="animate-spin text-indigo-500" />
                           <span className="text-xs font-semibold tracking-wide">Menyinkronkan data...</span>
                         </div>
                      )}

                      {!isSearching && pageResults.length === 0 && eventResults.length === 0 && articleResults.length === 0 && eProductResults.length === 0 && (
                        <div className="p-10 flex flex-col items-center justify-center text-center text-slate-400">
                          <Search size={32} className="mb-4 text-slate-300" />
                          <p className="text-[13px] font-bold text-slate-500 tracking-wide">Tidak ada hasil untuk "{searchQuery}"</p>
                          <p className="text-[11px] mt-1.5 text-slate-400">Coba gunakan kata kunci yang lebih umum.</p>
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
                className={`relative p-2.5 rounded-xl transition-all duration-300 ${showNotifications ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:text-slate-800 hover:bg-white hover:shadow-sm'}`}
              >
                <Bell size={20} strokeWidth={showNotifications ? 2.5 : 2} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4.5 h-4.5 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-[2px] border-white translate-x-1/4 -translate-y-1/4 shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                    className="absolute right-0 top-[55px] w-[320px] md:w-[380px] bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_30px_80px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Pemberitahuan</h3>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Tandai dibaca</button>
                      )}
                    </div>
                    
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-center text-slate-400">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                            <Bell size={20} className="text-slate-300" />
                          </div>
                          <p className="text-[13px] font-bold text-slate-500">Belum ada notifikasi baru.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isUnread = notif.read_at === null;
                          const status = notif.data?.status; 
                          
                          const Icon = status === 'verified' ? CheckCircle2 : (status === 'rejected' ? AlertCircle : Info);
                          const iconColor = status === 'verified' ? 'text-emerald-500' : (status === 'rejected' ? 'text-rose-500' : 'text-slate-600');
                          const bgIcon = status === 'verified' ? 'bg-emerald-50 border-emerald-100' : (status === 'rejected' ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-200');

                          let targetUrl = notif.data?.url || '/dashboard/ticket';

                          return (
                            <Link 
                              key={notif.id} href={targetUrl} 
                              onClick={() => { if (isUnread) handleMarkAllAsRead(); setShowNotifications(false); }} 
                              className={`flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors relative ${isUnread ? 'bg-indigo-50/30' : ''}`}
                            >
                              {isUnread && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-full bg-indigo-500" />}
                              <div className={`w-10 h-10 rounded-full border ${bgIcon} ${iconColor} flex items-center justify-center shrink-0`}><Icon size={18} /></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 mb-1 line-clamp-1">{notif.data?.title || notif.data?.event_name}</p>
                                <p className={`text-[12px] leading-relaxed ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{notif.data?.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-2.5 uppercase tracking-wide">{formatTimeAgo(notif.created_at)}</p>
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

        <div className="flex-1 w-full py-8 md:py-10">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 w-full relative z-10">
            {children}
          </div>
        </div>

        <footer className="bg-white/50 backdrop-blur-md border-t border-slate-200/50 mt-auto w-full z-10 relative">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-3.5">
              <div className="flex items-center gap-3">
                <img src="/logo-amania.png" alt="Amania" className="h-6 w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">© {new Date().getFullYear()} Amania.id</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium text-center md:text-left max-w-sm leading-relaxed">
                Platform pembelajaran komprehensif untuk pengembangan karir profesional.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[12px] font-bold text-slate-500">
              <Link href="/kebijakan-privasi" className="hover:text-indigo-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="/syarat-ketentuan" className="hover:text-indigo-600 transition-colors">Syarat & Ketentuan</Link>
              <Link href="/tentang-kami" className="hover:text-indigo-600 transition-colors">Tentang Kami</Link>
              <Link href="/support" className="hover:text-indigo-600 transition-colors">Pusat Bantuan</Link>
            </div>
          </div>
        </footer>
      </main>

      {/* ════════ 🔥 FLOATING WHATSAPP BUTTON (LUXURY EMERALD) 🔥 ════════ */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[99]"
      >
        <Link 
          href="https://wa.me/628985477864" 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative block group"
        >
          {/* Efek Aura Glowing Luar */}
          <div className="absolute inset-0 bg-[#25D366] rounded-full blur-xl opacity-20 group-hover:opacity-50 group-hover:scale-150 transition-all duration-500"></div>
          
          {/* Tombol Utama */}
          <motion.div 
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white rounded-full shadow-[0_10px_25px_-5px_rgba(37,211,102,0.5)] border border-white/20 overflow-hidden active:scale-95 transition-transform"
          >
            {/* Kilauan (Shimmer) Efek Luxury */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
            
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16" className="drop-shadow-md">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
            </svg>
          </motion.div>

          {/* Label Tooltip Melayang */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0 hidden sm:block">
            <div className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1)] whitespace-nowrap border border-slate-200">
              Hubungi Amania
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-white/90 backdrop-blur-md"></div>
            </div>
          </div>
        </Link>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}