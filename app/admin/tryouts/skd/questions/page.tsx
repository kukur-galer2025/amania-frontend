"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit3, Trash2, Loader2, 
  Search, Database, Layers, ArrowLeft, Package, FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
// 🔥 IMPORT KOMPONEN MODAL CANTIK 🔥
import ConfirmModal from '@/app/components/ConfirmModal';

// Helper Warna Kategori Tryout
const getCategoryColor = (categoryName: string) => {
  if (!categoryName) return 'bg-slate-50 text-slate-600 border-slate-200';
  const lowerName = categoryName.toLowerCase();
  if (lowerName.includes('cpns')) return 'bg-sky-50 text-sky-600 border-sky-100';
  if (lowerName.includes('dinas')) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (lowerName.includes('bumn')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  return 'bg-indigo-50 text-indigo-600 border-indigo-100'; 
};

// Pisahkan komponen yang menggunakan useSearchParams ke dalam komponen terpisah
function QuestionBankContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // MENGGUNAKAN PARAMETER BARU: skd_tryout_id
  const skdTryoutId = searchParams.get('skd_tryout_id');

  const [tryouts, setTryouts] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [tryoutInfo, setTryoutInfo] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // STATE UNTUK MODAL HAPUS SOAL
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setSearchQuery(''); 
      try {
        if (!skdTryoutId) {
          // WUJUD 1: FETCH DAFTAR TRYOUT JIKA BELUM PILIH
          const res = await apiFetch('/admin/tryout/skd/tryouts');
          const json = await res.json();
          if (json.success) setTryouts(json.data);
        } else {
          // WUJUD 2: FETCH INFO TRYOUT & DAFTAR SOALNYA
          const resPkg = await apiFetch(`/admin/tryout/skd/tryouts/${skdTryoutId}`);
          const jsonPkg = await resPkg.json();
          if (jsonPkg.success) setTryoutInfo(jsonPkg.data);

          const resQ = await apiFetch(`/admin/tryout/skd/questions?skd_tryout_id=${skdTryoutId}`);
          const jsonQ = await resQ.json();
          if (jsonQ.success) setQuestions(jsonQ.data);
        }
      } catch (err) {
        toast.error('Gagal mengambil data dari server');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [skdTryoutId]);

  // FUNGSI MEMBUKA MODAL
  const handleDeleteClick = (id: number) => {
    setSelectedQuestionId(id);
    setDeleteModalOpen(true);
  };

  // FUNGSI EKSEKUSI HAPUS
  const confirmDeleteQuestion = async () => {
    if (!selectedQuestionId) return;
    
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/questions/${selectedQuestionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Soal berhasil dihapus');
        // Refresh soal
        const resQ = await apiFetch(`/admin/tryout/skd/questions?skd_tryout_id=${skdTryoutId}`);
        const jsonQ = await resQ.json();
        if (jsonQ.success) setQuestions(jsonQ.data);
        setDeleteModalOpen(false);
      } else {
        toast.error(json.message || 'Gagal menghapus soal');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleting(false);
      setSelectedQuestionId(null);
    }
  };

  // =========================================================================
  // WUJUD 1: JIKA BELUM ADA ID TRYOUT DI URL, TAMPILKAN PILIHAN TRYOUT
  // =========================================================================
  if (!skdTryoutId) {
    const filteredTryouts = tryouts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 relative">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Bank Soal Utama</h1>
          <p className="text-slate-500 font-medium text-sm max-w-xl">
            Pilih Tryout di bawah ini untuk mulai menambahkan, mengedit, atau menghapus soal di dalamnya.
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Cari judul tryout..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Tryout...</p>
          </div>
        ) : filteredTryouts.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 border-dashed">
            <Package size={48} className="text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Tidak Ada Tryout</h3>
            <p className="text-sm text-slate-500">Buat tryout terlebih dahulu di menu Kelola Tryout SKD.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTryouts.map((t) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={t.id} className="bg-white rounded-[1.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all flex flex-col group">
                  <div className="mb-4">
                    {/* 🔥 Kategori Dinamis 🔥 */}
                    {t.category && (
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(t.category.name)}`}>
                        {t.category.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors">{t.title}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 bg-slate-50 py-2 px-3 rounded-xl border border-slate-100 w-max">
                    <FileText size={14} className="text-indigo-500"/> {t.questions_count || 0} Soal Terisi
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <Link 
                      href={`/admin/tryouts/skd/questions?skd_tryout_id=${t.id}`}
                      className="w-full flex items-center justify-between px-5 py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 group/btn"
                    >
                      Buka Bank Soal
                      <ChevronRight size={16} className="text-slate-400 group-hover/btn:text-indigo-500 group-hover/btn:translate-x-1 transition-all" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // WUJUD 2: TAMPILAN DAFTAR SOAL (KARTU VERTIKAL YANG RAPI)
  // =========================================================================
  const filteredQuestions = questions.filter(q => {
    const plainText = q.question_text.replace(/<[^>]+>/g, '').toLowerCase();
    const matchSearch = plainText.includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || q.main_category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      
      {/* Header Info Tryout */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/tryouts/skd/manage" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors shadow-sm shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tryoutInfo ? `Kelola Soal: ${tryoutInfo.title}` : 'Memuat Info Tryout...'}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Total ada {questions.length} soal di dalam paket ini.
            </p>
          </div>
        </div>

        {/* LINK BUAT SOAL DISESUAIKAN */}
        <Link 
          href={`/admin/tryouts/skd/questions/create?skd_tryout_id=${skdTryoutId}`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95 shrink-0"
        >
          <Plus size={18} strokeWidth={2.5}/> Buat Soal Baru
        </Link>
      </div>

      {/* Filter & Pencarian Soal */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Cari teks soal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-900"
          />
        </div>
        <div className="w-full sm:w-auto flex gap-2 overflow-x-auto no-scrollbar">
          {['all', 'twk', 'tiu', 'tkp'].map(cat => (
            <button
              key={cat} onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterCategory === cat ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* DAFTAR SOAL (DESAIN KARTU) */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Soal...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center bg-white rounded-[2rem] border border-slate-200 border-dashed">
          <Database size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum Ada Soal</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">Paket ini masih kosong. Klik "Buat Soal Baru" untuk mulai menyusun tryout.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {filteredQuestions.map((q, index) => {
              // Cek Kunci Jawaban Mutlak (Score tertinggi untuk TWK/TIU)
              const maxScore = Math.max(q.score_a, q.score_b, q.score_c, q.score_d, q.score_e);
              
              return (
              <motion.div 
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} 
                key={q.id} 
                className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors"
              >
                {/* HEADER KARTU: Nomor, Badge, dan Tombol */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 font-black flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-center text-[10px] font-black uppercase tracking-widest border ${
                      q.main_category === 'twk' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      q.main_category === 'tiu' ? 'bg-sky-50 text-sky-600 border-sky-100' : 
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {q.main_category}
                    </span>
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                      <Layers size={14}/> {q.sub_category?.name || 'Umum'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/tryouts/skd/questions/${q.id}/edit?skd_tryout_id=${skdTryoutId}`} 
                      className="px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all flex items-center gap-2"
                    >
                      <Edit3 size={16}/> Edit
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(q.id)} 
                      className="px-4 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all flex items-center gap-2"
                    >
                      <Trash2 size={16}/> Hapus
                    </button>
                  </div>
                </div>

                {/* BODY KARTU: Teks Soal */}
                <div className="prose prose-slate max-w-none text-slate-800 text-sm md:text-base leading-relaxed mb-6">
                  <div dangerouslySetInnerHTML={{ __html: q.question_text }} />
                </div>

                {/* AREA OPSI JAWABAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {(['a', 'b', 'c', 'd', 'e'] as const).map((opt) => {
                    const score = q[`score_${opt}`];
                    // Highlight hijau jika skor nya adalah yang tertinggi (biasanya 5)
                    const isCorrect = score === maxScore && score > 0;
                    
                    return (
                      <div key={opt} className={`flex items-start gap-3 p-4 border rounded-xl transition-all ${
                        isCorrect 
                        ? 'bg-emerald-50/50 border-emerald-200' 
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                      }`}>
                        <div className={`w-6 h-6 shrink-0 rounded text-[10px] font-black flex items-center justify-center mt-0.5 ${
                          isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {opt.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="prose prose-sm prose-slate max-w-none text-slate-700 text-sm" dangerouslySetInnerHTML={{ __html: q[`option_${opt}`] }} />
                        </div>
                        <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-black ${
                          isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {score} Poin
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* PEMBAHASAN */}
                {q.explanation && q.explanation !== '<p><br></p>' && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 mt-4">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Pembahasan
                    </h4>
                    <div className="prose prose-sm prose-amber max-w-none text-amber-900 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: q.explanation }} />
                  </div>
                )}

              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS SOAL */}
      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteQuestion}
        isLoading={isDeleting}
        type="danger"
        title="Hapus Soal Ini?"
        message="Soal ini akan dihapus secara permanen dari sistem dan tidak dapat dikembalikan."
        confirmText="Ya, Hapus Soal"
      />

    </div>
  );
}

// Wrapper Suspense WAJIB untuk Next.js 13+ App Router saat menggunakan useSearchParams()
export default function QuestionBankPage() {
  return (
    <Suspense fallback={
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Workspace...</p>
      </div>
    }>
      <QuestionBankContent />
    </Suspense>
  );
}