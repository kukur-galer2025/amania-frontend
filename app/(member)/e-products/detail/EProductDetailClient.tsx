"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowLeft, Loader2, CalendarDays,
  ShoppingCart, UserCircle, ShieldCheck, Zap,
  Infinity, RefreshCw, BadgeDollarSign, Star,
  MessageSquare, Send, CheckCircle2, Lock, ThumbsUp
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

declare global { interface Window { snap: any; } }

const BENEFITS = [
  { icon: Infinity,        label: 'Akses Seumur Hidup',        desc: 'Beli sekali, nikmati selamanya. Tidak ada biaya berulang.',                from: '#6366f1', to: '#8b5cf6', bg: 'linear-gradient(135deg,#eef2ff,#ede9fe)' },
  { icon: RefreshCw,       label: 'Materi Terupdate & Terpercaya', desc: 'Konten selalu diperbarui sesuai tren oleh para praktisi terbaik.',          from: '#0ea5e9', to: '#6366f1', bg: 'linear-gradient(135deg,#e0f2fe,#eef2ff)' },
  { icon: BadgeDollarSign, label: 'Harga Lebih Terjangkau',        desc: 'Nilai premium dengan harga bersahabat — investasi terbaik untuk kariermu.', from: '#10b981', to: '#0ea5e9', bg: 'linear-gradient(135deg,#ecfdf5,#e0f2fe)' },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', lineHeight: 0, borderRadius: '6px', transition: 'transform .15s' }}>
          <Star size={30}
            style={{ color: '#f59e0b', fill: s <= (hovered || value) ? '#f59e0b' : 'none', transition: 'fill .15s, transform .15s', transform: s <= (hovered || value) ? 'scale(1.15)' : 'scale(1)', display: 'block' }} />
        </button>
      ))}
    </div>
  );
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={size} style={{ color: '#f59e0b', fill: s <= Math.round(rating) ? '#f59e0b' : 'none', flexShrink: 0 }} />
      ))}
    </span>
  );
}

