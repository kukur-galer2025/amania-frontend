"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, ArrowLeft, Loader2,
    ShoppingCart, UserCircle, ShieldCheck,
    Infinity as InfinityIcon, RefreshCw, Star,
    MessageSquare, Send, CheckCircle2, Lock, ThumbsUp, X, AlertCircle, Sparkles,
    AlertTriangle, Crown, Layers, Share2, Link as LinkIcon, Banknote, Zap, Award, BadgeCheck, Eye
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

const BENEFITS = [
    { icon: InfinityIcon, label: 'Akses Selamanya', desc: 'Satu kali bayar untuk aset ini seumur hidup.', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200/60 dark:border-amber-500/20' },
    { icon: RefreshCw, label: 'Update Berkala', desc: 'Gratis update jika ada perbaikan materi.', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200/60 dark:border-blue-500/20' },
    { icon: ShieldCheck, label: 'Lisensi Resmi', desc: '100% legal dan terverifikasi oleh Amania.', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200/60 dark:border-emerald-500/20' },
];

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]' : 'text-slate-200 dark:text-slate-600 dark:text-slate-400'} />
            ))}
        </span>
    );
}

export default function EProductDetailClient({ slug }: { slug: string }) {
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    const [isOwned, setIsOwned] = useState(false);

    const [myRating, setMyRating] = useState(0);
    const [myReview, setMyReview] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [isLockedModalOpen, setIsLockedModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [paymentChannels, setPaymentChannels] = useState<any[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<string>('');
    const [isLoadingChannels, setIsLoadingChannels] = useState(false);
    const [channelError, setChannelError] = useState<string | null>(null);

    const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
    const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const headers: Record<string, string> = {};
                if (token && token !== 'null' && token !== 'undefined') {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await apiFetch(`/e-products/${slug}`, { headers });
                const json = await res.json();

                if (res.ok && json.success) {
                    setProduct(json.data);
                    setIsOwned(json.data.is_purchased === true);

                    if (userData && json.data.reviews) {
                        const mine = json.data.reviews.find((r: any) => r.user_id === userData.id);
                        if (mine) {
                            setMyRating(mine.rating);
                            setMyReview(mine.review || '');
                            setSubmitted(true);
                        }
                    }
                } else {
                    toast.error('Produk tidak ditemukan.');
                    router.push('/e-products');
                }
            } catch {
                toast.error('Gagal memuat data.');
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);

    const handleAddToCart = async () => {
        if (!userData) {
            toast.error('Silakan masuk terlebih dahulu.');
            sessionStorage.setItem('redirectAfterLogin', `/e-products/${slug}`);
            router.push('/login'); return;
        }

        setCartLoading(true);
        const tid = toast.loading('Menambahkan ke keranjang...');
        try {
            const res = await apiFetch('/cart', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ e_product_id: product.id })
            });
            const text = await res.text();
            let json;
            try { json = JSON.parse(text); } catch { json = { success: false, message: 'Terjadi kesalahan sistem.' }; }

            toast.dismiss(tid);

            if (res.ok && json.success) {
                window.dispatchEvent(new CustomEvent('showCartModal', {
                    detail: { type: 'success', title: 'Berhasil Masuk!', message: 'Produk telah ditambahkan ke keranjang belanja Anda.' }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('showCartModal', {
                    detail: { type: 'error', title: 'Pemberitahuan', message: json.message || 'Produk gagal dimasukkan.' }
                }));
            }
        } catch (error) {
            toast.dismiss(tid);
            toast.error('Kesalahan jaringan.');
        } finally {
            setCartLoading(false);
        }
    };

    const handleOpenPaymentModal = async () => {
        if (!userData) {
            toast.error('Silakan masuk terlebih dahulu.');
            sessionStorage.setItem('redirectAfterLogin', `/e-products/${slug}`);
            router.push('/login'); return;
        }

        if (product.price === 0) {
            handleProcessCheckout('FREE');
            return;
        }

        setIsPaymentModalOpen(true);
        setIsLoadingChannels(true);
        setChannelError(null);

        try {
            const res = await apiFetch('/checkout/payment-channels', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const json = await res.json();

            if (res.ok && json.success) {
                setPaymentChannels(json.data);
            } else {
                setChannelError(json.message || "Gagal mengambil data metode pembayaran.");
            }
        } catch (error) {
            setChannelError("Terjadi kesalahan jaringan.");
        } finally {
            setIsLoadingChannels(false);
        }
    };

    const handleProcessCheckout = async (methodOverride?: string) => {
        const finalMethod = methodOverride || selectedChannel;

        if (!finalMethod && product.price > 0) {
            toast.error("Pilih metode pembayaran terlebih dahulu!");
            return;
        }

        setBtnLoading(true);
        const tid = toast.loading('Menyiapkan akses eksklusif...');

        try {
            const res = await apiFetch('/checkout/e-product', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ e_product_id: product.id, method: finalMethod })
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                if (json.message?.toLowerCase().includes('sudah memiliki')) {
                    toast.success('Akses sudah di tangan Anda!', { id: tid, icon: '💎' });
                    setIsOwned(true);
                    setIsPaymentModalOpen(false);
                    setIsLockedModalOpen(false);
                } else {
                    toast.error(json.message || 'Gagal memproses pesanan.', { id: tid });
                }
                setBtnLoading(false); return;
            }

            if (json.is_free) {
                toast.success('Produk gratis berhasil diklaim!', { id: tid });
                setIsOwned(true);
                setIsPaymentModalOpen(false);
                setIsLockedModalOpen(false);
                setBtnLoading(false); return;
            }

            if (json.checkout_url) {
                toast.success('Membuka gerbang pembayaran...', { id: tid });
                window.location.href = json.checkout_url;
            } else {
                toast.error('Gateway tidak tersedia.', { id: tid }); setBtnLoading(false);
            }
        } catch { toast.error('Kesalahan koneksi.', { id: tid }); setBtnLoading(false); }
    };

    const handleAccessProduct = () => {
        toast.success('Membuka ruang akses materi...');
        router.push('/my-e-products');
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = `Pelajari: ${product?.title} di Amania`;
    const shareText = `Saya merekomendasikan produk digital premium"${product?.title}"ini. Sangat bermanfaat! Cek detailnya di sini: \n\n${shareUrl}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link berhasil disalin!');
        setIsShareModalOpen(false);
    };

    const handleSubmitReview = async () => {
        if (myRating === 0) { toast.error('Berikan bintang terlebih dahulu.'); return; }
        setSubmitting(true);
        try {
            const res = await apiFetch(`/e-products/${product.id}/reviews`, {
                method: 'POST', body: JSON.stringify({ rating: myRating, review: myReview }),
            });
            const json = await res.json();
            if (res.ok && json.success) {
                toast.success('Ulasan eksklusif Anda tersimpan!');
                setSubmitted(true);
                const token = localStorage.getItem('token');
                const headers: Record<string, string> = {};
                if (token && token !== 'null' && token !== 'undefined') {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const r2 = await apiFetch(`/e-products/${slug}`, { headers });
                const j2 = await r2.json();
                if (r2.ok && j2.success) {
                    setProduct(j2.data);
                    setIsOwned(j2.data.is_purchased === true);
                }
            } else { toast.error(json.message || 'Gagal menyimpan ulasan.'); }
        } catch { toast.error('Kesalahan koneksi.'); }
        finally { setSubmitting(false); }
    };

    const formatRupiah = (price: number) =>
        price === 0 ? 'GRATIS'
            : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    const reviews = product?.reviews || [];
    const totalReviews = product?.reviews_count || reviews.length;
    const avgRating = parseFloat(product?.reviews_avg_rating) || 0;
    const isFree = product?.price === 0;
    const originalPrice = product ? product.price * 5 : 0;

    const authorName = !product?.author?.name || product?.author?.name.toLowerCase() === 'admin amania'
        ? 'Amania Official'
        : product?.author?.name;

    const getAvatar = (user: any) => {
        if (!user?.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e2e8f0&color=334155&bold=true`;
        if (user.avatar.startsWith('http')) return user.avatar;
        return `${STORAGE_URL}/${user.avatar}`;
    };

    const groupedChannels = paymentChannels.reduce((acc, channel) => {
        if (channel.active) {
            if (!acc[channel.group]) acc[channel.group] = [];
            acc[channel.group].push(channel);
        }
        return acc;
    }, {} as Record<string, any[]>);

    if (loading) return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-[#F8FAFC] dark:bg-[#0B1120]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                <Loader2 size={48} className="text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <p className="text-sm font-black text-indigo-500/80 uppercase tracking-[0.3em] animate-pulse">Memuat Aset Premium...</p>
        </div>
    );

    return (
        <div className="min-h-screen font-sans pb-32 lg:pb-24 selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 w-full flex flex-col relative bg-[#F8FAFC] dark:bg-[#0B1120] overflow-x-hidden">

            {/* ════ GLOBAL CSS ANIMATIONS ════ */}
            <style jsx global>{`
 @keyframes shimmer {
 100% { transform: translateX(100%); }
 }
 @keyframes float {
 0%, 100% { transform: translateY(0px); }
 50% { transform: translateY(-12px); }
 }
 @keyframes pulse-glow {
 0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15); }
 50% { box-shadow: 0 0 40px rgba(99,102,241,0.25), 0 0 60px rgba(99,102,241,0.1); }
 }
 @keyframes gradient-shift {
 0% { background-position: 0% 50%; }
 50% { background-position: 100% 50%; }
 100% { background-position: 0% 50%; }
 }
 @keyframes border-glow {
 0%, 100% { border-color: rgba(99,102,241,0.2); }
 50% { border-color: rgba(99,102,241,0.5); }
 }
 .animate-float { animation: float 6s ease-in-out infinite; }
 .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
 .animate-gradient-shift { 
 background-size: 200% 200%;
 animation: gradient-shift 4s ease infinite; 
 }
 .html-content { font-size: 1.05rem; line-height: 1.85; color: #475569; }
 .html-content, .html-content * { word-break: normal !important; word-wrap: normal !important; overflow-wrap: break-word !important; white-space: normal !important; }
 .dark .html-content { color: #cbd5e1; }
 .html-content p { margin-bottom: 1.5em; max-width: 100%; overflow-x: hidden; }
 .html-content img, .html-content video, .html-content iframe { max-width: 100%; height: auto; border-radius: 1rem; margin: 1.5rem 0; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
 .html-content strong { color: #1e293b; font-weight: 800; }
 .dark .html-content strong { color: #f8fafc; }
 .html-content ul { padding-left: 1.5em; margin-bottom: 1.5em; list-style-type: disc; }
 .html-content li { margin-bottom: 0.5em; }
 .html-content h2 { color: #0f172a; font-weight: 900; margin-top: 2.5em; margin-bottom: 1em; font-size: 1.5rem; letter-spacing: -0.02em; }
 .dark .html-content h2 { color: #f8fafc; }
 .custom-scrollbar::-webkit-scrollbar { width: 5px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
 .glass-card {
 background: rgba(255,255,255,0.7);
 backdrop-filter: blur(20px);
 -webkit-backdrop-filter: blur(20px);
 }
 .dark .glass-card {
 background: rgba(15, 23, 42, 0.45);
 }
 .glass-card-strong {
 background: rgba(255,255,255,0.85);
 backdrop-filter: blur(24px);
 -webkit-backdrop-filter: blur(24px);
 }
 .dark .glass-card-strong {
 background: rgba(15, 23, 42, 0.7);
 }
 `}</style>

            {/* ════ AMBIENT BACKGROUND GLOW - ENHANCED ════ */}
            <div className="absolute top-0 left-0 right-0 h-[800px] z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-30%] left-[5%] w-[70%] h-[90%] bg-indigo-50 dark:bg-indigo-500/[0.07] blur-[150px] rounded-full" />
                <div className="absolute top-[5%] right-[5%] w-[50%] h-[70%] bg-violet-400/[0.06] blur-[130px] rounded-full" />
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-blue-400/[0.05] blur-[120px] rounded-full" />
                {/* Decorative grid pattern */}
                <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            </div>

            {/* HEADER NAV */}
            <div className="relative z-40 w-full pt-5 md:pt-8 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link href="/e-products" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs md:text-sm transition-transform duration-300 glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm dark:shadow-black/10 hover:shadow-md dark:shadow-black/15 px-4 sm:px-5 py-2.5 rounded-full group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">Kembali ke Katalog</span><span className="sm:hidden">Kembali</span>
                    </Link>

                    <button onClick={() => setIsShareModalOpen(true)} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold text-xs md:text-sm transition-transform duration-300 glass-card border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm dark:shadow-black/10 hover:shadow-md dark:shadow-black/15 px-4 sm:px-5 py-2.5 rounded-full group">
                        <Share2 size={16} className="group-hover:rotate-12 transition-transform" /> <span className="hidden sm:inline">Bagikan Produk</span><span className="sm:hidden">Bagikan</span>
                    </button>
                </div>
            </div>

            {/* ════ KONTEN UTAMA ════ */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 md:mt-10 w-full">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

                    {/* KOLOM KIRI (KONTEN) */}
                    <div className="flex-1 w-full min-w-0 flex flex-col gap-6 md:gap-10">

                        {/* 1. HEADER & COVER */}
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start pt-2 w-full">

                            {/* Animated Floating Cover - ENHANCED */}
                            <div className="relative mx-auto md:mx-0 shrink-0">
                                {/* Glow ring behind cover */}
                                <div className="absolute -inset-3 bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-blue-500/20 rounded-[2.2rem] blur-xl opacity-60 animate-pulse-glow" />

                                <motion.div
                                    animate={{ y: [-6, 6, -6] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                    className="w-[180px] sm:w-[240px] md:w-[300px] max-w-full aspect-[2/3] shrink-0 rounded-[1.8rem] md:rounded-[2rem] overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(79,70,229,0.35)] dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.65)] border-[3px] border-white dark:border-slate-800 group z-10"
                                >
                                    {product.cover_image ? (
                                        <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-violet-50 to-slate-100 text-indigo-300 gap-3">
                                            <FileText className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
                                            <span className="text-[9px] md:text-xs font-black uppercase tracking-widest text-indigo-400">Premium Asset</span>
                                        </div>
                                    )}

                                    {/* Overlay gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Status Badges on Cover */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                                        {isOwned && (
                                            <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-gradient-to-r from-indigo-600 to-violet-600 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg dark:shadow-black/40 flex items-center gap-1.5 w-fit border border-white dark:border-slate-800/40">
                                                <CheckCircle2 size={12} /> Dimiliki
                                            </motion.span>
                                        )}
                                        {isFree && !isOwned && (
                                            <motion.span initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-gradient-to-r from-emerald-500 to-teal-500 backdrop-blur-md text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg dark:shadow-black/40 w-fit border border-white dark:border-slate-800/40">
                                                <Zap size={12} className="inline mr-1" /> Gratis
                                            </motion.span>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Title & Meta Info */}
                            <div className="flex-1 flex flex-col text-center md:text-left w-full min-w-0 mt-2 md:mt-0">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                    className="inline-flex items-center justify-center md:justify-start gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-200/40 dark:border-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-4 w-fit mx-auto md:mx-0">
                                    <Crown size={13} className="text-indigo-500" /> {product.category?.name || 'Aset Eksklusif'}
                                </motion.div>

                                <motion.h1 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                    className="text-[22px] sm:text-3xl md:text-4xl lg:text-[2.75rem] font-black text-slate-900 dark:text-slate-100 leading-[1.12] tracking-tight mb-5 break-words">
                                    {product.title}
                                </motion.h1>

                                {/* Social Proof Badges */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                    className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-6">
                                    {avgRating > 0 ? (
                                        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-amber-200/50 dark:border-amber-900/30 shadow-sm dark:shadow-black/10 group hover:shadow-md dark:shadow-black/15 transition-transform">
                                            <Star size={15} className="fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-black text-slate-800 dark:text-slate-200">{avgRating.toFixed(1)}</span>
                                            <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500">({totalReviews} Ulasan)</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 glass-card px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-black/10">
                                            <Star size={15} className="text-slate-300 dark:text-slate-600" />
                                            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">Belum ada rating</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-3 py-1.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm dark:shadow-black/10">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span className="text-[9px] sm:text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Terverifikasi</span>
                                    </div>
                                </motion.div>

                                {/* Author Box - ENHANCED */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                                    className="glass-card-strong border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 flex items-center justify-center md:justify-start gap-3 sm:gap-4 w-full md:w-max shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-black/20 overflow-hidden mx-auto md:mx-0 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-black/30 transition-shadow duration-300 group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                        {authorName === 'Amania Official' ? (
                                            <img src="/logo-mini.png" alt="Amania Official" className="w-5 h-5 md:w-6 md:h-6 object-contain dark:brightness-0 dark:invert" />
                                        ) : product.author?.avatar ? (
                                            <img src={`${STORAGE_URL}/${product.author.avatar}`} alt="seller" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle size={26} />
                                        )}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Seller</p>
                                        <p className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5">
                                            {authorName}
                                            {authorName === 'Amania Official' && (
                                                <BadgeCheck size={16} className="text-blue-500 shrink-0" />
                                            )}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* 2. DESKRIPSI HTML CARD - ENHANCED */}
                        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                            className="glass-card-strong rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 w-full mt-2 overflow-hidden relative group">
                            {/* Decorative corner accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/[0.04] to-transparent rounded-bl-[4rem] pointer-events-none" />

                            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-5 md:pb-6 border-b border-slate-100 dark:border-slate-800 relative">
                                <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/50 shrink-0 shadow-sm dark:shadow-black/10">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 leading-none mb-1">Detail Materi</h2>
                                    <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Apa yang akan Anda dapatkan</p>
                                </div>
                            </div>
                            <div className="html-content w-full" dangerouslySetInnerHTML={{ __html: product.description.replace(/&nbsp;/g, ' ') }} />
                        </motion.div>

                        {/* 3. SEKSI ULASAN - ENHANCED */}
                        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
                            className="glass-card-strong rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-8 md:p-10 shadow-[0_8px_40px_rgb(0,0,0,0.04)] border border-slate-200 dark:border-slate-800 w-full relative overflow-hidden">
                            {/* Decorative corner */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/[0.04] to-transparent rounded-bl-[4rem] pointer-events-none" />

                            <div className="flex items-center gap-3 mb-6 md:mb-8 relative">
                                <div className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/60 dark:to-orange-950/60 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-500 border border-amber-200/40 dark:border-amber-900/50 shrink-0 shadow-sm dark:shadow-black/10">
                                    <MessageSquare size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 leading-none mb-1">Ulasan Pembeli</h2>
                                    <p className="text-[9px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Testimoni asli komunitas</p>
                                </div>
                            </div>

                            {/* Rating Summary Bar */}
                            {reviews.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 p-4 sm:p-5 bg-gradient-to-r from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-inner">
                                    <div className="text-center shrink-0">
                                        <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-500 leading-none">{avgRating.toFixed(1)}</p>
                                        <div className="flex items-center gap-0.5 mt-1.5 justify-center">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-amber-200 dark:text-slate-600 dark:text-slate-400'} />
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-amber-700 dark:text-amber-500 font-bold mt-1">{totalReviews} ulasan</p>
                                    </div>
                                    <div className="flex-1 w-full">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = reviews.filter((r: any) => Math.round(r.rating) === star).length;
                                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 w-3.5">{star}</span>
                                                    <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                                                    <div className="flex-1 h-[7px] bg-white dark:bg-slate-800 rounded-full overflow-hidden border border-amber-100 dark:border-amber-900/50">
                                                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-transform duration-500" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 w-5 text-right">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <div className="text-center py-10 md:py-14 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950/60 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed px-4 w-full">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                        <ThumbsUp size={28} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <p className="text-slate-900 dark:text-slate-100 font-black text-base md:text-lg mb-1">Belum ada ulasan</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm">Jadilah yang pertama membuktikan kualitas materi ini.</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:gap-4 mb-8 md:mb-10 w-full">
                                    {reviews.map((r: any, idx: number) => (
                                        <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                            className="p-4 sm:p-5 rounded-xl sm:rounded-2xl glass-card dark:bg-[#111827] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full min-w-0 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-[0_4px_24px_rgba(79,70,229,0.06)] transition-transform duration-300 group/review">
                                            <div className="flex items-center sm:items-start gap-3 w-full sm:w-auto shrink-0">
                                                <img src={getAvatar(r.user)} alt="avatar" className="w-9 h-9 md:w-10 md:h-10 rounded-xl shadow-sm dark:shadow-black/10 border border-slate-100 dark:border-slate-800 group-hover/review:scale-105 transition-transform" />
                                                <div className="min-w-0 sm:hidden flex-1">
                                                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{r.user?.name || 'Member Eksklusif'}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1 w-full">
                                                <div className="hidden sm:flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2.5 w-full">
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{r.user?.name || 'Member Eksklusif'}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 px-3 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 w-fit shrink-0">
                                                        <StarRow rating={r.rating} size={13} />
                                                    </div>
                                                </div>
                                                {/* Rating for mobile */}
                                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 px-3 py-1 rounded-lg border border-amber-100 dark:border-amber-900/30 w-fit shrink-0 mb-2.5 sm:hidden">
                                                    <StarRow rating={r.rating} size={13} />
                                                </div>
                                                {r.review && <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words w-full">{r.review}</p>}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Form Ulasan */}
                            <div className="w-full mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100 mb-5 flex items-center gap-2">
                                    <Star className="text-amber-500 fill-amber-500 w-5 h-5 shrink-0" /> {submitted ? 'Ulasan Anda' : 'Berikan Penilaian'}
                                </h3>

                                {!userData ? (
                                    <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900/60 dark:to-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left w-full">
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-slate-100 text-sm md:text-base mb-1">Akses Penilaian Terkunci</p>
                                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Anda harus masuk dan memiliki produk ini.</p>
                                        </div>
                                        <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white text-sm font-bold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-transform shadow-lg dark:shadow-black/20 shadow-slate-900/20 shrink-0">
                                            Masuk Sistem
                                        </Link>
                                    </div>
                                )
                                    : !isOwned ? (
                                        <div onClick={() => setIsLockedModalOpen(true)} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-950/40 border border-slate-200 dark:border-slate-800 border-dashed rounded-2xl p-6 md:p-10 flex flex-col items-center text-center cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50 dark:bg-indigo-500/10/50 dark:hover:bg-indigo-950/30 transition-transform duration-300 group relative overflow-hidden w-full">
                                            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm dark:shadow-black/10 mb-4 relative z-10 border border-slate-200 dark:border-slate-700 group-hover:scale-110 group-hover:border-amber-200 dark:group-hover:border-amber-500/50 transition-transform">
                                                <Lock className="text-slate-400 dark:text-slate-500 group-hover:text-amber-500 w-6 h-6" />
                                            </div>
                                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-base md:text-lg mb-2 relative z-10">Kawasan Khusus Pemilik</h4>
                                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto relative z-10">Beli akses produk untuk membuka fitur penilaian ini.</p>
                                        </div>
                                    )
                                        : submitted ? (
                                            <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 w-full">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-emerald-800 dark:text-emerald-400 text-sm md:text-base mb-3 flex items-center gap-2"><CheckCircle2 size={16} /> Tersimpan di Sistem</p>
                                                    <StarRow rating={myRating} size={16} />
                                                    {myReview && <p className="text-xs md:text-sm text-emerald-900 dark:text-emerald-300 mt-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm dark:shadow-black/10 break-words">{myReview}</p>}
                                                </div>
                                                <button onClick={() => setSubmitted(false)} className="w-full sm:w-auto text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-200/40 dark:bg-emerald-900/30 hover:bg-emerald-200/70 dark:hover:bg-emerald-900/50 px-5 py-2.5 rounded-xl shrink-0 mt-2 sm:mt-0">Edit Ulasan</button>
                                            </div>
                                        )
                                            : (
                                                <div className="space-y-5 w-full bg-gradient-to-br from-slate-50/80 to-white dark:from-slate-900/60 dark:to-slate-950/60 p-5 md:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                                    <div>
                                                        <label className="block text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Tingkat Kepuasan</label>
                                                        <div className="flex gap-1 md:gap-1.5">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <button key={s} onClick={() => setMyRating(s)} className="p-1 hover:scale-125 transition-transform duration-200 focus:outline-none">
                                                                    <Star className={`w-8 h-8 md:w-10 md:h-10 ${s <= myRating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-slate-300 dark:text-slate-600 dark:text-slate-400 hover:text-amber-200'}`} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Opini Anda (Opsional)</label>
                                                        <textarea value={myReview} onChange={(e) => setMyReview(e.target.value)} placeholder="Tuliskan pengalaman berharga Anda..."
                                                            className="w-full p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 focus:border-indigo-400 dark:focus:border-indigo-500 outline-none transition-transform min-h-[110px] resize-none shadow-sm dark:shadow-black/10" maxLength={1000} />
                                                    </div>
                                                    <button onClick={handleSubmitReview} disabled={submitting || myRating === 0}
                                                        className="w-full sm:w-auto px-8 py-3 md:py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black text-sm rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.4)]">
                                                        {submitting ? <Loader2 size={16} className="animate-spin shrink-0" /> : <Send size={16} className="shrink-0" />} Publish Ulasan
                                                    </button>
                                                </div>
                                            )}
                            </div>
                        </motion.div>
                    </div>

                    {/* KOLOM KANAN (THE LUXURY CHECKOUT VAULT) - ENHANCED */}
                    <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 mt-2 md:mt-4 lg:mt-0 z-30">

                        {/* Glow behind vault */}
                        <div className="hidden lg:block absolute -inset-3 bg-gradient-to-b from-indigo-500/[0.06] via-violet-500/[0.04] to-transparent rounded-[3rem] blur-2xl pointer-events-none" />

                        <div className="glass-card-strong rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.07)] overflow-hidden relative flex flex-col w-full group/vault hover:shadow-[0_25px_70px_rgba(0,0,0,0.09)] transition-shadow duration-500">

                            {/* Animated top accent line */}
                            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-gradient-shift" />

                            <div className="p-5 sm:p-6 md:p-8 relative z-10 bg-gradient-to-b from-white/90 to-slate-50/90 dark:from-slate-900/90 dark:to-slate-950/90">
                                {/* INDIKATOR KEPEMILIKAN */}
                                {isOwned ? (
                                    <div className="inline-flex items-center gap-2 mb-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/60 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-black/10">
                                        <CheckCircle2 size={15} strokeWidth={2.5} />
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Akses Terbuka</p>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-2 mb-5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3.5 py-2 rounded-xl w-fit shadow-sm dark:shadow-black/10">
                                        <Banknote size={13} className="text-indigo-600 dark:text-indigo-400" />
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Investasi Aset</p>
                                    </div>
                                )}

                                {/* HARGA & DISKON */}
                                {!isFree && !isOwned && (
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 line-through decoration-rose-500/60 decoration-2">
                                            {formatRupiah(originalPrice)}
                                        </span>
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-rose-500 to-pink-500 px-2 py-0.5 rounded-md shadow-sm dark:shadow-black/10">
                                            80% OFF
                                        </span>
                                    </div>
                                )}

                                <p className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-2 break-words ${isFree || isOwned ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {isOwned ? 'Terverifikasi' : formatRupiah(product.price)}
                                </p>

                                {!isFree && !isOwned && <p className="text-[11px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">Pembayaran 1x. Tanpa biaya tersembunyi.</p>}
                                {isFree && !isOwned && <p className="text-[11px] md:text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-6">Akses premium gratis khusus Anda.</p>}
                                {isOwned && <p className="text-[11px] md:text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-6">Bahan belajar sudah masuk di brankas Anda.</p>}

                                {/* TOMBOL AKSI (DESKTOP) */}
                                <div className="hidden lg:flex flex-col gap-2.5 w-full">
                                    {isOwned ? (
                                        <button onClick={handleAccessProduct} className="relative w-full py-4 rounded-xl font-black text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_35px_rgba(16,185,129,0.4)] transition-transform flex items-center justify-center gap-2 overflow-hidden group active:scale-[0.98]">
                                            <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:animate-shimmer"></span>
                                            <Layers size={18} className="shrink-0 relative z-10" /> <span className="relative z-10">Buka di Koleksi Saya</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={handleOpenPaymentModal} disabled={btnLoading} className="relative w-full py-4 rounded-xl font-black text-white text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:shadow-[0_12px_35px_rgba(5,150,105,0.4)] transition-transform flex items-center justify-center gap-2 disabled:opacity-70 overflow-hidden group/btn active:scale-[0.98]">
                                                <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-shimmer"></span>
                                                {btnLoading ? <Loader2 size={18} className="animate-spin shrink-0 relative z-10" /> : <Banknote size={18} className="shrink-0 relative z-10 text-emerald-100" />}
                                                <span className="relative z-10">{isFree ? 'Klaim Gratis Sekarang' : 'Beli Langsung'}</span>
                                            </button>

                                            {!isFree && (
                                                <button onClick={handleAddToCart} disabled={cartLoading} className="relative w-full py-3.5 rounded-xl font-black text-indigo-600 dark:text-indigo-400 text-sm bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200/60 dark:border-indigo-900/50 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/40 dark:hover:to-violet-900/40 transition-transform flex items-center justify-center gap-2 disabled:opacity-70 group/cart active:scale-[0.98]">
                                                    {cartLoading ? <Loader2 size={18} className="animate-spin shrink-0" /> : <ShoppingCart size={18} className="shrink-0 group-hover/cart:-translate-y-0.5 transition-transform" />}
                                                    <span>Tambah ke Keranjang</span>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Trust Sign */}
                                {!isOwned && (
                                    <div className="hidden lg:flex items-center justify-center gap-2 mt-4 text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                                        <Lock size={11} className="shrink-0" /> Pembayaran Terenkripsi Aman
                                    </div>
                                )}
                            </div>

                            {/* BENEFITS SECTION */}
                            <div className="border-t border-slate-100 dark:border-slate-700/50 p-5 sm:p-6 md:p-7 flex flex-col gap-3.5 w-full relative z-10">
                                {BENEFITS.map((b, idx) => (
                                    <motion.div key={b.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.08 }}
                                        className="flex gap-3 w-full min-w-0 items-start group/benefit hover:bg-white dark:hover:bg-slate-800/50 p-2 -m-2 rounded-xl">
                                        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${b.bg} ${b.border} border flex items-center justify-center shrink-0 shadow-sm dark:shadow-black/10 group-hover/benefit:scale-110 transition-transform`}>
                                            <b.icon size={16} strokeWidth={2.5} className={`bg-gradient-to-br ${b.gradient} bg-clip-text`} />
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs md:text-sm mb-0.5">{b.label}</p>
                                            <p className="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* ANTI PIRACY WARNING - ENHANCED */}
                            <div className="bg-gradient-to-r from-rose-50/70 to-pink-50/70 dark:from-rose-950/20 dark:to-pink-950/20 border-t border-rose-100 dark:border-rose-900/30 p-4 sm:p-5 w-full flex items-start gap-3 relative z-10">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 flex items-center justify-center shrink-0 border border-rose-200/60 dark:border-rose-800/40">
                                    <AlertTriangle size={14} className="text-rose-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] md:text-[10px] font-black text-rose-900 dark:text-rose-400 mb-0.5 uppercase tracking-widest">Peringatan Lisensi</p>
                                    <p className="text-[9px] md:text-[10px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed font-medium">
                                        Materi dilindungi Hukum. <strong className="dark:text-rose-300">Dilarang keras</strong> menggandakan atau memperjualbelikan aset ini tanpa izin resmi Amania.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* MOBILE STICKY BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-700/50 shadow-[0_-4px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-3 p-3 sm:p-4">
                    {/* Price Column */}
                    <div className="shrink-0 flex flex-col justify-center min-w-0 pl-1 w-[35%]">
                        {!isFree && !isOwned && (
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 line-through decoration-rose-400/60 mb-0.5 truncate">
                                {formatRupiah(originalPrice)}
                            </p>
                        )}
                        <p className={`text-sm sm:text-base font-black tracking-tight leading-none truncate ${isFree || isOwned ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                            {isOwned ? 'Akses Resmi' : formatRupiah(product.price)}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-1 flex gap-2 justify-end">
                        {isOwned ? (
                            <button onClick={handleAccessProduct} className="w-full py-2.5 rounded-xl font-black text-white text-xs bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/15">
                                <Layers size={14} className="shrink-0" /> <span className="truncate">Buka Koleksi</span>
                            </button>
                        ) : (
                            <>
                                {!isFree && (
                                    <button onClick={handleAddToCart} disabled={cartLoading} className="w-11 h-11 shrink-0 rounded-xl text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center active:scale-95 transition-transform disabled:opacity-70">
                                        {cartLoading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
                                    </button>
                                )}
                                <button onClick={handleOpenPaymentModal} disabled={btnLoading} className="flex-1 py-2.5 rounded-xl font-black text-white text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/25 dark:shadow-emerald-600/15 flex items-center justify-center gap-1.5 disabled:opacity-70 active:scale-95 transition-transform overflow-hidden relative group">
                                    <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></span>
                                    {btnLoading ? <Loader2 size={14} className="animate-spin shrink-0 relative z-10" /> : <Banknote size={16} className="shrink-0 relative z-10" />}
                                    <span className="truncate relative z-10">{isFree ? 'Klaim Gratis' : 'Beli Langsung'}</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="pb-safe w-full"></div>
            </div>

            {/* MODAL: AKSES TERKUNCI */}
            <AnimatePresence>
                {isLockedModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLockedModalOpen(false)}
                            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative w-full max-w-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl dark:shadow-black/40 p-6 md:p-8 text-center">
                            <button onClick={() => setIsLockedModalOpen(false)} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={16} />
                            </button>
                            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-amber-200/60 dark:border-amber-500/20">
                                <Lock size={28} className="text-amber-500" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-2">Area VIP Eksklusif</h3>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed px-2">
                                Fitur ulasan hanya terbuka bagi member yang telah resmi memiliki aset digital ini demi menjaga <strong className="text-slate-700 dark:text-slate-200">kredibilitas 100%</strong> di platform Amania.
                            </p>
                            <div className="flex flex-col gap-2.5 w-full">
                                <button onClick={() => { setIsLockedModalOpen(false); handleOpenPaymentModal(); }}
                                    className="w-full py-3.5 rounded-xl font-black text-white text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
                                    <Banknote size={16} className="shrink-0" /> {isFree ? 'Klaim Akses Gratis' : 'Dapatkan Akses Resmi'}
                                </button>
                                <button onClick={() => setIsLockedModalOpen(false)}
                                    className="w-full py-2.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    Tutup Peringatan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: PEMBAYARAN TRIPAY */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, y: 80, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 80, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative bg-white dark:bg-[#111827] rounded-2xl shadow-2xl dark:shadow-black/40 w-full md:w-[600px] max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700/50">

                            {/* Accent line */}
                            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-gradient-shift shrink-0" />

                            {/* Header */}
                            <div className="p-4 sm:p-5 md:p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between shrink-0">
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white truncate">Metode Pembayaran</h3>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Sistem Terenkripsi Aman</p>
                                </div>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-50 dark:bg-rose-500/10 transition-colors shrink-0">
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 sm:p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
                                {isLoadingChannels ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                                        <Loader2 size={40} className="text-indigo-500 animate-spin" />
                                        <p className="text-xs md:text-sm font-bold text-slate-400 dark:text-slate-500 animate-pulse uppercase tracking-widest">Menghubungkan Gateway...</p>
                                    </div>
                                ) : channelError ? (
                                    <div className="text-center py-10">
                                        <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
                                        <p className="text-slate-900 dark:text-white font-black text-base md:text-lg mb-2">Terjadi Kesalahan</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm px-4">{channelError}</p>
                                    </div>
                                ) : Object.keys(groupedChannels).length === 0 ? (
                                    <div className="text-center py-10">
                                        <AlertCircle size={40} className="text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto mb-4" />
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">Metode pembayaran tidak tersedia saat ini.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-5 md:space-y-6">
                                        {(Object.entries(groupedChannels) as [string, any[]][]).map(([groupName, channels]) => (
                                            <div key={groupName}>
                                                <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 md:mb-3 ml-1">{groupName}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-2.5">
                                                    {channels.map((channel: any) => {
                                                        const isSelected = selectedChannel === channel.code;
                                                        return (
                                                            <button key={channel.code} onClick={() => setSelectedChannel(channel.code)}
                                                                className={`flex items-center gap-3 p-3 md:p-3.5 rounded-xl border-2 text-left transition-all active:scale-[0.98]
 ${isSelected
                                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-100 dark:shadow-indigo-900/20'
                                                                        : 'border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/300 hover:border-indigo-300 dark:hover:border-indigo-600/50 shadow-sm'
                                                                    }`}>
                                                                <div className="w-11 h-8 md:w-14 md:h-10 shrink-0 bg-white rounded-lg flex items-center justify-center px-1.5 md:px-2 py-1 border border-slate-100 dark:border-slate-700/30">
                                                                    <img src={channel.icon_url} alt={channel.name} className="max-w-full max-h-full object-contain" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs md:text-sm font-bold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                        {channel.name}
                                                                    </p>
                                                                </div>
                                                                {isSelected && <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 sm:p-5 md:p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                                <div className="text-center sm:text-left min-w-0">
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center sm:justify-start gap-1"><ShieldCheck size={11} /> Tagihan Terenkripsi</p>
                                    <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none">{formatRupiah(product.price)}</p>
                                </div>
                                <button onClick={() => handleProcessCheckout()} disabled={!selectedChannel || btnLoading || !!channelError}
                                    className="w-full sm:w-auto px-6 sm:px-8 py-3 md:py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-500 disabled:shadow-none text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-600/25 dark:shadow-emerald-600/15 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shrink-0">
                                    {btnLoading ? <><Loader2 size={16} className="animate-spin shrink-0" /> <span className="truncate">Memproses...</span></> : <><Banknote size={16} className="shrink-0 text-emerald-100" /><span className="truncate">Selesaikan Pembayaran</span></>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL: SHARE PRODUK */}
            <AnimatePresence>
                {isShareModalOpen && (() => {
                    const cleanDesc = product.description
                        ? product.description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim().substring(0, 150) + '...'
                        : 'Produk digital premium dari Amania.id!';
                    const bcText = `📦 *${product.title}*\n\n${cleanDesc}\n\n⭐ Rating: ${avgRating > 0 ? avgRating.toFixed(1) + '/5' : 'Baru'} (${totalReviews} ulasan)\n👤 Seller: ${authorName}\n💰 ${isFree ? 'GRATIS!' : formatRupiah(product.price) + ' (Diskon 80%)'}\n\n🔗 Lihat detail:\n${shareUrl}\n\n_Powered by Amania.id_`;
                    const waUrl = `https://wa.me/?text=${encodeURIComponent(bcText)}`;
                    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(bcText)}`;
                    return (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShareModalOpen(false)}
                                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="relative w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-2xl dark:shadow-black/40 overflow-hidden">
                                <button onClick={() => setIsShareModalOpen(false)} className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full z-10 backdrop-blur-sm transition-colors">
                                    <X size={16} />
                                </button>

                                {/* Cover Hero Preview */}
                                <div className="relative aspect-[2.2/1] overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700">
                                    {product.cover_image && (
                                        <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} className="w-full h-full object-cover opacity-25" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                                        <span className="text-[8px] sm:text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1 block">Bagikan Produk</span>
                                        <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2">{product.title}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-white/70 flex items-center gap-1">
                                                {authorName === 'Amania Official' && <img src="/logo-mini.png" className="w-3 h-3 object-contain brightness-0 invert" />}
                                                {authorName}
                                            </span>
                                            {avgRating > 0 ? (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-amber-300 flex items-center gap-1">
                                                    <Star size={10} className="fill-amber-300" /> {avgRating.toFixed(1)}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] sm:text-[10px] font-bold text-white/50 flex items-center gap-1">
                                                    <Star size={10} /> Baru
                                                </span>
                                            )}
                                            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-300">
                                                {isFree ? 'GRATIS' : formatRupiah(product.price)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Broadcast Preview */}
                                <div className="p-4 sm:p-5">
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Preview Broadcast</p>
                                    <div className="bg-slate-50 dark:bg-slate-800/300 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 sm:p-4 text-[11px] sm:text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line max-h-28 overflow-y-auto custom-scrollbar">
                                        {bcText}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex flex-col gap-2">
                                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#25D366] hover:bg-[#1fb855] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        Bagikan via WhatsApp
                                    </a>
                                    <a href={tgUrl} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 sm:py-3 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#0088cc]/20 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                                        Bagikan via Telegram
                                    </a>
                                    <button onClick={handleCopyLink} className="w-full py-2.5 sm:py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-center gap-2 active:scale-95 transition-all">
                                        <LinkIcon size={16} /> Salin Link
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

        </div>
    );
}