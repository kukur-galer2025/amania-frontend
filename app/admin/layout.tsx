"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Rocket, Users, FileText, 
  LogOut, Bell, Tag, ChevronRight, Search,
  UserCog, Ticket, CreditCard, FileSpreadsheet,
  CheckCircle2, AlertCircle, Loader2, ArrowRight, Newspaper, Menu, X, ShoppingCart, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 
import "../globals.css";

const ADMIN_PAGES = [
  { id: 'p1', title: 'Overview Dashboard', link: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'p2', title: 'Kelola Event & Program', link: '/admin/events', icon: Rocket },
  { id: 'p3', title: 'Data Pendaftar / Peserta', link: '/admin/registrations', icon: Users },
  { id: 'p4', title: 'Kelola Tiket (Scanner)', link: '/admin/tickets', icon: Ticket },
  { id: 'p5', title: 'Transaksi Keuangan', link: '/admin/transactions', icon: CreditCard },
  { id: 'p6', title: 'Eksport Laporan (PDF)', link: '/admin/reports', icon: FileSpreadsheet },
  { id: 'p7', title: 'Kategori Artikel', link: '/admin/article-categories', icon: Tag },
  { id: 'p8', title: 'Semua Artikel', link: '/admin/articles', icon: FileText },
  { id: 'p9a', title: 'Kategori E-Produk', link: '/admin/e-product-categories', icon: Layers }, // 🔥 BARU
  { id: 'p9b', title: 'Kelola E-Produk Premium', link: '/admin/e-products', icon: ShoppingCart },
  { id: 'p10', title: 'Kelola User', link: '/admin/users', icon: UserCog },
];

