"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, ArrowRight, PackageSearch, Search, X,
  SlidersHorizontal, Tag, Gift, ChevronDown, Check,
  Star, Sparkles, TrendingUp, LayoutGrid, List as ListIcon,
  UserCircle, Flame
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/app/utils/api';

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
};

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Terbaru' },
  { value: 'top_rated', label: 'Rating Tertinggi' },
  { value: 'cheapest',  label: 'Termurah' },
  { value: 'priciest',  label: 'Termahal' },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} size={13} style={{ color: '#F59E0B', fill: s <= Math.round(rating) ? '#F59E0B' : 'none', flexShrink: 0 }} />
      ))}
    </span>
  );
}

export default function EProductsClient() {
  const [products,    setProducts]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [sort,        setSort]        = useState('newest');
  const [sortOpen,    setSortOpen]    = useState(false);
  const [priceFilter, setPriceFilter] = useState<'all'|'free'|'paid'>('all');
  const [viewMode,    setViewMode]    = useState<'grid' | 'list'>('grid');

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await apiFetch('/e-products');
        const json = await res.json();
        if (res.ok && json.success) setProducts(json.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    }
    if (priceFilter === 'free') list = list.filter(p => p.price === 0);
    if (priceFilter === 'paid') list = list.filter(p => p.price > 0);
    if (sort === 'top_rated') list.sort((a,b) => (parseFloat(b.reviews_avg_rating)||0) - (parseFloat(a.reviews_avg_rating)||0));
    else if (sort === 'cheapest') list.sort((a,b) => a.price - b.price);
    else if (sort === 'priciest') list.sort((a,b) => b.price - a.price);
    else list.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [products, search, sort, priceFilter]);

  const formatRupiah = (price: number) =>
    price === 0 ? 'GRATIS'
    : new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', minimumFractionDigits:0 }).format(price);

  const currentSort = SORT_OPTIONS.find(o => o.value === sort)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');

        .nx { font-family: 'Plus Jakarta Sans', sans-serif; background: transparent; color: #0F172A; }

        /* ══ HERO ══ */
        .nx-hero {
          position: relative; overflow: hidden;
          background: #FFFFFF; border-bottom: 1px solid #E2E8F0;
          padding: 64px 20px 56px; text-align: center;
        }
        .nx-hero::before {
          content: ''; position: absolute; top: -20%; left: -10%; width: 60%; height: 140%;
          background: radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 60%); pointer-events: none;
        }
        .nx-hero::after {
          content: ''; position: absolute; bottom: -20%; right: -10%; width: 60%; height: 140%;
          background: radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 60%); pointer-events: none;
        }

        /* ── Badge ── */
        .nx-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 14px; border-radius: 999px;
          background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); border: 1px solid #C7D2FE;
          color: #4F46E5; font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase;
          margin-bottom: 20px; box-shadow: 0 4px 12px rgba(79,70,229,0.08);
        }

        /* ── H1 ── */
        .nx-h1 {
          font-size: clamp(1.75rem, 6vw, 3.5rem);
          font-weight: 800; line-height: 1.2; letter-spacing: -.025em;
          color: #0F172A; margin: 0 auto 16px; max-width: 720px;
        }
        .nx-h1 span {
          background: linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nx-sub {
          font-size: clamp(13px, 2.5vw, 15px); font-weight: 500; color: #475569;
          line-height: 1.75; max-width: 520px; margin: 0 auto;
        }

        /* ── Stats glassmorphism (stacks nicely on mobile) ── */
        .nx-stats-wrap {
          display: flex; align-items: center; justify-content: center; gap: 0;
          margin-top: 36px;
          background: rgba(255,255,255,0.75); backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.55); border-radius: 20px;
          box-shadow: 0 8px 24px -8px rgba(79,70,229,0.12); overflow: hidden;
          width: fit-content; max-width: 100%; margin-left: auto; margin-right: auto;
        }
        .nx-stat-item { padding: 16px 28px; text-align: center; flex: 1; min-width: 0; }
        .nx-stat-val {
          font-size: 24px; font-weight: 800; color: #4F46E5; line-height: 1.2;
          letter-spacing: -.02em; display: flex; align-items: center; justify-content: center; gap: 5px;
        }
        .nx-stat-label { font-size: 10px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: .06em; margin-top: 3px; white-space: nowrap; }
        .nx-stat-div { width: 1px; background: #E2E8F0; align-self: stretch; }

        @media (max-width: 480px) {
          .nx-hero { padding: 44px 16px 40px; }
          .nx-stats-wrap { flex-direction: column; width: 100%; border-radius: 16px; }
          .nx-stat-div { width: 100%; height: 1px; align-self: auto; }
          .nx-stat-item { padding: 14px 20px; width: 100%; }
        }

        /* ══ TOOLBAR ══ */
        .nx-toolbar {
          background: rgba(255,255,255,0.92); backdrop-filter: blur(16px);
          border-bottom: 1px solid #E2E8F0; position: sticky; top: 0; z-index: 30;
        }
        .nx-toolbar-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 12px 16px; display: flex; flex-direction: column; gap: 10px;
        }
        @media (min-width: 769px) {
          .nx-toolbar-inner { flex-direction: row; align-items: center; padding: 12px 24px; gap: 12px; }
        }

        /* ── Search ── */
        .nx-search-wrap { position: relative; width: 100%; }
        @media (min-width: 769px) { .nx-search-wrap { flex: 1; } }

        .nx-search {
          width: 100%; padding: 11px 36px 11px 40px;
          border-radius: 12px; border: 1.5px solid #E2E8F0;
          background: #F8FAFC; font-family: inherit; font-size: 14px; font-weight: 500; color: #0F172A; outline: none; transition: all .2s;
          -webkit-appearance: none;
        }
        .nx-search:focus { background: #FFFFFF; border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .nx-search::placeholder { color: #94A3B8; }

        /* ── Toolbar row 2: filters + sort ── */
        .nx-toolbar-row2 {
          display: flex; align-items: center; gap: 8px;
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          padding-bottom: 2px; /* prevent clipping */
          /* scrollbar hidden */
          scrollbar-width: none;
        }
        .nx-toolbar-row2::-webkit-scrollbar { display: none; }

        /* ── Filter pills ── */
        .nx-filter-group { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

        .nx-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 8px 14px; border-radius: 10px; font-family: inherit;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all .18s;
          white-space: nowrap; border: 1.5px solid #E2E8F0; background: #FFFFFF; color: #475569;
          flex-shrink: 0;
        }
        .nx-pill:hover { border-color: #8B5CF6; color: #8B5CF6; background: #F5F3FF; }
        .nx-pill-active {
          background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #FFFFFF;
          border-color: transparent; box-shadow: 0 4px 10px rgba(99,102,241,0.22);
        }
        .nx-pill-active:hover { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFFFFF; }

        /* ── Spacer ── */
        .nx-spacer { flex: 1; min-width: 8px; }

        /* ── View toggle ── */
        .nx-view-toggle {
          display: flex; background: #F1F5F9; border-radius: 10px; padding: 3px;
          border: 1px solid #E2E8F0; flex-shrink: 0;
        }
        @media (max-width: 480px) { .nx-view-toggle { display: none; } }

        .nx-view-btn {
          padding: 7px; border-radius: 7px; border: none; cursor: pointer;
          transition: all .18s; display: flex; align-items: center; justify-content: center;
          background: transparent; color: #94A3B8;
        }
        .nx-view-btn.active { background: #FFFFFF; color: #6366F1; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
        .nx-view-btn:hover:not(.active) { color: #475569; }

        /* ── Sort dropdown ── */
        .nx-sort-wrap { position: relative; flex-shrink: 0; }
        .nx-sort-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px; font-family: inherit;
          font-size: 13px; font-weight: 700; cursor: pointer; transition: all .18s;
          white-space: nowrap; border: 1.5px solid #E2E8F0; background: #FFFFFF; color: #475569;
        }
        .nx-sort-btn:hover { border-color: #C7D2FE; color: #4F46E5; background: #EEF2FF; }
        .nx-sort-menu {
          position: absolute; top: calc(100% + 6px); right: 0; min-width: 174px;
          background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 6px;
          box-shadow: 0 8px 24px rgba(15,23,42,0.10); z-index: 50;
        }
        .nx-sort-item {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding: 9px 12px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all .15s; color: #475569; font-family: inherit; background: transparent; border: none; width: 100%;
        }
        .nx-sort-item:hover { background: #EEF2FF; color: #4F46E5; }
        .nx-sort-item-on { background: #EEF2FF; color: #4F46E5; font-weight: 800; }

        /* ══ RESULT BAR ══ */
        .nx-result-bar {
          max-width: 1200px; margin: 0 auto; padding: 14px 16px 0;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        @media (min-width: 769px) { .nx-result-bar { padding: 14px 24px 0; } }
        .nx-result-text { font-size: 13px; font-weight: 600; color: #64748B; }

        /* ══ SKELETON ══ */
        .nx-skeleton { background: #E2E8F0; border-radius: 8px; position: relative; overflow: hidden; }
        .nx-skeleton::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        /* ══ CARDS ══ */
        .nx-card {
          background: #FFFFFF; border-radius: 18px; overflow: hidden;
          border: 1px solid #E2E8F0; display: flex; flex-direction: column;
          transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
          position: relative; height: 100%;
        }
        .nx-card:hover { transform: translateY(-6px); box-shadow: 0 16px 36px -8px rgba(99,102,241,0.18); border-color: #A5B4FC; }

        /* List view: side-by-side on tablet+ only */
        @media (min-width: 640px) {
          .nx-card.list-view { flex-direction: row; align-items: stretch; }
        }

        /* Image wrap */
        .nx-img-wrap { position: relative; overflow: hidden; background: #F1F5F9; flex-shrink: 0; }
        .nx-card.grid-view .nx-img-wrap,
        .nx-card.list-view .nx-img-wrap { aspect-ratio: 16/10; width: 100%; }

        @media (min-width: 640px) {
          .nx-card.list-view .nx-img-wrap { width: 260px; aspect-ratio: unset; min-height: 100%; }
        }
        @media (min-width: 900px) {
          .nx-card.list-view .nx-img-wrap { width: 300px; }
        }

        .nx-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .45s ease; }
        .nx-card:hover .nx-img { transform: scale(1.04); }

        /* Placeholder icon area */
        .nx-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; min-height: 160px; }

        /* Overlay dim */
        .nx-img-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(15,23,42,0.35) 0%, transparent 40%); pointer-events: none; }

        /* Badges */
        .nx-free-badge {
          position: absolute; top: 12px; right: 12px;
          padding: 5px 12px; border-radius: 999px; font-size: 10px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(135deg, #10B981, #059669); color: #FFFFFF;
          box-shadow: 0 3px 10px rgba(16,185,129,0.28); z-index: 10;
        }
        .nx-bestseller-badge {
          position: absolute; top: 12px; left: 12px;
          padding: 5px 12px; border-radius: 999px; font-size: 10px; font-weight: 800;
          letter-spacing: .06em; text-transform: uppercase;
          background: linear-gradient(135deg, #F59E0B, #EA580C); color: #FFFFFF;
          box-shadow: 0 3px 10px rgba(234,88,12,0.28); z-index: 10;
          display: flex; align-items: center; gap: 4px;
        }

        /* ── Card body ── */
        .nx-body { padding: 18px; flex: 1; display: flex; flex-direction: column; gap: 0; min-width: 0; }
        @media (min-width: 480px) { .nx-body { padding: 20px; } }

        /* Meta row */
        .nx-meta-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
        .nx-author { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; color: #64748B; flex-shrink: 0; }
        .nx-dot { width: 3px; height: 3px; border-radius: 50%; background: #CBD5E1; flex-shrink: 0; }
        .nx-rating-row { display: flex; align-items: center; gap: 5px; flex-wrap: nowrap; }

        /* Title */
        .nx-title {
          font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.4; margin: 0 0 8px;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          transition: color .18s;
        }
        @media (min-width: 640px) { .nx-title { font-size: 17px; } }
        .nx-card:hover .nx-title { color: #4F46E5; }

        /* Description */
        .nx-desc {
          font-size: 13px; color: #64748B; line-height: 1.65; margin: 0;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          flex: 1;
        }

        /* ── Card footer ── */
        .nx-footer {
          margin-top: 16px; padding-top: 14px; border-top: 1px solid #F1F5F9;
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
        }

        .nx-price-wrap {}
        .nx-price-label { font-size: 9px; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 2px; }
        .nx-price { font-size: 20px; font-weight: 800; color: #4F46E5; letter-spacing: -.02em; line-height: 1; }
        .nx-price.free { color: #10B981; }
        @media (min-width: 640px) { .nx-price { font-size: 21px; } }

        .nx-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
          padding: 9px 16px; border-radius: 10px; font-size: 12px; font-weight: 800; color: #FFFFFF;
          background: #0F172A; text-decoration: none;
          transition: all .25s cubic-bezier(0.4, 0, 0.2, 1); flex-shrink: 0;
          white-space: nowrap;
        }
        .nx-card:hover .nx-cta {
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          transform: translateY(-2px); box-shadow: 0 6px 18px rgba(99,102,241,0.28);
        }

        /* ══ CONTENT WRAPPER ══ */
        .nx-content { max-width: 1200px; margin: 0 auto; padding: 24px 16px 72px; }
        @media (min-width: 769px) { .nx-content { padding: 28px 24px 80px; } }

        /* ── Grid ── */
        .nx-grid { display: grid; gap: 16px; }
        @media (min-width: 769px) { .nx-grid { gap: 20px; } }
        @media (min-width: 900px) { .nx-grid { gap: 24px; } }

        /* ── Empty state ── */
        .nx-empty {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 72px 24px; text-align: center;
          background: #FFFFFF; border-radius: 20px; border: 1px dashed #CBD5E1;
        }

        /* ══ BANNER ══ */
        .nx-banner {
          margin-top: 56px; border-radius: 20px; padding: 32px 24px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px;
          flex-wrap: wrap;
          background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
          position: relative; overflow: hidden;
        }
        .nx-banner::after {
          content: ''; position: absolute; right: 0; top: 0; width: 50%; height: 100%;
          background: radial-gradient(circle at right, rgba(255,255,255,0.18) 0%, transparent 60%);
          pointer-events: none;
        }
        @media (min-width: 640px) { .nx-banner { padding: 40px 40px; } }

        .nx-banner-title { font-size: clamp(20px, 4vw, 26px); font-weight: 800; color: #FFFFFF; margin: 0 0 8px; line-height: 1.2; letter-spacing: -.02em; }
        .nx-banner-sub { font-size: 14px; color: #C7D2FE; line-height: 1.6; margin: 0; font-weight: 500; }
        .nx-banner-cta {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 800;
          color: #4F46E5; background: #FFFFFF; text-decoration: none; transition: all .2s;
          white-space: nowrap; flex-shrink: 0; position: relative; z-index: 2;
        }
        .nx-banner-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
      `}</style>

      <div className="nx">

        {/* ════════ HERO ════════ */}
        <section className="nx-hero">
          <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
              <div className="nx-badge"><Sparkles size={12} /> Katalog Digital Premium</div>
            </motion.div>

            <motion.h1 className="nx-h1" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .06, duration: .5 }}>
              Tingkatkan Keahlian Digitalmu <span>Hari Ini.</span>
            </motion.h1>

            <motion.p className="nx-sub" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .14, duration: .5 }}>
              Akses E-Book, Template, dan Modul eksklusif dari praktisi terbaik Amania. Investasi sekali, akses selamanya.
            </motion.p>

            {/* Stats */}
            {!loading && products.length > 0 && (() => {
              const totalRev = products.reduce((s,p) => s + (p.reviews_count||0), 0);
              const withR    = products.filter(p => parseFloat(p.reviews_avg_rating) > 0);
              const avgAll   = withR.length > 0 ? (withR.reduce((s,p) => s + parseFloat(p.reviews_avg_rating), 0) / withR.length).toFixed(1) : null;

              return (
                <motion.div className="nx-stats-wrap" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .28, duration: .5 }}>
                  <div className="nx-stat-item">
                    <p className="nx-stat-val">{products.length}</p>
                    <p className="nx-stat-label">Produk Pilihan</p>
                  </div>
                  {avgAll && (
                    <>
                      <div className="nx-stat-div" />
                      <div className="nx-stat-item">
                        <p className="nx-stat-val">{avgAll} <Star size={18} style={{ color: '#F59E0B', fill: '#F59E0B' }} /></p>
                        <p className="nx-stat-label">Rating Global</p>
                      </div>
                    </>
                  )}
                  {totalRev > 0 && (
                    <>
                      <div className="nx-stat-div" />
                      <div className="nx-stat-item">
                        <p className="nx-stat-val">{totalRev.toLocaleString('id-ID')}</p>
                        <p className="nx-stat-label">Ulasan Terverifikasi</p>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })()}
          </div>
        </section>

        {/* ════════ TOOLBAR ════════ */}
        <div className="nx-toolbar">
          <div className="nx-toolbar-inner">

            {/* Row 1: Search (always full width on mobile) */}
            <div className="nx-search-wrap">
              <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
              <input
                className="nx-search"
                placeholder="Cari E-Book, Template, Modul…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }}
                    onClick={() => setSearch('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#E2E8F0', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
                    <X size={11} style={{ color: '#475569' }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Row 2: Filter pills + view toggle + sort */}
            <div className="nx-toolbar-row2">
              <div className="nx-filter-group">
                {[
                  { val: 'all',  label: 'Semua',    icon: <SlidersHorizontal size={13} /> },
                  { val: 'free', label: 'Gratis',   icon: <Gift size={13} /> },
                  { val: 'paid', label: 'Berbayar', icon: <Tag size={13} /> },
                ].map(({ val, label, icon }) => (
                  <button
                    key={val}
                    onClick={() => setPriceFilter(val as any)}
                    className={`nx-pill ${priceFilter === val ? 'nx-pill-active' : ''}`}>
                    {icon} {label}
                  </button>
                ))}
              </div>

              <div className="nx-spacer" />

              {/* View toggle — hidden on very small screens via CSS */}
              <div className="nx-view-toggle">
                <button onClick={() => setViewMode('grid')} className={`nx-view-btn ${viewMode === 'grid' ? 'active' : ''}`} title="Grid View">
                  <LayoutGrid size={15} strokeWidth={2.5} />
                </button>
                <button onClick={() => setViewMode('list')} className={`nx-view-btn ${viewMode === 'list' ? 'active' : ''}`} title="List View">
                  <ListIcon size={15} strokeWidth={2.5} />
                </button>
              </div>

              {/* Sort */}
              <div className="nx-sort-wrap" ref={sortRef}>
                <button className="nx-sort-btn" onClick={() => setSortOpen(o => !o)}>
                  <TrendingUp size={14} style={{ color: '#4F46E5', flexShrink: 0 }} />
                  <span>{currentSort.label}</span>
                  <ChevronDown size={13} style={{ transition: 'transform .2s', transform: sortOpen ? 'rotate(180deg)' : 'rotate(0)', color: '#94A3B8', flexShrink: 0 }} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      className="nx-sort-menu"
                      initial={{ opacity: 0, y: 5, scale: .97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: .97 }}
                      transition={{ duration: .14 }}>
                      {SORT_OPTIONS.map(o => (
                        <button
                          key={o.value}
                          className={`nx-sort-item ${sort === o.value ? 'nx-sort-item-on' : ''}`}
                          onClick={() => { setSort(o.value); setSortOpen(false); }}>
                          {o.label}
                          {sort === o.value && <Check size={13} style={{ flexShrink: 0, color: '#4F46E5' }} />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* Result bar */}
        <AnimatePresence>
          {!loading && (
            <motion.div className="nx-result-bar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="nx-result-text">
                Menampilkan <strong style={{ color: '#4F46E5' }}>{filtered.length}</strong> produk
              </span>
              {search && (
                <span className="nx-result-text">
                  untuk &ldquo;<strong style={{ color: '#0F172A' }}>{search}</strong>&rdquo;
                </span>
              )}
              {(search || priceFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setPriceFilter('all'); }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#DC2626', background: '#FEF2F2', border: 'none', cursor: 'pointer' }}>
                  <X size={11} /> Hapus Filter
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════ CONTENT ════════ */}
        <div className="nx-content">

          {/* Skeleton */}
          {loading && (
            <div
              className="nx-grid"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="nx-card grid-view" style={{ border: 'none', boxShadow: 'none' }}>
                  <div className="nx-skeleton" style={{ aspectRatio: '16/10', width: '100%' }} />
                  <div className="nx-body">
                    <div className="nx-skeleton" style={{ height: '20px', width: '75%', marginBottom: '10px' }} />
                    <div className="nx-skeleton" style={{ height: '14px', width: '100%', marginBottom: '6px' }} />
                    <div className="nx-skeleton" style={{ height: '14px', width: '55%', marginBottom: '0' }} />
                    <div className="nx-footer" style={{ borderTopColor: 'transparent' }}>
                      <div className="nx-skeleton" style={{ height: '26px', width: '100px' }} />
                      <div className="nx-skeleton" style={{ height: '36px', width: '88px', borderRadius: '10px' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <motion.div className="nx-empty" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <PackageSearch size={28} strokeWidth={1.5} style={{ color: '#4F46E5' }} />
              </div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Tidak Ada Hasil</p>
              <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '280px', lineHeight: 1.6 }}>Sesuaikan filter atau kata kunci pencarian Anda.</p>
            </motion.div>
          )}

          {/* Products */}
          {!loading && filtered.length > 0 && (
            <motion.div
              className="nx-grid"
              variants={containerVariants} initial="hidden" animate="visible"
              style={{
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))'
                  : '1fr',
              }}>
              <AnimatePresence mode="popLayout">
                {filtered.map(product => {
                  const isFree      = product.price === 0;
                  const avgRating   = parseFloat(product.reviews_avg_rating) || 0;
                  const totalRev    = product.reviews_count || 0;
                  const hasRating   = avgRating > 0;
                  const isBestseller = avgRating >= 4.5 && totalRev >= 1;

                  return (
                    <motion.div
                      key={product.id}
                      variants={cardVariants}
                      layout
                      exit={{ opacity: 0, scale: .95 }}
                      className={`nx-card ${viewMode === 'grid' ? 'grid-view' : 'list-view'}`}>

                      {/* Image */}
                      <div className="nx-img-wrap">
                        {product.cover_image ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${product.cover_image}`}
                            alt={product.title}
                            className="nx-img"
                          />
                        ) : (
                          <div className="nx-img-placeholder">
                            <FileText size={44} strokeWidth={1.5} style={{ color: '#CBD5E1' }} />
                          </div>
                        )}
                        <div className="nx-img-overlay" />
                        {isFree && <div className="nx-free-badge">Gratis</div>}
                        {isBestseller && !isFree && (
                          <div className="nx-bestseller-badge">
                            <Flame size={11} fill="currentColor" /> Bestseller
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="nx-body">

                        {/* Meta */}
                        <div className="nx-meta-row">
                          <div className="nx-author">
                            <UserCircle size={13} style={{ color: '#94A3B8', flexShrink: 0 }} />
                            <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.author?.name?.split(' ')[0] || 'Amania'}
                            </span>
                          </div>
                          {hasRating && (
                            <>
                              <span className="nx-dot" />
                              <div className="nx-rating-row">
                                <StarRow rating={avgRating} />
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{avgRating.toFixed(1)}</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>({totalRev})</span>
                              </div>
                            </>
                          )}
                        </div>

                        <h3 className="nx-title" title={product.title}>{product.title}</h3>

                        {product.description && (
                          <p className="nx-desc">
                            {product.description.replace(/<[^>]+>/g, '')}
                          </p>
                        )}

                        {/* Footer */}
                        <div className="nx-footer">
                          <div className="nx-price-wrap">
                            <p className="nx-price-label">Harga Akses</p>
                            <p className={`nx-price ${isFree ? 'free' : ''}`}>
                              {formatRupiah(product.price)}
                            </p>
                          </div>
                          <Link href={`/e-products/detail?slug=${product.slug}`} className="nx-cta">
                            Detail <ArrowRight size={13} />
                          </Link>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Bottom Banner */}
          {!loading && products.length > 0 && (
            <motion.div
              className="nx-banner"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28, duration: .6 }}>
              <div style={{ position: 'relative', zIndex: 2, flex: 1, minWidth: '220px' }}>
                <h2 className="nx-banner-title">Akselerasi Kariermu</h2>
                <p className="nx-banner-sub">Selain aset digital, temukan juga kelas dan bootcamp intensif kami.</p>
              </div>
              <Link href="/events" className="nx-banner-cta">
                Lihat Bootcamp <ArrowRight size={15} />
              </Link>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}