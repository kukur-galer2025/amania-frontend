"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Loader2, Sparkles, ChevronDown,
  Ticket, CalendarDays, Zap, Database, Brain,
  CheckCircle2, Clock, AlertCircle, CornerDownLeft,
  RotateCcw, Headphones, GraduationCap, Package,
  MessageCircle, ShieldCheck, UserCheck, ExternalLink,
  Minimize2, ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { safeStorage } from '@/app/utils/safeStorage';

// ──────────────────────────────────────────────
// CUSTOM MARKDOWN COMPONENTS (LUXURY TYPOGRAPHY)
// ──────────────────────────────────────────────
const MarkdownComponents = {
  p: ({ children }: any) => (
    <p className="mb-2.5 last:mb-0 leading-relaxed text-[13px] text-slate-700 dark:text-slate-300">
      {children}
    </p>
  ),
  a: ({ href, children }: any) => {
    if (href?.startsWith('/')) {
      return (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold hover:text-violet-700 dark:hover:text-violet-300 underline decoration-violet-300 dark:decoration-violet-600 underline-offset-2 transition-colors"
        >
          {children}
          <CornerDownLeft size={11} className="inline opacity-70" />
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 font-bold hover:text-violet-700 dark:hover:text-violet-300 underline decoration-violet-300 dark:decoration-violet-600 underline-offset-2 transition-colors"
      >
        {children}
        <ExternalLink size={11} className="inline opacity-70" />
      </a>
    );
  },
  ul: ({ children }: any) => (
    <ul className="list-none pl-0.5 mb-2.5 space-y-1.5 text-[13px]">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-4 mb-2.5 space-y-1 text-[13px] text-slate-700 dark:text-slate-300 font-medium">
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 flex items-start gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: any) => (
    <strong className="font-bold text-slate-900 dark:text-white">
      {children}
    </strong>
  ),
  code: ({ children }: any) => (
    <code className="bg-slate-100 dark:bg-slate-800/80 text-violet-600 dark:text-violet-300 border border-slate-200/80 dark:border-slate-700/60 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium">
      {children}
    </code>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 mt-3 flex items-center gap-1.5">
      <span className="w-1.5 h-3.5 bg-gradient-to-b from-violet-500 to-indigo-600 rounded-full" />
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-1 mt-2">
      {children}
    </h4>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-violet-500/60 pl-3 py-1 my-2 bg-violet-50/40 dark:bg-violet-950/20 rounded-r-lg text-[12px] italic text-slate-600 dark:text-slate-400">
      {children}
    </blockquote>
  ),
};

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  richCards?: RichCard[];
  timestamp?: number;
}

interface RichCard {
  type: 'event' | 'ticket' | 'course' | 'eproduct' | 'cs';
  title: string;
  subtitle?: string;
  badge?: { label: string; color: string };
  detail?: string;
  link?: string;
  icon?: 'calendar' | 'ticket' | 'check' | 'clock' | 'alert' | 'course' | 'package' | 'headset';
}

// ──────────────────────────────────────────────
// QUICK CHIP PRESETS (MULTI-DOMAIN PLATFORM TERPADU)
// ──────────────────────────────────────────────
const QUICK_CHIPS = [
  { icon: '🎟️', label: 'Cek Tiket & Transaksi', query: 'Cek status tiket dan transaksi saya' },
  { icon: '📅', label: 'Webinar & Seminar', query: 'Tunjukkan jadwal webinar dan seminar daring yang tersedia' },
  { icon: '📦', label: 'Modul E-Products', query: 'Rekomendasikan modul e-product premium yang ada' },
  { icon: '🎓', label: 'Kursus Pelatihan', query: 'Rekomendasikan kursus online pelatihan digital yang tersedia' },
  { icon: '⚡', label: 'Sisa Kuota Kursi', query: 'Berapa sisa kuota kursi webinar yang masih tersedia?' },
  { icon: '💬', label: 'Hubungi CS Support', query: 'Saya ingin menghubungi Customer Service untuk bantuan khusus' },
];