const BOTTOM_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: Rocket,          label: 'Event',     href: '/admin/events' },
  { icon: CreditCard,      label: 'Transaksi', href: '/admin/transactions' },
  { icon: ShoppingCart,    label: 'E-Produk',  href: '/admin/e-products' },
  { icon: Menu,            label: 'Menu',      href: '__MENU__' }, 
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  
  const [adminName,        setAdminName]        = useState('Super Admin');
  const [adminRole,        setAdminRole]        = useState('superadmin'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthorized,     setIsAuthorized]     = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications,     setNotifications]     = useState<any[]>([]);
  const [unreadCount,       setUnreadCount]       = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  const [searchQuery,            setSearchQuery]            = useState('');
  const [isSearching,            setIsSearching]            = useState(false);
  const [showSearchDropdown,     setShowSearchDropdown]     = useState(false);
  const [showMobileSearchInput, setShowMobileSearchInput] = useState(false); 
  const [pageResults,    setPageResults]    = useState<any[]>([]);
  const [userResults,    setUserResults]    = useState<any[]>([]);
  const [eventResults,   setEventResults]   = useState<any[]>([]);
  const [regResults,     setRegResults]     = useState<any[]>([]);
  const [articleResults, setArticleResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token   = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) { router.replace('/login'); return; }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'superadmin' && user.role !== 'organizer') { router.replace('/beranda'); return; }
      setAdminName(user.name);
      setAdminRole(user.role);
      setIsAuthorized(true);
      fetchAdminNotifications();
      const interval = setInterval(fetchAdminNotifications, 30000);
      return () => clearInterval(interval);
    } catch { localStorage.clear(); router.replace('/login'); }
  }, [router]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false); setShowMobileSearchInput(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); setShowMobileSearchInput(false); }, [pathname]);

  const fetchAdminNotifications = async () => {
    try {
      const res  = await apiFetch('/admin/notifications');
      const json = await res.json();
      if (res.ok && json.success) { setNotifications(json.notifications); setUnreadCount(json.unread_count); }
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try { setUnreadCount(0); await apiFetch('/admin/notifications/read', { method: 'POST' }); fetchAdminNotifications(); } catch {}
  };

  const formatTimeAgo = (dateString: string) => {
    const date    = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)  return 'Baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)  return `${minutes}m lalu`;
    const hours   = Math.floor(minutes / 60);
    if (hours   < 24)  return `${hours}j lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowSearchDropdown(false);
      setPageResults([]); setUserResults([]); setEventResults([]); setRegResults([]); setArticleResults([]);
      return;
    }
    setShowSearchDropdown(true); setIsSearching(true);
    const timer = setTimeout(async () => {
      const q = searchQuery.toLowerCase();
      let pages = ADMIN_PAGES;
      // Sembunyikan menu Super Admin dari Organizer
      if (adminRole !== 'superadmin') pages = pages.filter(p => !['/admin/users', '/admin/e-products', '/admin/e-product-categories'].includes(p.link));
      setPageResults(pages.filter(p => p.title.toLowerCase().includes(q)).slice(0, 3));
      try {
        const res  = await apiFetch(`/admin/global-search?q=${encodeURIComponent(searchQuery)}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setUserResults(json.users || []); setEventResults(json.events || []);
          setRegResults(json.registrations || []); setArticleResults(json.articles || []);
        }
      } catch { setUserResults([]); setEventResults([]); setRegResults([]); setArticleResults([]); }
      finally  { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, adminRole]);

  const handleGlobalSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/admin/registrations?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); setShowSearchDropdown(false); setShowMobileSearchInput(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  const NavItem = ({ icon: Icon, label, href }: { icon: any; label: string; href: string }) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/admin');
    return (
      <Link href={href} onClick={handleMenuClick} className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}>
        <div className="flex items-center gap-3">
          <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} />
          <span className={`text-sm font-bold leading-none ${isActive ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
        </div>
        {isActive && <motion.div layoutId="activeAdminPill" className="w-1.5 h-4 rounded-full bg-white/30" />}
      </Link>
    );
  };

  if (!isAuthorized) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 size={32} className="text-indigo-600 animate-spin" />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memverifikasi Akses Sistem...</p>
    </div>
  );

  const pageTitle = pathname === '/admin/dashboard'
    ? 'Overview'
    : pathname.split('/').filter(p => p !== 'admin' && p !== '').join(' / ').replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans overflow-x-hidden">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100
        flex flex-col z-50 shadow-sm overflow-hidden
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="px-6 pt-6 pb-5 flex items-center justify-between flex-shrink-0 border-b border-slate-100">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
              <img src="/logo-amania.png" alt="Amania" className="w-full h-full object-contain p-1" />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900 leading-none">Amania</p>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                {adminRole === 'superadmin' ? 'Super Admin Panel' : 'Organizer Panel'}
              </p>
            </div>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 lg:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <nav className="px-3 py-4 space-y-5">
            <div>
              <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Dashboard</p>
              <div className="space-y-0.5"><NavItem icon={LayoutDashboard} label="Overview" href="/admin/dashboard" /></div>
            </div>

            <div>
              <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Program Utama</p>
              <div className="space-y-0.5">
                <NavItem icon={Rocket} label="Kelola Event" href="/admin/events" />
                <NavItem icon={Users} label="Pendaftar" href="/admin/registrations" />
              </div>
            </div>

            <div>
              <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Transaksi</p>
              <div className="space-y-0.5">
                <NavItem icon={Ticket} label="Kelola Tiket" href="/admin/tickets" />
                <NavItem icon={CreditCard} label="Kelola Transaksi" href="/admin/transactions" />
              </div>
            </div>

            <div>
              <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Laporan</p>
              <div className="space-y-0.5"><NavItem icon={FileSpreadsheet} label="Eksport Laporan" href="/admin/reports" /></div>
            </div>

            <div>
              <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Konten Publik</p>
              <div className="space-y-0.5">
                <NavItem icon={Tag}      label="Kategori Artikel" href="/admin/article-categories" />
                <NavItem icon={FileText} label="Semua Artikel"    href="/admin/articles" />
              </div>
            </div>

            {adminRole === 'superadmin' && (
              <>
                <div>
                  <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">Katalog Digital</p>
                  <div className="space-y-0.5">
                    {/* 🔥 MENU BARU DITAMBAHKAN DI SINI 🔥 */}
                    <NavItem icon={Layers} label="Kategori E-Produk" href="/admin/e-product-categories" />
                    <NavItem icon={ShoppingCart} label="Kelola E-Produk" href="/admin/e-products" />
                  </div>
                </div>
                <div>
                  <p className="px-4 mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Pengaturan</p>
                  <div className="space-y-0.5"><NavItem icon={UserCog} label="Kelola User" href="/admin/users" /></div>
                </div>
              </>
            )}
          </nav>
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-slate-50 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm flex-shrink-0">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 leading-tight truncate">{adminName}</p>
              <p className="text-[10px] font-semibold text-indigo-500 mt-0.5">
                {adminRole === 'superadmin' ? 'Super Admin' : 'Organizer'}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all group">
            <LogOut size={17} className="group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
            <span className="text-sm font-bold">Keluar Sistem</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 w-full min-h-screen flex flex-col">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 lg:hidden text-slate-500 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"><Menu size={20} /></button>
            <div className="hidden sm:flex bg-slate-100 p-1.5 rounded-lg text-slate-400 flex-shrink-0"><LayoutDashboard size={15} /></div>
            <ChevronRight size={13} className="text-slate-300 hidden sm:block flex-shrink-0" />
            <span className="text-slate-800 font-bold text-sm capitalize truncate">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="relative" ref={searchRef}>
              <div className="hidden lg:block relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={15} />
                <input
                  type="text" value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleGlobalSearchEnter}
                  placeholder="Cari peserta, event, artikel..."
                  className="bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-8 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 w-64 xl:w-72 transition-all outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-300 bg-slate-100 border border-slate-200 px-1 py-0.5 rounded pointer-events-none">↵</span>
              </div>
              <button
                onClick={() => { setShowMobileSearchInput(p => !p); setTimeout(() => document.getElementById('mobile-search')?.focus(), 80); }}
                className="lg:hidden p-2 text-slate-500 hover:text-indigo-500 hover:bg-slate-100 rounded-xl transition-colors">
                {showMobileSearchInput ? <X size={18} /> : <Search size={18} />}
              </button>

              <AnimatePresence>
                {showMobileSearchInput && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-12 w-72 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 z-50 lg:hidden">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input id="mobile-search" type="text" value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={handleGlobalSearchEnter}
                        placeholder="Ketik lalu tekan Enter..."
                        className="w-full bg-slate-50 border border-indigo-200 rounded-xl py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400" />
                    </div>
                  </motion.div>
                )}

                {showSearchDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 lg:left-0 lg:right-auto top-12 w-80 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                    <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center gap-2">
                      {isSearching ? <Loader2 size={12} className="animate-spin text-indigo-500" /> : <Search size={12} className="text-slate-400" />}
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isSearching ? 'Mencari...' : 'Hasil Pencarian'}</p>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      {pageResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><LayoutDashboard size={11}/> Menu Admin</p>
                          {pageResults.map(page => (
                            <Link key={page.id} href={page.link}
                              onClick={() => { 
                                setShowSearchDropdown(false); setSearchQuery(''); setShowMobileSearchInput(false);
                              }}
                              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50 transition-colors group/sr">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0 group-hover/sr:bg-indigo-100 group-hover/sr:text-indigo-600 transition-colors"><page.icon size={15} /></div>
                              <p className="flex-1 text-xs font-semibold text-slate-700 group-hover/sr:text-indigo-700 transition-colors truncate">{page.title}</p>
                              <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover/sr:opacity-100 transition-all flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {eventResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5"><Rocket size={11}/> Event</p>
                          {eventResults.map(ev => (
                            <Link key={ev.id} href={ev.link}
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); setShowMobileSearchInput(false); }}
                              className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl group/sr">
                              <p className="text-xs font-semibold text-slate-800 truncate">{ev.title}</p>
                              <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover/sr:opacity-100 transition-all flex-shrink-0 ml-2" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {articleResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5"><Newspaper size={11}/> Artikel</p>
                          {articleResults.map(art => (
                            <Link key={art.id} href={art.link}
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); setShowMobileSearchInput(false); }}
                              className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl group/sr">
                              <p className="text-xs font-semibold text-slate-800 truncate">{art.title}</p>
                              <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover/sr:opacity-100 transition-all flex-shrink-0 ml-2" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {regResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5"><Ticket size={11}/> Tiket / Transaksi</p>
                          {regResults.map(reg => (
                            <Link key={reg.id} href={reg.link}
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); setShowMobileSearchInput(false); }}
                              className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl group/sr">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-800 truncate">{reg.name}</p>
                                <p className="text-[10px] text-slate-500">{reg.ticket_code}</p>
                              </div>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold ml-2 flex-shrink-0 ${reg.status === 'verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{reg.status}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                      {userResults.length > 0 && (
                        <div className="p-2">
                          <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5"><Users size={11}/> Pengguna</p>
                          {userResults.map(user => (
                            <Link key={user.id} href={user.link}
                              onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); setShowMobileSearchInput(false); }}
                              className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-xl group/sr">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                              </div>
                              <ArrowRight size={13} className="text-slate-300 opacity-0 group-hover/sr:opacity-100 transition-all flex-shrink-0 ml-2" />
                            </Link>
                          ))}
                        </div>
                      )}
                      {!isSearching && pageResults.length === 0 && eventResults.length === 0 && articleResults.length === 0 && regResults.length === 0 && userResults.length === 0 && (
                        <div className="p-8 text-center">
                          <Search size={24} className="mx-auto mb-3 text-slate-200" />
                          <p className="text-xs font-semibold text-slate-400">Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={notifRef}>
              <button onClick={() => setShowNotifications(p => !p)}
                className={`relative p-2 rounded-xl border transition-all ${showNotifications ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200'}`}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-rose-500 text-white text-[9px] font-bold rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    className="absolute right-0 top-12 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Pemberitahuan</h3>
                      {unreadCount > 0 && <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">Tandai dibaca</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={26} className="mx-auto mb-3 text-slate-200" />
                          <p className="text-xs font-semibold text-slate-400">Belum ada aktivitas baru.</p>
                        </div>
                      ) : (
                        notifications.map(notif => {
                          const isUnread  = notif.read_at === null;
                          const isPending = notif.data?.status === 'pending';
                          const Icon      = isPending ? AlertCircle : CheckCircle2;
                          return (
                            <Link key={notif.id} href={notif.data?.url || '#'}
                              onClick={() => { if (isUnread) handleMarkAllAsRead(); setShowNotifications(false); }}
                              className={`flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors ${isUnread ? 'bg-indigo-50/40' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isPending ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                <Icon size={15} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 mb-0.5 truncate">{notif.data?.title}</p>
                                <p className={`text-[11px] leading-relaxed ${isUnread ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{notif.data?.message}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1.5">{formatTimeAgo(notif.created_at)}</p>
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

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none">{adminName}</p>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">
                  {adminRole === 'superadmin' ? 'Super Admin' : 'Organizer'}
                </p>
              </div>
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-black text-sm shadow-sm">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
            </div>

          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 pb-24 lg:pb-8">
          {children}
        </div>

      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden">
        <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 px-2 pb-safe">
          <div className="flex items-center justify-around">
            {BOTTOM_NAV.map(({ icon: Icon, label, href }) => {
              if (href === '__MENU__') {
                return (
                  <button key="menu" onClick={() => setIsMobileMenuOpen(true)}
                    className="flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 text-slate-400 transition-colors active:scale-95">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Menu size={20} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold leading-none">{label}</span>
                  </button>
                );
              }
              const isActive = pathname === href || (pathname.startsWith(href) && href !== '/admin');
              return (
                <Link key={href} href={href}
                  className={`flex flex-col items-center gap-1 py-3 px-3 min-w-0 flex-1 transition-all active:scale-95 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isActive ? 'bg-indigo-100' : ''}`}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-bold leading-none ${isActive ? 'text-indigo-600' : ''}`}>{label}</span>
                  {isActive && (
                    <motion.span layoutId="bottomNavDot" className="w-1 h-1 rounded-full bg-indigo-500 mt-0.5" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 8px); }
      `}</style>
    </div>
  );
}