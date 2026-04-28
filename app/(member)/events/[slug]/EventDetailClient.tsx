"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calendar, MapPin, Clock, ShieldCheck, 
  User, Share2, Ticket, AlertCircle, Loader2, CheckCircle2,
  Gem, Image as ImageIcon, BookOpen, Video, FileText, Lock, Briefcase, 
  DownloadCloud, Sparkles, Info, Tag, ArrowRight, Users, Award 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// processQuillHtml — v3
//
// Membersihkan HTML dari Quill agar kata tidak terpotong di tengah.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_P_STYLE =
  'margin:0;padding:0;line-height:1.7;overflow-wrap:break-word;word-break:normal;hyphens:none;-webkit-hyphens:none;';

const WC = 'a-zA-Z\\u00C0-\\u024F\\u1E00-\\u1EFF0-9';

const IC =
  '(?:<\\/(?:span|strong|em|b|i|u|s|code|a|mark|sup|sub)[^>]*>\\s*)*';

const IO =
  '(?:\\s*<(?:span|strong|em|b|i|u|s|code|a|mark|sup|sub)[^>]*>)*';

const processQuillHtml = (html: string): string => {
  if (!html) return '';

  let r = html.replace(/\r\n?/g, '\n');

  // 🔥 FIX UTAMA: HAPUS KARAKTER INVISIBLE
  r = r.replace(/[\u200B-\u200D\uFEFF]/g, ''); // zero-width chars
  r = r.replace(/&shy;/gi, '');                // soft hyphen
  r = r.replace(/&nbsp;/gi, ' ');              // normalisasi spasi

  // ── A + B: KATA TERPOTONG DI </p><p> ──────────────────────────────
  {
    let prev = '';
    while (prev !== r) {
      prev = r;
      r = r.replace(
        new RegExp(
          `([${WC}])${IC}<\\/p>[ \\t\\n]*<p(?:\\s[^>]*)?>[ \\t\\n]*${IO}([${WC}])`,
          'g'
        ),
        '$1$2'
      );
    }
  }

  // ── C: KATA TERPOTONG DI <br> ─────────────────────────────────────
  {
    let prev = '';
    while (prev !== r) {
      prev = r;
      r = r.replace(
        new RegExp(
          `([${WC}])${IC}<br[ \\t]*\\/?>[ \\t\\n]*${IO}([${WC}])`,
          'g'
        ),
        '$1$2'
      );
    }
  }

  // ── D: KATA TERPOTONG OLEH \n ─────────────────────────────────────
  r = r.replace(
    new RegExp(`([${WC}])[ \\t]*\\n+[ \\t]*([${WC}])`, 'g'),
    '$1$2'
  );

  // ── E: FIX DOUBLE SPACE (opsional tapi bagus)
  r = r.replace(/ {2,}/g, ' ');

  // ── F: STYLE PARAGRAF ─────────────────────────────────────────────

  r = r.replace(
    /<p><\/p>/g,
    `<p style="${BASE_P_STYLE}min-height:1.617em;"></p>`
  );

  r = r.replace(
    /<p><br\s*\/?><\/p>/gi,
    `<p style="${BASE_P_STYLE}min-height:1.617em;"><br></p>`
  );

  r = r.replace(/<p(\s[^>]*)?>/g, (_, attrs = '') => {
    if (attrs.includes('style=')) {
      return `<p${attrs.replace(/style="([^"]*)"/, `style="${BASE_P_STYLE}$1"`)}>`;
    }
    return `<p${attrs} style="${BASE_P_STYLE}">`;
  });

  return r;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER ZONA WAKTU (ANTI TIMEZONE HELL)
// ─────────────────────────────────────────────────────────────────────────────
const parseSafeDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  let safeStr = dateStr.replace(' ', 'T');
  // Jika string dari Laravel tidak memiliki 'Z' atau '+', anggap sebagai WIB (+07:00)
  if (!safeStr.includes('Z') && !safeStr.includes('+')) {
    safeStr += '+07:00';
  }
  return new Date(safeStr);
};

// ─────────────────────────────────────────────────────────────────────────────

