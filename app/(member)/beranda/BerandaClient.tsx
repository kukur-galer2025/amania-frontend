"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, BookOpen, Trophy, 
  Calendar, Receipt, Ticket, 
  Sparkles, Newspaper, ChevronRight, Award,
  PlayCircle, Star, ShieldCheck, Users, MessageCircle
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function BerandaClient() {
  const [userName, setUserName] = useState("Pembelajar");
  const [events, setEvents] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName.split(' ')[0]); 
    }

    const fetchDashboardData = async () => {
      try {
        // 🔥 MENGGUNAKAN APIFETCH (Token sudah otomatis dikirim) 🔥
        const [resEvents, resArticles, resLeaders] = await Promise.all([
          apiFetch('/events'),
          apiFetch('/articles'),
          apiFetch('/leaderboard?filter=month').catch(() => null) 
        ]);

        const evJson = await resEvents.json();
        const arJson = await resArticles.json();
        const ldJson = resLeaders ? await resLeaders.json() : { data: [] };

        if (evJson.success) setEvents(evJson.data.slice(0, 3)); 
        if (arJson.success) setArticles(arJson.data.slice(0, 3)); 
        if (ldJson?.success) setLeaders(ldJson.data.slice(0, 3)); 

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-12 selection:bg-indigo-100 selection:text-indigo-900 w-full overflow-x-hidden min-w-0">
      
      {/* 1. HERO SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 pb-12 max-w-7xl mx-auto w-full min-w-0">
        <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-900/20 bg-slate-900 min-w-0">
          
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
              alt="Learning Collaboration" 
              className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-800/80 to-purple-900/40" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/30 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 px-6 py-16 md:py-24 md:px-16 max-w-3xl w-full min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-indigo-100 text-xs font-bold tracking-widest uppercase mb-6 shadow-sm shrink-0">
              <Sparkles size={14} className="text-amber-300 shrink-0" /> <span className="truncate">Pusat Pembelajaran</span>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6 break-words w-full">
              Halo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">{userName}! 👋</span><br/>
              Siap belajar hal baru?
            </motion.h1>
            
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-indigo-100/90 font-medium leading-relaxed mb-10 max-w-2xl break-words w-full">
              Eksplorasi kelas terbaru, tingkatkan wawasan melalui jurnal kami, dan pantau seluruh aktivitas belajar Anda di portal interaktif Amania.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center gap-4 w-full min-w-0">
              <Link href="/my-events" className="w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-black transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shrink-0 min-w-0">
                <PlayCircle size={20} className="shrink-0" /> <span className="truncate">Lanjutkan Belajar</span>
              </Link>
              <Link href="/events" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 min-w-0">
                <span className="truncate">Eksplorasi Katalog</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. AKTIVITAS & AKSES CEPAT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full min-w-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full min-w-0">
          <Link href="/dashboard/ticket" className="group bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all min-w-0 w-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] transition-transform group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center justify-between text-white mb-6 w-full min-w-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Ticket size={24} />
              </div>
              <ArrowRight size={24} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all shrink-0" />
            </div>
            <div className="relative z-10 w-full min-w-0">
              <h3 className="text-xl font-black text-white break-words w-full">E-Ticket Kelas</h3>
              <p className="text-sm text-indigo-100 mt-2 font-medium break-words w-full">Akses QR Code dan masuk ruang belajar.</p>
            </div>
          </Link>

          <Link href="/transactions" className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 relative overflow-hidden shadow-lg hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all min-w-0 w-full">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[30px] transition-transform group-hover:scale-150"></div>
            <div className="relative z-10 flex items-center justify-between text-white mb-6 w-full min-w-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Receipt size={24} />
              </div>
              <ArrowRight size={24} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all shrink-0" />
            </div>
            <div className="relative z-10 w-full min-w-0">
              <h3 className="text-xl font-black text-white break-words w-full">Transaksi & Tagihan</h3>
              <p className="text-sm text-emerald-100 mt-2 font-medium break-words w-full">Cek status pembayaran dan riwayat Anda.</p>
            </div>
          </Link>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-w-0 w-full">
            <div className="flex items-center justify-between mb-4 w-full min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 min-w-0">
                <Trophy size={18} className="text-amber-500 shrink-0" /> <span className="truncate">Top Peringkat</span>
              </h3>
              <Link href="/leaderboard" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 shrink-0">Detail</Link>
            </div>
            <div className="space-y-3 w-full min-w-0">
              {leaders.length > 0 ? leaders.map((leader, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors w-full min-w-0">
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <span className={`text-sm font-black shrink-0 ${idx===0 ? 'text-amber-500' : idx===1 ? 'text-slate-400' : idx===2 ? 'text-orange-400' : 'text-slate-400'}`}>#{idx + 1}</span>
                    <img src={getAvatarUrl(leader.name)} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 shrink-0" />
                    <p className="text-xs font-bold text-slate-800 truncate min-w-0 flex-1">{leader.name}</p>
                  </div>
                  {idx === 0 && <Award size={16} className="text-amber-500 shrink-0 ml-2" />}
                </div>
              )) : (
                <div className="text-center py-4 text-xs font-medium text-slate-400 break-words w-full">Belum ada peringkat bulan ini.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEUNGGULAN AMANIA */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-20 mt-6 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="text-center max-w-2xl mx-auto mb-12 w-full min-w-0">
            <h2 className="text-3xl font-black text-slate-900 mb-4 break-words w-full">Kenapa Belajar di Amania?</h2>
            <p className="text-slate-500 font-medium break-words w-full">Kami merancang ekosistem pembelajaran terbaik untuk mempercepat akselerasi karir Anda di industri digital.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full min-w-0">
            {[
              { icon: Star, color: "text-amber-500", bg: "bg-amber-50", title: "Mentor Praktisi", desc: "Belajar langsung dari ahli yang berpengalaman di industri." },
              { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50", title: "Sertifikat Sah", desc: "Dapatkan e-certificate resmi untuk memperkuat portofolio Anda." },
              { icon: PlayCircle, color: "text-blue-500", bg: "bg-blue-50", title: "Akses Rekaman", desc: "Tidak bisa hadir? Tonton ulang rekaman kelas kapan saja." },
              { icon: Users, color: "text-purple-500", bg: "bg-purple-50", title: "Jejaring Luas", desc: "Bergabung dengan ribuan alumni di komunitas eksklusif Amania." },
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-center hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full min-w-0">
                <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm shrink-0`}>
                  <item.icon size={28} className="shrink-0" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 break-words w-full">{item.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed break-words w-full">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROGRAM UNGGULAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 w-full min-w-0">
          <div className="min-w-0 w-full">
            <h2 className="text-3xl font-black text-slate-900 mb-2 break-words w-full">Program Pilihan</h2>
            <p className="text-slate-500 font-medium break-words w-full">Tingkatkan karir Anda dengan kelas dan bootcamp terbaru kami.</p>
          </div>
          <Link href="/events" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100 shrink-0 min-w-0">
            <span className="truncate">Katalog Lengkap</span> <ChevronRight size={16} className="shrink-0" />
          </Link>
        </div>

        {/* 🔥 KONDISI LOADING, ADA DATA, ATAU KOSONG 🔥 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
            {[1,2,3].map(i => (
              <div key={i} className="h-80 bg-white border border-slate-200 rounded-[2rem] p-2 animate-pulse w-full">
                <div className="w-full h-44 bg-slate-100 rounded-3xl mb-4"></div>
                <div className="h-4 bg-slate-100 rounded mx-4 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded mx-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
            {events.map((event, idx) => (
              <Link href={`/events/detail?slug=${event.slug}`} key={event.id} className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col p-2 min-w-0 w-full">
                <div className="aspect-[16/10] bg-slate-100 rounded-[1.5rem] overflow-hidden relative shrink-0 w-full">
                  {event.image ? (
                    <img src={`${STORAGE_URL}/${event.image}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><BookOpen size={32} className="text-slate-300" /></div>
                  )}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm shrink-0 max-w-[80%]">
                    <span className="truncate block">{event.tier || 'Masterclass'}</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 min-w-0 w-full">
                  <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors break-words w-full">{event.title}</h3>
                  <div className="mt-auto space-y-3 min-w-0 w-full">
                    <div className="flex items-center gap-2.5 text-sm text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-0 w-full">
                      <Calendar size={16} className="text-indigo-400 shrink-0"/> 
                      <span className="truncate">{new Date(event.start_time).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year:'numeric'})}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm w-full">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Belum Ada Event</h3>
            <p className="text-slate-500 font-medium">Tim kami sedang mempersiapkan program pembelajaran terbaik untuk Anda. Nantikan segera!</p>
          </div>
        )}
      </section>

      {/* 5. ARTIKEL & JURNAL TERBARU */}
      <section className="bg-white border-t border-slate-200 py-16 md:py-24 w-full min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 text-center md:text-left w-full min-w-0">
            <div className="min-w-0 w-full">
              <h2 className="text-3xl font-black text-slate-900 mb-2 break-words w-full">Jurnal & Wawasan</h2>
              <p className="text-slate-500 font-medium break-words w-full">Baca artikel inspiratif dan tren teknologi dari editorial Amania.</p>
            </div>
            <Link href="/articles" className="inline-flex items-center justify-center gap-1.5 text-indigo-600 font-bold hover:text-indigo-800 transition-colors shrink-0 min-w-0">
              <span className="truncate">Eksplorasi Jurnal</span> <ChevronRight size={18} className="shrink-0" />
            </Link>
          </div>

          {/* 🔥 KONDISI LOADING, ADA DATA, ATAU KOSONG 🔥 */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
              {[1,2,3].map(i => (
                <div key={i} className="flex flex-col gap-4 animate-pulse w-full">
                  <div className="aspect-[4/3] bg-slate-100 rounded-[2rem]"></div>
                  <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                  <div className="h-6 bg-slate-100 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full min-w-0">
              {articles.map((article, idx) => (
                <Link href={`/articles/read?slug=${article.slug}`} key={article.id} className="group flex flex-col gap-5 min-w-0 w-full">
                  <div className="aspect-[4/3] bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 relative shadow-sm group-hover:shadow-lg transition-all duration-300 shrink-0 w-full">
                    {article.image ? (
                      <img src={`${STORAGE_URL}/${article.image}`} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Newspaper size={32} className="text-slate-300" /></div>
                    )}
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2.5 truncate w-full">{article.category?.name || 'Edukasi IT'}</p>
                    <h3 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors break-words w-full">{article.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-200 flex flex-col items-center justify-center text-center shadow-inner w-full">
              <div className="w-20 h-20 bg-white text-slate-300 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Newspaper size={40} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2">Belum Ada Artikel</h3>
              <p className="text-slate-500 font-medium">Tim redaksi kami sedang meracik artikel inspiratif untuk Anda. Nantikan segera!</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. CTA KOMUNITAS */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 pt-8 max-w-7xl mx-auto w-full min-w-0">
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 border border-slate-800 w-full min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 text-center md:text-left max-w-xl space-y-4 min-w-0 w-full">
            <h2 className="text-3xl md:text-4xl font-black text-white break-words w-full">Jangan Belajar Sendirian!</h2>
            <p className="text-slate-400 font-medium text-sm md:text-base leading-relaxed break-words w-full">
              Bergabunglah dengan grup diskusi Amania. Perluas jejaring Anda, bertukar ide, dan selesaikan tantangan belajar bersama ratusan peserta lainnya.
            </p>
          </div>

          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <Link href="/community" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-indigo-50 text-slate-900 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10 w-full md:w-auto min-w-0">
              <MessageCircle size={20} className="text-indigo-600 shrink-0" /> <span className="truncate">Gabung Komunitas</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}