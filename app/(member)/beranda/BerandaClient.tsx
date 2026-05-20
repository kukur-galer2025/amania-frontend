"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, BookOpen, Trophy,
  Calendar, Receipt, Ticket,
  Sparkles, Newspaper, ChevronRight, Award,
  PlayCircle, Star, ShieldCheck, Users, MessageCircle,
  FileText, Flame, Rocket, ShoppingCart, TrendingUp, CheckCircle, Clock
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

export default function BerandaClient() {
  const [userName, setUserName] = useState("Pembelajar");
  const [events, setEvents] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [eProducts, setEProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName.split(' ')[0]);
    }

    const fetchDashboardData = async () => {
      try {
        const [resEvents, resArticles, resLeaders, resEProducts] = await Promise.all([
          apiFetch('/events?running=1').catch(() => null), // 🔥 Hanya ambil event yang sedang berjalan/akan datang
          apiFetch('/articles').catch(() => null),
          apiFetch('/leaderboard?filter=month').catch(() => null),
          apiFetch('/e-products').catch(() => null)
        ]);

        const evJson = resEvents ? await resEvents.json() : { success: false };
        const arJson = resArticles ? await resArticles.json() : { success: false };
        const ldJson = resLeaders ? await resLeaders.json() : { success: false };
        const epJson = resEProducts ? await resEProducts.json() : { success: false };

        if (evJson.success) setEvents(evJson.data?.slice(0, 3) || []);
        if (arJson.success) setArticles(arJson.data?.slice(0, 3) || []);
        if (ldJson.success) setLeaders(ldJson.data?.slice(0, 3) || []);

        if (epJson.success) {
          const topProducts = [...(epJson.data || [])]
            .sort((a, b) => (parseFloat(b.reviews_avg_rating) || 0) - (parseFloat(a.reviews_avg_rating) || 0))
            .slice(0, 5);
          setEProducts(topProducts);
        }

      } catch (error) {
        console.error("Gagal memuat data beranda", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f8fafc&color=4f46e5&bold=true`;
  };

  const formatRupiah = (price: number) =>
    price === 0 ? 'Gratis'
      : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16 selection:bg-indigo-100 selection:text-indigo-900 w-full overflow-x-hidden min-w-0">

      {/* DECORATIVE BACKGROUND BLOBS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/30 to-purple-200/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[800px] right-1/10 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 to-teal-200/25 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 pb-10 max-w-7xl mx-auto w-full relative z-10">
        <div className="relative w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-900/15 bg-slate-950 border border-slate-900">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
              alt="Learning Collaboration"
              className="w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105"
            />
          </div>
          {/* Neon overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-indigo-950/40" />
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-500/20 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-45 -left-45 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 px-6 py-16 md:py-24 md:px-16 lg:px-20 max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-amber-300 text-xs font-black tracking-wider uppercase mb-6 shadow-xl shrink-0"
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>Pusat Pembelajaran Interaktif Amania</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6"
            >
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 drop-shadow-sm">{userName}! 👋</span><br />
              Siap Kuasai Hal Baru?
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-base md:text-xl text-slate-300 font-medium leading-relaxed mb-10 max-w-2xl"
            >
              Akselerasikan karir digital Anda melalui kurikulum berbasis kebutuhan industri. Ikuti kelas terupdate, dapatkan sertifikat resmi, dan terhubung langsung dengan para mentor ahli.
            </motion.p>

            {/* Quick Stats in Hero */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-4 max-w-lg mb-10 border-t border-white/10 pt-8"
            >
              <div>
                <p className="text-2xl md:text-3xl font-black text-white">5K+</p>
                <p className="text-xs md:text-sm text-slate-400 font-bold">Member Aktif</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-amber-400">4.9★</p>
                <p className="text-xs md:text-sm text-slate-400 font-bold">Ulasan Kelas</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-indigo-400">100%</p>
                <p className="text-xs md:text-sm text-slate-400 font-bold">Portofolio terverivikasi</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full"
            >
              <Link href="/my-events" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black transition-all shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shrink-0">
                <PlayCircle size={20} className="shrink-0" />
                <span>Lanjutkan Belajar</span>
              </Link>
              <Link href="/events" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-2xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 hover:scale-105 shrink-0">
                <span>Eksplorasi Katalog</span>
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. AKTIVITAS & AKSES CEPAT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">

          <Link href="/dashboard/ticket" className="group bg-gradient-to-br from-indigo-700 to-violet-900 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-indigo-900/10 hover:shadow-indigo-500/20 hover:-translate-y-1.5 transition-all duration-300 w-full border border-indigo-600/30">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-[40px] transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center justify-between text-white mb-8 w-full">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                <Ticket size={28} className="text-amber-300" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <ArrowRight size={18} className="text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all shrink-0" />
              </div>
            </div>
            <div className="relative z-10 w-full">
              <h3 className="text-2xl font-black text-white tracking-tight">E-Ticket Kelas</h3>
              <p className="text-sm text-indigo-100 mt-2 font-medium leading-relaxed">Akses QR Code Anda dan masuk ke ruang webinar dengan instan.</p>
            </div>
          </Link>

          <Link href="/transactions" className="group bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl shadow-emerald-900/10 hover:shadow-emerald-500/20 hover:-translate-y-1.5 transition-all duration-300 w-full border border-emerald-500/30">
            <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-[40px] transition-transform duration-500 group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center justify-between text-white mb-8 w-full">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                <Receipt size={28} className="text-emerald-300" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <ArrowRight size={18} className="text-white opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all shrink-0" />
              </div>
            </div>
            <div className="relative z-10 w-full">
              <h3 className="text-2xl font-black text-white tracking-tight">Transaksi & Tagihan</h3>
              <p className="text-sm text-emerald-100 mt-2 font-medium leading-relaxed">Cek invoice, riwayat transaksi, dan status pesanan e-produk Anda.</p>
            </div>
          </Link>

          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-200/80 shadow-xl shadow-slate-100/50 flex flex-col justify-between w-full">
            <div className="flex items-center justify-between mb-5 w-full">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trophy size={20} className="text-amber-500 shrink-0" />
                <span>Leaderboard Bulan Ini</span>
              </h3>
              <Link href="/leaderboard" className="text-xs font-black text-indigo-600 hover:text-indigo-800 shrink-0 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100/50 transition-colors">
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3.5 w-full">
              {leaders.length > 0 ? leaders.map((leader, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl hover:border-indigo-100 border border-transparent transition-all w-full">
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <span className={`text-sm font-black shrink-0 w-6 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-orange-500'}`}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <img src={getAvatarUrl(leader.name)} alt="Avatar" className="w-9 h-9 rounded-full border border-slate-200 shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-800 truncate leading-snug">{leader.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{leader.points || (150 - idx * 15)} Poin</p>
                    </div>
                  </div>
                  {idx === 0 && <Award size={18} className="text-amber-500 shrink-0 ml-2" />}
                </div>
              )) : (
                <div className="text-center py-6 text-xs font-semibold text-slate-400 w-full flex flex-col items-center gap-2">
                  <Trophy className="text-slate-300" size={24} />
                  Belum ada peringkat bulan ini.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. KEUNGGULAN AMANIA */}
      <section className="bg-white border-y border-slate-200/80 py-16 md:py-20 mt-10 w-full relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-2xl mx-auto mb-14 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-xs font-extrabold uppercase tracking-wider mb-4 border border-indigo-100">
              <Sparkles size={12} className="text-indigo-500" />
              <span>Ekosistem Terbaik</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-4 tracking-tight">
              Kenapa Belajar di Amania?
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed">Kami merancang platform belajar IT modern dengan kurikulum adaptif guna memastikan akselerasi karir Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { icon: Star, color: "text-amber-500", bg: "bg-amber-50/80 border-amber-100", title: "Mentor Praktisi", desc: "Belajar langsung dari pakar industri terkemuka dengan sesi interaktif." },
              { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50/80 border-emerald-100", title: "Sertifikat Sah", desc: "Dapatkan e-certificate resmi untuk melengkapi kredibilitas portofolio Anda." },
              { icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50/80 border-blue-100", title: "Akses Rekaman", desc: "Nikmati akses lifetime pemutaran ulang video materi kelas kapan pun." },
              { icon: Users, color: "text-purple-500", bg: "bg-purple-50/80 border-purple-100", title: "Jejaring Luas", desc: "Bergabung ke forum diskusi alumni eksklusif bersama para pegiat IT." },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100/60 rounded-[2.2rem] p-8 text-center hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1.5 transition-all duration-300 w-full group">
                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={28} className="shrink-0" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2.5">{item.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROGRAM UNGGULAN (EVENTS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 w-full relative z-10 min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full">
          <div className="min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 rounded-full text-rose-600 text-xs font-extrabold uppercase tracking-wider mb-4 border border-rose-100">
              <Flame size={12} className="text-rose-500 animate-pulse" />
              <span>Program Sedang Berjalan</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-2.5 tracking-tight flex items-center gap-3">
              <Rocket className="text-rose-500 shrink-0" size={32} />
              Event & Webinar Aktif
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed break-words w-full">Daftar kelas dan webinar yang sedang berlangsung atau segera dimulai. Jangan lewatkan!</p>
          </div>
          <Link href="/events" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-6 py-3.5 rounded-2xl border border-indigo-100 shrink-0 min-w-0 text-sm">
            <span className="truncate">Katalog Event Lengkap</span>
            <ChevronRight size={18} className="shrink-0" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-white border border-slate-200 rounded-[2.5rem] p-3 animate-pulse w-full">
                <div className="w-full h-48 bg-slate-100 rounded-3xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded mx-4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded mx-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
            {events.map((event) => {
              const now = new Date();
              const startTime = new Date(event.start_time);
              const isStarted = now >= startTime;

              // Visual discount helper
              const isFree = event.basic_price === 0;
              const hasPrice = event.basic_price > 0;

              return (
                <Link
                  href={`/events/${event.slug}`} // 🔥 FIX: Gunakan path routing dinamis /events/[slug]
                  key={event.id}
                  className="group bg-white rounded-[2.5rem] border border-slate-200/80 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300 flex flex-col p-3 min-w-0 w-full shadow-md shadow-slate-100/50"
                >

                  <div className="relative w-full bg-slate-100 rounded-[1.8rem] overflow-hidden shrink-0 block" style={{ aspectRatio: '16 / 10' }}>
                    {event.image ? (
                      <img src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50"><BookOpen size={40} className="text-slate-300" /></div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      <span className="bg-slate-950/80 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm max-w-[120px] text-center border border-white/10">
                        {event.tier || 'Masterclass'}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 z-10">
                      {isStarted ? (
                        <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 border border-emerald-400/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>Sedang Berjalan</span>
                        </span>
                      ) : (
                        <span className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 border border-indigo-500/20">
                          <Clock size={12} />
                          <span>Segera Hadir</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between mb-3 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                      <span>Amania Academy</span>
                      {event.venue && <span className="truncate max-w-[60%]">📍 {event.venue}</span>}
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-950 leading-snug mb-5 line-clamp-2 group-hover:text-indigo-600 transition-colors break-words w-full">{event.title}</h3>

                    <div className="mt-auto space-y-4 min-w-0 w-full border-t border-slate-100 pt-4">
                      {/* Date Row */}
                      <div className="flex items-center gap-3 text-sm text-slate-600 font-bold bg-slate-50 px-4 py-3 rounded-xl border border-slate-100/60 min-w-0 w-full">
                        <Calendar size={18} className="text-indigo-500 shrink-0" />
                        <span className="truncate">{new Date(event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>

                      {/* Pricing Row */}
                      <div className="flex items-center justify-between gap-2 px-1">
                        <div className="flex flex-col">
                          {hasPrice && (
                            <span className="text-xs text-slate-400 line-through font-bold">
                              {formatRupiah(event.basic_price * 5)}
                            </span>
                          )}
                          <span className={`text-lg font-black tracking-tight ${isFree ? 'text-emerald-600' : 'text-slate-950'}`}>
                            {formatRupiah(event.basic_price)}
                          </span>
                        </div>
                        {hasPrice && (
                          <span className="bg-red-50 text-red-500 border border-red-100 text-[10px] font-black px-2 py-1 rounded-lg">
                            80% OFF
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-lg shadow-slate-100/30 w-full">
            <div className="w-24 h-24 bg-rose-50 text-rose-300 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-rose-100/30">
              <Calendar size={44} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2.5">Belum Ada Event Aktif</h3>
            <p className="text-slate-500 font-medium max-w-md">Saat ini belum ada kelas atau webinar yang sedang aktif. Kami sedang menyusun agenda baru, silakan kunjungi katalog berkala.</p>
          </div>
        )}
      </section>

      {/* 🔥 5. E-PRODUK TERLARIS 🔥 */}
      <section className="bg-slate-50 border-t border-slate-200/80 py-16 md:py-20 w-full min-w-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-center md:text-left w-full min-w-0">
            <div className="min-w-0 w-full">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-xs font-extrabold uppercase tracking-wider mb-4 border border-indigo-100">
                <TrendingUp size={12} className="text-indigo-500" />
                <span>Terpopuler Pekan Ini</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-2.5 tracking-tight flex items-center gap-3">
                <ShoppingCart className="text-indigo-500 shrink-0" size={32} />
                E-Produk Terpopuler
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed break-words w-full">Koleksi e-book, source-code template, dan aset premium terlaris hasil rancangan kreator andalan.</p>
            </div>
            <Link href="/e-products" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-white hover:bg-slate-50 px-6 py-3.5 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/50 shrink-0 min-w-0 text-sm">
              <span className="truncate">Lihat Semua E-Produk</span>
              <ChevronRight size={18} className="shrink-0" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full min-w-0 pt-2 pb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="relative w-full bg-slate-200 rounded-2xl animate-pulse block" style={{ aspectRatio: '2 / 3' }}></div>
              ))}
            </div>
          ) : eProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 w-full min-w-0">
              {eProducts.map(product => {
                const isFree = product.price === 0;
                const avgRating = parseFloat(product.reviews_avg_rating) || 0;
                const isHot = avgRating >= 4.5 && (product.reviews_count || 0) >= 1;

                return (
                  <Link key={product.id} href={`/e-products/${product.slug}`} className="group flex flex-col h-full w-full min-w-0">

                    <div
                      className="relative w-full bg-slate-100 rounded-2xl md:rounded-[2rem] shadow-md border border-slate-200/80 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 group-hover:-translate-y-2 transition-all duration-300 overflow-hidden mb-3.5 md:mb-4 block"
                      style={{ aspectRatio: '2 / 3' }}
                    >
                      {product.cover_image ? (
                        <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                          <FileText size={48} strokeWidth={1} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-0"></div>

                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {isFree ? (
                          <span className="bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                            Gratis
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                            80% OFF
                          </span>
                        )}
                        {isHot && !isFree && (
                          <span className="bg-amber-500 text-slate-900 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                            <Flame size={10} className="fill-slate-900" /> Hot
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 px-1.5 min-w-0">
                      <p className="text-[10px] md:text-[11px] text-slate-400 font-bold uppercase tracking-wider truncate mb-1 w-full" title={product.author?.name}>
                        {product.author?.name || 'Amania Official'}
                      </p>

                      <h3 className="text-sm md:text-[15px] font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2 break-words w-full" title={product.title}>
                        {product.title}
                      </h3>

                      <div className="mt-auto flex flex-col gap-0.5 w-full min-w-0">
                        {!isFree && (
                          <span className="text-[11px] text-slate-400 line-through font-bold">
                            {formatRupiah(product.price * 5)}
                          </span>
                        )}
                        <div className="flex items-center justify-between gap-2 w-full min-w-0">
                          <p className={`text-base md:text-lg font-black tracking-tight truncate ${isFree ? 'text-emerald-600' : 'text-slate-950'}`}>
                            {formatRupiah(product.price)}
                          </p>

                          {avgRating > 0 && (
                            <div className="flex items-center gap-0.5 shrink-0 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black text-slate-700">{avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-lg shadow-slate-100/30 w-full">
              <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100/30">
                <FileText size={44} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2.5">Belum Ada E-Produk</h3>
              <p className="text-slate-500 font-medium">Aset digital premium sedang disiapkan untuk Anda. Segera kembali!</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. ARTIKEL & JURNAL TERBARU */}
      <section className="bg-white border-t border-slate-200/80 py-16 md:py-20 w-full min-w-0 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-center md:text-left w-full min-w-0">
            <div className="min-w-0 w-full">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 rounded-full text-indigo-600 text-xs font-extrabold uppercase tracking-wider mb-4 border border-indigo-100">
                <Newspaper size={12} className="text-indigo-500" />
                <span>Wawasan Teknologi</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 mb-2.5 tracking-tight flex items-center gap-3">
                <Newspaper className="text-indigo-500 shrink-0" size={32} />
                Jurnal & Wawasan Terkini
              </h2>
              <p className="text-slate-500 font-medium text-sm md:text-base leading-relaxed break-words w-full">Perluas cakrawala pengetahuan Anda dengan artikel inspiratif dan tren programming dari tim editorial Amania.</p>
            </div>
            <Link href="/articles" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors shrink-0 min-w-0 text-sm bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-6 py-3.5 rounded-2xl">
              <span className="truncate">Eksplorasi Jurnal</span>
              <ChevronRight size={18} className="shrink-0" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex flex-col gap-4 animate-pulse w-full">
                  <div className="relative w-full bg-slate-100 rounded-[2rem]" style={{ aspectRatio: '4 / 3' }}></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
              {articles.map((article) => (
                <Link href={`/articles/${article.slug}`} key={article.id} className="group flex flex-col gap-5 min-w-0 w-full">

                  <div
                    className="relative w-full bg-slate-100 rounded-[2.2rem] overflow-hidden border border-slate-200 shadow-md group-hover:shadow-2xl group-hover:shadow-indigo-500/5 group-hover:-translate-y-1.5 transition-all duration-355 shrink-0 block"
                    style={{ aspectRatio: '4 / 3' }}
                  >
                    {article.image ? (
                      <img src={`${STORAGE_URL}/${article.image}`} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-50"><Newspaper size={40} className="text-slate-300" /></div>
                    )}
                  </div>

                  <div className="min-w-0 w-full px-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                      {article.category?.name || 'Edukasi IT'}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-950 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors break-words w-full">{article.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-16 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-inner w-full">
              <div className="w-24 h-24 bg-white text-slate-300 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
                <Newspaper size={44} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2.5">Belum Ada Artikel</h3>
              <p className="text-slate-500 font-medium">Tim redaksi sedang memformulasikan info & tips IT terbaik untuk Anda. Tunggu ya!</p>
            </div>
          )}
        </div>
      </section>

      {/* 7. CTA KOMUNITAS */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 pt-8 max-w-7xl mx-auto w-full min-w-0 relative z-10">
        <div className="bg-slate-950 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-10 border border-slate-900 w-full min-w-0">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 w-85 h-85 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center lg:text-left max-w-2xl space-y-4 min-w-0 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl text-amber-300 text-xs font-black tracking-wider uppercase">
              <Users size={12} className="text-amber-400" />
              <span>Amania Exclusive Community</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight break-words w-full leading-tight">Jangan Belajar Sendirian!<br />Gabung Komunitas Kami.</h2>
            <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed break-words w-full max-w-xl">
              Perluas networking, selesaikan error coding bersama ribuan murid lainnya, dan bertukar wawasan secara realtime di grup diskusi eksklusif member Amania.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full lg:w-auto">
            <Link href="/community" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-400/20 w-full lg:w-auto min-w-0">
              <MessageCircle size={20} className="shrink-0" />
              <span className="truncate">Gabung Komunitas Sekarang</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}