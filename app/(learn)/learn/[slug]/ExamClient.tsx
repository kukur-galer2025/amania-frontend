"use client";

import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RefreshCcw, Loader2 } from 'lucide-react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ExamClient({ slug, isDark = true, onPassed }: { slug: string, isDark?: boolean, onPassed: () => void }) {
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [lastAttempt, setLastAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchExam();
  }, [slug]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/my-courses/${slug}/exam`);
      const json = await res.json();
      if (res.ok && json.success) {
        setExam(json.data);
        setLastAttempt(json.last_attempt);
      }
    } catch {
      toast.error('Gagal memuat ujian');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const submitExam = async () => {
    if (!exam) return;
    if (Object.keys(answers).length < exam.questions.length) {
      if (!confirm('Anda belum menjawab semua soal. Yakin ingin mengumpulkan?')) return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/my-courses/${slug}/exam/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setResult(json.data);
        if (json.data.is_passed) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          if (json.data.certificate_created) {
             toast.success('Sertifikat kelulusan berhasil dibuat!');
             onPassed();
          }
        }
      } else {
        toast.error(json.message || 'Gagal mengirim ujian');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  if (!exam) return (
    <div className={`flex flex-col items-center justify-center p-20 text-center rounded-2xl m-4 ${isDark ? 'bg-slate-900' : 'bg-white shadow-sm border border-slate-200'}`}>
      <Award size={48} className="text-slate-400 mb-4" />
      <h2 className={`text-xl font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ujian Tidak Tersedia</h2>
      <p className="text-sm text-slate-500">Kursus ini belum memiliki ujian akhir.</p>
    </div>
  );

  if (result) {
    return (
      <div className={`flex flex-col items-center justify-center p-10 sm:p-20 text-center rounded-2xl m-4 shadow-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        {result.is_passed ? (
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>
        ) : (
          <div className="w-24 h-24 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <XCircle size={48} />
          </div>
        )}
        <h2 className={`text-3xl font-black mb-2 ${result.is_passed ? 'text-emerald-500' : 'text-rose-500'}`}>
          {result.is_passed ? 'LULUS!' : 'BELUM LULUS'}
        </h2>
        <p className="text-slate-400 mb-8 font-medium">Nilai Minimum: {result.passing_score}</p>
        
        <div className={`px-10 py-8 rounded-2xl border mb-8 inline-block ${isDark ? 'bg-black/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
           <p className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-widest">Skor Anda</p>
           <p className={`text-6xl font-black ${result.is_passed ? (isDark ? 'text-white' : 'text-slate-800') : 'text-slate-400'}`}>{result.score}</p>
        </div>

        {!result.is_passed && (
          <button onClick={() => { setResult(null); setAnswers({}); }} className={`px-8 py-3 font-bold rounded-xl transition-colors flex items-center gap-2 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <RefreshCcw size={18} /> Coba Lagi
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-8 md:p-12 min-h-screen ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-800'}`}>
      <div className="max-w-3xl mx-auto">
        <div className={`p-6 sm:p-8 rounded-3xl border mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
           <div>
             <div className="flex items-center gap-2 mb-2">
               <Award className="text-amber-500" size={24} />
               <h1 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{exam.title}</h1>
             </div>
             <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{exam.description || 'Ujian Akhir Kursus. Jawab semua pertanyaan dengan benar.'}</p>
           </div>
           <div className={`px-4 py-3 rounded-2xl border text-center shrink-0 min-w-[120px] ${isDark ? 'bg-black/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">KKM / Lulus</p>
             <p className="text-xl font-black text-amber-500">{exam.passing_score}</p>
           </div>
        </div>

        {lastAttempt && (
          <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between ${lastAttempt.is_passed ? (isDark ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600') : (isDark ? 'bg-rose-900/20 border-rose-500/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600')}`}>
             <div>
               <p className="text-xs font-bold uppercase mb-1">Percobaan Terakhir</p>
               <p className="text-sm">Skor: <span className="font-black text-lg">{lastAttempt.score}</span> - {lastAttempt.is_passed ? 'Lulus' : 'Belum Lulus'}</p>
             </div>
             {lastAttempt.is_passed && <CheckCircle2 size={32} className="opacity-50" />}
          </div>
        )}

        <div className="space-y-8">
          {exam.questions?.map((q: any, i: number) => (
             <div key={q.id} className={`border rounded-3xl p-6 sm:p-8 shadow-lg ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <p className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest">Pertanyaan {i + 1} dari {exam.questions.length}</p>
                <p className={`text-lg font-bold mb-6 leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>{q.question_text}</p>
                
                <div className="space-y-3">
                   {(['A','B','C','D'] as const).map(opt => {
                     const isSelected = answers[q.id] === opt;
                     const optText = opt === 'A' ? q.option_a : opt === 'B' ? q.option_b : opt === 'C' ? q.option_c : q.option_d;
                     
                     return (
                       <button
                         key={opt}
                         onClick={() => handleSelect(q.id, opt)}
                         className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${isSelected ? (isDark ? 'bg-emerald-500/10 border-emerald-500' : 'bg-emerald-50 border-emerald-500') : (isDark ? 'bg-black/20 border-slate-800 hover:border-slate-600 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100')}`}
                       >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-black ${isSelected ? 'bg-emerald-500 text-white' : (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500')}`}>
                             {opt}
                          </div>
                          <p className={`font-medium ${isSelected ? 'text-emerald-500 font-bold' : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>{optText}</p>
                       </button>
                     );
                   })}
                </div>
             </div>
          ))}
        </div>

        <div className="mt-10 flex justify-end">
           <button onClick={submitExam} disabled={submitting} className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
              {submitting ? <Loader2 className="animate-spin" /> : 'Kumpulkan Jawaban'}
              {!submitting && <ArrowRight size={20} />}
           </button>
        </div>
      </div>
    </div>
  );
}
