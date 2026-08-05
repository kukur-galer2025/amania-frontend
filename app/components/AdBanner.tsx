"use client";

import React, { useEffect, useState, useCallback } from 'react';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
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
        className={`relative rounded-xl md:rounded-2xl overflow-clip w-full shrink-0 bg-slate-900 ${className}`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="relative w-full h-auto flex items-center justify-center">
          {ads.map((ad, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`transition-opacity duration-300 w-full ${
                  isActive ? 'relative opacity-100 z-10' : 'absolute top-0 left-0 h-full opacity-0 z-0'
                }`}
              >
                {ad.url ? (
                  <a href={ad.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                    <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`} alt={ad.title} className="w-full h-auto object-contain rounded-xl md:rounded-2xl" />
                  </a>
                ) : (
                  <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`} alt={ad.title} className="w-full h-auto object-contain rounded-xl md:rounded-2xl" />
                )}
              </div>
            );
          })}

          {/* Gradient overlay bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/40 pointer-events-none z-10" />

          {/* Dots */}
          {ads.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'bg-amber-400 w-5'
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
        className="relative w-full max-w-3xl mx-auto rounded-xl md:rounded-2xl border border-slate-200/50 dark:border-white/10 group bg-slate-950 ring-1 ring-black/5 dark:ring-white/5 transform-gpu translate-z-0 overflow-clip"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Image Container — auto height based on active image to prevent cropping */}
        <div className="relative w-full h-auto flex items-center justify-center">
          {ads.map((ad, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={idx}
                className={`transition-opacity duration-300 w-full ${
                  isActive ? 'relative opacity-100 z-10' : 'absolute top-0 left-0 h-full opacity-0 z-0'
                }`}
              >
                {ad.url ? (
                  <a href={ad.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                    <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`}
                      alt={ad.title}
                      className="w-full h-auto object-contain rounded-xl md:rounded-2xl"
                    />
                  </a>
                ) : (
                  <img loading="lazy" src={`${STORAGE_URL}/${ad.image_path}`}
                    alt={ad.title}
                    className="w-full h-auto object-contain rounded-xl md:rounded-2xl"
                  />
                )}
              </div>
            );
          })}

          {/* Solid overlays for depth & luxury feel without expensive gradients */}
          <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-10 rounded-xl md:rounded-2xl" />

          {/* Premium Badge */}
          <div className="absolute top-3 left-3 md:top-5 md:left-5 z-20">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 rounded-full border border-amber-500/30">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">Sorotan Eksklusif</span>
            </div>
          </div>

          {/* Arrow Navigation — only on hover, desktop only */}
          {ads.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-white/20"
              >
                <ChevronRight size={20} />
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
                      ? 'bg-amber-400 w-8 md:w-10'
                      : 'bg-white/40 hover:bg-white/80 w-2 md:w-3'
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
