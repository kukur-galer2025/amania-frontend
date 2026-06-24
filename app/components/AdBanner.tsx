"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

interface AdBannerProps {
  placement: string;
  /** 'banner' = wide landscape carousel (default), 'sidebar' = portrait for sidebar */
  variant?: 'banner' | 'sidebar';
  className?: string;
}

export default function AdBanner({ placement, variant = 'banner', className = '' }: AdBannerProps) {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await apiFetch(`/advertisements?placement=${placement}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Sort by order ascending (API already does this but double-check)
          const sorted = [...json.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          setAds(sorted);
        }
      } catch {
        // Silently fail — ads are non-critical
      }
    };
    fetchAds();
  }, [placement]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (ads.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads, isPaused]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % ads.length);
  }, [ads.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + ads.length) % ads.length);
  }, [ads.length]);

  // Nothing to render
  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];
  if (!currentAd) return null;

  // ========= SIDEBAR VARIANT (Portrait for Articles) =========
  if (variant === 'sidebar') {
    return (
      <div
        className={`relative rounded-xl md:rounded-2xl overflow-hidden shadow-lg dark:shadow-black/20 w-full shrink-0 bg-slate-900 ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full aspect-[4/5]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full"
            >
              {currentAd.url ? (
                <a href={currentAd.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                  <img loading="lazy" src={`${STORAGE_URL}/${currentAd.image_path}`} alt={currentAd.title} className="w-full h-full object-cover" />
                </a>
              ) : (
                <img loading="lazy" src={`${STORAGE_URL}/${currentAd.image_path}`} alt={currentAd.title} className="w-full h-full object-cover" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

          {/* Dots */}
          {ads.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-amber-400 w-5 shadow-sm shadow-black/50'
                      : 'bg-white/50 hover:bg-white/80 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========= BANNER VARIANT (Wide Landscape — Default) =========
  return (
    <section className={`px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto w-full relative z-10 ${className}`}>
      <div
        className="relative w-full max-w-5xl mx-auto rounded-2xl md:rounded-[2rem] overflow-hidden shadow-xl dark:shadow-black/25 border border-slate-200/40 dark:border-slate-700/40 group bg-slate-900"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Image Container — proportional aspect ratio */}
        <div className="relative w-full aspect-[3/1] sm:aspect-[3.5/1] lg:aspect-[4/1]">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              {currentAd.url ? (
                <a href={currentAd.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                  <img loading="lazy" src={`${STORAGE_URL}/${currentAd.image_path}`}
                    alt={currentAd.title}
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <img loading="lazy" src={`${STORAGE_URL}/${currentAd.image_path}`}
                  alt={currentAd.title}
                  className="w-full h-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none z-10" />

          {/* Arrow Navigation — only on hover, desktop only */}
          {ads.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-10 md:h-10 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/10"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {ads.length > 1 && (
            <div className="absolute bottom-3 md:bottom-4 left-0 right-0 flex justify-center gap-1.5 md:gap-2 z-20">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-white w-6 md:w-8 shadow-md shadow-black/40'
                      : 'bg-white/40 hover:bg-white/70 w-1.5 md:w-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
