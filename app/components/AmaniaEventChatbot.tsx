"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Sparkles, ChevronDown,
  Ticket, CalendarDays, Brain,
  CheckCircle2, Clock, AlertCircle, CornerDownLeft,
  RotateCcw, Headphones, GraduationCap, Package,
  MessageCircle, ShieldCheck, UserCheck, ExternalLink,
  ArrowRight, ThumbsUp, ThumbsDown, Square, Copy, Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { safeStorage } from '@/app/utils/safeStorage';

// ──────────────────────────────────────────────
// KEAMANAN TAUTAN & KARTU
//
// Jawaban AI bisa dimanipulasi (prompt injection) untuk menyisipkan tautan/kartu berbahaya, jadi semuanya
// divalidasi di sisi klien sebelum ditampilkan, sebagai lapisan terakhir setelah penjaga di server.
// ──────────────────────────────────────────────
const isInternalPath = (l: string): boolean => l.startsWith('/') && !l.startsWith('//') && !l.startsWith('/\\');

/** Tautan kartu: hanya jalur internal situs atau WhatsApp resmi (wa.me). Selain itu dibuang. */
const safeCardLink = (link: unknown): string | undefined => {
  if (typeof link !== 'string') return undefined;
  const l = link.trim();
  if (isInternalPath(l)) return l;
  try {
    const u = new URL(l);
    if (u.protocol === 'https:' && u.hostname === 'wa.me') return l;
  } catch { /* bukan URL valid */ }
  return undefined;
};

/** Tautan Markdown eksternal: hanya http(s). Skema lain (javascript:, data:, dll.) ditolak. */
const parseExternalUrl = (href: string): URL | null => {
  try {
    const u = new URL(href);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u : null;
  } catch {
    return null;
  }
};

const CARD_TYPES = ['event', 'ticket', 'course', 'eproduct', 'cs'];
const CARD_ICONS = ['calendar', 'ticket', 'check', 'clock', 'alert', 'course', 'package', 'headset'];
const clip = (v: unknown, max: number): string | undefined => (typeof v === 'string' && v.trim() ? v.slice(0, max) : undefined);

/** Validasi & normalisasi kartu dari AI: bentuk dibatasi, teks dipotong, tautan disaring. Kartu tanpa judul dibuang. */
const sanitizeCard = (raw: any): RichCard | null => {
  if (!raw || typeof raw !== 'object') return null;
  const title = clip(raw.title, 80);
  if (!title) return null;
  const badgeLabel = raw.badge && typeof raw.badge === 'object' ? clip(raw.badge.label, 24) : undefined;
  return {
    type: CARD_TYPES.includes(raw.type) ? raw.type : 'event',
    title,
    subtitle: clip(raw.subtitle, 120),
    badge: badgeLabel ? { label: badgeLabel, color: clip(raw.badge.color, 12) ?? 'blue' } : undefined,
    detail: clip(raw.detail, 120),
    link: safeCardLink(raw.link),
    icon: CARD_ICONS.includes(raw.icon) ? raw.icon : undefined,
  };
};

// ──────────────────────────────────────────────
// TIPOGRAFI MARKDOWN (jawaban bot)
// ──────────────────────────────────────────────
const LINK_CLS =
  'inline-flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 underline decoration-violet-300/70 dark:decoration-violet-500/50 underline-offset-[3px] transition-colors';
const TEXT_CLS = 'text-[13.5px] leading-[1.65] text-slate-700 dark:text-slate-200';

const MarkdownComponents = {
  p: ({ children }: any) => <p className={`mb-2.5 last:mb-0 ${TEXT_CLS}`}>{children}</p>,
  a: ({ href, children }: any) => {
    const h = typeof href === 'string' ? href.trim() : '';
    if (isInternalPath(h)) {
      return (
        <Link href={h} className={LINK_CLS}>
          {children}
          <CornerDownLeft size={11} className="inline opacity-60" />
        </Link>
      );
    }

    const url = parseExternalUrl(h);
    // Skema berbahaya / tidak valid: tampilkan teksnya saja, tanpa tautan
    if (!url) return <span>{children}</span>;

    return (
      <a href={url.href} target="_blank" rel="noopener noreferrer nofollow" className={LINK_CLS}>
        {children}
        <ExternalLink size={11} className="inline opacity-60" />
        {/* Tujuan tautan selalu terlihat, agar pengguna tidak tertipu teks tautan yang menyesatkan */}
        <span className="text-[10px] font-normal opacity-60 no-underline">({url.hostname})</span>
      </a>
    );
  },
  ul: ({ children }: any) => <ul className="mb-2.5 last:mb-0 space-y-1.5">{children}</ul>,
  // `ordered` diteruskan ke <li> agar daftar bernomor tidak ikut mendapat titik penanda daftar biasa
  ol: ({ children }: any) => (
    <ol className="mb-2.5 last:mb-0 list-decimal pl-5 space-y-1.5 marker:font-semibold marker:text-violet-500">
      {React.Children.map(children, (c) => (React.isValidElement(c) ? React.cloneElement(c as any, { ordered: true }) : c))}
    </ol>
  ),
  li: ({ children, ordered }: any) =>
    ordered ? (
      <li className={`pl-1 ${TEXT_CLS}`}>{children}</li>
    ) : (
      <li className={`flex items-start gap-2.5 ${TEXT_CLS}`}>
        <span className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500" />
        <span className="min-w-0 flex-1">{children}</span>
      </li>
    ),
  strong: ({ children }: any) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-slate-600 dark:text-slate-300">{children}</em>,
  code: ({ children }: any) => (
    <code className="rounded-md border border-slate-200/80 bg-slate-100 px-1.5 py-0.5 font-mono text-[11.5px] font-medium text-violet-700 dark:border-white/10 dark:bg-white/10 dark:text-violet-200">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="my-2 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[12px] leading-relaxed text-slate-100 [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit">
      {children}
    </pre>
  ),
  h1: ({ children }: any) => <MdHeading>{children}</MdHeading>,
  h2: ({ children }: any) => <MdHeading>{children}</MdHeading>,
  h3: ({ children }: any) => <MdHeading>{children}</MdHeading>,
  h4: ({ children }: any) => (
    <h4 className="mb-1 mt-2.5 text-[13px] font-semibold text-slate-800 dark:text-slate-100">{children}</h4>
  ),
  hr: () => <hr className="my-3 border-slate-200 dark:border-white/10" />,
  blockquote: ({ children }: any) => (
    <blockquote className="my-2 rounded-r-lg border-l-2 border-amber-400/70 bg-amber-50/50 py-1 pl-3 text-[12.5px] italic text-slate-600 dark:bg-amber-400/5 dark:text-slate-300">
      {children}
    </blockquote>
  ),
};

