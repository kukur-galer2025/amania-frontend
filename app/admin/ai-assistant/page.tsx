"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  Bot, BookOpen, BarChart3, Plus, Pencil, Trash2, Pin, Loader2, Save, X,
  ThumbsUp, ThumbsDown, AlertTriangle, Zap, Timer, MessageSquare,
  Settings as SettingsIcon, Power, ShieldCheck, Phone, Sparkles, ArrowUp, ArrowDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api';

type Tab = 'knowledge' | 'stats' | 'settings';

interface QuickChip { icon: string; label: string; query: string }

const MAX_CHIPS = 8;

/** Penanda hasil Tes Koneksi pada pilihan model (kosong = belum dites). */
const statusIcon = (status?: string): string =>
  status === 'ok' ? '✅ ' : status === 'quota' ? '⏳ ' : status === 'failed' ? '❌ ' : '';
// Sama dengan bawaan di backend (AiSetting::DEFAULT_QUICK_CHIPS); dipakai tombol "Pulihkan bawaan".
const DEFAULT_CHIPS: QuickChip[] = [
  { icon: '🎟️', label: 'Cek Tiket & Transaksi', query: 'Cek status tiket dan transaksi saya' },
  { icon: '📅', label: 'Webinar & Seminar', query: 'Tunjukkan jadwal webinar dan seminar daring yang tersedia' },
  { icon: '📦', label: 'Modul E-Products', query: 'Rekomendasikan modul e-product premium yang ada' },
  { icon: '🎓', label: 'Kursus Pelatihan', query: 'Rekomendasikan kursus online pelatihan digital yang tersedia' },
  { icon: '⚡', label: 'Sisa Kuota Kursi', query: 'Berapa sisa kuota kursi webinar yang masih tersedia?' },
  { icon: '💬', label: 'Hubungi CS Support', query: 'Saya ingin menghubungi Customer Service untuk bantuan khusus' },
];

interface AiSettings {
  enabled: boolean;
  allow_guests: boolean;
  bot_name: string;
  welcome_message: string;
  quick_chips: QuickChip[];
  model: string;
  smart_routing: boolean;
  routing_threshold: number;
  adaptive_routing: boolean;
  semantic_retrieval: boolean;
  temperature: number;
  max_output_tokens: number;
  extra_instructions: string;
  cs_phone: string;
  cs_hours: string;
  rate_limit_per_minute: number;
  log_conversations: boolean;
  log_retention_days: number;
  status_changed_at: string | null;
  status_changed_by: string | null;
}

interface KnowledgeItem {
  id: number;
  title: string;
  category: string;
  content: string;
  keywords: string | null;
  is_pinned: boolean;
  is_active: boolean;
}

interface Gap {
  id: number;
  message: string;
  engine: string;
  fallback_reason: string | null;
  feedback: number | null;
  feedback_comment: string | null;
  created_at: string;
}

interface EmbeddingStatus {
  chunks: number; documents: number; model?: string; dims?: number;
  last_indexed?: string | null; available: boolean; enabled: boolean;
}
interface TokenAvg { requests: number; avg_in: number; avg_out: number; total_in: number; total_out: number }
interface RoutingStats {
  routed: number; a: number; b: number; c: number;
  a_percent: number; b_percent: number; c_percent: number;
  tokens_b: TokenAvg; tokens_c: TokenAvg;
  estimated_tokens_saved: number;
  adaptive_enabled?: boolean;
  calibration?: Record<string, { answered: number; bad: number; thumbs_down: number; rephrased: number; rate: number; boost: number }>;
  top_intents: { route: string | null; intent: string; total: number }[];
}

interface Stats {
  days: number;
  total: number;
  gemini: number;
  fallback: number;
  fallback_percent: number;
  avg_latency_ms: number;
  avg_first_token_ms: number;
  thumbs_up: number;
  thumbs_down: number;
  fallback_reasons: Record<string, number>;
  gaps: Gap[];
  blocked: number;
  rule?: number;
  embedding?: EmbeddingStatus;
  avg_latency_rule_ms?: number;
  routing?: RoutingStats;
  security_events: { id: number; message: string; engine: string; fallback_reason: string | null; created_at: string }[];
}

const CATEGORIES = ['umum', 'pembayaran', 'kebijakan', 'webinar', 'e-product', 'kursus', 'akun', 'sertifikat'];
const EMPTY_FORM = { title: '', category: 'umum', content: '', keywords: '', is_pinned: false, is_active: true };

const inputCls =
  'w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-xs md:text-sm focus:outline-none focus:border-indigo-500 transition-all';
const labelCls = 'text-[10px] md:text-xs font-bold text-slate-500 uppercase mb-1.5 block tracking-wider';

