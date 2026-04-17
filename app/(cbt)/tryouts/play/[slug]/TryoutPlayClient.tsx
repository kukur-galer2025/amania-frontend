"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, 
  Grid3X3, X, CheckCircle2, ShieldAlert, Loader2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/app/utils/api';

export default function TryoutPlayClient({ slug }: { slug: string }) {
  const router = useRouter();

  // State API
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [tryoutInfo, setTryoutInfo] = useState<any>(null);

  // State Ujian
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); 
  const [doubtful, setDoubtful] = useState<Set<string>>(new Set()); 
  const [timeLeft, setTimeLeft] = useState(0); 
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  // FETCH DATA
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiFetch(`/tryout/skd/play/${slug}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const json = await res.json();

        if (res.ok && json.success) {
          setTryoutInfo(json.data.tryout);
          setTimeLeft(json.data.tryout.duration_minutes * 60);

          const formattedQuestions = json.data.questions.map((q: any, idx: number) => ({
            id: q.id.toString(),
            number: idx + 1,
            section: q.main_category === 'twk' ? 'Tes Wawasan Kebangsaan (TWK)' : q.main_category === 'tiu' ? 'Tes Intelegensia Umum (TIU)' : 'Tes Karakteristik Pribadi (TKP)',
            subCategory: q.sub_category?.name || q.subCategory?.name || 'UMUM',
            text: q.question_text,
            options: [
              { id: 'A', text: q.option_a },
              { id: 'B', text: q.option_b },
              { id: 'C', text: q.option_c },
              { id: 'D', text: q.option_d },
              { id: 'E', text: q.option_e },
            ].filter(opt => opt.text !== null)
          }));

          setQuestions(formattedQuestions);
        } else {
          toast.error(json.message || "Gagal memuat soal.");
          router.push('/tryouts/belajarku');
        }
      } catch (err) {
        toast.error("Terjadi kesalahan jaringan.");
        router.push('/tryouts/belajarku');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [slug, router]);

  const currentQuestion = questions[currentIndex];

  // Logic Timer
  useEffect(() => {
    if (loading || timeLeft <= 0) return;
    if (timeLeft === 1) handleForceSubmit();

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    if (doubtful.has(currentQuestion.id)) toggleDoubtful();
  };

  const toggleDoubtful = () => {
    if (!currentQuestion) return;
    setDoubtful(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleForceSubmit = () => {
    toast.error('Waktu Habis! Jawaban otomatis disimpan.');
    router.push('/tryouts/history'); 
  };

  const handleManualSubmit = () => {
    toast.success('Ujian Selesai! Jawaban berhasil disimpan.');
    router.push('/tryouts/history');
  };

  // Warna Palet khas BKN
  const getPaletteColor = (qId: string, index: number) => {
    const isAnswered = !!answers[qId];
    const isDoubtful = doubtful.has(qId);
    const isActive = currentIndex === index;

    let baseClass = 'font-bold text-[13px] border transition-all ';
    
    if (isAnswered) {
      baseClass += isDoubtful ? 'bg-[#f0ad4e] text-white border-[#eea236]' : 'bg-[#5cb85c] text-white border-[#4cae4c]';
    } else {
      baseClass += 'bg-[#d9534f] text-white border-[#d43f3a]';
    }

    if (isActive) {
      baseClass += ' ring-2 ring-[#337ab7] ring-offset-1 scale-105 z-10';
    }

    return baseClass;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full h-full min-h-[500px]">
        <Loader2 size={48} className="text-[#337ab7] animate-spin" />
        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Menyiapkan Lembar Ujian...</p>
      </div>
    );
  }

  if (questions.length === 0) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full text-[#333]">
      
      {/* Bar Batas Waktu & Kategori Soal */}
      <div className="bg-[#f5f5f5] text-[#333] border-b border-gray-300 px-4 py-2 md:px-8 flex items-center justify-between shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-2">
            <span className="bg-[#5bc0de] text-white px-3 py-1 rounded-sm text-[11px] font-bold border border-[#46b8da] uppercase shadow-sm">
              {currentQuestion.section}
            </span>
            {/* Tampilan Sub Kategori */}
            {currentQuestion.subCategory && currentQuestion.subCategory !== 'UMUM' && (
              <span className="bg-white text-[#5bc0de] px-2 py-1 rounded-sm text-[10px] font-bold border border-[#46b8da] uppercase shadow-sm hidden md:block">
                {currentQuestion.subCategory}
              </span>
            )}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-bold text-gray-600 uppercase hidden sm:block">Sisa Waktu:</span>
          {/* 🔥 UPDATE: Timer berubah merah dan berkedip jika sisa waktu <= 10 Menit (600 Detik) 🔥 */}
          <div className={`px-4 py-1 rounded-sm font-mono font-bold text-lg md:text-xl border transition-colors ${
            timeLeft <= 600 ? 'bg-[#d9534f] text-white border-[#d43f3a] animate-pulse' : 'bg-white text-[#d9534f] border-gray-300 shadow-inner'
          }`}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Tombol Buka Palet Mobile */}
      <div className="lg:hidden bg-white px-4 py-2 border-b border-gray-300 flex justify-end shrink-0 shadow-sm">
         <button 
            onClick={() => setIsMobilePaletteOpen(true)}
            className="px-3 py-1.5 bg-[#f5f5f5] text-[#333] hover:bg-gray-200 rounded-sm border border-gray-300 flex items-center gap-2 text-[11px] font-bold uppercase transition-colors"
          >
            <Grid3X3 size={14} /> Daftar Navigasi Soal
          </button>
      </div>

      {/* ════════ MAIN WORKSPACE BKN STYLE ════════ */}
      <div className="flex-1 flex overflow-hidden w-full max-w-[1600px] mx-auto p-3 lg:p-4 gap-3 lg:gap-5">
        
        {/* KIRI - SIDEBAR GRID SOAL (Dipindah ke Kiri) */}
        <aside className="hidden lg:flex w-[250px] bg-white border border-gray-300 shadow-sm rounded-sm flex-col shrink-0 h-full overflow-hidden">
          <div className="bg-[#f5f5f5] border-b border-gray-300 p-2.5 text-center shrink-0">
            <h3 className="font-bold text-[#333] text-[11px] uppercase tracking-wider">Navigasi Soal</h3>
          </div>
          
          {/* Area Grid Nomor Soal - Bisa di-scroll */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar w-full">
            <div className="grid grid-cols-5 gap-1.5 w-full">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-full aspect-square flex items-center justify-center rounded-sm shadow-sm ${getPaletteColor(q.id, idx)}`}
                >
                  {q.number}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan Warna */}
          <div className="p-3 border-t border-gray-300 bg-[#f5f5f5] space-y-2.5 shrink-0 text-[11px] text-[#333] font-bold uppercase">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-[#5cb85c] border border-[#4cae4c] rounded-sm shrink-0 shadow-sm" /> Dijawab
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-[#d9534f] border border-[#d43f3a] rounded-sm shrink-0 shadow-sm" /> Belum
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 bg-[#f0ad4e] border border-[#eea236] rounded-sm shrink-0 shadow-sm" /> Ragu-ragu
            </div>
          </div>
        </aside>

        {/* KANAN - AREA SOAL & JAWABAN (Dipindah ke Kanan) */}
        <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm rounded-sm h-full overflow-hidden">
          
          {/* Header Kotak Soal */}
          <div className="bg-[#f5f5f5] border-b border-gray-300 px-5 py-2.5 flex justify-between items-center shrink-0">
            <h2 className="text-[13px] font-bold text-[#333] uppercase flex flex-wrap items-center gap-2">
              Soal Nomor {currentQuestion.number}
              {currentQuestion.subCategory && currentQuestion.subCategory !== 'UMUM' && (
                <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm normal-case border border-gray-300 font-semibold tracking-wide mt-0.5 sm:mt-0">
                  Topik: {currentQuestion.subCategory}
                </span>
              )}
            </h2>
            <div className="flex gap-2 text-[#337ab7]">
               <Info size={16} />
            </div>
          </div>
          
          {/* Area Konten Teks Soal & Opsi - Bisa di-scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
            
            {/* Teks Soal */}
            <div 
              className="text-[15px] md:text-[16px] text-black leading-relaxed prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
            />

            {/* Opsi Jawaban */}
            <div className="space-y-2">
              {currentQuestion.options.map((opt: any) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 p-2.5 rounded-sm cursor-pointer transition-colors border ${
                      isSelected ? 'bg-[#e8f0fe] border-blue-200' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      <input 
                        type="radio" 
                        name={`answer-${currentQuestion.id}`}
                        className="w-4 h-4 cursor-pointer accent-[#337ab7]"
                        checked={isSelected}
                        onChange={() => handleSelectOption(opt.id)}
                      />
                    </div>
                    <div className="flex gap-2.5">
                       <span className="font-bold text-[15px]">{opt.id}.</span>
                       <div 
                          className="text-[15px] text-black prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: opt.text }}
                       />
                    </div>
                  </label>
                );
              })}
            </div>

          </div>

          {/* Navigasi Bawah */}
          <div className="bg-[#f5f5f5] border-t border-gray-300 p-3 md:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-100 text-[#333] rounded-sm text-xs font-bold uppercase transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Kembali
            </button>

            <button 
              onClick={toggleDoubtful}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-xs font-bold uppercase transition-colors border ${
                doubtful.has(currentQuestion.id)
                ? 'bg-[#f0ad4e] border-[#eea236] text-white shadow-inner'
                : 'bg-[#f0ad4e] border-[#eea236] text-white opacity-80 hover:opacity-100'
              }`}
            >
              <input type="checkbox" checked={doubtful.has(currentQuestion.id)} readOnly className="w-3 h-3 accent-white pointer-events-none" /> Ragu-Ragu
            </button>

            {currentIndex === questions.length - 1 ? (
              <button 
                onClick={() => setShowSubmitConfirm(true)}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#d9534f] border border-[#d43f3a] hover:bg-red-700 text-white rounded-sm text-xs font-bold uppercase transition-colors shadow-sm"
              >
                Selesai Ujian <CheckCircle2 size={16} />
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#337ab7] border border-[#2e6da4] hover:bg-blue-700 text-white rounded-sm text-xs font-bold uppercase transition-colors shadow-sm"
              >
                Simpan & Lanjutkan <ChevronRight size={16} />
              </button>
            )}
          </div>

        </div>

      </div>

      {/* ════════ MOBILE PALETTE DRAWER ════════ */}
      <AnimatePresence>
        {isMobilePaletteOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobilePaletteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-[#f5f5f5] rounded-t-md z-[120] lg:hidden flex flex-col max-h-[85vh] border-t border-gray-300 shadow-2xl"
            >
              <div className="p-3 border-b border-gray-300 flex items-center justify-between bg-white rounded-t-md shrink-0">
                <h3 className="font-bold text-[#333] uppercase text-sm flex items-center gap-2">
                  <Grid3X3 size={16} className="text-[#337ab7]" /> Navigasi Soal
                </h3>
                <button onClick={() => setIsMobilePaletteOpen(false)} className="p-1.5 bg-gray-200 rounded-sm text-gray-700 shrink-0"><X size={16}/></button>
              </div>

              <div className="flex items-center justify-center gap-4 py-2.5 bg-white border-b border-gray-200 shrink-0">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-[#5cb85c] border border-[#4cae4c] rounded-sm shrink-0"/> Sudah</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-[#d9534f] border border-[#d43f3a] rounded-sm shrink-0"/> Belum</div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase"><div className="w-3 h-3 bg-[#f0ad4e] border border-[#eea236] rounded-sm shrink-0"/> Ragu</div>
              </div>

              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 w-full bg-white">
                <div className="grid grid-cols-6 gap-2 w-full">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => { setCurrentIndex(idx); setIsMobilePaletteOpen(false); }}
                      className={`w-full aspect-square flex items-center justify-center rounded-sm shadow-sm ${getPaletteColor(q.id, idx)}`}
                    >
                      {q.number}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ════════ SUBMIT CONFIRMATION MODAL ════════ */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-sm shadow-2xl p-6 md:p-8 max-w-md w-full text-center border border-gray-300">
              <div className="w-16 h-16 bg-[#f2dede] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ebccd1]">
                <ShieldAlert size={32} className="text-[#a94442]" />
              </div>
              <h2 className="text-xl font-bold text-[#333] mb-2 uppercase">Selesaikan Ujian?</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Apakah Anda yakin ingin mengakhiri ujian ini? Jawaban Anda akan langsung dinilai oleh sistem dan tidak dapat diubah kembali.
              </p>
              
              <div className="flex flex-col gap-2.5 w-full">
                <button onClick={handleManualSubmit} className="w-full py-3 bg-[#5cb85c] border border-[#4cae4c] text-white font-bold rounded-sm hover:bg-green-600 transition-all uppercase text-xs tracking-wide">
                  Ya, Akhiri Ujian
                </button>
                <button onClick={() => setShowSubmitConfirm(false)} className="w-full py-3 bg-[#f5f5f5] border border-gray-300 text-[#333] font-bold rounded-sm hover:bg-gray-200 transition-colors uppercase text-xs tracking-wide">
                  Cek Kembali Jawaban
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f5f5f5; border-left: 1px solid #e5e5e5; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 2px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #a8a8a8; }
      `}</style>
    </div>
  );
}