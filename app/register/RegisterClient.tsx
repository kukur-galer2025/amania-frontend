"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Eye, EyeOff, Mail, Lock, 
  User, Sparkles, ArrowRight, AlertTriangle, 
  Check 
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function RegisterClient() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(''); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      return setError('Konfirmasi kata sandi tidak cocok.');
    }

    setLoading(true); 
    setError('');

    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setShowSuccessOverlay(true);
        toast.dismiss();
        setTimeout(() => router.push('/beranda'), 2000);
      } else {
        setError(data.message || 'Pendaftaran gagal.');
        setLoading(false);
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
      setLoading(false);
    } 
  };

  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError(''); 
      const loadToast = toast.loading("Memproses akun Google...");

      try {
        // 🔥 PENGGUNAAN APIFETCH 🔥
        const res = await apiFetch('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const json = await res.json();

        if (res.ok && json.success) {
          toast.dismiss(loadToast);
          localStorage.setItem('token', json.data.token);
          localStorage.setItem('user', JSON.stringify(json.data.user));
          setShowSuccessOverlay(true);
          setTimeout(() => router.push('/beranda'), 2000);
        } else {
          toast.error(json.message || "Gagal mendaftar.", { id: loadToast });
          setIsGoogleLoading(false);
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi.", { id: loadToast });
        setIsGoogleLoading(false);
      } 
    },
    onError: () => {
      toast.error("Proses Google dibatalkan.");
      setIsGoogleLoading(false);
    }
  });

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      
      {/* 🔥 FULLSCREEN SUCCESS OVERLAY 🔥 */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl"><Check size={40} className="md:w-[48px] md:h-[48px]" strokeWidth={3} /></motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Pendaftaran Berhasil!</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed">Selamat bergabung di Amania Nusantara.</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 flex items-center gap-2 text-slate-400 text-xs md:text-sm font-semibold"><Loader2 size={16} className="animate-spin text-indigo-500" /> Mengarahkan...</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KOLOM KIRI: FORM REGISTER */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8 sm:px-12 lg:px-16 flex-none flex items-center justify-between border-b md:border-none border-slate-100 bg-white md:bg-transparent sticky top-0 md:relative z-20">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group">
            <img src="/logo-amania.png" alt="Amania" className="h-6 md:h-8 w-auto" />
            <span className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">Amania</span>
          </Link>
          <Link href="/login" className="text-xs md:text-sm font-semibold text-slate-600 hover:text-indigo-600">Masuk</Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-8 md:mb-10 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-2 md:mb-3">Buat Akun Anda</h1>
            <p className="text-slate-500 md:text-slate-600 font-medium text-sm md:text-base px-2 sm:px-0">Mulai perjalanan belajar Anda di Amania Nusantara.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 md:p-4 bg-red-50/80 text-red-700 text-xs md:text-sm font-semibold rounded-xl md:rounded-2xl border border-red-200/60 flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500 md:w-5 md:h-5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="button" onClick={() => registerWithGoogle()}
            disabled={isGoogleLoading || loading || showSuccessOverlay}
            className="w-full flex items-center justify-center gap-2.5 md:gap-3 bg-white border border-slate-300 md:border-2 md:border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3 md:py-3.5 px-4 rounded-xl text-sm md:text-base disabled:opacity-50 transition-all mb-6 md:mb-8"
          >
            {isGoogleLoading ? <Loader2 size={18} className="animate-spin text-slate-400" /> : <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24"><path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.7 17.58V20.34H19.26C21.34 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/><path d="M12 23C14.97 23 17.16 22.02 18.73 20.34L15.7 17.58C14.85 18.17 13.52 18.5 12 18.5C9.07 18.5 6.57 16.53 5.71 13.88H2.56V16.73C4.3 20.19 7.89 23 12 23Z" fill="#34A853"/><path d="M5.71 13.88C5.49 13.23 5.36 12.63 5.36 12C5.36 11.37 5.49 10.77 5.71 10.12V7.27H2.56C1.94 8.5 1.58 9.92 1.58 11.42C1.58 12.92 1.94 14.34 2.56 15.57L5.71 13.88Z" fill="#FBBC05"/><path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.34 3.88C17.16 1.86 14.97 0.900002 12 0.900002C7.89 0.900002 4.3 3.69 2.56 7.15L5.71 10.01C6.57 7.37 9.07 5.38 12 5.38Z" fill="#EA4335"/></svg>}
            {isGoogleLoading ? 'Memproses...' : 'Daftar dengan Google'}
          </button>

          <form onSubmit={handleRegister} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nama Anda" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="nama@email.com" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required minLength={8} placeholder="Minimal 8" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-10 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Ulangi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type={showPassword ? "text" : "password"} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required minLength={8} placeholder="Sandi Ulang" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-10 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading || isGoogleLoading || showSuccessOverlay} className="w-full bg-indigo-600 text-white py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 mt-2 md:mt-4">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Buat Akun Sekarang'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-950/95"></div>
        <div className="relative z-10 p-16 xl:p-24 text-white max-w-3xl">
          <h2 className="text-4xl xl:text-5xl font-black leading-tight mb-8 tracking-tighter">Transformasi Karirmu di <span className="text-indigo-400">Amania.</span></h2>
          <p className="text-lg text-slate-300 leading-relaxed">Belajar langsung dari praktisi industri terbaik di Indonesia. Akses bootcamp, webinar, dan dapatkan sertifikasi resmi.</p>
        </div>
      </div>
    </div>
  );
}