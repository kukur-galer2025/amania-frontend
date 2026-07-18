"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Framer Motion removed for performance — using CSS-only animations
import {
    ArrowLeft, Calendar, MapPin, Clock, ShieldCheck,
    User, Share2, Ticket, AlertCircle, Loader2, CheckCircle2,
    Gem, Image as ImageIcon, BookOpen, Video, FileText, Lock, Briefcase,
    DownloadCloud, Sparkles, Info, Tag, ArrowRight, Users, Award, Zap,
    X, Link as LinkIcon, CalendarHeart
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

// ─────────────────────────────────────────────────────────────────────────────
// processQuillHtml — v3
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

    r = r.replace(/[\u200B-\u200D\uFEFF]/g, '');
    r = r.replace(/&shy;/gi, '');
    r = r.replace(/&nbsp;/gi, ' ');

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

    r = r.replace(
        new RegExp(`([${WC}])[ \\t]*\\n+[ \\t]*([${WC}])`, 'g'),
        '$1$2'
    );

    r = r.replace(/ {2,}/g, ' ');

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

    return r.replace(/&nbsp;/g, ' ');
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER CONVERT HTML TO PLAIN TEXT
// ─────────────────────────────────────────────────────────────────────────────
const stripHtmlToText = (html: string) => {
    if (!html) return '';
    let text = html.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<[^>]*>?/gm, '');
    text = text.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ');
    return text.trim();
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER ZONA WAKTU
// ─────────────────────────────────────────────────────────────────────────────
const parseSafeDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    let safeStr = dateStr.replace(' ', 'T');
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
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // STATE HITUNG MUNDUR (COUNTDOWN)
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    // STATE MODAL
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'login' | 'registered'>('login');

    const userData =
        typeof window !== 'undefined'
            ? JSON.parse(safeStorage.getItem('user') || 'null')
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

    // 🔥 EFEK COUNTDOWN (UPDATE SETIAP MENIT) 🔥
    useEffect(() => {
        if (!eventData?.start_time) return;

        const updateTimer = () => {
            const targetDate = parseSafeDate(eventData.start_time).getTime();
            const now = new Date().getTime();
            const diff = targetDate - now;

            if (diff <= 0) {
                setTimeLeft(null);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            if (days > 0) {
                setTimeLeft(`${days} Hari ${hours} Jam Lagi`);
            } else if (hours > 0) {
                setTimeLeft(`${hours} Jam ${minutes} Mnt Lagi`);
            } else {
                setTimeLeft(`${minutes} Menit Lagi`);
            }
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 60000);

        return () => clearInterval(intervalId);
    }, [eventData?.start_time]);

    const handleShare = () => setIsShareModalOpen(true);
    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link disalin ke clipboard!');
    };

    const handleDownloadBanner = async () => {
        if (!eventData?.image) return;
        const imgUrl = `${STORAGE_URL}/${eventData.image}`;
        try {
            const response = await fetch(imgUrl, { mode: 'cors' });
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
        // 1. Cek apakah user sudah login
        if (!userData) {
            setModalType('login');
            setShowModal(true);
            return;
        }

        // 2. Cek apakah user sudah punya tiket (dari Backend)
        if (eventData?.user_registration) {
            setModalType('registered');
            setShowModal(true);
            return;
        }

        // 3. Cek sisa kuota
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
                <div className="animate-spin" style={{ animationDuration: '1.2s' }}>
                    <Loader2 size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Program Tidak Ditemukan</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">
                    Program yang Anda cari mungkin sudah dihapus atau tautan tidak valid.
                </p>
                <Link
                    href="/events"
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600"
                >
                    Kembali ke Katalog
                </Link>
            </div>
        );

    const isFree = eventData.basic_price === 0;

    const eventDate = parseSafeDate(eventData.start_time);
    const isPast = parseSafeDate(eventData.end_time) < new Date();

    const isSuperadmin = true;
    const organizerName = eventData.organizer?.name || 'Amania Official';
    const organizerAvatar = eventData.organizer?.avatar
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
        <div className="w-full pb-32 lg:pb-16 selection:bg-indigo-200 selection:text-indigo-900 dark:selection:text-indigo-100 font-sans">

            {/* ── TOP ACTION BAR ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <Link
                    href="/events"
                    className="group flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-bold text-sm hover:text-indigo-600 dark:text-indigo-400"
                >
                    <div className="p-1.5 bg-slate-100 dark:bg-slate-700/50 rounded-full group-hover:bg-indigo-100 dark:hover:bg-indigo-900">
                        <ArrowLeft size={16} />
                    </div>
                    <span>Katalog Program</span>
                </Link>
                <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold hover:bg-indigo-600 hover:text-white"
                >
                    <Share2 size={14} />
                    <span>Bagikan</span>
                </button>
            </div>

            {/* ── HERO ─────────────────────────────────────────────────────────────── */}
            <div className="relative w-full">
                <div className="max-w-7xl mx-auto px-0 sm:px-0">
                    <div className="relative aspect-square sm:aspect-[21/9] w-full sm:rounded-2xl group bg-slate-900">
                        {eventData.image ? (
                            <img
                                src={`${STORAGE_URL}/${eventData.image}`}
                                alt="Banner"
                                className="w-full h-full object-cover opacity-80 sm:rounded-2xl"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center sm:rounded-2xl">
                                <ImageIcon size={64} className="text-slate-700 dark:text-slate-300" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/60 sm:rounded-2xl" />
                        <div className="absolute bottom-0 left-0 p-6 sm:p-10 md:p-12 w-full">
                            <div className="space-y-4 max-w-4xl">
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <span className="px-3 py-1.5 bg-white/20 dark:bg-slate-800/30 border border-slate-200/30 dark:border-slate-700/20 text-white rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles size={12} className="text-amber-400" />
                                        {eventData.certificate_tier !== 'none' ? 'Sertifikat Tersedia' : 'Amania Official'}
                                    </span>
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-white ${isPast ? 'bg-rose-500 dark:bg-rose-600' : 'bg-emerald-500 dark:bg-emerald-600'
                                            }`}
                                    >
                                        {isPast ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                                        {isPast ? 'Program Selesai' : 'Pendaftaran Dibuka'}
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] tracking-tight">
                                    {eventData.title}
                                </h1>
                            </div>
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
                        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700/50 flex flex-col gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-1">
                                <Calendar size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Tanggal Pelaksanaan</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' })}
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700/50 flex flex-col gap-1.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-1">
                                <Clock size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Waktu Akses</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {formatTimeRange(eventData.start_time, eventData.end_time)} WIB
                            </p>
                        </div>
                        <div className="bg-white dark:bg-[#111827] p-4 sm:p-5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700/50 flex flex-col gap-1.5 sm:col-span-2 md:col-span-1">
                            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-1">
                                <MapPin size={16} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Platform / Lokasi</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{eventData.venue}</p>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white dark:bg-[#111827] rounded-[2rem] border border-slate-200 dark:border-slate-700/50 p-5 sm:p-8 w-full">
                        <div className="flex gap-4 sm:gap-8 border-b border-slate-100 dark:border-slate-700/50 mb-8 overflow-x-auto">
                            {(['desc', 'curriculum'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 text-sm font-black relative whitespace-nowrap px-1 ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'
                                        }`}
                                >
                                    {tab === 'desc' ? 'Informasi Program' : 'Materi / Kurikulum'}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[300px] w-full">
                            {activeTab === 'desc' ? (
                                <div
                                    key="desc"
                                    className="w-full min-w-0 animate-fade-in"
                                >
                                    <div
                                        className="q-content"
                                        dangerouslySetInnerHTML={{ __html: processedDescription }}
                                    />

                                    {eventData.speakers && eventData.speakers.length > 0 && (
                                        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                                <User size={20} className="text-indigo-500" /> Profil Instruktur
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {eventData.speakers.map((spk: any) => (
                                                    <div
                                                        key={spk.id}
                                                        className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-700 group"
                                                    >
                                                        <img
                                                            src={`${STORAGE_URL}/${spk.photo}`}
                                                            alt={spk.name}
                                                            className="w-14 h-14 rounded-full object-cover shrink-0 bg-slate-200"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                        <div className="flex-1 min-w-0 pt-0.5">
                                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:text-indigo-400">{spk.name}</h4>
                                                            <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1 w-full leading-snug">
                                                                <Briefcase size={12} className="text-indigo-400 shrink-0 mt-[2px]" />
                                                                <span className="flex-1">{spk.role}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    key="curriculum"
                                    className="space-y-4 animate-fade-in"
                                >
                                    {!eventData.materials || eventData.materials.length === 0 ? (
                                        <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-700/50 rounded-2xl bg-slate-50 dark:bg-[#111827]">
                                            <BookOpen size={40} className="mx-auto text-slate-300 dark:text-slate-500 mb-4" />
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Materi Sedang Disusun</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                                Syllabus lengkap akan segera dipublikasikan menjelang pelaksanaan program.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-4 rounded-2xl mb-6 flex items-start gap-3">
                                                <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-xs md:text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-1">Daftar Kurikulum</p>
                                                    <p className="text-[11px] md:text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
                                                        Berikut adalah materi yang akan dibahas. Materi dengan label{' '}
                                                        <strong>Premium</strong> hanya bisa diakses secara penuh oleh peserta
                                                        Premium setelah acara berlangsung.
                                                    </p>
                                                </div>
                                            </div>
                                            {eventData.materials.map((mat: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-4 p-5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-3xl hover:border-indigo-600 group"
                                                >
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#111827] flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:bg-indigo-50 dark:hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:text-indigo-400 shrink-0">
                                                        {mat.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                                                                Modul {i + 1}
                                                            </span>
                                                            {mat.access_tier === 'premium' ? (
                                                                <span className="text-[8px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <Gem size={8} /> PREMIUM ONLY
                                                                </span>
                                                            ) : (
                                                                <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                    <CheckCircle2 size={8} /> BASIC
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{mat.title}</h4>
                                                    </div>
                                                    <Lock size={16} className="text-slate-300 dark:text-slate-500 hidden sm:block shrink-0" />
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="order-1 lg:order-2 w-full flex flex-col gap-6">

                    {/* 🔥 POSISI BARU: POSTER EVENT DI ATAS KOTAK TIKET 🔥 */}
                    {eventData.image && (
                        <div className="w-full bg-slate-900 rounded-2xl border-4 border-slate-200/50 dark:border-slate-700/300">
                            <img
                                src={`${STORAGE_URL}/${eventData.image}`}
                                alt="Poster Program"
                                className="w-full h-auto max-h-[400px] object-cover object-center rounded-xl"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 relative">

                        {/* WIDGET WAKTU TERSISA (Hitung Mundur) */}
                        {timeLeft && !isPast && (
                            <div className="mb-6 w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border bg-amber-50 border-amber-200 relative group">
                                <div className="flex items-center gap-3 z-10">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-500 text-white">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-amber-700/80 font-black uppercase tracking-[0.15em] mb-0.5">
                                            Waktu Tersisa
                                        </p>
                                        <p className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                                            {timeLeft}
                                        </p>
                                    </div>
                                </div>
                                <div className="shrink-0 z-10">
                                    <Zap size={24} className="text-amber-500 opacity-60" />
                                </div>
                            </div>
                        )}

                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Ticket size={16} /> Pilih Tiket Akses
                        </h3>

                        <div className="space-y-4 mb-8">
                            <button
                                onClick={() => setSelectedTier('basic')}
                                className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex justify-between items-center text-left ${selectedTier === 'basic'
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10'
                                        : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#111827] hover:border-slate-300 dark:border-slate-600 opacity-70'
                                    }`}
                            >
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${selectedTier === 'basic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                        <Tag size={12} /> Basic Pass
                                    </p>
                                    <p className={`text-xl font-black ${selectedTier === 'basic' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                        {isFree ? 'GRATIS' : `Rp ${eventData.basic_price.toLocaleString('id-ID')}`}
                                    </p>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedTier === 'basic' ? 'bg-indigo-600 text-white' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                                    {selectedTier === 'basic' && <CheckCircle2 size={14} className="text-white" strokeWidth={3} />}
                                </div>
                            </button>

                            {eventData.premium_price > 0 && (
                                <button
                                    onClick={() => setSelectedTier('premium')}
                                    className={`w-full p-4 sm:p-5 rounded-2xl border-2 flex justify-between items-center text-left ${selectedTier === 'premium'
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
                                            : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-[#111827] hover:border-slate-300 dark:border-slate-600 opacity-70'
                                        }`}
                                >
                                    <div>
                                        <p className={`text-[10px] font-black uppercase tracking-wider mb-1 flex items-center gap-1.5 ${selectedTier === 'premium' ? 'text-amber-600' : 'text-slate-500 dark:text-slate-400'}`}>
                                            <Gem size={12} /> Premium
                                        </p>
                                        <p className={`text-xl font-black ${selectedTier === 'premium' ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            Rp {eventData.premium_price.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedTier === 'premium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {selectedTier === 'premium' && <CheckCircle2 size={16} className="text-white" strokeWidth={3} />}
                                    </div>
                                </button>
                            )}
                        </div>

                        <div className="hidden lg:block space-y-3 mb-8">
                            <button
                                onClick={handleProceedToCheckout}
                                disabled={isPast || eventData.quota === 0}
                                className={`w-full py-4 rounded-xl font-black text-sm transition-transform active:scale-[0.98] ${isPast || eventData.quota === 0
                                        ? 'bg-slate-200 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                        : selectedTier === 'premium'
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                            : 'bg-slate-900 text-white hover:bg-indigo-600'
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

                            {/* TOMBOL UNDUH POSTER */}
                            {eventData.image && (
                                <button
                                    onClick={handleDownloadBanner}
                                    className="w-full py-3.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-xs hover:border-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2"
                                >
                                    <DownloadCloud size={16} /> Unduh Poster Program
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-[#111827] p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 space-y-3 mb-6">
                            <div className="flex items-center justify-between text-xs min-w-0">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-1.5"><Users size={14} className="text-slate-400 dark:text-slate-400" /> Sisa Kuota</span>
                                <span className="font-bold text-slate-900 dark:text-white bg-white dark:bg-[#111827] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700/50">
                                    {eventData.quota === 0 ? 'Habis' : `${eventData.quota} Kursi`}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs min-w-0">
                                <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-1.5"><Award size={14} className="text-slate-400 dark:text-slate-400" /> E-Certificate</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-200">
                                    {eventData.certificate_tier === 'none' ? 'Tidak Ada' : 'Tersedia'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700/50 shrink-0">
                                {organizerAvatar ? (
                                    <img src={organizerAvatar} className="w-full h-full object-cover" alt="org" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                ) : (
                                    <User size={20} className="text-slate-400 dark:text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-0.5">Penyelenggara</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1 truncate">
                                    {organizerName}{' '}
                                    {isSuperadmin && <ShieldCheck size={14} className="text-emerald-500 shrink-0" />}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white dark:bg-[#0f172a] border-t-2 border-slate-200 dark:border-slate-700">
                <div className="px-4 py-3 sm:px-6 sm:py-4 max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="shrink-0 min-w-0 max-w-[40%]">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-0.5 truncate">
                            {selectedTier === 'premium' ? 'Total (Premium)' : 'Total (Basic)'}
                        </p>
                        <p
                            className={`text-lg sm:text-xl font-black tracking-tight leading-none truncate ${selectedTier === 'premium' ? 'text-amber-600' : isFree ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
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
                        className={`flex-1 py-3.5 sm:py-4 rounded-xl font-black text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 ${eventData.quota === 0 || isPast
                                ? 'bg-slate-200 text-slate-400 dark:text-slate-400'
                                : selectedTier === 'premium'
                                    ? 'bg-amber-500'
                                    : 'bg-slate-900'
                            }`}
                    >
                        <span className="truncate flex items-center justify-center gap-1.5">
                            {isPast ? <><AlertCircle size={14} /> Ditutup</> : eventData.quota === 0 ? <><AlertCircle size={14} /> Penuh</> : <>Lanjut Bayar <ArrowRight size={14} /></>}
                        </span>
                    </button>
                    {eventData.image && (
                        <button
                            onClick={handleDownloadBanner}
                            className="p-3.5 sm:p-4 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 shrink-0 flex items-center justify-center"
                        >
                            <DownloadCloud size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* 🔥 MODAL POPUP PENGECEKAN CHECKOUT */}
            <>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-slate-900/80"
                            onClick={() => setShowModal(false)}
                        />

                        <div
                            className="relative w-full max-w-[400px] bg-white dark:bg-[#111827] rounded-2xl p-6 md:p-8 overflow-hidden z-10"
                        >
                            {modalType === 'login' ? (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Akses Ditolak</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                                        Anda harus masuk ke akun Amania terlebih dahulu untuk melanjutkan pendaftaran program ini.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600">
                                            Batal
                                        </button>
                                        <button
                                            onClick={() => {
                                                sessionStorage.setItem('redirectAfterLogin', `/events/${slug}`);
                                                router.push('/login');
                                            }}
                                            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-95"
                                        >
                                            Login Sekarang
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sudah Terdaftar</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                        Anda sudah terdaftar di program ini dengan akses tiket <strong className="text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{eventData.user_registration?.tier}</strong>.
                                    </p>

                                    {eventData.user_registration?.status === 'pending' && (
                                        <div className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 p-3 rounded-xl mb-6 font-medium">
                                            Status tagihan Anda saat ini masih <strong>Pending</strong>. Silakan selesaikan pembayaran untuk mengaktifkan ruang kelas.
                                        </div>
                                    )}

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-600">
                                            Tutup
                                        </button>
                                        <Link
                                            href={`/my-events/${slug}`}
                                            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center justify-center active:scale-95"
                                        >
                                            Buka Kelas
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>

            {/* 🔥 SHARE MODAL WITH BROADCAST 🔥 */}
            <>
                {isShareModalOpen && (() => {
                    const shareUrl = `${window.location.origin}/events/${eventData?.id || slug}`;
                    const shareTitle = eventData?.title || 'Program Unggulan Amania';
                    const fullDesc = stripHtmlToText(eventData?.description || '');

                    let dateStr = '-';
                    let timeStr = '-';
                    try {
                        const d = new Date(eventData?.start_time);
                        dateStr = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                        const tEnd = new Date(eventData?.end_time);
                        timeStr = `${d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} - ${tEnd.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} WIB`;
                    } catch (e) { }

                    const locStr = eventData?.venue || 'Offline';
                    let priceStr = '';
                    const basicPrice = eventData?.basic_price || 0;
                    const premiumPrice = eventData?.premium_price || 0;

                    if (premiumPrice > 0) {
                        priceStr = `\n▫️ Basic: ${basicPrice === 0 ? '*GRATIS*' : 'Rp ' + basicPrice.toLocaleString('id-ID')}\n▫️ Premium: Rp ${premiumPrice.toLocaleString('id-ID')}`;
                    } else {
                        priceStr = basicPrice === 0 ? '*GRATIS!*' : 'Rp ' + basicPrice.toLocaleString('id-ID');
                    }

                    const shareIntro = `🎉 *INFO EVENT MENARIK!* 🎉\n\nYuk tingkatkan skill kamu dengan ikutan program eksklusif:\n🎓 *"${shareTitle}"*\n\n${fullDesc.substring(0, 150)}...\n\n🗓 *WAKTU & TEMPAT:*\nHari/Tgl: ${dateStr}\nWaktu: ${timeStr}\nLokasi: ${locStr}\n\n💰 *BIAYA:* ${priceStr}\n\nJangan sampai ketinggalan! 🔥\n📍 *Cek detail & daftar sekarang di sini:*\n`;
                    const bcText = `${shareIntro}${shareUrl}\n\n_Powered by Amania.id_`;

                    const waUrl = `https://wa.me/?text=${encodeURIComponent(bcText)}`;
                    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(bcText)}`;

                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <div onClick={() => setIsShareModalOpen(false)} className="absolute inset-0 bg-slate-900/50" />
                            <div
                                className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl z-10 p-6">
                                <button onClick={() => setIsShareModalOpen(false)} className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full z-10">
                                    <X size={16} />
                                </button>

                                {/* Preview Card */}
                                <div className="relative aspect-[2.2/1] bg-indigo-900 rounded-xl overflow-hidden">
                                    {eventData?.image && (
                                        <img src={`${STORAGE_URL}/${eventData.image}`} alt={eventData.title} className="w-full h-full object-cover opacity-30" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                        <span className="text-[8px] sm:text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 block">Bagikan Program</span>
                                        <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">{eventData?.title}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-white/70 flex items-center gap-1"><CalendarHeart size={10} /> {dateStr}</span>
                                            <span className="text-[9px] sm:text-[10px] font-bold text-white/70 flex items-center gap-1"><MapPin size={10} /> {eventData?.venue || 'Offline'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Broadcast Preview */}
                                <div className="p-4 sm:p-5">
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">Preview Broadcast</p>
                                    <div className="bg-slate-50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 sm:p-4 text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line max-h-28 overflow-y-auto custom-scrollbar">
                                        {bcText}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2">
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        Bagikan via WhatsApp
                                    </a>
                                    <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                        Bagikan via Telegram
                                    </a>
                                    <button onClick={handleCopyLink} className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-2 active:scale-95">
                                        <LinkIcon size={16} /> Salin Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </>

            <style jsx global>{`
 .q-content {
 font-size: 0.95rem;
 line-height: 1.7;
 color: #334155; /* dark handled by globals */
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

 .q-content strong, .q-content b { font-weight: 800; color: #0f172a; }
 .q-content em, .q-content i { font-style: italic; }
 .q-content u { text-decoration: underline; }
 .q-content s { text-decoration: line-through; }

 .q-content h1 { font-size:1.75rem; font-weight:900; color:#0f172a; margin:1.5rem 0 0.5rem !important; line-height:1.3; }
 .q-content h2 { font-size:1.5rem; font-weight:800; color:#0f172a; margin:1.25rem 0 0.4rem !important; line-height:1.35; }
 .q-content h3 { font-size:1.25rem; font-weight:700; color:#0f172a; margin:1rem 0 0.35rem !important; line-height:1.4; }
 .q-content h4 { font-size:1.1rem; font-weight:700; color:#1e293b; margin:0.75rem 0 0.25rem !important; }

 .q-content ul { padding-left:1.5em; margin:0; list-style-type:disc; }
 .q-content ol { padding-left:1.5em; margin:0; list-style-type:decimal; }
 .q-content li { margin-bottom:0.2rem !important; }

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

 .q-content img, .q-content video, .q-content iframe {
 max-width:100%; height:auto; border-radius:0.75rem;
 margin:0.75rem 0; box-shadow:0 4px 20px rgba(0,0,0,0.08);
 }

 .q-content a { color:#4f46e5; text-decoration:underline; text-underline-offset:2px; }
 .q-content a:hover { color:#4338ca; }

 .custom-scrollbar::-webkit-scrollbar { display:none; }
 .custom-scrollbar { -ms-overflow-style:none; scrollbar-width:none; }
 `}</style>
        </div>
    );
}