export default function EventDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'curriculum'>('desc');
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium'>('basic');
  const [isSharing, setIsSharing] = useState(false);

  const userData =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || 'null')
      : null;
  const STORAGE_URL =
    process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!slug) return;
    const fetchEventDetail = async () => {
      try {
        const res = await apiFetch(`/events/${slug}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setEventData(json.data);
        } else {
          toast.error('Program tidak ditemukan.');
          router.push('/events');
        }
      } catch {
        toast.error('Gagal memuat data program.');
      } finally {
        setLoading(false);
      }
    };
    fetchEventDetail();
  }, [slug, router]);

  // 🔥 UPDATE: handleShare dengan perbaikan Caption Foto
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);

    const shareUrl = window.location.href;
    const shareTitle = eventData?.title || 'Program Unggulan Amania';
    const shareText = `Halo! Yuk ikutan program "${shareTitle}" di Amania Nusantara. Cek detailnya di sini:`;
    
    // GABUNGKAN teks dan URL agar menjadi Caption yang utuh
    const captionText = `${shareText}\n\n${shareUrl}`;

    try {
      if (navigator.share) {
        let sharedWithImage = false;

        // Coba fetch gambar dan konversi jadi File object
        if (eventData?.image) {
          try {
            const imgUrl = `${STORAGE_URL}/${eventData.image}`;
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            
            const ext = blob.type.split('/')[1] || 'jpg';
            const file = new File([blob], `poster-${slug}.${ext}`, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: shareTitle,
                text: captionText, // 🔥 Kirim teks gabungan di sini
                // url: shareUrl,  // 🔥 HAPUS properti URL agar aplikasi (WA) tidak error/membuang teksnya
                files: [file]
              });
              toast.success('Berhasil membagikan poster dan tautan!');
              sharedWithImage = true;
            }
          } catch (imgError) {
            console.warn("Gagal menyiapkan file gambar, fallback ke teks", imgError);
          }
        }

        // Fallback jika tidak bisa melampirkan gambar
        if (!sharedWithImage) {
          await navigator.share({ 
            title: shareTitle, 
            text: captionText // Gunakan teks gabungan juga untuk fallback
          });
          toast.success('Berhasil membagikan tautan!');
        }
      } else {
        // Fallback untuk copy paste biasa
        await navigator.clipboard.writeText(captionText);
        toast.success('Tautan disalin ke clipboard!');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast.error('Terjadi kesalahan saat membagikan.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleDownloadBanner = async () => {
    if (!eventData?.image) return;
    const imgUrl = `${STORAGE_URL}/${eventData.image}`;
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Poster-${eventData.slug || 'Amania'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Poster berhasil diunduh!');
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  const handleProceedToCheckout = () => {
    if (!userData) {
      toast.error('Silakan masuk terlebih dahulu untuk mendaftar.');
      sessionStorage.setItem('redirectAfterLogin', `/events/${slug}`);
      router.push('/login');
      return;
    }
    if (eventData.quota <= 0) {
      toast.error('Maaf, kuota untuk program ini sudah habis.');
      return;
    }
    toast.loading('Mengarahkan ke pembayaran...', { duration: 1500 });
    router.push(`/checkout?slug=${slug}&tier=${selectedTier}`);
  };

  if (loading)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        >
          <Loader2 size={48} className="text-indigo-600" />
        </motion.div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
          Menyiapkan Ruang Kelas
        </p>
      </div>
    );

  if (!eventData)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center w-full px-4">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-2">
          <AlertCircle size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Program Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm max-w-sm mb-4">
          Program yang Anda cari mungkin sudah dihapus atau tautan tidak valid.
        </p>
        <Link
          href="/events"
          className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors shadow-lg"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );

  const isFree = eventData.basic_price === 0;
  
  const eventDate = parseSafeDate(eventData.start_time);
  const isPast = parseSafeDate(eventData.end_time) < new Date();
  
  const isSuperadmin = !eventData.organizer || eventData.organizer.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : eventData.organizer.name;
  const organizerAvatar =
    !isSuperadmin && eventData.organizer?.avatar
      ? `${STORAGE_URL}/${eventData.organizer.avatar}`
      : null;

  const formatTimeRange = (start: string, end: string) => {
    if (!start || !end) return '';
    try {
      const startDate = parseSafeDate(start);
      const endDate = parseSafeDate(end);
      
      const startTimeStr = startDate.toLocaleTimeString('id-ID', { 
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' 
      });
      const endTimeStr = endDate.toLocaleTimeString('id-ID', { 
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' 
      });
      
      return `${startTimeStr.replace(/\./g, ':')} - ${endTimeStr.replace(/\./g, ':')}`;
    } catch {
      return '';
    }
  };

  const processedDescription = processQuillHtml(eventData.description || '');

  return (
    <div className="w-full pb-32 lg:pb-16 selection:bg-indigo-200 selection:text-indigo-900 font-sans">

      {/* ── TOP ACTION BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Link
          href="/events"
          className="group flex items-center gap-2.5 text-slate-700 font-bold text-sm hover:text-indigo-600 transition-colors"
        >
          <div className="p-1.5 bg-slate-100 rounded-full group-hover:bg-indigo-100 transition-all">
            <ArrowLeft size={16} />
          </div>
          <span>Katalog Program</span>
        </Link>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-wait"
        >
          {isSharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} 
          <span>Bagikan</span>
        </button>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div className="relative w-full">
        <div className="max-w-7xl mx-auto px-0 sm:px-0">
          <div className="relative aspect-square sm:aspect-[21/9] w-full overflow-hidden sm:rounded-[2.5rem] shadow-2xl group bg-slate-900">
            {eventData.image ? (
              <img
                src={`${STORAGE_URL}/${eventData.image}`}
                alt="Banner"
                className="w-full h-full object-cover opacity-80 transition-transform duration-[2s] group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                <ImageIcon size={64} className="text-slate-700" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-12 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 max-w-4xl"
              >
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="text-amber-400" />
                    {eventData.certificate_tier !== 'none' ? 'Sertifikat Tersedia' : 'Amania Official'}
                  </span>
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${
                      isPast ? 'bg-rose-500/90 text-white' : 'bg-emerald-500/90 text-white'
                    }`}
                  >
                    {isPast ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                    {isPast ? 'Program Selesai' : 'Pendaftaran Dibuka'}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight drop-shadow-2xl">
                  {eventData.title}
                </h1>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto mt-6 md:mt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-10">

        {/* LEFT COLUMN */}
        <div className="space-y-8 order-2 lg:order-1 min-w-0 w-full">

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-1">
                <Calendar size={16} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal Pelaksanaan</p>
              <p className="text-sm font-bold text-slate-900">
                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
              </p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-1">
                <Clock size={16} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Akses</p>
              <p className="text-sm font-bold text-slate-900 truncate">
                {formatTimeRange(eventData.start_time, eventData.end_time)} WIB
              </p>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 shadow-sm flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
              <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-1">
                <MapPin size={16} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform / Lokasi</p>
              <p className="text-sm font-bold text-slate-900 truncate">{eventData.venue}</p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 sm:p-8 w-full">
            <div className="flex gap-4 sm:gap-8 border-b border-slate-100 mb-8 overflow-x-auto">
              {(['desc', 'curriculum'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-black transition-all relative whitespace-nowrap px-1 ${
                    activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab === 'desc' ? 'Informasi Program' : 'Materi / Kurikulum'}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tabLine"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px] w-full">
              <AnimatePresence mode="wait">

                {activeTab === 'desc' ? (
                  <motion.div
                    key="desc"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full min-w-0"
                  >
                    <div
                      className="q-content"
                      dangerouslySetInnerHTML={{ __html: processedDescription }}
                    />

                    {eventData.speakers && eventData.speakers.length > 0 && (
                      <div className="mt-10 pt-8 border-t border-slate-100">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                          <User size={20} className="text-indigo-500" /> Profil Instruktur
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {eventData.speakers.map((spk: any) => (
                            <div
                              key={spk.id}
                              className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group"
                            >
                              <img
                                src={`${STORAGE_URL}/${spk.photo}`}
                                alt={spk.name}
                                className="w-14 h-14 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform shrink-0"
                              />
                              <div className="flex-1 min-w-0 pt-0.5">
                                <h4 className="text-sm font-bold text-slate-900 leading-snug">{spk.name}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-start gap-1.5 mt-1.5 leading-relaxed">
                                  <Briefcase size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                                  <span className="flex-1">{spk.role}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="curriculum"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {!eventData.materials || eventData.materials.length === 0 ? (
                      <div className="py-16 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                        <BookOpen size={40} className="mx-auto text-slate-300 mb-4" />
                        <h4 className="text-base font-bold text-slate-900 mb-1">Materi Sedang Disusun</h4>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                          Syllabus lengkap akan segera dipublikasikan menjelang pelaksanaan program.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-6 flex items-start gap-3">
                          <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs md:text-sm font-bold text-indigo-900 mb-1">Daftar Kurikulum</p>
                            <p className="text-[11px] md:text-xs text-indigo-700 leading-relaxed">
                              Berikut adalah materi yang akan dibahas. Materi dengan label{' '}
                              <strong>VIP</strong> hanya bisa diakses secara penuh oleh peserta
                              Premium setelah acara berlangsung.
                            </p>
                          </div>
                        </div>
                        {eventData.materials.map((mat: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-3xl hover:border-indigo-600 transition-all group"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
                              {mat.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                                  Modul {i + 1}
                                </span>
                                {mat.access_tier === 'premium' ? (
                                  <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <Gem size={8} /> VIP ONLY
                                  </span>
                                ) : (
                                  <span className="text-[8px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <CheckCircle2 size={8} /> BASIC
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 line-clamp-2">{mat.title}</h4>
                            </div>
                            <Lock size={16} className="text-slate-300 hidden sm:block shrink-0" />
                          </div>
                        ))}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="order-1 lg:order-2 w-full lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 opacity-50" />

            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Ticket size={16} /> Pilih Tiket Akses
            </h3>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => setSelectedTier('basic')}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex justify-between items-center text-left ${
                  selectedTier === 'basic'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-500/10'
                    : 'border-slate-100 bg-white hover:border-slate-300 opacity-70'
                }`}
              >
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${selectedTier === 'basic' ? 'text-indigo-600' : 'text-slate-500'}`}>
                    <Tag size={12} /> Basic Pass
                  </p>
                  <p className={`text-xl font-black ${selectedTier === 'basic' ? 'text-slate-900' : 'text-slate-600'}`}>
                    {isFree ? 'GRATIS' : `Rp ${eventData.basic_price.toLocaleString('id-ID')}`}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTier === 'basic' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {selectedTier === 'basic' && <CheckCircle2 size={16} className="text-white" strokeWidth={3} />}
                </div>
              </button>

              {eventData.premium_price > 0 && (
                <button
                  onClick={() => setSelectedTier('premium')}
                  className={`w-full p-4 sm:p-5 rounded-2xl border-2 transition-all flex justify-between items-center text-left ${
                    selectedTier === 'premium'
                      ? 'border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10'
                      : 'border-slate-100 bg-white hover:border-slate-300 opacity-70'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${selectedTier === 'premium' ? 'text-amber-600' : 'text-slate-500'}`}>
                      <Gem size={12} /> VIP Premium
                    </p>
                    <p className={`text-xl font-black ${selectedTier === 'premium' ? 'text-slate-900' : 'text-slate-600'}`}>
                      Rp {eventData.premium_price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedTier === 'premium' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                    {selectedTier === 'premium' && <CheckCircle2 size={16} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              )}
            </div>

            <div className="hidden lg:block space-y-3 mb-8">
              <button
                onClick={handleProceedToCheckout}
                disabled={isPast || eventData.quota === 0}
                className={`w-full py-4 rounded-xl font-black text-sm transition-all shadow-xl active:scale-[0.98] ${
                  isPast || eventData.quota === 0
                    ? 'bg-slate-200 text-slate-500 shadow-none cursor-not-allowed'
                    : selectedTier === 'premium'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-indigo-600'
                }`}
              >
                {isPast ? (
                  <span className="flex items-center justify-center gap-2"><AlertCircle size={16} /> PROGRAM SELESAI</span>
                ) : eventData.quota === 0 ? (
                  <span className="flex items-center justify-center gap-2"><AlertCircle size={16} /> KUOTA PENUH</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">LANJUT KE PEMBAYARAN <ArrowRight size={16} /></span>
                )}
              </button>
              {eventData.image && (
                <button
                  onClick={handleDownloadBanner}
                  className="w-full py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                >
                  <DownloadCloud size={16} /> Unduh Poster Program
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs min-w-0">
                <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> Sisa Kuota</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-200">
                  {eventData.quota === 0 ? 'Habis' : `${eventData.quota} Kursi`}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs min-w-0">
                <span className="text-slate-500 font-semibold shrink-0 flex items-center gap-1.5"><Award size={14} className="text-slate-400" /> E-Certificate</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  {eventData.certificate_tier === 'none' ? 'Tidak Ada' : 'Tersedia'}
                </span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                {organizerAvatar ? (
                  <img src={organizerAvatar} className="w-full h-full object-cover" alt="org" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Penyelenggara</p>
                <p className="text-sm font-bold text-slate-900 flex items-center gap-1 truncate">
                  {organizerName}{' '}
                  {isSuperadmin && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 pb-safe z-50 lg:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="shrink-0 min-w-0 max-w-[40%]">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">
            {selectedTier === 'premium' ? 'Total (VIP)' : 'Total (Basic)'}
          </p>
          <p
            className={`text-lg sm:text-xl font-black tracking-tight leading-none truncate ${
              selectedTier === 'premium' ? 'text-amber-600' : isFree ? 'text-emerald-500' : 'text-slate-900'
            }`}
          >
            {selectedTier === 'premium'
              ? `Rp ${eventData.premium_price.toLocaleString('id-ID')}`
              : isFree
              ? 'GRATIS'
              : `Rp ${eventData.basic_price.toLocaleString('id-ID')}`}
          </p>
        </div>
        <button
          onClick={handleProceedToCheckout}
          disabled={eventData.quota === 0 || isPast}
          className={`flex-1 py-3.5 sm:py-4 rounded-xl font-black text-white text-xs sm:text-sm shadow-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
            eventData.quota === 0 || isPast
              ? 'bg-slate-200 text-slate-400 shadow-none'
              : selectedTier === 'premium'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/25'
              : 'bg-slate-900 shadow-slate-900/20'
          }`}
        >
          <span className="truncate flex items-center justify-center gap-1.5">
            {isPast ? <><AlertCircle size={14} /> Ditutup</> : eventData.quota === 0 ? <><AlertCircle size={14} /> Penuh</> : <>Lanjut Bayar <ArrowRight size={14} /></>}
          </span>
        </button>
        {eventData.image && (
          <button
            onClick={handleDownloadBanner}
            className="p-3.5 sm:p-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors shrink-0 flex items-center justify-center"
          >
            <DownloadCloud size={18} />
          </button>
        )}
      </div>

      <style jsx global>{`
        .q-content {
          font-size: 0.95rem;
          line-height: 1.7;
          color: #334155;
          overflow-wrap: break-word;
          word-break: normal;
          hyphens: none;
          -webkit-hyphens: none;
          white-space: normal;
        }

        .q-content p,
        .q-content span,
        .q-content li,
        .q-content h1,
        .q-content h2,
        .q-content h3,
        .q-content h4 {
          margin: 0 !important;
          word-break: normal !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          white-space: normal !important;
        }

        /* ── Formatting ── */
        .q-content strong, .q-content b { font-weight: 800; color: #0f172a; }
        .q-content em, .q-content i      { font-style: italic; }
        .q-content u                     { text-decoration: underline; }
        .q-content s                     { text-decoration: line-through; }

        /* ── Headings ── */
        .q-content h1 { font-size:1.75rem; font-weight:900; color:#0f172a; margin:1.5rem 0 0.5rem !important; line-height:1.3; }
        .q-content h2 { font-size:1.5rem;  font-weight:800; color:#0f172a; margin:1.25rem 0 0.4rem !important; line-height:1.35; }
        .q-content h3 { font-size:1.25rem; font-weight:700; color:#0f172a; margin:1rem 0 0.35rem !important; line-height:1.4; }
        .q-content h4 { font-size:1.1rem;  font-weight:700; color:#1e293b; margin:0.75rem 0 0.25rem !important; }

        /* ── Lists ── */
        .q-content ul { padding-left:1.5em; margin:0; list-style-type:disc; }
        .q-content ol { padding-left:1.5em; margin:0; list-style-type:decimal; }
        .q-content li { margin-bottom:0.2rem !important; }

        /* ── Blockquote & Code ── */
        .q-content blockquote {
          border-left:4px solid #6366f1; margin:0.5rem 0; padding:0.5rem 1rem;
          background:#f1f5f9; border-radius:0 0.5rem 0.5rem 0;
          color:#475569; font-style:italic;
        }
        .q-content pre {
          background:#0f172a; color:#34d399; padding:1rem;
          border-radius:0.5rem; overflow-x:auto; font-size:0.85rem; margin:0.5rem 0;
        }
        .q-content code {
          background:#f1f5f9; padding:0.15em 0.4em;
          border-radius:0.25rem; font-size:0.875em; color:#6366f1;
        }

        /* ── Media ── */
        .q-content img, .q-content video, .q-content iframe {
          max-width:100%; height:auto; border-radius:0.75rem;
          margin:0.75rem 0; box-shadow:0 4px 20px rgba(0,0,0,0.08);
        }

        /* ── Links ── */
        .q-content a { color:#4f46e5; text-decoration:underline; text-underline-offset:2px; }
        .q-content a:hover { color:#4338ca; }

        /* ── Scrollbar ── */
        .custom-scrollbar::-webkit-scrollbar { display:none; }
        .custom-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>
    </div>
  );
}