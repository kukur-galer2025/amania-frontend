"use client";

import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/app/utils/api';
import { Sparkles, Loader2, Megaphone, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PromoClient() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await apiFetch('/advertisements');
        const json = await res.json();
        if (res.ok && json.success) {
          setAds(json.data);
        }
      } catch (err) {
        console.error("Gagal menarik data promo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-extrabold uppercase tracking-wider mb-4 border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400" />
            <span>Pusat Penawaran Spesial</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
            Promo & Iklan Terbaru
          </h1>
          <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Temukan diskon e-produk, info bootcamp, dan penawaran menarik dari mitra resmi Amania. Jangan sampai terlewatkan!
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Promo...</p>
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-[3rem] p-16 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700">
            <Megaphone size={40} className="text-slate-300 dark:text-slate-500" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Belum Ada Promo Saat Ini</h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Nantikan penawaran menarik selanjutnya dari Amania.</p>
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
  );
}