function RatingBar({ count, total, star }: { count: number; total: number; star: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', width: '12px', textAlign: 'right', flexShrink: 0 }}>{star}</span>
      <Star size={10} style={{ color: '#f59e0b', fill: '#f59e0b', flexShrink: 0 }} />
      <div style={{ flex: 1, height: '7px', borderRadius: '999px', background: '#f1f5f9', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .7, delay: .2, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', width: '28px', textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
    </div>
  );
}

export default function EProductDetailClient() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const slug         = searchParams.get('slug');

  const [product,    setProduct]    = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const [myRating,   setMyRating]   = useState(0);
  const [myReview,   setMyReview]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const userData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || '';

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res  = await apiFetch(`/e-products/${slug}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setProduct(json.data);
          if (userData && json.data.reviews) {
            const mine = json.data.reviews.find((r: any) => r.user_id === userData.id);
            if (mine) { setMyRating(mine.rating); setMyReview(mine.review || ''); setSubmitted(true); }
          }
        } else { toast.error('Produk tidak ditemukan.'); router.push('/e-products'); }
      } catch { toast.error('Gagal memuat data.'); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const handlePurchase = async () => {
    if (!userData) {
      toast.error('Silakan masuk terlebih dahulu.');
      sessionStorage.setItem('redirectAfterLogin', `/e-products/detail?slug=${slug}`);
      router.push('/login'); return;
    }
    setBtnLoading(true);
    const tid = toast.loading('Menyiapkan pembayaran...');
    try {
      const res  = await apiFetch('/checkout/e-product', { method: 'POST', body: JSON.stringify({ e_product_id: product.id }) });
      const json = await res.json();
      if (!res.ok || !json.success) { toast.error(json.message || 'Gagal.', { id: tid }); setBtnLoading(false); return; }
      if (json.is_free) { toast.success('Produk gratis berhasil diklaim!', { id: tid }); setBtnLoading(false); return; }
      if (json.snap_token && window.snap) {
        toast.dismiss(tid);
        window.snap.pay(json.snap_token, {
          onSuccess: () => { toast.success('Pembayaran sukses!'); setBtnLoading(false); },
          onPending:  () => { toast('Pembayaran pending.', { icon: '⏳' }); setBtnLoading(false); },
          onError:    () => { toast.error('Pembayaran gagal.'); setBtnLoading(false); },
          onClose:    () => { toast('Ditutup.', { icon: 'ℹ️' }); setBtnLoading(false); },
        });
      } else { toast.error('Gateway tidak tersedia.', { id: tid }); setBtnLoading(false); }
    } catch { toast.error('Kesalahan koneksi.', { id: tid }); setBtnLoading(false); }
  };

  const handleSubmitReview = async () => {
    if (myRating === 0) { toast.error('Pilih bintang terlebih dahulu.'); return; }
    setSubmitting(true);
    try {
      const res  = await apiFetch(`/e-products/${product.id}/review`, {
        method: 'POST', body: JSON.stringify({ rating: myRating, review: myReview }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Ulasan berhasil disimpan!');
        setSubmitted(true);
        const r2 = await apiFetch(`/e-products/${slug}`);
        const j2 = await r2.json();
        if (r2.ok && j2.success) setProduct(j2.data);
      } else { toast.error(json.message || 'Gagal menyimpan ulasan.'); }
    } catch { toast.error('Kesalahan koneksi.'); }
    finally { setSubmitting(false); }
  };

  const formatRupiah = (price: number) =>
    price === 0 ? 'GRATIS'
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const reviews      = product?.reviews || [];
  const totalReviews = product?.reviews_count || reviews.length;
  const avgRating    = parseFloat(product?.reviews_avg_rating) || 0;
  const ratingDist   = [5, 4, 3, 2, 1].map(s => ({
    star: s,
    count: reviews.filter((r: any) => r.rating === s).length,
  }));

  const getAvatar = (user: any) => {
    if (!user?.avatar) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&bold=true`;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `${STORAGE_URL}/${user.avatar}`;
  };

  if (loading) return (
    <div style={{ minHeight: '72vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: .85, ease: 'linear' }}>
        <Zap size={26} style={{ color: '#6366f1' }} />
      </motion.div>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#a5b4fc', letterSpacing: '.1em', textTransform: 'uppercase', margin: 0 }}>Memuat produk…</p>
    </div>
  );

  const isFree = product?.price === 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Sora:wght@400;500;600;700;800&display=swap');

        /* DIHAPUS: *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } */
        
        .epd { font-family: 'Sora', sans-serif; background: transparent; }

        /* ── Wrapper ── */
        .epd-wrap { max-width: 1140px; margin: 0 auto; padding: 24px 16px 80px; }
        @media (min-width: 640px) { .epd-wrap { padding: 28px 20px 96px; } }
        @media (min-width: 900px) { .epd-wrap { padding: 32px 24px 100px; } }

        /* ── Back link ── */
        .epd-back {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 999px;
          font-size: 12px; font-weight: 700; letter-spacing: .03em;
          color: #64748b; background: #fff; border: 1.5px solid #ede9fe;
          text-decoration: none; transition: .2s;
          box-shadow: 0 2px 8px rgba(99,102,241,.07); font-family: 'Sora', sans-serif;
        }
        .epd-back:hover { color: #6366f1; border-color: #c7d2fe; }

        /* ── Layout ── */
        .epd-layout { display: flex; flex-direction: column; gap: 20px; margin-top: 20px; }
        @media (min-width: 860px) {
          .epd-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
        }

        /* ── Sticky sidebar (desktop only) ── */
        .epd-sticky { position: static; }
        @media (min-width: 860px) { .epd-sticky { position: sticky; top: 80px; } }

        /* ── Cards ── */
        .epd-card {
          background: #fff; border-radius: 20px;
          border: 1px solid #ede9fe; box-shadow: 0 2px 14px rgba(99,102,241,.06);
          overflow: hidden;
        }
        .epd-pad { padding: 20px; }
        @media (min-width: 480px) { .epd-pad { padding: 24px; } }
        @media (min-width: 640px) { .epd-pad { padding: 28px 30px; } }

        /* ── Label divider ── */
        .epd-label {
          display: flex; align-items: center; gap: 10px;
          font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
          color: #6366f1; margin-bottom: 16px;
        }
        .epd-label::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg,#e0e7ff,transparent); }

        /* ── Title ── */
        .epd-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.5rem, 5vw, 2.4rem);
          font-weight: 400; line-height: 1.15; color: #0a0a14;
          letter-spacing: -.02em; margin: 0 0 20px;
        }

        /* ── Chips ── */
        .epd-chips { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 16px; border-top: 1px solid #f0eeff; }
        .epd-chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 13px; border-radius: 10px;
          font-size: 11px; font-weight: 600; color: #4338ca;
          background: #eef2ff; border: 1px solid #c7d2fe; font-family: 'Sora', sans-serif;
          white-space: nowrap;
        }
        .epd-chip-green { background: #f0fdf4; border-color: #a7f3d0; color: #166534; }

        /* ── Prose ── */
        .epd-prose { font-size: 14px; line-height: 1.85; color: #374151; }
        .epd-prose p { margin: 0 0 .9em; }
        .epd-prose h2, .epd-prose h3 { font-family: 'DM Serif Display', serif; font-weight: 400; color: #0a0a14; margin: 1.4em 0 .4em; }
        .epd-prose ul { padding-left: 1.4em; margin: 0 0 .9em; }
        .epd-prose li { margin-bottom: .35em; }
        .epd-prose strong { color: #0a0a14; font-weight: 700; }

        /* ── Benefits ── */
        .epd-benefit {
          border-radius: 16px; padding: 16px 18px;
          display: flex; align-items: flex-start; gap: 14px;
          border: 1px solid transparent; transition: transform .28s, box-shadow .28s, border-color .28s;
          position: relative; overflow: hidden; cursor: default;
        }
        .epd-benefit:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(99,102,241,.1); border-color: #e0e7ff; }
        .epd-benefit-icon { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

        /* ── Sidebar / purchase card ── */
        .epd-sidebar {
          background: #fff; border-radius: 20px;
          border: 1px solid #ede9fe; box-shadow: 0 8px 28px rgba(99,102,241,.09);
          overflow: hidden;
        }

        /* On mobile: sidebar comes FIRST (before left column) via order */
        .epd-sidebar-order { order: -1; }
        @media (min-width: 860px) { .epd-sidebar-order { order: 0; } }

        /* ── Cover image ── */
        .epd-cover { position: relative; width: 100%; overflow: hidden; background: #eef2ff; }
        .epd-cover { aspect-ratio: 16/9; } /* Wider on mobile */
        @media (min-width: 860px) { .epd-cover { aspect-ratio: 4/3; } }
        .epd-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .5s ease; }
        .epd-sidebar:hover .epd-cover img { transform: scale(1.04); }
        .epd-cover-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,10,20,.5) 0%, transparent 50%); pointer-events: none; }
        .epd-vbadge {
          position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
          padding: 4px 14px; border-radius: 999px;
          font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
          background: rgba(255,255,255,.92); color: #6366f1;
          backdrop-filter: blur(8px); border: 1px solid #c7d2fe;
          white-space: nowrap; font-family: 'Sora', sans-serif;
        }

        /* ── Price block ── */
        .epd-price-block { padding: 18px 20px 0; }
        @media (min-width: 480px) { .epd-price-block { padding: 20px 24px 0; } }
        .epd-price-label { font-size: 9px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #a5b4fc; margin: 0 0 4px; }
        .epd-price { font-family: 'Sora', sans-serif; font-size: clamp(1.8rem, 6vw, 2.4rem); font-weight: 800; letter-spacing: -.04em; line-height: 1; color: #0a0a14; }
        .epd-price.free { color: #059669; }
        .epd-no-recur { font-size: 11px; color: #94a3b8; margin: 3px 0 0; font-weight: 500; }

        /* ── Divider ── */
        .epd-divider { height: 1px; background: linear-gradient(90deg,#e0e7ff,#f5f3ff,#e0e7ff); margin: 16px 20px; }
        @media (min-width: 480px) { .epd-divider { margin: 18px 24px; } }

        /* ── CTA block ── */
        .epd-cta-block { padding: 0 20px 20px; display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 480px) { .epd-cta-block { padding: 0 24px 24px; gap: 12px; } }

        /* ── Mini benefit rows ── */
        .epd-mini-row { display: flex; align-items: center; gap: 10px; font-size: 12px; font-weight: 600; color: #374151; }
        .epd-mini-icon { width: 26px; height: 26px; border-radius: 7px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }

        /* ── Buy button ── */
        .epd-buy {
          width: 100%; border: none; cursor: pointer; position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 15px 20px; border-radius: 16px;
          font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 800;
          color: #fff; letter-spacing: -.01em;
          background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#6366f1 100%);
          box-shadow: 0 8px 24px rgba(99,102,241,.35);
          transition: all .28s cubic-bezier(.22,.68,0,1.2);
        }
        .epd-buy:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 16px 36px rgba(99,102,241,.42); }
        .epd-buy:active { transform: scale(.99); }
        .epd-buy:disabled { opacity: .65; cursor: not-allowed; transform: none; }
        @keyframes shine { 0%{transform:translateX(-160%) skewX(-20deg)} 100%{transform:translateX(280%) skewX(-20deg)} }
        .epd-shine { position: absolute; top: 0; left: 0; width: 45%; height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent); animation: shine 2.2s ease-in-out infinite; }

        /* ── Author strip ── */
        .epd-author-strip { border-top: 1px solid #f0eeff; padding-top: 14px; display: flex; flex-direction: column; gap: 7px; }

        /* ── Review card ── */
        .epd-review-card { background: #fafaff; border-radius: 14px; padding: 16px; border: 1px solid #ede9fe; transition: box-shadow .2s; }
        .epd-review-card:hover { box-shadow: 0 6px 18px rgba(99,102,241,.07); }

        /* ── Review meta row ── */
        .epd-review-meta { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }

        /* ── Textarea ── */
        .epd-textarea {
          width: 100%; padding: 13px 15px; border-radius: 12px;
          border: 1.5px solid #e0e7ff; background: #fafaff;
          font-family: 'Sora', sans-serif; font-size: 13px; color: #0f172a;
          outline: none; resize: vertical; min-height: 90px;
          transition: border-color .2s, box-shadow .2s; line-height: 1.65;
        }
        .epd-textarea:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }
        .epd-textarea::placeholder { color: #94a3b8; }

        /* ── Submit button ── */
        .epd-submit {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 11px 22px; border-radius: 12px;
          font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700;
          color: #fff; background: linear-gradient(135deg,#6366f1,#7c3aed);
          border: none; cursor: pointer; transition: all .2s;
          box-shadow: 0 4px 12px rgba(99,102,241,.28);
        }
        .epd-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(99,102,241,.36); }
        .epd-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        /* ── Rating overview box ── */
        .epd-rating-overview {
          display: flex; gap: 24px; align-items: center;
          padding: 18px 20px; border-radius: 16px;
          background: linear-gradient(135deg,#fafaff,#f5f3ff);
          border: 1px solid #ede9fe; margin-bottom: 20px;
        }
        @media (max-width: 420px) {
          .epd-rating-overview { flex-direction: column; gap: 16px; align-items: flex-start; }
        }

        /* ── Empty review ── */
        .epd-empty-review {
          display: flex; flex-direction: column; align-items: center;
          padding: 36px 20px; gap: 10px; text-align: center;
          border-radius: 14px; background: #fafaff; border: 1.5px dashed #ddd6fe;
        }

        /* ── Trust line ── */
        .epd-trust { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; color: #94a3b8; font-weight: 500; }

        /* ── Login prompt ── */
        .epd-login-prompt {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 16px 18px; border-radius: 14px;
          background: #fafaff; border: 1.5px dashed #ddd6fe;
          flex-wrap: wrap;
        }
        .epd-login-cta {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          font-size: 12px; font-weight: 700; color: #fff;
          background: linear-gradient(135deg,#6366f1,#7c3aed);
          text-decoration: none; flex-shrink: 0; white-space: nowrap;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="epd">
        <div className="epd-wrap">

          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .38 }}>
            <Link href="/e-products" className="epd-back"><ArrowLeft size={13} /> Kembali ke Katalog</Link>
          </motion.div>

          <div className="epd-layout">

            {/* ══════════════ SIDEBAR (first on mobile via order) ══════════════ */}
            <motion.div className="epd-sticky epd-sidebar-order" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .45 }}>
              <div className="epd-sidebar">

                {/* Cover */}
                <div className="epd-cover">
                  {product.cover_image
                    ? <img src={`${STORAGE_URL}/${product.cover_image}`} alt={product.title} />
                    : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', minHeight: '180px' }}>
                        <FileText size={52} strokeWidth={.9} style={{ color: '#a5b4fc' }} />
                      </div>
                    )
                  }
                  <div className="epd-cover-overlay" />
                  {avgRating > 0 && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '999px', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)', fontSize: '12px', fontWeight: 800, color: '#0a0a14', border: '1px solid rgba(255,255,255,.6)' }}>
                      <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} /> {avgRating.toFixed(1)}
                      <span style={{ fontWeight: 500, color: '#64748b', fontSize: '10px' }}>({totalReviews})</span>
                    </div>
                  )}
                  <div className="epd-vbadge">✦ Amania Verified</div>
                </div>

                {/* Price */}
                <div className="epd-price-block">
                  <p className="epd-price-label">Investasi Sekali Beli</p>
                  <p className={`epd-price ${isFree ? 'free' : ''}`}>{formatRupiah(product.price)}</p>
                  {!isFree && <p className="epd-no-recur">Tidak ada biaya berulang</p>}
                </div>

                <div className="epd-divider" />

                <div className="epd-cta-block">
                  {/* Mini benefits */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' }}>
                    {[
                      { bg: '#eef2ff', color: '#6366f1', icon: Infinity,        text: 'Akses seumur hidup' },
                      { bg: '#e0f2fe', color: '#0ea5e9', icon: RefreshCw,       text: 'Materi selalu diperbarui' },
                      { bg: '#ecfdf5', color: '#10b981', icon: BadgeDollarSign, text: 'Harga paling terjangkau' },
                      { bg: '#fef3c7', color: '#d97706', icon: ShieldCheck,     text: 'Konten terverifikasi' },
                    ].map(({ bg, color, icon: Ic, text }) => (
                      <div key={text} className="epd-mini-row">
                        <div className="epd-mini-icon" style={{ background: bg }}><Ic size={13} style={{ color }} strokeWidth={2} /></div>
                        {text}
                      </div>
                    ))}
                  </div>

                  {/* Buy button */}
                  <button className="epd-buy" onClick={handlePurchase} disabled={btnLoading}>
                    {!btnLoading && <div className="epd-shine" />}
                    {btnLoading
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Menghubungkan…</>
                      : <><ShoppingCart size={16} /> {isFree ? 'Klaim Gratis Sekarang' : 'Beli Sekarang'}</>
                    }
                  </button>

                  {/* Trust */}
                  <div className="epd-trust">
                    <ShieldCheck size={12} style={{ color: '#34d399' }} /> Pembayaran 100% aman & terenkripsi
                  </div>

                  {/* Author strip */}
                  <div className="epd-author-strip">
                    <div className="epd-mini-row">
                      <UserCircle size={13} style={{ color: '#818cf8', flexShrink: 0 }} />
                      <span>Oleh <strong style={{ color: '#0a0a14', fontWeight: 700 }}>{product.author?.name || 'Admin Amania'}</strong></span>
                    </div>
                    <div className="epd-mini-row">
                      <CalendarDays size={13} style={{ color: '#818cf8', flexShrink: 0 }} />
                      <span>{new Date(product.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ══════════════ LEFT COLUMN ══════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

              {/* Hero card */}
              <motion.div className="epd-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }}>
                <div className="epd-pad">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 13px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', color: '#4f46e5', border: '1px solid #c7d2fe', fontFamily: 'Sora, sans-serif' }}>✦ Digital Asset</span>
                    {isFree && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 13px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)', color: '#065f46', border: '1px solid #6ee7b7', fontFamily: 'Sora, sans-serif' }}>✦ Gratis</span>}
                  </div>
                  <h1 className="epd-title">{product.title}</h1>
                  <div className="epd-chips">
                    <span className="epd-chip"><UserCircle size={13} style={{ color: '#818cf8' }} />{product.author?.name || 'Admin Amania'}</span>
                    <span className="epd-chip"><CalendarDays size={13} style={{ color: '#818cf8' }} />{new Date(product.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="epd-chip epd-chip-green"><ShieldCheck size={13} style={{ color: '#22c55e' }} />Terverifikasi Amania</span>
                  </div>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div className="epd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08, duration: .45 }}>
                <div className="epd-pad">
                  <p className="epd-label"><FileText size={12} />Deskripsi Produk</p>
                  <div className="epd-prose" dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>
              </motion.div>

              {/* Benefits */}
              <motion.div className="epd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .14, duration: .45 }}>
                <div className="epd-pad">
                  <p className="epd-label"><span>✦</span>Kenapa Pilih Produk Ini?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {BENEFITS.map(({ icon: Icon, label, desc, from, to, bg }, i) => (
                      <motion.div key={label} className="epd-benefit" style={{ background: bg }}
                        initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .2 + i * .07, duration: .38 }}>
                        <div className="epd-benefit-icon" style={{ background: `linear-gradient(135deg,${from},${to})` }}>
                          <Icon size={19} style={{ color: '#fff' }} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0a0a14', margin: '0 0 3px', letterSpacing: '-.01em' }}>{label}</p>
                          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '10px', fontWeight: 800, color: from, backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.6)' }}>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Reviews */}
              <motion.div className="epd-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .45 }}>
                <div className="epd-pad">
                  <p className="epd-label"><MessageSquare size={12} />Ulasan Pembeli</p>

                  {/* Rating overview */}
                  {totalReviews > 0 && (
                    <div className="epd-rating-overview">
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <p style={{ fontFamily: 'Sora, sans-serif', fontSize: 'clamp(2.8rem,8vw,3.8rem)', fontWeight: 800, color: '#0a0a14', lineHeight: 1, margin: '0 0 6px', letterSpacing: '-.05em' }}>
                          {avgRating.toFixed(1)}
                        </p>
                        <StarRow rating={avgRating} size={15} />
                        <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, margin: '5px 0 0' }}>{totalReviews} ulasan</p>
                      </div>
                      <div style={{ flex: 1, minWidth: '140px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {ratingDist.map(({ star, count }) => (
                          <RatingBar key={star} star={star} count={count} total={totalReviews} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review list */}
                  {reviews.length === 0 ? (
                    <div className="epd-empty-review">
                      <ThumbsUp size={30} strokeWidth={1.5} style={{ color: '#c4b5fd' }} />
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Belum ada ulasan</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Jadilah yang pertama memberikan ulasan!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {reviews.map((r: any) => (
                        <motion.div key={r.id} className="epd-review-card"
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <img src={getAvatar(r.user)} alt={r.user?.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #e0e7ff' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="epd-review-meta">
                                <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                  {r.user?.name || 'Pengguna Amania'}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                  <StarRow rating={r.rating} size={12} />
                                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500, white: 'nowrap' }}>
                                    {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                              {r.review && (
                                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.7, margin: 0 }}>{r.review}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Review form */}
                  <div style={{ borderTop: '1px solid #f0eeff', paddingTop: '20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0a0a14', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <Star size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      {submitted ? 'Ulasan Kamu' : 'Tulis Ulasan'}
                    </p>

                    {!userData ? (
                      <div className="epd-login-prompt">
                        <Lock size={17} style={{ color: '#a78bfa', flexShrink: 0, marginTop: '1px' }} />
                        <div style={{ flex: 1, minWidth: '160px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>Masuk untuk memberi ulasan</p>
                          <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>Hanya pembeli yang telah menyelesaikan pembayaran yang dapat memberikan ulasan.</p>
                        </div>
                        <Link href="/login" className="epd-login-cta">Masuk</Link>
                      </div>
                    ) : submitted ? (
                      <div style={{ padding: '16px 18px', borderRadius: '14px', background: 'linear-gradient(135deg,#ecfdf5,#f0fdf4)', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0, marginTop: '1px' }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#065f46', margin: '0 0 8px' }}>Ulasan kamu telah tersimpan ✓</p>
                          <StarRow rating={myRating} size={14} />
                          {myReview && <p style={{ fontSize: '13px', color: '#374151', margin: '7px 0 0', lineHeight: 1.65 }}>{myReview}</p>}
                        </div>
                        <button onClick={() => setSubmitted(false)}
                          style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '7px', flexShrink: 0 }}>
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', margin: '0 0 8px' }}>Pilih rating bintang</p>
                          <StarPicker value={myRating} onChange={setMyRating} />
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', margin: '0 0 7px' }}>Tulis ulasan <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opsional)</span></p>
                          <textarea className="epd-textarea" value={myReview} onChange={e => setMyReview(e.target.value)}
                            placeholder="Bagikan pengalamanmu menggunakan produk ini…" maxLength={1000} />
                          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right', margin: '4px 0 0' }}>{myReview.length}/1000</p>
                        </div>
                        <div>
                          <button className="epd-submit" onClick={handleSubmitReview} disabled={submitting || myRating === 0}>
                            {submitting
                              ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan…</>
                              : <><Send size={13} /> Kirim Ulasan</>
                            }
                          </button>
                          {myRating === 0 && <p style={{ fontSize: '11px', color: '#f59e0b', margin: '8px 0 0', fontWeight: 600 }}>⚠ Pilih minimal 1 bintang terlebih dahulu</p>}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>

            </div>{/* end left column */}

          </div>{/* end layout */}
        </div>
      </div>
    </>
  );
}