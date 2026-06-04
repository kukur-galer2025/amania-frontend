"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle, AlertCircle, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

export default function CourseExamManager({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  
  // Exam Info Form
  const [title, setTitle] = useState('');
  const [passingScore, setPassingScore] = useState<number | ''>(70);
  const [savingExam, setSavingExam] = useState(false);

  // Question Modal
  const [questionModal, setQuestionModal] = useState<{ isOpen: boolean; editing: any | null }>({ isOpen: false, editing: null });
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A'|'B'|'C'|'D'>('A');
  const [savingQuestion, setSavingQuestion] = useState(false);

  const fetchExam = useCallback(async () => {
    try {
      const res = await apiFetch(`/admin/courses/${courseId}/exam`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setExam(json.data);
        setTitle(json.data.title);
        setPassingScore(Number(json.data.passing_score));
      }
    } catch {
      // It's normal to not have an exam initially
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchExam(); }, [fetchExam]);

  const saveExamInfo = async () => {
    if (!title.trim()) { toast.error('Judul ujian wajib diisi!'); return; }
    setSavingExam(true);
    try {
      const res = await apiFetch(`/admin/courses/${courseId}/exam`, {
        method: 'POST',
        body: JSON.stringify({ title, passing_score: passingScore === '' ? 0 : passingScore })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Info ujian disimpan!');
        fetchExam();
      } else {
        toast.error('Gagal menyimpan ujian');
      }
    } catch {
      toast.error('Terjadi kesalahan server');
    } finally {
      setSavingExam(false);
    }
  };

  const openQuestionModal = (q?: any) => {
    if (q) {
      setQText(q.question_text);
      setOptA(q.option_a); setOptB(q.option_b); setOptC(q.option_c); setOptD(q.option_d);
      setCorrectOpt(q.correct_option);
      setQuestionModal({ isOpen: true, editing: q });
    } else {
      setQText('');
      setOptA(''); setOptB(''); setOptC(''); setOptD('');
      setCorrectOpt('A');
      setQuestionModal({ isOpen: true, editing: null });
    }
  };

  const saveQuestion = async () => {
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      toast.error('Semua field soal dan pilihan wajib diisi!'); return;
    }
    setSavingQuestion(true);
    try {
      const isEdit = questionModal.editing;
      const url = isEdit ? `/admin/courses/exams/questions/${isEdit.id}` : `/admin/courses/exams/${exam.id}/questions`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: correctOpt })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(isEdit ? 'Soal diupdate' : 'Soal ditambah');
        setQuestionModal({ isOpen: false, editing: null });
        fetchExam();
      } else {
        toast.error('Gagal menyimpan soal');
      }
    } catch {
      toast.error('Terjadi kesalahan server');
    } finally {
      setSavingQuestion(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      const res = await apiFetch(`/admin/courses/exams/questions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Soal dihapus');
        fetchExam();
      }
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Memuat data ujian...</div>;

  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Award size={16} className="text-amber-500" /> Ujian Akhir (Final Exam)</h3>
        {exam && (
           <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded text-xs font-bold">{exam.questions?.length || 0} Soal</span>
        )}
      </div>

      {!exam && !title ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
          <Award size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700 mb-1">Kursus ini belum punya Ujian Akhir</p>
          <p className="text-xs text-slate-500 mb-6">Tambahkan ujian akhir sebagai syarat mutlak kelulusan siswa.</p>
          <button onClick={() => setTitle('Ujian Akhir: ')} className="px-5 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors shadow-sm">
            <Plus size={14} className="inline mr-1" /> Buat Ujian Baru
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Exam Settings */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Judul Ujian</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Nilai Minimum Kelulusan</label>
              <input type="number" min="0" max="100" value={passingScore} onChange={e => setPassingScore(e.target.value === '' ? '' : Number(e.target.value))} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-amber-500 focus:border-amber-500" />
            </div>
            <div className="md:col-span-1">
              <button onClick={saveExamInfo} disabled={savingExam} className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-lg transition-colors">
                {savingExam ? 'Menyimpan...' : 'Simpan Info Ujian'}
              </button>
            </div>
          </div>

          {exam && (
             <div>
               <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Daftar Soal</h4>
                  <button onClick={() => openQuestionModal()} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200">
                     <Plus size={12} className="inline mr-1" /> Tambah Soal
                  </button>
               </div>

               {exam.questions?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Belum ada soal.</p>
               ) : (
                  <div className="space-y-3">
                    {exam.questions?.map((q: any, idx: number) => (
                       <div key={q.id} className="p-4 border border-slate-200 rounded-xl bg-white flex justify-between gap-4">
                          <div className="flex-1">
                             <p className="text-sm font-bold text-slate-800 mb-2">{idx + 1}. {q.question_text}</p>
                             <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className={`p-1.5 rounded ${q.correct_option === 'A' ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>A. {q.option_a}</div>
                                <div className={`p-1.5 rounded ${q.correct_option === 'B' ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>B. {q.option_b}</div>
                                <div className={`p-1.5 rounded ${q.correct_option === 'C' ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>C. {q.option_c}</div>
                                <div className={`p-1.5 rounded ${q.correct_option === 'D' ? 'bg-emerald-100 text-emerald-700 font-bold border border-emerald-300' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>D. {q.option_d}</div>
                             </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                             <button onClick={() => openQuestionModal(q)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"><Edit size={14}/></button>
                             <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"><Trash2 size={14}/></button>
                          </div>
                       </div>
                    ))}
                  </div>
               )}
             </div>
          )}
        </div>
      )}

      {/* Question Modal */}
      <AnimatePresence>
        {questionModal.isOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl p-6 overflow-y-auto max-h-[90vh]">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black">{questionModal.editing ? 'Edit Soal' : 'Tambah Soal Baru'}</h2>
                    <button onClick={() => setQuestionModal({isOpen: false, editing: null})} className="text-slate-400 hover:text-rose-500"><XCircle size={24}/></button>
                 </div>
                 
                 <div className="space-y-4">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Teks Pertanyaan</label>
                       <textarea rows={3} value={qText} onChange={e => setQText(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-amber-500 focus:border-amber-500 resize-none"></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {(['A','B','C','D'] as const).map(opt => (
                          <div key={opt} className={`p-3 border rounded-xl ${correctOpt === opt ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}>
                             <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-bold text-slate-700">Pilihan {opt}</label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                   <input type="radio" name="correctOpt" value={opt} checked={correctOpt === opt} onChange={() => setCorrectOpt(opt)} className="text-amber-500 focus:ring-amber-500" />
                                   <span className="text-[10px] font-bold text-slate-500">Kunci Jawaban</span>
                                </label>
                             </div>
                             <input type="text" value={opt === 'A' ? optA : opt === 'B' ? optB : opt === 'C' ? optC : optD} onChange={e => {
                                if(opt==='A') setOptA(e.target.value);
                                else if(opt==='B') setOptB(e.target.value);
                                else if(opt==='C') setOptC(e.target.value);
                                else setOptD(e.target.value);
                             }} className="w-full border-slate-300 rounded p-2 text-sm focus:ring-amber-500 focus:border-amber-500" placeholder={`Teks pilihan ${opt}`} />
                          </div>
                       ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                       <button onClick={() => setQuestionModal({isOpen: false, editing: null})} className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-600 rounded-lg">Batal</button>
                       <button onClick={saveQuestion} disabled={savingQuestion} className="px-4 py-2 text-sm font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600">{savingQuestion ? 'Menyimpan...' : 'Simpan Soal'}</button>
                    </div>
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