/** Judul bagian dalam jawaban: aksen emas-ungu tipis di sisi kiri. */
function MdHeading({ children }: { children?: React.ReactNode }) {
  return (
    <h3 className="mb-1.5 mt-3 flex items-center gap-2 text-[14px] font-semibold tracking-tight text-slate-900 first:mt-0 dark:text-white">
      <span className="h-3.5 w-1 shrink-0 rounded-full bg-gradient-to-b from-amber-300 via-violet-500 to-indigo-600" />
      <span className="min-w-0">{children}</span>
    </h3>
  );
}

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
  messageId?: string;            // ID jawaban dari server (untuk feedback)
  feedback?: 'up' | 'down';      // rating yang sudah diberikan user
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
// QUICK CHIP BAWAAN (dipakai bila server tidak mengirim daftar chip, mis. backend lama).
// Daftar aktif diatur admin di AI Assistant > Pengaturan dan dibaca lewat GET /ai/config.
// ──────────────────────────────────────────────
interface QuickChip { icon: string; label: string; query: string }

const DEFAULT_QUICK_CHIPS: QuickChip[] = [
  { icon: '🎟️', label: 'Cek Tiket & Transaksi', query: 'Cek status tiket dan transaksi saya' },
  { icon: '📅', label: 'Webinar & Seminar', query: 'Tunjukkan jadwal webinar dan seminar daring yang tersedia' },
  { icon: '📦', label: 'Modul E-Products', query: 'Rekomendasikan modul e-product premium yang ada' },
  { icon: '🎓', label: 'Kursus Pelatihan', query: 'Rekomendasikan kursus online pelatihan digital yang tersedia' },
  { icon: '⚡', label: 'Sisa Kuota Kursi', query: 'Berapa sisa kuota kursi webinar yang masih tersedia?' },
  { icon: '💬', label: 'Hubungi CS Support', query: 'Saya ingin menghubungi Customer Service untuk bantuan khusus' },
];

// ──────────────────────────────────────────────
// AVATAR BOT
// ──────────────────────────────────────────────
const BotAvatar = ({ size = 28 }: { size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="shrink-0 rounded-[11px] bg-gradient-to-br from-amber-300/80 via-violet-500 to-indigo-600 p-[1.5px] shadow-[0_6px_16px_-4px_rgba(99,102,241,0.55)]"
  >
    <div className="flex h-full w-full items-center justify-center rounded-[9.5px] bg-[#0f1030] text-violet-200">
      <Brain size={Math.round(size * 0.5)} strokeWidth={2} />
    </div>
  </div>
);

// ──────────────────────────────────────────────
// KARTU INFORMASI (RICH CARD)
// ──────────────────────────────────────────────
const BADGE_TONES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
};
const badgeTone = (color?: string) => BADGE_TONES[color ?? ''] ?? 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-white/10 dark:text-slate-300 dark:ring-white/10';

const CARD_TILES: Record<string, string> = {
  cs: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
  course: 'from-sky-500 to-indigo-600 shadow-indigo-500/30',
  eproduct: 'from-amber-400 to-orange-500 shadow-amber-500/30',
  ticket: 'from-violet-500 to-indigo-600 shadow-violet-500/30',
  event: 'from-indigo-500 to-violet-600 shadow-indigo-500/30',
};

