"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, BookOpen, Layers, CheckCircle2, LayoutGrid, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import RichTextEditor from '@/app/components/RichTextEditor';
import ConfirmModal from '@/app/components/ConfirmModal';

function EditQuestionContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; 
  const searchParams = useSearchParams();
  
  // 🔥 MENGGUNAKAN PARAMETER BARU: skd_tryout_id 🔥
  const skdTryoutIdFromUrl = searchParams.get('skd_tryout_id');

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [isReady, setIsReady] = useState(false); 
  
  const [packageInfo, setPackageInfo] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);

  const [correctOption, setCorrectOption] = useState<string>('a');

  // STATE UNTUK MODAL HAPUS SOAL
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    skd_tryout_id: '',
    main_category: 'twk',
    skd_question_sub_category_id: '',
    question_text: '',
    option_a: '', score_a: 0,
    option_b: '', score_b: 0,
    option_c: '', score_c: 0,
    option_d: '', score_d: 0,
    option_e: '', score_e: 0,
    explanation: '',
  });

  useEffect(() => {
    if (!id || !skdTryoutIdFromUrl) return;

    const fetchData = async () => {
      try {
        const [resQ, resPkg, resSub, resAllQ] = await Promise.all([
          apiFetch(`/admin/tryout/skd/questions/${id}`),
          apiFetch(`/admin/tryout/skd/tryouts/${skdTryoutIdFromUrl}`),
          apiFetch('/admin/tryout/skd/sub-categories'),
          apiFetch(`/admin/tryout/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`)
        ]);
        
        const jsonQ = await resQ.json();
        const jsonPkg = await resPkg.json();
        const jsonSub = await resSub.json();
        const jsonAllQ = await resAllQ.json();

        if (jsonPkg.success) setPackageInfo(jsonPkg.data);
        if (jsonSub.success) setSubCategories(jsonSub.data);
        if (jsonAllQ.success) setExistingQuestions(jsonAllQ.data);

        if (jsonQ.success) {
          const qData = jsonQ.data;
          setFormData({
            skd_tryout_id: qData.skd_tryout_id,
            main_category: qData.main_category,
            skd_question_sub_category_id: qData.skd_question_sub_category_id,
            question_text: qData.question_text || '',
            option_a: qData.option_a || '', score_a: qData.score_a || 0,
            option_b: qData.option_b || '', score_b: qData.score_b || 0,
            option_c: qData.option_c || '', score_c: qData.score_c || 0,
            option_d: qData.option_d || '', score_d: qData.score_d || 0,
            option_e: qData.option_e || '', score_e: qData.score_e || 0,
            explanation: qData.explanation || '',
          });

          if (qData.main_category !== 'tkp') {
            if (qData.score_a === 5) setCorrectOption('a');
            else if (qData.score_b === 5) setCorrectOption('b');
            else if (qData.score_c === 5) setCorrectOption('c');
            else if (qData.score_d === 5) setCorrectOption('d');
            else if (qData.score_e === 5) setCorrectOption('e');
          }
        } else {
          toast.error('Data soal tidak ditemukan');
          router.push(`/admin/tryouts/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`);
        }
      } catch (error) {
        toast.error('Gagal mengambil data dari server');
      } finally {
        setFetchingData(false);
        setTimeout(() => setIsReady(true), 500); 
      }
    };
    fetchData();
  }, [id, skdTryoutIdFromUrl, router]);

  useEffect(() => {
    if (!isReady) return;

    if (formData.main_category !== 'tkp') {
      setFormData(prev => ({
        ...prev,
        score_a: correctOption === 'a' ? 5 : 0,
        score_b: correctOption === 'b' ? 5 : 0,
        score_c: correctOption === 'c' ? 5 : 0,
        score_d: correctOption === 'd' ? 5 : 0,
        score_e: correctOption === 'e' ? 5 : 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        score_a: prev.score_a === 0 ? 1 : prev.score_a, 
        score_b: prev.score_b === 0 ? 2 : prev.score_b, 
        score_c: prev.score_c === 0 ? 3 : prev.score_c, 
        score_d: prev.score_d === 0 ? 4 : prev.score_d, 
        score_e: prev.score_e === 0 ? 5 : prev.score_e
      }));
    }
  }, [formData.main_category, correctOption, isReady]);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.main_category === formData.main_category
  );

  // 🔥 VALIDASI KETAT DAN ANTI TEMBUS 🔥
  const validateForm = () => {
    if (!formData.skd_tryout_id) return "Master Tryout tidak terdeteksi.";
    if (!formData.skd_question_sub_category_id) return "Materi / Sub-Kategori Wajib Dipilih!";

    const isHtmlEmpty = (htmlString: string) => {
      if (!htmlString) return true;
      const pureText = htmlString.replace(/<[^>]*>?/gm, '').trim();
      return pureText.length === 0;
    };

    if (isHtmlEmpty(formData.question_text)) return "Teks Utama Soal tidak boleh kosong!";
    if (isHtmlEmpty(formData.option_a)) return "Pilihan Jawaban A wajib diisi!";
    if (isHtmlEmpty(formData.option_b)) return "Pilihan Jawaban B wajib diisi!";
    if (isHtmlEmpty(formData.option_c)) return "Pilihan Jawaban C wajib diisi!";
    if (isHtmlEmpty(formData.option_d)) return "Pilihan Jawaban D wajib diisi!";
    if (isHtmlEmpty(formData.option_e)) return "Pilihan Jawaban E wajib diisi!";

    if (formData.main_category === 'tkp') {
      const options = ['A', 'B', 'C', 'D', 'E'];
      const scores = [formData.score_a, formData.score_b, formData.score_c, formData.score_d, formData.score_e];
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] === 0 || scores[i] === null || scores[i] === undefined || isNaN(scores[i])) {
          return `Validasi Gagal (TKP): Bobot pada Opsi ${options[i]} tidak boleh 0 atau kosong!`;
        }
        if (scores[i] < 1 || scores[i] > 5) {
          return `Validasi Gagal (TKP): Bobot pada Opsi ${options[i]} harus angka 1 sampai 5.`;
        }
      }
      const uniqueScores = new Set(scores);
      if (uniqueScores.size !== 5) {
        return "Validasi Gagal (TKP): Bobot nilai harus bervariasi (1, 2, 3, 4, 5). Tidak boleh ada nilai yang kembar!";
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorMessage = validateForm();
    if (errorMessage) {
      toast.error(errorMessage, { 
        duration: 5000, 
        icon: '🚨',
        style: { fontWeight: 'bold', border: '1px solid #fecdd3' } 
      });
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/questions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(`Perubahan Soal berhasil disimpan!`, { 
          duration: 4000,
          icon: '✅',
          style: { fontWeight: 'bold', border: '1px solid #bbf7d0' } 
        });
        const resAllQ = await apiFetch(`/admin/tryout/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`);
        const jsonAllQ = await resAllQ.json();
        if (jsonAllQ.success) setExistingQuestions(jsonAllQ.data);
      } else {
        toast.error(json.message || 'Gagal menyimpan perubahan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan saat menyimpan soal');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteQuestion = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/questions/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Soal berhasil dihapus!');
        router.push(`/admin/tryouts/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`);
      } else {
        toast.error(json.message || 'Gagal menghapus soal');
        setIsDeleting(false);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan jaringan');
      setIsDeleting(false);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  const handleEditorChange = (field: string, content: string) => {
    setFormData(prev => ({ ...prev, [field]: content }));
  };

  if (!skdTryoutIdFromUrl || !id) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Layers className="w-16 h-16 text-rose-300 mb-4" />
        <h2 className="text-xl font-black text-rose-600 mb-2">Error Parameter URL</h2>
        <p className="text-sm font-bold text-slate-500">Parameter URL tidak lengkap. Silakan kembali ke halaman kelola.</p>
        <Link href="/admin/tryouts/skd/manage" className="mt-6 px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors">
          Kembali ke Daftar Tryout
        </Link>
      </div>
    );
  }

  if (fetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Data Soal...</p>
      </div>
    );
  }

  const currentIndex = existingQuestions.findIndex(q => q.id.toString() === id);

  return (
    <div className="max-w-7xl mx-auto pb-12 relative">
      
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/admin/tryouts/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`} className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Edit Soal {currentIndex !== -1 ? `#${currentIndex + 1}` : ''}</h1>
          <p className="text-slate-500 text-sm font-medium">Perbarui soal untuk <span className="font-bold text-indigo-600">{packageInfo?.title}</span></p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-8 relative items-start">
        
        <div className="w-full xl:flex-1 space-y-6">
          <form id="editQuestionForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 🔥 TATA LETAK 2 KOLOM YANG RAPI 🔥 */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Kolom Kiri: Info Induk (Disabled) */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Tryout</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 cursor-not-allowed opacity-80">
                      <BookOpen size={18} className="text-indigo-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-700 truncate">{packageInfo?.title}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Kategori Tryout</label>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 cursor-not-allowed opacity-80">
                      <Tag size={18} className="text-emerald-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {packageInfo?.category?.name || 'Tidak ada kategori'}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-1.5">*Kategori mengikuti pengaturan Tryout Induk.</p>
                  </div>
                </div>

                {/* Kolom Kanan: Pilihan Sub-Kategori Soal */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Kategori Induk <span className="text-rose-500">*</span></label>
                    <select 
                      value={formData.main_category} 
                      onChange={(e) => setFormData({...formData, main_category: e.target.value, skd_question_sub_category_id: ''})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 transition-all" required
                    >
                      <option value="twk">TWK (Wawasan Kebangsaan)</option>
                      <option value="tiu">TIU (Intelegensia Umum)</option>
                      <option value="tkp">TKP (Karakteristik Pribadi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Materi / Sub-Kategori <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        value={formData.skd_question_sub_category_id} 
                        onChange={(e) => setFormData({...formData, skd_question_sub_category_id: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-900 transition-all" required
                      >
                        <option value="" disabled>-- Pilih Materi --</option>
                        {filteredSubCategories.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8">
              <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Teks Soal <span className="text-rose-500">*</span></label>
              <RichTextEditor value={formData.question_text} onChange={(val) => handleEditorChange('question_text', val)} placeholder="Ketik soal, masukkan rumus, atau gambar..." />
            </div>

            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Opsi Jawaban & Skor</h3>
                <div className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {formData.main_category === 'tkp' ? 'Mode Poin 1-5 (TKP)' : 'Mode Kunci Jawaban Mutlak'}
                </div>
              </div>
              
              {(['a', 'b', 'c', 'd', 'e'] as const).map((opt) => (
                <div key={opt} className={`mb-8 p-5 rounded-2xl relative transition-all border ${formData.main_category !== 'tkp' && correctOption === opt ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 font-black rounded-lg flex items-center justify-center transition-colors ${formData.main_category !== 'tkp' && correctOption === opt ? 'bg-emerald-500 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                        {opt.toUpperCase()}
                      </div>
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Opsi {opt.toUpperCase()}</label>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {formData.main_category === 'tkp' ? (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bobot Poin:</label>
                          <input 
                            type="number" min="1" max="5" value={formData[`score_${opt}`] || ''} 
                            onChange={(e) => setFormData({...formData, [`score_${opt}`]: Number(e.target.value)})} 
                            className="w-16 font-mono text-center font-bold text-lg text-indigo-600 outline-none bg-transparent" 
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <button
                          type="button" onClick={() => setCorrectOption(opt)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${correctOption === opt ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${correctOption === opt ? 'border-white' : 'border-slate-300'}`}>
                            {correctOption === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                          {correctOption === opt ? 'Kunci Jawaban (5 Poin)' : 'Jadikan Kunci Jawaban'}
                        </button>
                      )}
                    </div>
                  </div>

                  <RichTextEditor value={formData[`option_${opt}`]} onChange={(val) => handleEditorChange(`option_${opt}`, val)} placeholder={`Tuliskan pilihan jawaban ${opt.toUpperCase()}...`} />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 sm:p-8">
              <label className="block text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Pembahasan Jawaban (Opsional)</label>
              <RichTextEditor value={formData.explanation} onChange={(val) => handleEditorChange('explanation', val)} placeholder="Tuliskan cara cepat, trik, atau pembahasan detail..." />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sticky bottom-6 z-40 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xl">
              
              <button 
                type="button" 
                onClick={() => setDeleteModalOpen(true)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 text-sm"
              >
                <Trash2 size={18} /> Hapus Soal
              </button>

              <div className="flex items-center w-full sm:w-auto gap-3">
                <Link href={`/admin/tryouts/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`} className="w-full sm:w-auto px-6 py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-all text-sm">
                  Batal
                </Link>
                <button type="submit" form="editQuestionForm" disabled={loading} className="w-full sm:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 text-sm">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Perubahan
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* SIDEBAR NAVIGASI SOAL */}
        <div className="w-full xl:w-80 shrink-0 xl:sticky xl:top-24 order-first xl:order-last">
          <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Navigasi Soal</h3>
                <p className="text-[10px] font-bold text-slate-500">Total {existingQuestions.length} Soal Tersimpan</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {existingQuestions.map((q, index) => {
                const isActive = q.id.toString() === id;
                return (
                  <Link 
                    key={q.id} 
                    href={`/admin/tryouts/skd/questions/${q.id}/edit?skd_tryout_id=${skdTryoutIdFromUrl}`}
                    className={`w-full aspect-square flex items-center justify-center rounded-xl text-xs font-bold border transition-all ${
                      isActive 
                      ? 'border-2 border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200 font-black' 
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600'
                    }`}
                    title={isActive ? `Sedang Edit Soal #${index + 1}` : `Edit Soal #${index + 1}`}
                  >
                    {index + 1}
                  </Link>
                );
              })}
              
              <Link 
                href={`/admin/tryouts/skd/questions/create?skd_tryout_id=${skdTryoutIdFromUrl}`}
                className="w-full aspect-square flex items-center justify-center rounded-xl text-xs font-bold border border-dashed border-slate-300 text-slate-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                title="Tambah Soal Baru"
              >
                +
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link href={`/admin/tryouts/skd/questions?skd_tryout_id=${skdTryoutIdFromUrl}`} className="block w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">
                Kembali ke Daftar Soal
              </Link>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteQuestion}
        isLoading={isDeleting}
        type="danger"
        title="Hapus Soal Ini?"
        message="Tindakan ini tidak bisa dibatalkan. Soal yang terhapus tidak akan lagi muncul dalam ujian."
        confirmText="Ya, Hapus Soal"
      />
    </div>
  );
}

export default function EditQuestionPage() {
  return (
    <Suspense fallback={
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Workspace...</p>
      </div>
    }>
      <EditQuestionContent />
    </Suspense>
  );
}