// ──────────────────────────────────────────────
// LUXURY RICH CARD COMPONENT
// ──────────────────────────────────────────────
const RichCardComponent = ({ card }: { card: RichCard }) => {
  const iconMap: Record<string, React.ReactNode> = {
    calendar: <CalendarDays size={15} />,
    ticket: <Ticket size={15} />,
    check: <CheckCircle2 size={15} />,
    clock: <Clock size={15} />,
    alert: <AlertCircle size={15} />,
    course: <GraduationCap size={15} />,
    package: <Package size={15} />,
    headset: <Headphones size={15} />,
  };

  const isCsCard = card.type === 'cs';
  const isExternalLink = card.link?.startsWith('http');

  const mainCard = (
    <div
      className={`mt-2.5 p-3.5 rounded-2xl border transition-all duration-300 group/card ${
        isCsCard
          ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 dark:border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_4px_20px_-6px_rgba(16,185,129,0.15)]'
          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500/50 shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Glowing Icon Square */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/card:scale-105 ${
            isCsCard
              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
              : card.type === 'course'
              ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
              : card.type === 'eproduct'
              ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.25)]'
              : 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]'
          }`}
        >
          {iconMap[card.icon ?? 'calendar'] ?? <CalendarDays size={15} />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h5 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
              {card.title}
            </h5>
            {card.badge && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-violet-500/20 bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 shrink-0">
                {card.badge.label}
              </span>
            )}
          </div>

          {card.subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {card.subtitle}
            </p>
          )}

          {card.detail && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium">
              <span>{card.detail}</span>
            </div>
          )}
        </div>

        {card.link && !isCsCard && (
          <div className="shrink-0 text-violet-500 dark:text-violet-400 opacity-60 group-hover/card:opacity-100 group-hover/card:translate-x-0.5 transition-all">
            <ArrowRight size={14} />
          </div>
        )}
      </div>

      {/* Customer Service Fallback Actions */}
      {isCsCard && (
        <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <a
            href={card.link || "https://wa.me/628985477864"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] active:scale-98"
          >
            <MessageCircle size={15} />
            Eskalasi ke CS via WhatsApp
          </a>
          <Link
            href="/support"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold text-center transition-colors"
          >
            Help Center
          </Link>
        </div>
      )}
    </div>
  );

  if (card.link && !isCsCard) {
    if (isExternalLink) {
      return (
        <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
          {mainCard}
        </a>
      );
    }
    return <Link href={card.link} className="block">{mainCard}</Link>;
  }
  return mainCard;
};

