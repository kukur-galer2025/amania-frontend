'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, ShieldCheck, AlertTriangle, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack } from 'lucide-react';
import { apiFetch } from '@/app/utils/api';

interface ProtectedVideoPlayerProps {
  type: 'lesson' | 'material' | 'eproduct_material';
  id: number;
  className?: string;
  onEnded?: () => void;
}

/**
 * 🔥 PROTECTED VIDEO PLAYER
 * 
 * Fitur Proteksi:
 * 1. Video diambil melalui Signed URL (expired 2 jam, anti-share link)
 * 2. Disable right-click context menu
 * 3. Disable keyboard shortcuts untuk download (Ctrl+S, etc)
 * 4. Custom controls (menyembunyikan native download button)
 * 5. CSS user-select: none (anti-inspect elemen)
 */
export default function ProtectedVideoPlayer({ type, id, className = '', onEnded }: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom controls state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch signed streaming URL
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    apiFetch('/video/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!mounted) return;
        if (res.ok && json.success) {
          setStreamUrl(json.stream_url);
        } else {
          setError(json.message || 'Gagal memuat video.');
        }
      })
      .catch(() => {
        if (mounted) setError('Gagal menghubungi server.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [type, id]);

  // Disable right-click
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const preventContext = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const preventKeys = (e: KeyboardEvent) => {
      // Block Ctrl+S, Ctrl+U, F12
      if ((e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'S' || e.key === 'U')) || e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    container.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);

    return () => {
      container.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
    };
  }, []);

  // Auto-hide controls
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * duration;
  };

  const skip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`aspect-video bg-slate-900 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-3">
          <Loader2 size={36} className="text-indigo-400 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">Memuat video terproteksi...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`aspect-video bg-slate-900 flex items-center justify-center ${className}`}>
        <div className="text-center space-y-3 max-w-sm px-4">
          <AlertTriangle size={36} className="text-amber-400 mx-auto" />
          <p className="text-sm font-bold text-slate-300">{error}</p>
          <p className="text-xs text-slate-500">Silakan muat ulang halaman atau coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-video bg-black select-none overflow-hidden group ${className}`}
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Video Element - NO native controls, NO download */}
      <video
        ref={videoRef}
        src={streamUrl || undefined}
        className="w-full h-full object-contain cursor-pointer"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Protected Badge */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-emerald-400 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full pointer-events-none">
        <ShieldCheck size={10} /> Video Terproteksi
      </div>

      {/* Center Play Button (when paused) */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <button onClick={togglePlay} className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center pointer-events-auto hover:bg-white/30 transition-colors">
            <Play size={28} className="text-white ml-1" fill="currentColor" />
          </button>
        </div>
      )}

      {/* Custom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/bar" onClick={seekTo}>
          {/* Buffered */}
          <div className="absolute inset-y-0 left-0 bg-white/30 rounded-full" style={{ width: `${(buffered / duration) * 100 || 0}%` }} />
          {/* Progress */}
          <div className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-[width] duration-100" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-indigo-500 border-2 border-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100 || 0}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button onClick={togglePlay} className="p-1.5 text-white hover:text-indigo-400 transition-colors">
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>
            <button onClick={() => skip(-10)} className="p-1.5 text-white/70 hover:text-white transition-colors hidden sm:block">
              <SkipBack size={16} />
            </button>
            <button onClick={() => skip(10)} className="p-1.5 text-white/70 hover:text-white transition-colors hidden sm:block">
              <SkipForward size={16} />
            </button>
            <button onClick={toggleMute} className="p-1.5 text-white/70 hover:text-white transition-colors">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="text-[10px] md:text-xs font-mono text-white/70 ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleFullscreen} className="p-1.5 text-white/70 hover:text-white transition-colors">
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Anti-download overlay (transparent, prevents drag/save-image) */}
      <div className="absolute inset-0 z-[5] pointer-events-none" />
    </div>
  );
}
