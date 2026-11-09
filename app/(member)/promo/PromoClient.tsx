"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/api';
import { Sparkles, Loader2, Megaphone, ExternalLink, Ticket, Copy, Check, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PromoClient() {
  const [ads, setAds] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kode voucher "${code}" berhasil disalin!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatRupiah = (val: number) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [adsRes, vouchersRes] = await Promise.all([
          apiFetch('/advertisements'),
          apiFetch('/vouchers/available'),
        ]);

        const adsJson = await adsRes.json();
        const vouchersJson = await vouchersRes.json();

        if (adsRes.ok && adsJson.success) setAds(adsJson.data || []);
        if (vouchersRes.ok && vouchersJson.success) setVouchers(vouchersJson.data || []);
      } catch (err) {
        console.error("Gagal menarik data promo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-in fade-in duration-500 pb-20">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400" />
            <span>Pusat Penawaran Spesial</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Promo & Voucher Diskon
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Gunakan kode kupon untuk mendapatkan potongan harga spesial pada E-Produk dan Kursus Online Amania.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Promo...</p>
        </div>
      ) : (
        <div className="space-y-16">

          {/* SECTION: VOUCHER DISKON AKTIF */}
          {vouchers.length > 0 && (
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Ticket size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Kupon Diskon Tersedia</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Salin kode dan gunakan saat checkout pembelian</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {vouchers.map((v, idx) => (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Background accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

                    <div>
                      {/* Badge Diskon */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full font-black text-xs border border-emerald-100 dark:border-emerald-500/20">
                          {v.discount_type === 'percent' ? `${v.discount_value}% OFF` : `Potongan ${formatRupiah(v.discount_value)}`}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {v.applicable_to === 'all' ? 'Semua Produk' : v.applicable_to === 'e_product' ? 'E-Produk' : 'Kursus'}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5 leading-snug">
                        {v.name}
                      </h3>

                      {v.min_purchase > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          Min. belanja {formatRupiah(v.min_purchase)}
                        </p>
                      )}

                      {v.expires_at && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-4">
                          <Clock size={12} /> Berlaku hingga {new Date(v.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Copy Box */}
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl font-mono font-black text-sm tracking-widest text-violet-600 dark:text-violet-400 truncate">
                        {v.code}
                      </div>
                      <button
                        onClick={() => handleCopy(v.code)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0 ${
                          copiedCode === v.code
                            ? 'bg-emerald-600 text-white'
                            : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                        }`}
                      >
                        {copiedCode === v.code ? <Check size={14} /> : <Copy size={14} />}
                        {copiedCode === v.code ? 'Disalin' : 'Salin'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: BANNER IKLAN / PROMO */}
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Banner Promo & Iklan</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Informasi program, event, dan penawaran mitra Amania</p>
              </div>
            </div>

            {ads.length === 0 ? (
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
                <Megaphone size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">Belum Ada Banner Iklan</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nantikan info penawaran menarik selanjutnya dari Amania.</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {ads.map((ad, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={ad.id}
                    className="break-inside-avoid relative group rounded-[2rem] overflow-hidden shadow-md dark:shadow-black/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {ad.url ? (
                      <a href={ad.url} target="_blank" rel="noreferrer" className="block relative h-full w-full">
                        <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`} alt={ad.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="bg-white text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2">
                            Lihat Penawaran <ExternalLink size={16} />
                          </span>
                        </div>
                      </a>
                    ) : (
                      <div className="block relative h-full w-full">
                        <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`} alt={ad.title} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