// ──────────────────────────────────────────────
// MODERN TYPING INDICATOR
// ──────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-end gap-2.5 px-1 py-1"
  >
    {/* Micro Glowing Bot Avatar */}
    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(124,58,237,0.3)]">
      <Brain size={13} />
    </div>

    {/* Sleek Pulse Pill */}
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
        <span className="text-[11px] font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
          Menganalisis RAG & Data Transaksional...
        </span>
      </div>
      <div className="flex items-center gap-1 pl-1">
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// ──────────────────────────────────────────────
// MAIN CHATBOT COMPONENT
// ──────────────────────────────────────────────
export default function AmaniaEventChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoggedIn = Boolean(
    typeof window !== 'undefined' && safeStorage.getItem('token')
  );

  // ── Greeting message ──
  const buildGreeting = useCallback((): ChatMessage => {
    const user = (() => {
      try {
        const u = safeStorage.getItem('user');
        return u ? JSON.parse(u) : null;
      } catch { return null; }
    })();
    const name = user?.name?.split(' ')[0] ?? 'Pengguna';
    const isAuth = Boolean(safeStorage.getItem('token'));

    return {
      role: 'assistant',
      content: isAuth
        ? `Halo **${name}**! 👋 Selamat datang di **Amania Digital Assistant** — sistem asisten cerdas berarsitektur **Hybrid RAG + Integrasi Data Transaksional Dinamis** pada Platform Layanan Digital Terpadu Amania.\n\nSaya siap memandu Anda melintasi seluruh pilar ekosistem:\n- 📅 **Webinar & Seminar Daring**: Jadwal acara, topik pembicara, & sisa kuota kursi live\n- 📦 **Modul E-Products Premium**: E-book panduan, template, lisensi, & unduh berkas\n- 🎓 **Kursus Pelatihan Online**: Silabus kelas terstruktur, modul video, & e-sertifikat\n- 🎟️ **Pelacakan Transaksi Terpadu**: Cek nomor tiket (\`TK-...\`), invoice (\`INV-...\`), & status akun\n- 💬 **Bantuan Customer Service**: Eskalasi cepat WhatsApp bila kendala butuh penanganan khusus\n\nAda yang ingin Anda tanyakan atau lacak hari ini?`
        : `Halo! 👋 Selamat datang di **Amania Digital Assistant** — asisten cerdas berarsitektur **Hybrid RAG + Integrasi Data Transaksional Dinamis** pada Platform Layanan Digital Terpadu Amania.\n\nSaya siap memandu Anda mengeksplorasi **Webinar Daring**, modul **E-Products Premium**, hingga **Kursus Pelatihan Terakreditasi**! Untuk pelacakan tiket otomatis dan riwayat pesanan pribadi, silakan **[Masuk ke Akun Anda](/login)**.\n\nAda layanan yang bisa saya bantu rekomendasikan untuk Anda?`,
      timestamp: Date.now(),
    };
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([buildGreeting()]);
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = 0;
        }
        inputRef.current?.focus();
      }, 150);
    }
    if (isOpen) setHasNotification(false);
  }, [isOpen, messages.length, buildGreeting]);

  // ── Hide floating WhatsApp button when chat modal is open to avoid overlay ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const waBtn = document.getElementById('floating-whatsapp-btn');
      if (waBtn) {
        if (isOpen) {
          waBtn.style.opacity = '0';
          waBtn.style.pointerEvents = 'none';
          waBtn.style.transform = 'scale(0.7)';
        } else {
          waBtn.style.opacity = '1';
          waBtn.style.pointerEvents = 'auto';
          waBtn.style.transform = 'scale(1)';
        }
      }
    }
  }, [isOpen]);

  // ── Scroll handling ──
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (!chatBodyRef.current) return;
    const el = chatBodyRef.current;
    const handleScroll = () => {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollDown(distFromBottom > 120);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Only auto-scroll when user starts conversation (messages > 1) or receives assistant response
  useEffect(() => {
    if (messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && !showScrollDown) {
        scrollToBottom();
      }
    }
  }, [messages, showScrollDown, scrollToBottom]);

  // ── Parse rich cards from response ──
  const parseRichCards = (text: string): { cleanText: string; cards: RichCard[] } => {
    const cardRegex = /\[CARD:(\{[\s\S]*?\})\]/g;
    const cards: RichCard[] = [];
    let cleanText = text;

    let match;
    while ((match = cardRegex.exec(text)) !== null) {
      try {
        const card: RichCard = JSON.parse(match[1]);
        cards.push(card);
      } catch { /* skip malformed */ }
    }
    cleanText = text.replace(cardRegex, '').trim();
    return { cleanText, cards };
  };

  // ── Send message ──
  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);
    scrollToBottom();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const token = safeStorage.getItem('token');

    const assistantIndex = history.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() }]);

    try {
      const payload = {
        session_id: sessionId,
        message: text,
        history: history
          .slice(-8)
          .map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content })),
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/ai/event-assistant`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errData.message ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            if (data.chunk) {
              fullText += data.chunk;
              const display = fullText.includes('[CARD:')
                ? fullText.replace(/\[CARD:\{[\s\S]*?\}\]/g, '').trim()
                : fullText;

              setMessages(prev => {
                const next = [...prev];
                next[assistantIndex] = {
                  ...next[assistantIndex],
                  content: display,
                  isStreaming: true,
                };
                return next;
              });
            }
          } catch { /* skip */ }
        }
      }

      const { cleanText, cards } = parseRichCards(fullText);
      setMessages(prev => {
        const next = [...prev];
        next[assistantIndex] = {
          role: 'assistant',
          content: cleanText || fullText,
          isStreaming: false,
          richCards: cards.length > 0 ? cards : undefined,
          timestamp: Date.now(),
        };
        return next;
      });

    } catch (err: any) {
      const errMsg = err?.message?.includes('fetch')
        ? 'Tidak dapat terhubung ke server backend Amania. Pastikan server aktif di port 8000.'
        : `Maaf, terjadi kendala koneksi: ${err?.message ?? 'Kesalahan tidak diketahui'}. Silakan coba kembali atau hubungi Customer Service.`;

      setMessages(prev => {
        const next = [...prev];
        next[assistantIndex] = { role: 'assistant', content: errMsg, isStreaming: false, timestamp: Date.now() };
        return next;
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [input, isLoading, messages, sessionId, scrollToBottom]);

  // ── Key handler ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Reset session ──
  const handleReset = () => {
    setMessages([buildGreeting()]);
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = 0;
    }
  };

  // ──────────────────────────────────────────────
  // RENDER INTERFACE
  // ──────────────────────────────────────────────
  return (
    <>
      {/* ── LUXURY FLOATING ACTION BUTTON (FAB) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90] flex items-center gap-3 select-none pointer-events-none"
          >
            {/* Elegant Floating Smart Capsule (Positioned horizontally to the LEFT of the FAB orb) */}
            <AnimatePresence>
              {hasNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 15, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 15, scale: 0.95 }}
                  onClick={() => setIsOpen(true)}
                  className="group relative cursor-pointer pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl backdrop-blur-xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-white/15 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.6)] hover:border-violet-400/60 transition-all duration-300 max-w-[250px]"
                >
                  {/* Glowing Status Dot */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-white tracking-tight flex items-center gap-1">
                        Amania AI Assistant <Sparkles size={11} className="text-violet-400 inline" />
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight mt-0.5 truncate">
                      Webinar, Modul, Kursus & Tiket
                    </p>
                  </div>

                  {/* Close pill */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setHasNotification(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Tutup notifikasi"
                  >
                    <X size={12} />
                  </button>

                  {/* Little right arrow pointing towards the FAB button */}
                  <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 dark:bg-slate-950 border-t border-r border-white/15 rotate-45 pointer-events-none" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Luxury FAB Orb */}
            <div className="relative group pointer-events-auto">
              {/* Ambient Pulsing Aura */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-500 animate-pulse pointer-events-none" />

              <button
                onClick={() => setIsOpen(true)}
                id="amania-chatbot-fab"
                aria-label="Buka Amania Digital Assistant"
                className="relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-indigo-700 via-violet-600 to-fuchsia-600 shadow-[0_12px_36px_-6px_rgba(99,102,241,0.5),0_0_0_1.5px_rgba(255,255,255,0.25)_inset] hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden"
              >
                {/* Specular Highlight Sheen */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 via-transparent to-transparent pointer-events-none" />

                {/* Animated Brain + Sparkles Icon */}
                <div className="relative z-10 flex items-center justify-center">
                  <Brain size={26} className="text-white drop-shadow-md" />
                  <Sparkles size={13} className="absolute -top-1 -right-1 text-fuchsia-200 animate-pulse" />
                </div>

                {/* Status Dot */}
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LUXURY CHAT WINDOW (MODAL) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.94 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[100] w-[calc(100vw-32px)] sm:w-[420px] rounded-[28px] overflow-hidden flex flex-col backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-white/10 shadow-[0_25px_80px_-15px_rgba(15,23,42,0.4),0_0_0_1px_rgba(255,255,255,0.2)_inset]"
            style={{
              height: 'min(640px, calc(100vh - 80px))',
            }}
          >
            {/* ═══════════════ HEADER ═══════════════ */}
            <div className="shrink-0 relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 px-4 py-3.5 text-white border-b border-white/10">
              {/* Ambient Cosmic Lights */}
              <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-violet-600/20 blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-fuchsia-600/15 blur-2xl -ml-12 -mb-12 pointer-events-none" />
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                {/* Bot Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Glowing Squircle Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 p-[1.5px] shadow-[0_0_18px_rgba(124,58,237,0.45)]">
                      <div className="w-full h-full rounded-[14px] bg-slate-950/90 backdrop-blur-md flex items-center justify-center text-violet-300">
                        <Brain size={20} />
                      </div>
                    </div>
                    {/* Live Emerald Pin */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[14px] tracking-tight text-white leading-none">
                        Amania Digital AI
                      </h3>
                      <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-violet-200">
                        HYBRID RAG
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[11px] text-slate-300 font-medium truncate">
                        Platform Layanan Digital Terpadu
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleReset}
                    title="Mulai Sesi Percakapan Baru"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Tutup Percakapan"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    <Minimize2 size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* ═══════════════ ARCHITECTURE TELEMETRY STRIP ═══════════════ */}
            <div className="shrink-0 px-3.5 py-2 bg-slate-950/95 border-b border-white/5 flex items-center justify-between text-[10px] text-slate-300 select-none">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-semibold text-violet-300">
                  <Database size={10} className="text-violet-400" />
                  Hybrid RAG
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 font-semibold text-fuchsia-300">
                  <Zap size={10} className="text-fuchsia-400" />
                  Dynamic SQL
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isLoggedIn ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                    <UserCheck size={11} />
                    Verified
                  </span>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
                  >
                    <ShieldCheck size={11} className="text-slate-400" />
                    Mode Tamu
                  </Link>
                )}
              </div>
            </div>

            {/* ═══════════════ MESSAGES BODY ═══════════════ */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/60 dark:from-slate-950/90 dark:via-slate-900/90 dark:to-slate-950/90 custom-scrollbar"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 p-[1px] shrink-0 mt-0.5 shadow-sm">
                      <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center text-violet-300">
                        <Brain size={13} />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white rounded-tr-xs shadow-[0_6px_20px_-6px_rgba(99,102,241,0.4)]'
                          : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs shadow-[0_4px_16px_-4px_rgba(15,23,42,0.06)]'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-normal">
                          {msg.content}
                        </p>
                      ) : (
                        <ReactMarkdown components={MarkdownComponents}>
                          {msg.content || (msg.isStreaming ? '...' : '')}
                        </ReactMarkdown>
                      )}
                    </div>

                    {/* Rich Cards Section */}
                    {msg.richCards && msg.richCards.length > 0 && (
                      <div className="w-full space-y-2 mt-0.5">
                        {msg.richCards.map((card, ci) => (
                          <RichCardComponent key={ci} card={card} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Scroll Down button */}
            <AnimatePresence>
              {showScrollDown && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-[92px] right-5 w-8 h-8 rounded-full bg-slate-900/90 text-white border border-white/20 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-20"
                >
                  <ChevronDown size={15} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* ═══════════════ QUICK CHIP PRESETS ═══════════════ */}
            {messages.length <= 1 && !isLoading && (
              <div className="shrink-0 px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {QUICK_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.query)}
                      className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 bg-white dark:bg-slate-800/90 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-slate-700 dark:text-slate-200 hover:text-violet-700 dark:hover:text-violet-300 border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-full transition-all shadow-xs hover:shadow-sm shrink-0 flex items-center gap-1.5"
                    >
                      <span>{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════ INPUT DOCK ═══════════════ */}
            <div className="shrink-0 px-3.5 py-3 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/70 dark:border-slate-800 backdrop-blur-xl">
              <div className="flex items-end gap-2">
                {/* Textarea Dock */}
                <div className="flex-1 bg-slate-100/80 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl focus-within:border-violet-500/60 focus-within:ring-4 focus-within:ring-violet-500/10 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all overflow-hidden shadow-inner">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Tanya webinar, kursus, modul e-product, tiket..."
                    rows={1}
                    disabled={isLoading}
                    className="w-full bg-transparent text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 resize-none outline-none px-3.5 py-2.5 max-h-[100px] disabled:opacity-60 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    style={{ height: '40px' }}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  id="amania-chatbot-send"
                  aria-label="Kirim Pesan"
                  className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center transition-all ${
                    input.trim() && !isLoading
                      ? 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-[0_4px_16px_rgba(124,58,237,0.45)] hover:scale-105 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={15} className="translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Sub-label Footer */}
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles size={10} className="text-violet-500 inline" />
                  Hybrid RAG & Transaksional Terpadu
                </span>
                <span>Enter untuk kirim</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