const RichCardComponent = ({ card, csUrl }: { card: RichCard; csUrl: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    calendar: <CalendarDays size={16} />,
    ticket: <Ticket size={16} />,
    check: <CheckCircle2 size={16} />,
    clock: <Clock size={16} />,
    alert: <AlertCircle size={16} />,
    course: <GraduationCap size={16} />,
    package: <Package size={16} />,
    headset: <Headphones size={16} />,
  };

  const isCsCard = card.type === 'cs';
  const isExternalLink = card.link?.startsWith('http');
  const tile = CARD_TILES[card.type] ?? CARD_TILES.event;
  // Kartu CS selalu memakai nomor dari Pengaturan admin (bukan angka yang tertanam di kode)
  const waLink = card.link && card.link.startsWith('https://wa.me/') ? card.link : csUrl;

  const body = (
    <div
      className={`group/card mt-2.5 rounded-2xl border p-3 transition-all duration-300 ${
        isCsCard
          ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-emerald-400/20 dark:from-emerald-500/10 dark:via-transparent dark:to-transparent'
          : 'border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-violet-300 hover:shadow-[0_8px_24px_-12px_rgba(99,102,241,0.35)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-400/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover/card:scale-105 ${tile}`}>
          {iconMap[card.icon ?? 'calendar'] ?? <CalendarDays size={16} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h5 className="min-w-0 truncate text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">{card.title}</h5>
            {card.badge && (
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${badgeTone(card.badge.color)}`}>
                {card.badge.label}
              </span>
            )}
          </div>
          {card.subtitle && <p className="mt-0.5 line-clamp-1 text-[11.5px] text-slate-500 dark:text-slate-400">{card.subtitle}</p>}
          {card.detail && (
            <p className="mt-1.5 inline-flex max-w-full items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <span className="truncate">{card.detail}</span>
            </p>
          )}
        </div>

        {card.link && !isCsCard && (
          <ArrowRight size={15} className="mt-1 shrink-0 text-violet-500 opacity-50 transition-all group-hover/card:translate-x-0.5 group-hover/card:opacity-100 dark:text-violet-300" />
        )}
      </div>

      {isCsCard && (
        <div className="mt-3 flex flex-col gap-2 border-t border-emerald-500/15 pt-3 min-[420px]:flex-row">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2.5 text-[12px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,0.7)] transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98]"
            >
              <MessageCircle size={15} />
              Chat via WhatsApp
            </a>
          )}
          <Link
            href="/support"
            className={`rounded-xl bg-slate-100 px-3.5 py-2.5 text-center text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15 ${waLink ? '' : 'flex-1'}`}
          >
            Pusat Bantuan
          </Link>
        </div>
      )}
    </div>
  );

  if (card.link && !isCsCard) {
    if (isExternalLink) {
      return (
        <a href={card.link} target="_blank" rel="noopener noreferrer" className="block">
          {body}
        </a>
      );
    }
    return (
      <Link href={card.link} className="block">
        {body}
      </Link>
    );
  }
  return body;
};

// ──────────────────────────────────────────────
// INDIKATOR MENGETIK
// ──────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2.5">
    <BotAvatar size={28} />
    <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-center gap-1">
        {[0, 0.16, 0.32].map((delay, i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"
            animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 0.8, repeat: Infinity, delay, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <span className="text-[11.5px] text-slate-500 dark:text-slate-400">Sedang menyusun jawaban…</span>
    </div>
  </motion.div>
);

/** Format jam pesan, mis. "14.05". */
const fmtTime = (ts?: number): string =>
  ts ? new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';

// ──────────────────────────────────────────────
// KONFIGURASI DARI ADMIN (GET /ai/config)
// ──────────────────────────────────────────────
interface AssistantConfig {
  enabled: boolean;
  allow_guests: boolean;
  bot_name: string;
  welcome_message: string;
  quick_chips: QuickChip[];
  cs_whatsapp_url: string; // tautan WhatsApp CS dari Pengaturan admin (untuk kartu CS)
}

const DEFAULT_ASSISTANT_CONFIG: AssistantConfig = {
  enabled: true,
  allow_guests: true,
  bot_name: 'Amania Digital AI',
  welcome_message: '',
  quick_chips: DEFAULT_QUICK_CHIPS,
  // SENGAJA kosong: nomor CS hanya boleh berasal dari Pengaturan admin (lewat server), tidak tertanam di kode.
  // Bila kosong, kartu CS tidak menampilkan tombol WhatsApp (tetap ada tombol Pusat Bantuan).
  cs_whatsapp_url: '',
};

// ──────────────────────────────────────────────
// RIWAYAT CHAT TERSIMPAN (sessionStorage)
//
// Percakapan bertahan saat halaman di-refresh atau berpindah halaman, dan hilang otomatis saat tab ditutup.
// Sengaja sessionStorage (bukan localStorage): percakapan bisa memuat data tiket/transaksi, jadi tidak boleh
// tersisa di komputer bersama. Kunci dipisah per user, dan dihapus saat logout.
// ──────────────────────────────────────────────
const CHAT_KEY_PREFIX = 'amania_chat_v1:';
const CHAT_SESSION_KEY = 'amania_chat_sid';
const MAX_STORED_MESSAGES = 40;
// Sama dengan validasi backend (message max:2000)
const MAX_INPUT_CHARS = 2000;
const INPUT_COUNTER_FROM = 1800; // penghitung karakter baru muncul saat mendekati batas

// Teks polos untuk tombol salin: buang penanda Markdown agar rapi saat ditempel di aplikasi lain
function toPlainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|[\s(])[*_]([^*_\n]+)[*_](?=[\s).,!?]|$)/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .trim();
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* lanjut ke cara cadangan */ }
  try {
    // Cadangan untuk konteks non-HTTPS / peramban lama
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const GUEST_CHAT_KEY = CHAT_KEY_PREFIX + 'guest';

/** Identitas percakapan saat ini: id user bila ada token yang masih tersimpan, selain itu "guest". */
const currentChatKey = (): string => {
  try {
    if (!safeStorage.getItem('token')) return GUEST_CHAT_KEY;
    const raw = safeStorage.getItem('user');
    const id = raw ? JSON.parse(raw)?.id : null;
    return CHAT_KEY_PREFIX + (id ?? 'guest');
  } catch {
    return GUEST_CHAT_KEY;
  }
};

const loadStoredChat = (key: string = currentChatKey()): ChatMessage[] => {
  try {
    const raw = sessionStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .map((m: any): ChatMessage => ({
        role: m.role,
        content: m.content,
        richCards: Array.isArray(m.richCards)
          ? m.richCards.map(sanitizeCard).filter((c: RichCard | null): c is RichCard => c !== null)
          : undefined,
        timestamp: m.timestamp,
        messageId: m.messageId,
        feedback: m.feedback,
        isStreaming: false,
      }));
  } catch {
    return [];
  }
};

/** Tema gelap situs: sama dengan aturan layout member (preferensi tersimpan, jika tidak ada ikuti sistem). */
const readDarkTheme = (): boolean => {
  const saved = safeStorage.getItem('theme');
  if (saved === 'dark') return true;
  if (saved === 'light') return false;
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
};

/** Simpan percakapan di bawah kunci PEMILIKNYA (bukan identitas saat ini), agar tidak tertukar saat login/logout. */
const saveStoredChat = (messages: ChatMessage[], key: string) => {
  try {
    // Hanya sapaan awal = tidak ada yang perlu disimpan
    if (messages.length <= 1) {
      sessionStorage.removeItem(key);
      return;
    }
    const slim = messages.slice(-MAX_STORED_MESSAGES).map(m => ({
      role: m.role, content: m.content, richCards: m.richCards,
      timestamp: m.timestamp, messageId: m.messageId, feedback: m.feedback,
    }));
    sessionStorage.setItem(key, JSON.stringify(slim));
  } catch { /* storage penuh/diblokir: abaikan, chat tetap berjalan */ }
};

/** Hapus riwayat semua akun (dipanggil saat logout). Riwayat tamu dibiarkan. */
const clearAccountChats = () => {
  try {
    for (const k of Object.keys(sessionStorage)) {
      if (k.startsWith(CHAT_KEY_PREFIX) && k !== GUEST_CHAT_KEY) sessionStorage.removeItem(k);
    }
  } catch { /* abaikan */ }
};

const getOrCreateSessionId = (): string => {
  const fresh = () => Math.random().toString(36).substring(2);
  try {
    const existing = sessionStorage.getItem(CHAT_SESSION_KEY);
    if (existing) return existing;
    const id = fresh();
    sessionStorage.setItem(CHAT_SESSION_KEY, id);
    return id;
  } catch {
    return fresh();
  }
};

// ──────────────────────────────────────────────
// MAIN CHATBOT COMPONENT
// ──────────────────────────────────────────────
export default function AmaniaEventChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [inputTruncated, setInputTruncated] = useState(false); // teks yang ditempel/diketik melebihi batas lalu dipotong
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(false);
  // ID sesi bertahan selama tab terbuka, sehingga satu percakapan tetap terkelompok di log server
  const [sessionId] = useState(getOrCreateSessionId);
  const abortRef = useRef<AbortController | null>(null); // koneksi jawaban yang sedang berjalan (untuk tombol Stop)
  // Generasi percakapan: naik setiap percakapan dikosongkan (reset / logout / ganti akun). Jawaban yang masih mengalir
  // hanya boleh menulis bila generasinya masih sama; jika tidak, hasilnya dibuang (mencegah gelembung hantu & array berlubang).
  const epochRef = useRef(0);

  // Halaman admin (/admin/...) tidak menampilkan widget chatbot publik.
  const pathname = usePathname();
  const isAdminArea = pathname === '/admin' || (pathname?.startsWith('/admin/') ?? false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Konfigurasi dari admin (AI Assistant > Pengaturan): aktif/nonaktif, mode tamu, nama bot, sapaan ──
  const [config, setConfig] = useState<AssistantConfig>(DEFAULT_ASSISTANT_CONFIG);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Tampilan: tema gelap (mengikuti situs) & layar sangat pendek (HP landscape)
  const [isDark, setIsDark] = useState(false);
  const [compact, setCompact] = useState(false);
  // Identitas pemilik percakapan (id user / "guest"); null sampai sinkronisasi pertama
  const [authKey, setAuthKey] = useState<string | null>(null);
  const ownerKeyRef = useRef<string>(GUEST_CHAT_KEY); // pemilik percakapan yang sedang ada di memori
  const prevAuthKey = useRef<string | null>(null);

  /**
   * Sinkronkan status login & tema dari localStorage. Widget berada di root layout sehingga TIDAK ikut dimuat ulang
   * saat user login/logout lewat navigasi di dalam aplikasi; tanpa sinkronisasi ini widget tetap menampilkan
   * status "Mode Tamu" (atau, lebih berbahaya, percakapan akun sebelumnya setelah logout).
   */
  const syncAuth = useCallback(() => {
    setIsLoggedIn(Boolean(safeStorage.getItem('token')));
    setAuthKey(currentChatKey());
    setIsDark(readDarkTheme());
  }, []);

  const loadConfig = useCallback(async () => {
    syncAuth(); // ikut berubah setelah login/logout
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${apiUrl}/ai/config`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setConfig({
            ...DEFAULT_ASSISTANT_CONFIG,
            ...json.data,
            // Backend lama tidak mengirim quick_chips → pakai bawaan; daftar kosong dari admin dihormati
            quick_chips: Array.isArray(json.data.quick_chips) ? json.data.quick_chips : DEFAULT_QUICK_CHIPS,
            cs_whatsapp_url: typeof json.data.cs_whatsapp_url === 'string' && json.data.cs_whatsapp_url
              ? json.data.cs_whatsapp_url
              : DEFAULT_ASSISTANT_CONFIG.cs_whatsapp_url,
          });
        }
      }
      // 404 (backend lama) / gagal koneksi → pakai default (aktif), perilaku sama seperti sebelumnya
    } catch { /* abaikan */ }
    finally { setConfigLoaded(true); }
  }, [syncAuth]);

  // Muat saat halaman dibuka, lalu sinkron: tiap 60 detik, saat tab kembali aktif, dan saat chat dibuka.
  useEffect(() => {
    loadConfig();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') loadConfig();
    }, 60_000);
    const onVisible = () => { if (document.visibilityState === 'visible') loadConfig(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadConfig]);

  useEffect(() => { if (isOpen) loadConfig(); }, [isOpen, loadConfig]);

  // Login/logout lewat navigasi dalam aplikasi mengubah pathname; login/logout di tab lain memicu event `storage`.
  useEffect(() => { syncAuth(); }, [pathname, syncAuth]);
  useEffect(() => {
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, [syncAuth]);

  // Saat chat terbuka, ikuti tombol tema situs (perubahan di tab yang sama tidak memicu event `storage`)
  useEffect(() => {
    if (!isOpen) return;
    const t = setInterval(() => setIsDark(readDarkTheme()), 1500);
    return () => clearInterval(t);
  }, [isOpen]);

  // Ganti identitas (login/logout/ganti akun): buang percakapan identitas lama dari memori dan hentikan
  // jawaban yang masih mengalir. Riwayat identitas baru dimuat saat chat dibuka.
  useEffect(() => {
    if (authKey === null) return;
    if (prevAuthKey.current !== null && prevAuthKey.current !== authKey) {
      epochRef.current++;
      abortRef.current?.abort();
      setMessages([]);
      setInput(''); setInputTruncated(false);
      setIsLoading(false);
    }
    prevAuthKey.current = authKey;
  }, [authKey]);

  // Deteksi viewport: layar sangat pendek (HP landscape) dipakai layar penuh; di HP (<640px) halaman di belakang
  // dikunci agar tidak ikut bergulir saat chat terbuka.
  useEffect(() => {
    const short = window.matchMedia('(max-height: 480px)');
    const update = () => setCompact(short.matches);
    update();
    short.addEventListener('change', update);
    return () => short.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const phone = window.matchMedia('(max-width: 639px)');
    if (!phone.matches && !compact) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen, compact]);

  // Esc menutup chat
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  // Setelah pesan terkirim, kolom ketik kembali ke tinggi awal
  useEffect(() => {
    if (!input && inputRef.current) inputRef.current.style.height = '42px';
  }, [input]);

  // Jika admin menonaktifkan saat chat sedang terbuka, tutup (agar tombol WhatsApp melayang kembali normal)
  useEffect(() => { if (!config.enabled) setIsOpen(false); }, [config.enabled]);

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

    // Sapaan kustom dari admin (placeholder {name} = nama depan user)
    if (config.welcome_message.trim()) {
      return {
        role: 'assistant',
        content: config.welcome_message.replace(/\{name\}/gi, name),
        timestamp: Date.now(),
      };
    }

    return {
      role: 'assistant',
      content: isAuth
        ? `Halo **${name}**! 👋\n\nSaya **Amania Digital Assistant**. Saya bisa membantu Anda dengan:\n- 📅 Jadwal **webinar** dan sisa kuota kursi\n- 📦 Katalog **e-product** premium\n- 🎓 Informasi **kursus** dan sertifikat\n- 🎟️ Cek status tiket\n\nAda yang bisa saya bantu hari ini?`
        : `Halo! 👋 Saya **Amania Digital Assistant**. Saya bisa membantu info **webinar**, **e-product**, dan **kursus online**.\n\nUntuk cek tiket dan riwayat pesanan, silakan **[masuk ke akun Anda](/login)**.\n\nAda yang bisa saya bantu?`,
      timestamp: Date.now(),
    };
  }, [config.welcome_message]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Pulihkan percakapan sebelumnya (mis. setelah refresh); jika tidak ada, mulai dengan sapaan
      const ownerKey = authKey ?? currentChatKey();
      ownerKeyRef.current = ownerKey; // percakapan di memori milik identitas ini
      const restored = loadStoredChat(ownerKey);
      if (restored.length > 0) {
        setMessages(restored);
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          inputRef.current?.focus();
        }, 150);
      } else {
        setMessages([buildGreeting()]);
        setTimeout(() => {
          if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = 0;
          }
          inputRef.current?.focus();
        }, 150);
      }
    }
    if (isOpen) setHasNotification(false);
  }, [isOpen, messages.length, buildGreeting, authKey]);

  // Simpan percakapan setiap kali berubah (kecuali saat jawaban masih mengalir).
  // Disimpan di bawah kunci PEMILIK percakapan; bila identitas sudah berganti (login/logout), jangan simpan apa pun.
  useEffect(() => {
    if (!configLoaded || authKey === null || messages.length === 0 || messages.some(m => m.isStreaming)) return;
    if (ownerKeyRef.current !== authKey) return;
    saveStoredChat(messages, ownerKeyRef.current);
  }, [messages, configLoaded, authKey]);

  // Logout: hapus riwayat akun dari tab ini (data transaksi tidak boleh tersisa untuk pengguna berikutnya)
  useEffect(() => {
    if (configLoaded && !isLoggedIn) clearAccountChats();
  }, [configLoaded, isLoggedIn]);

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
        const card = sanitizeCard(JSON.parse(match[1]));
        if (card) cards.push(card);
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
    setInput(''); setInputTruncated(false);
    setIsLoading(true);
    scrollToBottom();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const token = safeStorage.getItem('token');

    const assistantIndex = history.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() }]);

    // Dideklarasikan di luar try agar jawaban parsial tetap bisa disimpan saat user menekan Stop
    let fullText = '';
    let messageId: string | undefined;
    const controller = new AbortController();
    abortRef.current = controller;
    // Semua penulisan dari stream melewati pagar generasi: bila percakapan sudah dikosongkan, hasilnya dibuang
    const epoch = epochRef.current;
    const updateMessages = (fn: (prev: ChatMessage[]) => ChatMessage[]) => {
      if (epoch === epochRef.current) setMessages(fn);
    };

    try {
      const payload = {
        session_id: sessionId,
        message: text,
        // History = percakapan SEBELUM pesan ini, tanpa sapaan awal bot & tanpa bubble kosong.
        // (Pesan terbaru dikirim terpisah lewat field `message`, supaya tidak terkirim ganda ke Gemini.)
        history: messages
          .filter((m, i) => !(i === 0 && m.role === 'assistant') && m.content.trim())
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
        signal: controller.signal,
      });

      if (res.status === 429) {
        throw new Error('Terlalu banyak pesan dalam waktu singkat. Mohon tunggu sekitar satu menit lalu coba lagi');
      }

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ message: 'Server error' }));
        // Admin menonaktifkan chatbot / mewajibkan login saat chat sedang berjalan → sinkronkan tampilan langsung
        if (res.status === 503 && errData.code === 'assistant_disabled') {
          setConfig(c => ({ ...c, enabled: false }));
        } else if (res.status === 401 && errData.code === 'login_required') {
          setConfig(c => ({ ...c, allow_guests: false }));
        }
        throw new Error(errData.message ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = ''; // sisa baris yang terpotong di antara dua network chunk

      const handleLine = (rawLine: string) => {
        const line = rawLine.replace(/\r$/, '');
        if (!line.startsWith('data:')) return;
        const dataStr = line.slice(5).trim();
        if (!dataStr || dataStr === '[DONE]') return;
        try {
          const data = JSON.parse(dataStr);
          if (data.message_id) messageId = data.message_id;
          if (data.chunk) {
            fullText += data.chunk;
            // Sembunyikan kartu [CARD:{...}] termasuk yang belum lengkap (masih streaming)
            const display = fullText
              .replace(/\[CARD:\{[\s\S]*?\}\]/g, '')
              .replace(/\[CARD:[\s\S]*$/, '')
              .trim();

            updateMessages(prev => {
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
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });

        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() ?? ''; // baris terakhir mungkin belum utuh
        lines.forEach(handleLine);
      }
      if (lineBuffer) handleLine(lineBuffer);

      const { cleanText, cards } = parseRichCards(fullText);
      updateMessages(prev => {
        const next = [...prev];
        next[assistantIndex] = {
          role: 'assistant',
          content: cleanText || fullText || 'Maaf, saya belum bisa menjawab saat ini. Silakan coba lagi atau hubungi Customer Service melalui menu bantuan.',
          isStreaming: false,
          richCards: cards.length > 0 ? cards : undefined,
          timestamp: Date.now(),
          messageId,
        };
        return next;
      });

    } catch (err: any) {
      // User menekan Stop: simpan jawaban parsial (bukan error), dan tetap bisa diberi 👍/👎
      if (err?.name === 'AbortError') {
        const { cleanText, cards } = parseRichCards(fullText);
        const partial = cleanText || fullText.replace(/\[CARD:[\s\S]*$/, '').trim();
        updateMessages(prev => {
          const next = [...prev];
          next[assistantIndex] = {
            role: 'assistant',
            content: partial ? `${partial}\n\n_⏹ Respons dihentikan._` : '_⏹ Respons dihentikan._',
            isStreaming: false,
            richCards: cards.length > 0 ? cards : undefined,
            timestamp: Date.now(),
            messageId,
          };
          return next;
        });
        return;
      }

      // Pesan untuk pengunjung: bedakan internet pengguna yang putus dari layanan yang tidak dapat dihubungi,
      // tanpa detail teknis (alamat/port server tidak relevan bagi pengguna).
      const isNetworkError = err instanceof TypeError || /fetch|network/i.test(err?.message ?? '');
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const errMsg = isOffline
        ? '📡 Koneksi internet Anda sepertinya terputus. Periksa jaringan Anda, lalu kirim ulang pesan. Riwayat percakapan tetap tersimpan.'
        : isNetworkError
          ? 'Maaf, asisten sedang tidak dapat dihubungi. Silakan coba lagi beberapa saat lagi atau hubungi Customer Service bila mendesak.'
          : `Maaf, terjadi kendala koneksi: ${err?.message ?? 'Kesalahan tidak diketahui'}. Silakan coba kembali atau hubungi Customer Service.`;

      updateMessages(prev => {
        const next = [...prev];
        next[assistantIndex] = { role: 'assistant', content: errMsg, isStreaming: false, timestamp: Date.now() };
        return next;
      });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (epoch === epochRef.current) setIsLoading(false); // percakapan baru sudah mengatur status loading-nya sendiri
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [input, isLoading, messages, sessionId, scrollToBottom]);

  // ── Stop: hentikan jawaban yang sedang diketik ──
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Putuskan koneksi yang masih berjalan saat komponen di-unmount (mis. pindah halaman)
  useEffect(() => () => abortRef.current?.abort(), []);

  // ── Feedback 👍/👎 per jawaban ──
  const sendFeedback = useCallback(async (idx: number, rating: 'up' | 'down') => {
    const target = messages[idx];
    // Rating boleh diganti (👍 → 👎 atau sebaliknya); klik ulang pilihan yang sama tidak mengirim apa pun
    if (!target?.messageId || target.feedback === rating) return;
    const previous = target.feedback;

    // Optimistic update: pilihan langsung tampil aktif
    setMessages(prev => prev.map((m, i) => (i === idx ? { ...m, feedback: rating } : m)));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const res = await fetch(`${apiUrl}/ai/event-assistant/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ message_id: target.messageId, rating }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      // Gagal tersimpan: kembalikan tampilan ke pilihan sebelumnya agar tidak menyesatkan pengguna
      setMessages(prev => prev.map((m, i) => (i === idx ? { ...m, feedback: previous } : m)));
    }
  }, [messages]);

  // ── Salin jawaban ──
  const copyMessage = useCallback(async (idx: number, content: string) => {
    const ok = await copyToClipboard(toPlainText(content));
    if (!ok) return;
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(cur => (cur === idx ? null : cur)), 2000);
  }, []);

  // ── Key handler ──
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Reset session ──
  const handleReset = () => {
    // Hentikan jawaban yang masih mengalir & buang hasilnya: tanpa ini, jawaban lama menyusup ke percakapan baru
    epochRef.current++;
    abortRef.current?.abort();
    setIsLoading(false);
    setInput(''); setInputTruncated(false);
    setMessages([buildGreeting()]);
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = 0;
    }
  };

  // Widget disembunyikan total jika: konfigurasi belum dimuat (mencegah kedip), dinonaktifkan admin,
  // atau mode khusus member dan user belum login. (Semua hook sudah dipanggil di atas.)
  // Panel admin juga disembunyikan: widget publik menimpa konten panel dan bukan untuk pengelola.
  if (isAdminArea || !configLoaded || !config.enabled || (!config.allow_guests && !isLoggedIn)) {
    return null;
  }

  const lastMessage = messages[messages.length - 1];
  // Indikator mengetik hanya selama belum ada teks; setelah teks mengalir, jawabannya sendiri yang tampil
  const showTyping = isLoading && !lastMessage?.content;
  const showChips = messages.length <= 1 && !isLoading && config.quick_chips.length > 0;

  // Tata letak jendela (mobile-first):
  //  • < 640px      : bottom sheet (tinggi maks. 92% layar, sudut atas membulat) + latar redup
  //  • ≥ 640px      : jendela mengambang di pojok kanan bawah (lebar 400 → 420 → 440px sesuai layar)
  //  • HP landscape : layar penuh (tinggi < 480px tidak cukup untuk jendela mengambang)
  // `dvh` = tinggi viewport dinamis, sehingga tidak tertutup address bar / keyboard di HP.
  const windowLayout = compact
    ? 'inset-0 h-[100dvh] w-full rounded-none'
    : 'inset-x-0 bottom-0 h-[min(92dvh,740px)] rounded-t-[28px] ' +
      'sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[min(660px,calc(100dvh-2.5rem))] sm:w-[400px] sm:rounded-[28px] ' +
      'md:bottom-6 md:right-6 md:w-[420px] ' +
      'xl:h-[min(720px,calc(100dvh-3rem))] xl:w-[440px]';

  // ──────────────────────────────────────────────
  // RENDER INTERFACE
  // `dark` dipasang di sini karena widget berada di luar kontainer tema milik layout member/admin.
  // ──────────────────────────────────────────────
  return (
    <div className={isDark ? 'dark' : ''}>
      {/* ═════════════ TOMBOL MELAYANG (FAB) ═════════════ */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="fab"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[90] flex select-none items-center gap-3 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8"
          >
            {/* Kapsul sapaan (disembunyikan di layar sempit agar tidak menutupi konten) */}
            <AnimatePresence>
              {hasNotification && (
                <motion.div
                  key="capsule"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  onClick={() => setIsOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(true); }}
                  className="pointer-events-auto relative hidden max-w-[270px] cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-[#0d0e2a]/95 py-2.5 pl-3.5 pr-2.5 shadow-[0_20px_44px_-16px_rgba(13,14,42,0.8)] backdrop-blur-xl transition-colors hover:border-amber-300/40 sm:flex"
                >
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="flex items-center gap-1.5 truncate text-[12.5px] font-semibold tracking-tight text-white">
                      {config.bot_name} <Sparkles size={11} className="shrink-0 text-amber-300" />
                    </p>
                    <p className="mt-0.5 truncate text-[10.5px] text-slate-400">Webinar · E-Product · Kursus · Tiket</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setHasNotification(false); }}
                    className="rounded-full p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label="Tutup notifikasi"
                  >
                    <X size={12} />
                  </button>
                  <span className="pointer-events-none absolute -right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-r border-t border-white/10 bg-[#0d0e2a]" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Orb */}
            <div className="pointer-events-auto relative">
              <span className="pointer-events-none absolute -inset-1.5 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-amber-300 opacity-40 blur-xl" />
              <button
                onClick={() => setIsOpen(true)}
                id="amania-chatbot-fab"
                aria-label={`Buka ${config.bot_name}`}
                className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white shadow-[0_18px_40px_-12px_rgba(79,70,229,0.75)] ring-1 ring-amber-300/50 transition-transform duration-300 hover:scale-105 active:scale-95 sm:h-[60px] sm:w-[60px]"
              >
                <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/25 via-transparent to-transparent" />
                <Brain size={26} strokeWidth={1.9} className="relative drop-shadow" />
                <Sparkles size={12} className="absolute right-3 top-3 text-amber-200" />
              </button>
              <span className="pointer-events-none absolute right-0 top-0 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0b0c1d]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═════════════ JENDELA CHAT ═════════════ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[99] bg-slate-950/50 backdrop-blur-[3px] sm:hidden"
            aria-hidden="true"
          />
        )}
        {isOpen && (
          <motion.div
            key="window"
            role="dialog"
            aria-label={config.bot_name}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className={`fixed z-[100] flex flex-col overflow-hidden border border-slate-200/70 bg-white shadow-[0_44px_110px_-34px_rgba(15,23,42,0.65)] dark:border-white/10 dark:bg-[#0b0c1d] ${windowLayout}`}
          >
            {/* ───────── HEADER ───────── */}
            <header className={`relative shrink-0 overflow-hidden bg-gradient-to-br from-[#0d0e2a] via-[#17154a] to-[#0f1237] px-4 text-white sm:px-5 ${compact ? 'py-2' : 'pb-3.5 pt-4'}`}>
              <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-violet-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative shrink-0">
                    <BotAvatar size={compact ? 34 : 44} />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#12123a]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-[15px] font-semibold tracking-tight">{config.bot_name}</h3>
                      <span className="hidden shrink-0 rounded-full border border-amber-300/40 bg-amber-300/10 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-amber-200 min-[380px]:inline-block">
                        Hybrid RAG
                      </span>
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
                      </span>
                      <span className="text-slate-600">·</span>
                      {isLoggedIn ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <UserCheck size={11} /> Terverifikasi
                        </span>
                      ) : (
                        <Link href="/login" className="inline-flex items-center gap-1 text-slate-300 underline-offset-2 transition-colors hover:text-white hover:underline">
                          <ShieldCheck size={11} /> Mode tamu · Masuk
                        </Link>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    title="Mulai percakapan baru"
                    aria-label="Mulai percakapan baru"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition-all hover:bg-white/20 hover:text-white active:scale-95"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Tutup"
                    aria-label="Tutup percakapan"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition-all hover:bg-white/20 hover:text-white active:scale-95"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
            </header>

            {/* ───────── PESAN ───────── */}
            <div className="relative min-h-0 flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-50/70 dark:from-[#0b0c1d] dark:via-[#0d0e22] dark:to-[#0b0c1d]">
              <div
                ref={chatBodyRef}
                className="custom-scrollbar absolute inset-0 space-y-4 overflow-y-auto overscroll-contain px-3.5 py-4 sm:px-4"
                aria-live="polite"
              >
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  // Bubble kosong saat menunggu teks pertama digantikan indikator mengetik
                  if (!isUser && !msg.content && msg.isStreaming) return null;

                  return (
                    <div key={idx} className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                      {!isUser && <BotAvatar size={28} />}

                      <div className={`flex min-w-0 max-w-[88%] flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={
                            isUser
                              ? 'max-w-full rounded-2xl rounded-tr-md bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 px-3.5 py-2.5 text-white shadow-[0_12px_26px_-14px_rgba(99,102,241,0.9)]'
                              : 'max-w-full rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none'
                          }
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap break-words text-[13.5px] leading-[1.6]">{msg.content}</p>
                          ) : (
                            <div className="break-words">
                              <ReactMarkdown components={MarkdownComponents}>{msg.content}</ReactMarkdown>
                            </div>
                          )}
                        </div>

                        {msg.richCards && msg.richCards.length > 0 && (
                          <div className="w-full space-y-2">
                            {msg.richCards.map((card, ci) => (
                              <RichCardComponent key={ci} card={card} csUrl={config.cs_whatsapp_url} />
                            ))}
                          </div>
                        )}

                        {/* Jam + feedback */}
                        {!msg.isStreaming && (
                          <div className="flex items-center gap-1.5 px-1 text-[10.5px] text-slate-400 dark:text-slate-500">
                            {msg.timestamp && <span>{fmtTime(msg.timestamp)}</span>}
                            {!isUser && msg.content && (
                              <span className="flex items-center gap-0.5">
                                <span className="mr-0.5">·</span>
                                <button
                                  onClick={() => copyMessage(idx, msg.content)}
                                  aria-label={copiedIdx === idx ? 'Jawaban tersalin' : 'Salin jawaban'}
                                  title={copiedIdx === idx ? 'Tersalin' : 'Salin jawaban'}
                                  className={`flex items-center gap-1 rounded-md p-1 transition-colors ${
                                    copiedIdx === idx
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200'
                                  }`}
                                >
                                  {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                                  {copiedIdx === idx && <span>Tersalin</span>}
                                </button>
                              </span>
                            )}
                            {!isUser && msg.messageId && (
                              <span className="flex items-center gap-0.5">
                                <button
                                  onClick={() => sendFeedback(idx, 'up')}
                                  aria-label="Jawaban membantu"
                                  aria-pressed={msg.feedback === 'up'}
                                  title="Membantu"
                                  className={`rounded-md p-1 transition-colors ${
                                    msg.feedback === 'up'
                                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                      : 'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10'
                                  }`}
                                >
                                  <ThumbsUp size={12} fill={msg.feedback === 'up' ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => sendFeedback(idx, 'down')}
                                  aria-label="Jawaban kurang membantu"
                                  aria-pressed={msg.feedback === 'down'}
                                  title="Kurang membantu"
                                  className={`rounded-md p-1 transition-colors ${
                                    msg.feedback === 'down'
                                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                                      : 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10'
                                  }`}
                                >
                                  <ThumbsDown size={12} fill={msg.feedback === 'down' ? 'currentColor' : 'none'} />
                                </button>
                                {msg.feedback && <span className="ml-0.5">Terima kasih atas masukan Anda</span>}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {showTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              <AnimatePresence>
                {showScrollDown && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => scrollToBottom()}
                    aria-label="Ke pesan terbaru"
                    className="absolute bottom-3 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-lg backdrop-blur transition hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-slate-800/95 dark:text-white"
                  >
                    <ChevronDown size={16} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ───────── PERTANYAAN CEPAT ───────── */}
            {showChips && (
              <div className="shrink-0 border-t border-slate-200/60 bg-white/80 pb-1 pt-2.5 backdrop-blur dark:border-white/5 dark:bg-white/[0.02]">
                {!compact && (
                  <p className="mb-1.5 px-3.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:px-4">Pertanyaan populer</p>
                )}
                <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-3.5 pb-1.5 sm:px-4 [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%_-_28px),transparent)] [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%_-_28px),transparent)]">
                  {config.quick_chips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.query)}
                      className="flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 text-[12px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-px hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md active:translate-y-0 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-violet-200"
                    >
                      <span aria-hidden="true">{chip.icon}</span>
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ───────── INPUT ───────── */}
            <footer className="shrink-0 border-t border-slate-200/70 bg-white px-3.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 dark:border-white/10 dark:bg-[#0b0c1d] sm:px-4 sm:pb-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 rounded-2xl bg-slate-100/80 ring-1 ring-transparent transition-all focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.10)] focus-within:ring-violet-500/40 dark:bg-white/[0.06] dark:focus-within:bg-white/[0.08]">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      // Batas ditegakkan di sini (bukan atribut maxLength) agar pemotongan bisa diberitahukan ke pengguna
                      const raw = e.target.value;
                      const over = raw.length > MAX_INPUT_CHARS;
                      setInput(over ? raw.slice(0, MAX_INPUT_CHARS) : raw);
                      setInputTruncated(over || (inputTruncated && raw.length >= MAX_INPUT_CHARS));
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Tanya webinar, kursus, e-product, tiket…"
                    aria-label="Tulis pesan"
                    aria-describedby={input.length >= INPUT_COUNTER_FROM ? 'amania-chatbot-counter' : undefined}
                    rows={1}
                    disabled={isLoading}
                    // 16px di HP mencegah iOS memperbesar layar saat input difokuskan
                    className="block max-h-[110px] w-full resize-none bg-transparent px-3.5 py-2.5 text-[16px] leading-[1.45] text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-[13.5px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ height: '42px' }}
                  />
                </div>

                {/* Kirim / Stop: saat bot menjawab, tombol berubah menjadi Stop */}
                {isLoading ? (
                  <button
                    onClick={handleStop}
                    id="amania-chatbot-stop"
                    aria-label="Hentikan jawaban"
                    title="Hentikan jawaban"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-[0_10px_24px_-10px_rgba(15,23,42,0.7)] transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-slate-900"
                  >
                    <Square size={13} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    id="amania-chatbot-send"
                    aria-label="Kirim pesan"
                    className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl transition-all ${
                      input.trim()
                        ? 'bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 text-white shadow-[0_12px_26px_-10px_rgba(99,102,241,0.9)] hover:scale-105 active:scale-95'
                        : 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-white/10 dark:text-slate-500'
                    }`}
                  >
                    <Send size={16} className="-translate-x-px translate-y-px" />
                  </button>
                )}
              </div>

              {input.length >= INPUT_COUNTER_FROM && (
                <p
                  id="amania-chatbot-counter"
                  aria-live="polite"
                  className={`mt-1.5 px-1 text-right text-[10.5px] font-medium ${
                    input.length >= MAX_INPUT_CHARS ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {inputTruncated
                    ? `Teks dipotong: maksimal ${MAX_INPUT_CHARS.toLocaleString('id-ID')} karakter per pesan`
                    : `${input.length.toLocaleString('id-ID')}/${MAX_INPUT_CHARS.toLocaleString('id-ID')} karakter`}
                </p>
              )}
              {!compact && (
                <p className="mt-2 text-center text-[10.5px] leading-snug text-slate-400 dark:text-slate-500">
                  Didukung Hybrid RAG · AI bisa keliru, periksa informasi penting
                </p>
              )}
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
