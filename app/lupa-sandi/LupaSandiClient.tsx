"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Loader2, Mail, ArrowRight, AlertTriangle, 
  CheckCircle2, Key, MessageCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function LupaSandiClient() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const waNumber = "628122718132";
  const waMessage = encodeURIComponent("Halo Admin Amania, saya lupa kata sandi akun saya. Mohon bantuannya untuk melakukan reset password.");

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Tautan pemulihan telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.');
        toast.success('Email pemulihan terkirim!');
      } else {
        setStatus('error');
        setMessage(data.message || 'Email tidak ditemukan dalam sistem kami.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Gagal terhubung ke server. Silakan coba lagi atau hubungi admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900">
      
      {/* KOLOM KIRI: FORM LUPA SANDI */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        <div className="p-6 md:p-8 sm:px-12 lg:px-16 xl:px-24 flex-none flex items-center justify-between border-b md:border-none border-slate-100 bg-white md:bg-transparent sticky top-0 md:relative z-20">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group">
            <img src="/logo-amania.png" alt="Amania" className="h-6 md:h-8 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">Amania</span>
          </Link>
          <Link href="/login" className="text-xs md:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">
            Masuk
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 md:py-12 max-w-2xl mx-auto w-full">
          
          <div className="mb-8 md:mb-10 text-center sm:text-left">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-indigo-100 shadow-sm mx-auto sm:mx-0">
              <Key size={24} className="md:w-7 md:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-2 md:mb-3">
              Lupa Kata Sandi?
            </h1>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
              Pilih metode pemulihan di bawah untuk mendapatkan akses kembali ke akun Amania Anda.
            </p>
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 md:mb-8 p-3.5 md:p-4 bg-red-50/80 text-red-700 text-xs md:text-sm font-semibold rounded-xl border border-red-200/60 flex items-start gap-3">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500" />
                <p className="font-medium leading-relaxed">{message}</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8 p-3.5 md:p-4 bg-emerald-50/80 text-emerald-800 text-xs md:text-sm font-semibold rounded-xl border border-emerald-200/60 flex items-start gap-3">
                <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-500" />
                <p className="font-medium leading-relaxed">{message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-50 border border-slate-200 p-5 md:p-6 rounded-2xl mb-6 md:mb-8">
            <h3 className="text-xs md:text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs">1</span> 
              Kirim Tautan ke Email
            </h3>
            
            <form onSubmit={handleSubmitEmail} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                  disabled={loading || status === 'success'}
                  placeholder="email@anda.com"
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-sm text-slate-950 font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all disabled:opacity-60 disabled:bg-slate-100" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || status === 'success' || !email}
                className="w-full bg-indigo-600 text-white py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Mengirim...' : 'Kirim Tautan Pemulihan'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 text-slate-300">
            <hr className="flex-1 border-slate-200" />
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">ATAU</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-5 md:p-6 rounded-2xl">
            <h3 className="text-xs md:text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
              <span className="bg-emerald-200 text-emerald-800 w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs">2</span> 
              Hubungi Admin via WA
            </h3>
            <p className="text-[11px] md:text-[13px] text-emerald-700 font-medium mb-4 leading-relaxed pl-7 md:pl-8">
              Lupa email atau menemui kendala? Admin kami siap membantu mereset kata sandi Anda secara manual.
            </p>
            <a 
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-emerald-500 text-white py-3 md:py-3.5 px-4 rounded-xl text-xs md:text-sm font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} className="md:w-5 md:h-5" />
              Chat Admin Sekarang
            </a>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614064641913-6b71f301682b?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 to-slate-950/95"></div>
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-16 xl:p-24 max-w-3xl text-white">
          <h2 className="text-4xl xl:text-5xl font-black leading-[1.15] mb-8 tracking-tighter">
            Keamanan Data Anda <span className="text-indigo-400">Prioritas Kami.</span>
          </h2>
          <p className="text-lg text-slate-300 mb-8 font-medium leading-relaxed max-w-xl">
            Sistem kami memastikan akun Anda terlindungi. Lakukan pemulihan kata sandi melalui verifikasi email yang sah.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}