const ROUTE_META: Record<'a' | 'b' | 'c', { label: string; desc: string; bar: string; dot: string }> = {
  a: { label: 'A · Tanpa LLM', desc: 'Dijawab dari database', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  b: { label: 'B · LLM konteks kecil', desc: 'Hanya data domain relevan', bar: 'bg-sky-500', dot: 'bg-sky-500' },
  c: { label: 'C · LLM konteks penuh', desc: 'Pertanyaan rumit / ambigu', bar: 'bg-violet-500', dot: 'bg-violet-500' },
};

function RoutingCard({ routing, ruleLatencyMs }: { routing: RoutingStats; ruleLatencyMs: number }) {
  const fmt = (n: number) => n.toLocaleString('id-ID');
  const keys = ['a', 'b', 'c'] as const;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold text-slate-900">Routing & Penghematan Token</h3>
        <span className="text-[11px] text-slate-400">{fmt(routing.routed)} pertanyaan ber-rute</span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100" role="img"
        aria-label={`Sebaran rute: A ${routing.a_percent}%, B ${routing.b_percent}%, C ${routing.c_percent}%`}>
        {keys.map((k) => routing[`${k}_percent` as const] > 0 && (
          <div key={k} className={ROUTE_META[k].bar} style={{ width: `${routing[`${k}_percent` as const]}%` }} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        {keys.map((k) => (
          <div key={k} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${ROUTE_META[k].dot}`} />
              <span className="text-xs font-bold text-slate-700">{ROUTE_META[k].label}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 mt-1.5 leading-none">{routing[`${k}_percent` as const]}%
              <span className="text-xs font-semibold text-slate-400 ml-1.5">{fmt(routing[k])}×</span></p>
            <p className="text-[10px] text-slate-400 mt-1.5">{ROUTE_META[k].desc}</p>
            {k === 'a' && ruleLatencyMs > 0 && <p className="text-[10px] text-slate-500 mt-1">Rata² latensi {ruleLatencyMs} ms</p>}
            {k !== 'a' && (() => {
              const t = k === 'b' ? routing.tokens_b : routing.tokens_c;
              return t.requests > 0
                ? <p className="text-[10px] text-slate-500 mt-1">Rata² {fmt(t.avg_in)} token masuk · {fmt(t.avg_out)} keluar</p>
                : <p className="text-[10px] text-slate-400 mt-1">Belum ada data token</p>;
            })()}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
        <p className="text-xs text-emerald-800">
          Estimasi token dihemat: <b>{fmt(routing.estimated_tokens_saved)}</b>
        </p>
        <p className="text-[10px] text-emerald-700/80 mt-1 leading-relaxed">
          Dihitung dari rata-rata token nyata permintaan rute C (dari Gemini). Bernilai 0 bila belum ada pembanding nyata. Angka ini estimasi, bukan tagihan.
        </p>
      </div>

      {routing.calibration && Object.keys(routing.calibration).length > 0 && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h4 className="text-xs font-bold text-slate-800">Kalibrasi adaptif per intent</h4>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${routing.adaptive_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
              {routing.adaptive_enabled ? 'Aktif' : 'Dimatikan'}
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-left font-semibold px-3 py-2">Intent</th>
                  <th className="text-right font-semibold px-3 py-2">Jawaban A</th>
                  <th className="text-right font-semibold px-3 py-2">Tidak puas</th>
                  <th className="text-right font-semibold px-3 py-2">Ambang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(routing.calibration).map(([intent, c]) => (
                  <tr key={intent}>
                    <td className="px-3 py-2 font-medium text-slate-700">{intent}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{fmt(c.answered)}</td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {Math.round(c.rate * 100)}% <span className="text-slate-400">({c.thumbs_down}👎 · {c.rephrased} diulang)</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      {c.boost > 0
                        ? <span className="font-bold text-amber-700">+{Math.round(c.boost * 100)} poin · diperketat</span>
                        : <span className="text-slate-400">{c.answered < 10 ? 'data belum cukup' : 'normal'}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
            Ambang hanya bisa naik, tidak pernah turun, dan baru berubah setelah minimal 10 jawaban per intent dalam 30 hari terakhir.
          </p>
        </div>
      )}

      {routing.top_intents.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {routing.top_intents.map((t, i) => (
            <span key={`${t.route}-${t.intent}-${i}`} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200">
              {t.route ?? '-'} · {t.intent} · {t.total}×
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dialog konfirmasi kustom (pengganti window.confirm bawaan browser) ──
interface ConfirmState {
  title: string;
  description: string;
  points?: string[];            // poin-poin dampak tindakan
  confirmLabel: string;
  busyLabel: string;
  icon: React.ReactNode;
  onConfirm: () => Promise<void> | void;
}

function ConfirmDialog({ state, busy, onCancel, onConfirm }: {
  state: ConfirmState | null; busy: boolean; onCancel: () => void; onConfirm: () => void;
}) {
  // Esc = batal (kecuali sedang memproses)
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, busy, onCancel]);

  return (
    <AnimatePresence>
      {state && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => !busy && onCancel()}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4 ring-8 ring-rose-50/60">
                  {state.icon}
                </div>
                <h3 id="confirm-title" className="text-base md:text-lg font-bold text-slate-900 mb-2">{state.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{state.description}</p>
              </div>

              {state.points && state.points.length > 0 && (
                <ul className="mt-5 space-y-2 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                  {state.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-3 mt-6 md:mt-8">
                <button
                  onClick={onCancel}
                  disabled={busy}
                  className="flex-1 py-2.5 md:py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs md:text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={onConfirm}
                  disabled={busy}
                  autoFocus
                  className="flex-1 py-2.5 md:py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm rounded-xl transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />}
                  {busy ? state.busyLabel : state.confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Komponen level-modul (bukan di dalam page) agar input tidak ter-remount/kehilangan fokus tiap ketikan.
function SettingsSection({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm p-5 md:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <h3 className="text-sm md:text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

/**
 * Baca respons API admin dengan memeriksa status HTTP lebih dulu. Tanpa ini, respons 401/403/500 (yang tidak
 * memiliki field `data`) diam-diam menghasilkan halaman kosong atau "memuat" selamanya tanpa pesan apa pun.
 */
async function readAdminJson(res: Response, what: string) {
  if (res.status === 401) throw new Error('Sesi login berakhir. Silakan login ulang.');
  if (res.status === 403) throw new Error('Anda tidak memiliki izin untuk melihat bagian ini.');
  if (!res.ok) throw new Error(`${what} (kesalahan server HTTP ${res.status}).`);
  const json = await res.json().catch(() => null);
  if (!json) throw new Error(`${what}: respons server tidak dapat dibaca.`);
  return json;
}

function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 text-center" role="alert">
      <AlertTriangle className="mx-auto mb-2 text-rose-500" size={22} />
      <p className="text-sm font-semibold text-rose-800">{message}</p>
      <button type="button" onClick={onRetry}
        className="mt-3 rounded-xl bg-white px-4 py-2 text-xs font-bold text-rose-700 ring-1 ring-rose-200 transition-colors hover:bg-rose-100">
        Coba lagi
      </button>
    </div>
  );
}

export default function AdminAiAssistantPage() {
  const [tab, setTab] = useState<Tab>('knowledge');
  const [kbError, setKbError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // ── Basis pengetahuan ──
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loadingKb, setLoadingKb] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Statistik ──
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchKnowledge = useCallback(async () => {
    try {
      const json = await readAdminJson(await apiFetch('/admin/ai/knowledge'), 'Gagal memuat basis pengetahuan');
      setItems(json.data ?? []);
      setKbError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat basis pengetahuan.';
      setKbError(msg);
      toast.error(msg);
    } finally {
      setLoadingKb(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const json = await readAdminJson(await apiFetch(`/admin/ai/stats?days=${days}`), 'Gagal memuat statistik');
      setStats(json.data ?? null);
      setStatsError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat statistik.';
      setStatsError(msg);
      toast.error(msg);
    } finally {
      setLoadingStats(false);
    }
  }, [days]);

  // ── Pengaturan & status aktif/nonaktif ──
  const [settings, setSettings] = useState<AiSettings | null>(null);   // nilai tersimpan di server
  const [settingsForm, setSettingsForm] = useState<AiSettings | null>(null); // nilai yang sedang diedit
  const [models, setModels] = useState<Record<string, string>>({});
  // Hasil Tes Koneksi terakhir per model (ok | quota | failed); model tanpa entri = belum dites
  const [modelStatus, setModelStatus] = useState<Record<string, { status: string }>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const json = await readAdminJson(await apiFetch('/admin/ai/settings'), 'Gagal memuat pengaturan');
      if (!json.data) throw new Error('Gagal memuat pengaturan: data tidak ditemukan pada respons server.');
      setSettings(json.data);
      setSettingsForm(json.data);
      setModels(json.models ?? {});
      setModelStatus(json.model_status ?? {});
      setSettingsError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat pengaturan.';
      setSettingsError(msg);
      toast.error(msg);
    }
  }, []);

  // ── Dialog konfirmasi ──
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const closeConfirm = useCallback(() => setConfirmState(null), []);
  const runConfirm = async () => {
    if (!confirmState) return;
    setConfirmBusy(true);
    try { await confirmState.onConfirm(); } finally {
      setConfirmBusy(false);
      setConfirmState(null);
    }
  };

  // Mengaktifkan langsung; menonaktifkan (berdampak ke seluruh website) wajib lewat konfirmasi.
  // ── Tes koneksi model ──
  const [testingModel, setTestingModel] = useState(false);
  const [modelTest, setModelTest] = useState<{ ok: boolean; message: string; latency_ms: number } | null>(null);
  const [reindexing, setReindexing] = useState(false);
  const [indexInfo, setIndexInfo] = useState<EmbeddingStatus | null>(null);

  const loadIndexInfo = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/ai/stats?days=7');
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.data?.embedding) setIndexInfo(json.data.embedding);
    } catch { /* status indeks hanyalah informasi tambahan */ }
  }, []);

  const reindex = async () => {
    setReindexing(true);
    const t = toast.loading('Membangun indeks vektor...');
    try {
      const res = await apiFetch('/admin/ai/embeddings/reindex', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (json?.data?.status) setIndexInfo((cur) => ({ ...(cur ?? { enabled: true }), ...json.data.status }) as EmbeddingStatus);
      if (res.ok) toast.success(json.message || 'Indeks diperbarui.', { id: t });
      else toast.error(json.message || 'Gagal membangun indeks.', { id: t });
    } catch {
      toast.error('Kesalahan koneksi.', { id: t });
    } finally {
      setReindexing(false);
    }
  };

  const testModel = async () => {
    if (!settingsForm) return;
    setTestingModel(true);
    setModelTest(null);
    try {
      const res = await apiFetch('/admin/ai/settings/test-model', {
        method: 'POST',
        body: JSON.stringify({ model: settingsForm.model }),
      });
      const json = await res.json().catch(() => ({}));
      // Simpan status ke daftar pilihan agar ikon ✅/⏳/❌ langsung muncul tanpa memuat ulang halaman
      if (json.model && json.status) {
        setModelStatus((s) => ({ ...s, [json.model]: { status: json.status } }));
      }
      if (res.status === 429) {
        setModelTest({ ok: false, message: 'Terlalu banyak tes. Tunggu sebentar lalu coba lagi.', latency_ms: 0 });
      } else if (res.ok || json.message) {
        setModelTest({ ok: !!json.ok, message: json.message ?? 'Tidak ada respons.', latency_ms: json.latency_ms ?? 0 });
      } else {
        setModelTest({ ok: false, message: 'Gagal menjalankan tes.', latency_ms: 0 });
      }
    } catch {
      setModelTest({ ok: false, message: 'Kesalahan koneksi ke server.', latency_ms: 0 });
    } finally {
      setTestingModel(false);
    }
  };

  const toggleEnabled = () => {
    if (!settings) return;
    if (settings.enabled) {
      setConfirmState({
        title: 'Nonaktifkan Chatbot?',
        description: 'Fitur chatbot akan dimatikan untuk semua pengunjung website.',
        points: [
          'Widget chatbot langsung hilang dari seluruh halaman website.',
          'Permintaan ke chatbot ditolak oleh server.',
          'Pengaturan dan basis pengetahuan tetap tersimpan.',
          'Bisa diaktifkan kembali kapan saja dari halaman ini.',
        ],
        confirmLabel: 'Ya, Nonaktifkan',
        busyLabel: 'Menonaktifkan...',
        icon: <Power size={28} strokeWidth={2} />,
        onConfirm: () => applyEnabled(false),
      });
    } else {
      applyEnabled(true);
    }
  };

  const applyEnabled = async (next: boolean) => {
    setTogglingStatus(true);
    const loadToast = toast.loading(next ? 'Mengaktifkan chatbot...' : 'Menonaktifkan chatbot...');
    try {
      const res = await apiFetch('/admin/ai/settings', { method: 'PUT', body: JSON.stringify({ enabled: next }) });
      if (res.ok) {
        const json = await res.json();
        setSettings(json.data);
        setSettingsForm((f) => (f ? { ...f, enabled: json.data.enabled, status_changed_at: json.data.status_changed_at, status_changed_by: json.data.status_changed_by } : json.data));
        toast.success(next ? 'Chatbot kini AKTIF di seluruh website.' : 'Chatbot dinonaktifkan di seluruh website.', { id: loadToast });
      } else {
        toast.error('Gagal mengubah status chatbot.', { id: loadToast });
      }
    } catch {
      toast.error('Kesalahan koneksi.', { id: loadToast });
    } finally {
      setTogglingStatus(false);
    }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    if (settingsForm.quick_chips.some((c) => !c.label.trim() || !c.query.trim())) {
      toast.error('Lengkapi label dan pertanyaan pada setiap tombol cepat, atau hapus baris yang kosong.');
      return;
    }
    setSavingSettings(true);
    const loadToast = toast.loading('Menyimpan pengaturan...');
    try {
      // `enabled` & jejak audit diubah lewat tombol status, bukan form ini
      const payload: Partial<AiSettings> = { ...settingsForm };
      delete payload.enabled;
      delete payload.status_changed_at;
      delete payload.status_changed_by;
      const res = await apiFetch('/admin/ai/settings', { method: 'PUT', body: JSON.stringify(payload) });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSettings(json.data);
        setSettingsForm(json.data);
        toast.success('Pengaturan tersimpan dan langsung berlaku.', { id: loadToast });
      } else {
        const firstError = json.errors ? (Object.values(json.errors)[0] as string[])[0] : null;
        toast.error(firstError || json.message || 'Gagal menyimpan pengaturan.', { id: loadToast });
      }
    } catch {
      toast.error('Kesalahan koneksi.', { id: loadToast });
    } finally {
      setSavingSettings(false);
    }
  };

  const setField = <K extends keyof AiSettings>(key: K, value: AiSettings[K]) =>
    setSettingsForm((f) => (f ? { ...f, [key]: value } : f));

  // Perbandingan mendalam (JSON) karena quick_chips berupa array/objek
  const settingsDirty = !!settings && !!settingsForm && (
    (Object.keys(settingsForm) as (keyof AiSettings)[])
      .filter((k) => !['enabled', 'status_changed_at', 'status_changed_by'].includes(k))
      .some((k) => JSON.stringify(settingsForm[k]) !== JSON.stringify(settings[k]))
  );

  // ── Editor tombol cepat ──
  const updateChip = (i: number, patch: Partial<QuickChip>) =>
    setSettingsForm((f) => f && ({ ...f, quick_chips: f.quick_chips.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) }));
  const removeChip = (i: number) =>
    setSettingsForm((f) => f && ({ ...f, quick_chips: f.quick_chips.filter((_, idx) => idx !== i) }));
  const moveChip = (i: number, dir: -1 | 1) =>
    setSettingsForm((f) => {
      if (!f) return f;
      const j = i + dir;
      if (j < 0 || j >= f.quick_chips.length) return f;
      const next = [...f.quick_chips];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, quick_chips: next };
    });
  const addChip = () =>
    setSettingsForm((f) => f && f.quick_chips.length < MAX_CHIPS
      ? ({ ...f, quick_chips: [...f.quick_chips, { icon: '💬', label: '', query: '' }] })
      : f);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);
  useEffect(() => { fetchKnowledge(); }, [fetchKnowledge]);
  useEffect(() => { if (tab === 'stats') fetchStats(); }, [tab, fetchStats]);

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
  };

  const startEdit = (item: KnowledgeItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      category: item.category,
      content: item.content,
      keywords: item.keywords ?? '',
      is_pinned: item.is_pinned,
      is_active: item.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadToast = toast.loading(editingId ? 'Menyimpan perubahan...' : 'Menambahkan...');
    try {
      const res = await apiFetch(editingId ? `/admin/ai/knowledge/${editingId}` : '/admin/ai/knowledge', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({ ...form, keywords: form.keywords || null }),
      });
      if (res.ok) {
        toast.success('Tersimpan. Chatbot langsung memakai data terbaru.', { id: loadToast });
        resetForm();
        fetchKnowledge();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Gagal menyimpan.', { id: loadToast });
      }
    } catch {
      toast.error('Kesalahan koneksi.', { id: loadToast });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: KnowledgeItem) => {
    const res = await apiFetch(`/admin/ai/knowledge/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    });
    if (res.ok) fetchKnowledge();
    else toast.error('Gagal mengubah status.');
  };

  const handleDelete = (item: KnowledgeItem) => {
    setConfirmState({
      title: 'Hapus Pengetahuan?',
      description: `"${item.title}" akan dihapus dari basis pengetahuan. Chatbot tidak lagi bisa menjawab berdasarkan informasi ini. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: 'Ya, Hapus',
      busyLabel: 'Menghapus...',
      icon: <Trash2 size={28} strokeWidth={2} />,
      onConfirm: async () => {
        try {
          const res = await apiFetch(`/admin/ai/knowledge/${item.id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success('Pengetahuan dihapus.');
            if (editingId === item.id) resetForm();
            fetchKnowledge();
          } else {
            toast.error('Gagal menghapus.');
          }
        } catch {
          toast.error('Kesalahan koneksi.');
        }
      },
    });
  };

  const reasonLabel = (r: string | null) => {
    if (!r) return null;
    const map: Record<string, string> = {
      no_api_key: 'API key belum diset',
      curl_error: 'Koneksi ke Gemini gagal',
      empty_response: 'Gemini tidak menjawab',
      prompt_leak: 'Prompt bocor (jawaban dipotong)',
      rule_db_error: 'Database gagal saat menjawab (tanpa LLM)',
    };
    if (r.startsWith('injection:')) return `Upaya manipulasi prompt (${r.replace('injection:', '')})`;
    return map[r] ?? (r.startsWith('http_') ? `Gemini error ${r.replace('http_', 'HTTP ')}` : r);
  };

  const StatCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${tone}`}>{icon}</div>
      <p className="text-xl md:text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">{label}</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 px-2 sm:px-0">
      <ConfirmDialog state={confirmState} busy={confirmBusy} onCancel={closeConfirm} onConfirm={runConfirm} />

      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bot className="text-indigo-600" size={24} /> AI Assistant
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Kelola pengetahuan chatbot dan pantau kualitas jawabannya. Perubahan langsung berlaku tanpa menunggu cache.
        </p>
      </div>

      {/* ═════════ STATUS CHATBOT (saklar utama) ═════════ */}
      {settings && (
        <div className={`rounded-2xl border p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          settings.enabled ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
        }`}>
          <div className="flex items-start gap-3 min-w-0">
            <span className="relative flex h-3 w-3 mt-1.5 shrink-0">
              {settings.enabled && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${settings.enabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            </span>
            <div className="min-w-0">
              <p className={`text-sm md:text-base font-bold ${settings.enabled ? 'text-emerald-800' : 'text-rose-800'}`}>
                Chatbot {settings.enabled ? 'AKTIF' : 'NONAKTIF'}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {settings.enabled
                  ? 'Widget chatbot tampil di seluruh website dan melayani pengunjung.'
                  : 'Widget chatbot disembunyikan di seluruh website dan permintaan ke chatbot ditolak oleh server.'}
              </p>
              {settings.status_changed_at && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Terakhir diubah{settings.status_changed_by ? ` oleh ${settings.status_changed_by}` : ''} pada{' '}
                  {new Date(settings.status_changed_at).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggleEnabled}
            disabled={togglingStatus}
            className={`shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white transition-all shadow-lg disabled:opacity-70 ${
              settings.enabled ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
            }`}
          >
            {togglingStatus ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
            {settings.enabled ? 'Nonaktifkan Chatbot' : 'Aktifkan Chatbot'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit max-w-full overflow-x-auto">
        {([
          ['knowledge', 'Basis Pengetahuan', BookOpen],
          ['stats', 'Statistik & Celah', BarChart3],
          ['settings', 'Pengaturan', SettingsIcon],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
              tab === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ═════════ TAB: BASIS PENGETAHUAN ═════════ */}
      {tab === 'knowledge' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 h-fit shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                {editingId ? <Pencil size={16} className="text-indigo-600" /> : <Plus size={16} className="text-indigo-600" />}
                {editingId ? 'Edit Pengetahuan' : 'Tambah Pengetahuan'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-700" aria-label="Batal edit">
                  <X size={16} />
                </button>
              )}
            </div>

            <div>
              <label className={labelCls}>Judul / Topik</label>
              <input className={inputCls} required maxLength={255} value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Cth: Kebijakan Refund" />
            </div>

            <div>
              <label className={labelCls}>Kategori</label>
              <input className={inputCls} required maxLength={60} list="kb-categories" value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <datalist id="kb-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>

            <div>
              <label className={labelCls}>Isi Jawaban / Informasi</label>
              <textarea className={`${inputCls} min-h-[130px] resize-y`} required maxLength={3000} value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis fakta yang benar dan ringkas. Chatbot hanya akan menjawab sesuai isi ini." />
              <p className="text-[10px] text-slate-400 mt-1 text-right">{form.content.length}/3000</p>
            </div>

            <div>
              <label className={labelCls}>Kata Kunci Tambahan (opsional)</label>
              <input className={inputCls} maxLength={255} value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                placeholder="pisahkan dengan koma: refund, batal, uang kembali" />
              <p className="text-[10px] text-slate-400 mt-1">Bantu chatbot menemukan topik ini dari istilah yang dipakai pengguna.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" className="mt-0.5 accent-indigo-600" checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
                <span className="text-xs text-slate-700">
                  <b>Selalu disertakan</b> <span className="text-slate-400">— untuk kebijakan penting (refund, pembayaran). Pakai seperlunya agar prompt tetap ringkas.</span>
                </span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="accent-indigo-600" checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                <span className="text-xs text-slate-700"><b>Aktif</b></span>
              </label>
            </div>

            <button disabled={saving}
              className="w-full bg-indigo-600 text-white py-2.5 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </form>

          <div className="lg:col-span-3 space-y-3">
            {kbError ? (
              <LoadError message={kbError} onRetry={fetchKnowledge} />
            ) : loadingKb ? (
              <div className="p-10 text-center text-slate-400 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-indigo-400" /> Memuat...</div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400 text-sm">
                Belum ada pengetahuan. Tambahkan FAQ atau kebijakan pertama Anda.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id}
                  className={`bg-white rounded-2xl border p-4 md:p-5 shadow-sm transition-opacity ${
                    editingId === item.id ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
                  } ${item.is_active ? '' : 'opacity-55'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{item.category}</span>
                        {item.is_pinned && (
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 inline-flex items-center gap-1">
                            <Pin size={9} /> Selalu disertakan
                          </span>
                        )}
                        {!item.is_active && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">Nonaktif</span>}
                      </div>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      {item.keywords && <p className="text-[10px] text-slate-400 mt-2">Kata kunci: {item.keywords}</p>}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button onClick={() => toggleActive(item)} title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${item.is_active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-500 hover:bg-slate-100'}`}>
                        {item.is_active ? 'ON' : 'OFF'}
                      </button>
                      <button onClick={() => startEdit(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" aria-label="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" aria-label="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ═════════ TAB: STATISTIK & CELAH ═════════ */}
      {tab === 'stats' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Periode:</span>
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  days === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}>
                {d} hari
              </button>
            ))}
          </div>

          {statsError ? (
            <LoadError message={statsError} onRetry={fetchStats} />
          ) : loadingStats || !stats ? (
            <div className="p-10 text-center text-slate-400 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-indigo-400" /> Memuat...</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <StatCard icon={<MessageSquare size={16} />} tone="bg-indigo-50 text-indigo-600" label="Total Chat" value={String(stats.total)} />
                <StatCard icon={<AlertTriangle size={16} />} tone="bg-amber-50 text-amber-600" label="Fallback" value={`${stats.fallback_percent}%`} />
                <StatCard icon={<ShieldCheck size={16} />} tone="bg-slate-100 text-slate-600" label="Diblokir" value={String(stats.blocked ?? 0)} />
                <StatCard icon={<Timer size={16} />} tone="bg-sky-50 text-sky-600" label="Rata² Latensi" value={`${(stats.avg_latency_ms / 1000).toFixed(1)}s`} />
                <StatCard icon={<Zap size={16} />} tone="bg-violet-50 text-violet-600" label="Teks Pertama" value={`${(stats.avg_first_token_ms / 1000).toFixed(1)}s`} />
                <StatCard icon={<ThumbsUp size={16} />} tone="bg-emerald-50 text-emerald-600" label="Membantu" value={String(stats.thumbs_up)} />
                <StatCard icon={<ThumbsDown size={16} />} tone="bg-rose-50 text-rose-600" label="Kurang Membantu" value={String(stats.thumbs_down)} />
              </div>

              {stats.routing && stats.routing.routed > 0 && <RoutingCard routing={stats.routing} ruleLatencyMs={stats.avg_latency_rule_ms ?? 0} />}

              {Object.keys(stats.fallback_reasons).length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Penyebab Fallback</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(stats.fallback_reasons).map(([reason, count]) => (
                      <span key={reason} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                        {reasonLabel(reason)} · {count}×
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3">Fallback berarti Gemini tidak menjawab dan sistem memakai mesin lokal. Persentase tinggi = cek API key, kuota, atau koneksi server.</p>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 md:p-5 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Celah Pengetahuan</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pertanyaan yang jatuh ke fallback atau diberi 👎. Tambahkan jawabannya di tab Basis Pengetahuan.</p>
                </div>
                {stats.gaps.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-sm">Belum ada celah pada periode ini 🎉</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {stats.gaps.map((g) => (
                      <div key={g.id} className="p-4 md:px-5 flex items-start gap-3">
                        <div className="shrink-0 mt-0.5">
                          {g.feedback === -1 ? <ThumbsDown size={15} className="text-rose-500" /> : <AlertTriangle size={15} className="text-amber-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-800 font-medium break-words">{g.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(g.created_at).toLocaleString('id-ID')}
                            {g.engine === 'fallback' && ` · ${reasonLabel(g.fallback_reason) ?? 'fallback'}`}
                            {g.feedback_comment && ` · "${g.feedback_comment}"`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Kejadian keamanan: permintaan diblokir & prompt bocor */}
              {(stats.security_events?.length ?? 0) > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-slate-500" /> Percobaan Penyalahgunaan
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pesan yang ditolak otomatis karena mencoba memanipulasi chatbot (mis. meminta membocorkan instruksi). Chatbot tidak dipanggil untuk pesan ini.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {stats.security_events.map((ev) => (
                      <div key={ev.id} className="p-4 md:px-5 flex items-start gap-3">
                        <ShieldCheck size={15} className="text-slate-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-slate-800 font-medium break-words">{ev.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(ev.created_at).toLocaleString('id-ID')} · {reasonLabel(ev.fallback_reason)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═════════ TAB: PENGATURAN ═════════ */}
      {tab === 'settings' && (
        settingsError && !settingsForm ? (
          <LoadError message={settingsError} onRetry={fetchSettings} />
        ) : !settingsForm ? (
          <div className="p-10 text-center text-slate-400 text-sm"><Loader2 className="animate-spin mx-auto mb-2 text-indigo-400" /> Memuat...</div>
        ) : (
          <form onSubmit={saveSettings} className="space-y-6 pb-4">
            {/* Umum */}
            <SettingsSection icon={<Sparkles size={18} />} title="Umum & Tampilan" desc="Siapa yang boleh memakai chatbot dan bagaimana ia menyapa pengunjung.">
              <ToggleRow
                label="Izinkan pengunjung tanpa login"
                desc="Jika dimatikan, chatbot hanya muncul untuk user yang sudah login. Permintaan dari tamu juga ditolak server."
                checked={settingsForm.allow_guests}
                onChange={(v) => setField('allow_guests', v)}
              />
              <div>
                <label className={labelCls}>Nama Chatbot</label>
                <input className={inputCls} required maxLength={40} value={settingsForm.bot_name}
                  onChange={(e) => setField('bot_name', e.target.value)} placeholder="Amania Digital AI" />
                <p className="text-[10px] text-slate-400 mt-1">Tampil di header chat dan tombol melayang.</p>
              </div>
              <div>
                <label className={labelCls}>Pesan Sambutan (opsional)</label>
                <textarea className={`${inputCls} min-h-[110px] resize-y`} maxLength={1500} value={settingsForm.welcome_message}
                  onChange={(e) => setField('welcome_message', e.target.value)}
                  placeholder="Halo {name}! Ada yang bisa kami bantu hari ini?" />
                <p className="text-[10px] text-slate-400 mt-1">
                  Kosongkan untuk memakai sapaan bawaan. Gunakan <code className="bg-slate-100 px-1 rounded">{'{name}'}</code> untuk nama depan user. Mendukung Markdown.
                </p>
              </div>

              {/* Tombol cepat */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${labelCls} mb-0`}>Tombol Pertanyaan Cepat ({settingsForm.quick_chips.length}/{MAX_CHIPS})</label>
                  <button type="button" onClick={() => setField('quick_chips', DEFAULT_CHIPS)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800">
                    Pulihkan bawaan
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mb-3">Muncul di awal percakapan. Klik tombol = langsung mengirim pertanyaannya ke chatbot.</p>

                <div className="space-y-2.5">
                  {settingsForm.quick_chips.length === 0 && (
                    <p className="text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center">
                      Tidak ada tombol cepat. Chatbot hanya menampilkan sapaan.
                    </p>
                  )}
                  {settingsForm.quick_chips.map((chip, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl p-2.5">
                      <input className={`${inputCls} sm:w-14 text-center !px-2`} maxLength={8} value={chip.icon} aria-label={`Ikon tombol ${i + 1}`}
                        onChange={(e) => updateChip(i, { icon: e.target.value })} placeholder="🙂" />
                      <input className={`${inputCls} sm:w-44`} maxLength={30} value={chip.label} aria-label={`Label tombol ${i + 1}`}
                        onChange={(e) => updateChip(i, { label: e.target.value })} placeholder="Label tombol" />
                      <input className={`${inputCls} sm:flex-1`} maxLength={300} value={chip.query} aria-label={`Pertanyaan tombol ${i + 1}`}
                        onChange={(e) => updateChip(i, { query: e.target.value })} placeholder="Pertanyaan yang dikirim saat diklik" />
                      <div className="flex items-center gap-0.5 shrink-0 self-end sm:self-auto">
                        <button type="button" onClick={() => moveChip(i, -1)} disabled={i === 0} aria-label="Naikkan"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                          <ArrowUp size={14} />
                        </button>
                        <button type="button" onClick={() => moveChip(i, 1)} disabled={i === settingsForm.quick_chips.length - 1} aria-label="Turunkan"
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent">
                          <ArrowDown size={14} />
                        </button>
                        <button type="button" onClick={() => removeChip(i)} aria-label="Hapus tombol"
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addChip} disabled={settingsForm.quick_chips.length >= MAX_CHIPS}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:hover:text-indigo-600">
                  <Plus size={14} /> Tambah Tombol
                </button>
              </div>
            </SettingsSection>

            {/* Routing pintar */}
            <SettingsSection icon={<Zap size={18} />} title="Routing Pintar (Hemat Token)" desc="Pertanyaan sederhana dijawab langsung dari database tanpa LLM; yang rumit tetap dijawab Gemini.">
              <ToggleRow
                label="Aktifkan routing tiga tingkat"
                desc="A: dijawab tanpa LLM (data real time dari database) · B: LLM dengan konteks kecil · C: LLM dengan konteks penuh. Jika dimatikan, semua pertanyaan dijawab LLM (pembanding “selalu LLM”)."
                checked={settingsForm.smart_routing}
                onChange={(v) => setField('smart_routing', v)}
              />
              <div className={settingsForm.smart_routing ? '' : 'opacity-50 pointer-events-none'}>
                <label className={labelCls}>Kehati-hatian: {Math.round(settingsForm.routing_threshold * 100)}%</label>
                <input type="range" min={0.5} max={0.99} step={0.01} value={settingsForm.routing_threshold}
                  onChange={(e) => setField('routing_threshold', parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Lebih hemat token (lebih banyak jawaban tanpa LLM)</span><span>Lebih hati-hati (lebih banyak ke LLM)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Pertanyaan baru dijawab tanpa LLM bila keyakinan router ≥ nilai ini. Prinsipnya: <b>jika ragu, naik ke LLM</b>. Disarankan 85%.
                </p>
              </div>
              <div className={settingsForm.smart_routing ? '' : 'opacity-50 pointer-events-none'}>
                <ToggleRow
                  label="Routing adaptif (belajar dari umpan balik)"
                  desc="Bila jawaban tanpa LLM untuk suatu intent sering mendapat 👎 atau pertanyaannya diulang pengguna, ambang intent itu otomatis dinaikkan (lebih hati-hati). Ambang tidak pernah diturunkan di bawah nilai di atas."
                  checked={settingsForm.adaptive_routing}
                  onChange={(v) => setField('adaptive_routing', v)}
                />
              </div>
            </SettingsSection>

            {/* Pencarian semantik */}
            <SettingsSection icon={<Bot size={18} />} title="Pencarian Semantik (RAG Hibrida)" desc="Menemukan dokumen berdasarkan makna, bukan hanya kata yang sama, lalu digabung dengan pencarian kata kunci.">
              <ToggleRow
                label="Aktifkan retriever embedding"
                desc="Pertanyaan seperti “mau belajar bikin website” akan menemukan kursus Laravel/Next.js walau kata-katanya berbeda. Jika dimatikan atau layanan embedding bermasalah, sistem otomatis memakai pencarian kata kunci."
                checked={settingsForm.semantic_retrieval}
                onChange={(v) => setField('semantic_retrieval', v)}
              />
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {indexInfo ? (
                      <>
                        <b>{indexInfo.documents}</b> dokumen · <b>{indexInfo.chunks}</b> potongan terindeks
                        {indexInfo.model ? <> · model <span className="font-mono">{indexInfo.model}</span> ({indexInfo.dims} dim)</> : null}
                        <br />
                        <span className="text-slate-400">
                          Terakhir diperbarui: {indexInfo.last_indexed ? new Date(indexInfo.last_indexed).toLocaleString('id-ID') : 'belum pernah'}
                          {!indexInfo.available && ' · API key Gemini belum diatur'}
                        </span>
                      </>
                    ) : (
                      <button type="button" onClick={loadIndexInfo} className="font-semibold text-indigo-600 hover:underline">Lihat status indeks</button>
                    )}
                  </div>
                  <button type="button" onClick={reindex} disabled={reindexing}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-60 transition-all">
                    {reindexing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Indeks Ulang
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                  Indeks diperbarui otomatis tiap 10 menit (hanya bagian yang berubah). Gunakan tombol ini setelah mengubah banyak FAQ atau katalog. Kuota dan status webinar tetap dihitung real time, tidak lewat indeks.
                </p>
              </div>
            </SettingsSection>

            {/* Perilaku AI */}
            <SettingsSection icon={<Bot size={18} />} title="Perilaku AI" desc="Atur kecerdasan, gaya jawaban, dan karakter chatbot.">
              <div>
                <label className={labelCls}>Model Gemini</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select className={`${inputCls} sm:flex-1`} value={settingsForm.model}
                    onChange={(e) => { setField('model', e.target.value); setModelTest(null); }}>
                    {Object.entries(models).map(([id, label]) => <option key={id} value={id}>{statusIcon(modelStatus[id]?.status)}{label}</option>)}
                    {!models[settingsForm.model] && <option value={settingsForm.model}>{statusIcon(modelStatus[settingsForm.model]?.status)}{settingsForm.model}</option>}
                  </select>
                  <button type="button" onClick={testModel} disabled={testingModel}
                    className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-60 transition-all">
                    {testingModel ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                    Tes Koneksi
                  </button>
                </div>
                {modelTest && (
                  <p className={`mt-2 text-xs rounded-xl px-3 py-2 border leading-relaxed ${
                    modelTest.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {modelTest.ok ? '✅' : '❌'} {modelTest.message}{modelTest.latency_ms > 0 && ` (${modelTest.latency_ms} ms)`}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Daftar diambil langsung dari Google, jadi model yang tampil belum tentu bisa dipakai akun Anda. Gunakan <b>Tes Koneksi</b> sebelum menyimpan.
                  {' '}Penanda: ✅ sudah teruji · ⏳ kuota habis (model sendiri mungkin sehat) · ❌ gagal · tanpa tanda = belum dites.
                </p>
              </div>
              <div>
                <label className={labelCls}>Gaya Jawaban: {settingsForm.temperature.toFixed(1)}</label>
                <input type="range" min={0} max={1} step={0.1} value={settingsForm.temperature}
                  onChange={(e) => setField('temperature', parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Konsisten & faktual (disarankan ≤ 0.5)</span><span>Kreatif & bervariasi</span>
                </div>
              </div>
              <div>
                <label className={labelCls}>Panjang Maksimal Jawaban</label>
                <select className={inputCls} value={settingsForm.max_output_tokens}
                  onChange={(e) => setField('max_output_tokens', parseInt(e.target.value, 10))}>
                  <option value={1024}>Ringkas (1.024 token)</option>
                  <option value={2048}>Standar (2.048 token)</option>
                  <option value={4096}>Panjang (4.096 token)</option>
                  <option value={8192}>Sangat panjang (8.192 token)</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Instruksi Tambahan (opsional)</label>
                <textarea className={`${inputCls} min-h-[110px] resize-y`} maxLength={1500} value={settingsForm.extra_instructions}
                  onChange={(e) => setField('extra_instructions', e.target.value)}
                  placeholder="Cth: Gunakan sapaan 'Kak'. Jawab maksimal 4 kalimat. Selalu tawarkan bantuan lanjutan di akhir jawaban." />
                <p className="text-[10px] text-slate-400 mt-1">
                  Untuk gaya bahasa & persona. Aturan privasi, login, dan eskalasi ke Customer Service tetap diprioritaskan. {settingsForm.extra_instructions.length}/1500
                </p>
              </div>
            </SettingsSection>

            {/* CS */}
            <SettingsSection icon={<Phone size={18} />} title="Customer Service" desc="Kontak yang ditampilkan chatbot saat pertanyaan perlu ditangani manusia.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nomor WhatsApp CS</label>
                  <input className={inputCls} required maxLength={25} value={settingsForm.cs_phone}
                    onChange={(e) => setField('cs_phone', e.target.value)} placeholder="+62 812-3456-7890" />
                  <p className="text-[10px] text-slate-400 mt-1">Tautan wa.me dibuat otomatis dari nomor ini.</p>
                </div>
                <div>
                  <label className={labelCls}>Jam Operasional</label>
                  <input className={inputCls} required maxLength={60} value={settingsForm.cs_hours}
                    onChange={(e) => setField('cs_hours', e.target.value)} placeholder="08.00 – 21.00 WIB" />
                </div>
              </div>
            </SettingsSection>

            {/* Keamanan */}
            <SettingsSection icon={<ShieldCheck size={18} />} title="Keamanan & Privasi" desc="Lindungi kuota API dan kelola data percakapan.">
              <div>
                <label className={labelCls}>Batas Pesan per Menit (per IP)</label>
                <input type="number" min={5} max={120} className={inputCls} value={settingsForm.rate_limit_per_minute}
                  onChange={(e) => setField('rate_limit_per_minute', parseInt(e.target.value || '0', 10))} />
                <p className="text-[10px] text-slate-400 mt-1">Mencegah penyalahgunaan kuota Gemini. Rentang 5–120.</p>
              </div>
              <ToggleRow
                label="Simpan riwayat percakapan"
                desc="Dibutuhkan untuk statistik, daftar celah pengetahuan, dan tombol 👍/👎. Jika dimatikan, tidak ada percakapan yang dicatat dan tombol feedback disembunyikan."
                checked={settingsForm.log_conversations}
                onChange={(v) => setField('log_conversations', v)}
              />
              <div>
                <label className={labelCls}>Hapus Log Otomatis Setelah (hari)</label>
                <input type="number" min={0} max={3650} className={inputCls} value={settingsForm.log_retention_days}
                  onChange={(e) => setField('log_retention_days', parseInt(e.target.value || '0', 10))} />
                <p className="text-[10px] text-slate-400 mt-1">
                  0 = simpan selamanya. Pembersihan berjalan harian lewat scheduler Laravel (<code className="bg-slate-100 px-1 rounded">schedule:run</code> harus terpasang di cron server).
                </p>
              </div>
            </SettingsSection>

            {/* Bar simpan melayang */}
            <div className="sticky bottom-4 z-30 flex justify-start">
              <div className="flex flex-wrap items-center gap-3 bg-white/95 backdrop-blur border border-slate-200 shadow-xl rounded-2xl px-4 py-2.5">
                {settingsDirty && <span className="text-xs font-semibold text-amber-600">Ada perubahan belum disimpan</span>}
                <button type="button" disabled={!settingsDirty || savingSettings} onClick={() => setSettingsForm(settings)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40">
                  Batalkan
                </button>
                <button disabled={!settingsDirty || savingSettings}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-40 disabled:shadow-none transition-all">
                  {savingSettings ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </form>
        )
      )}
    </div>
  );
}
