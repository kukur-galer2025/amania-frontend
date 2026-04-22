"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Eye, EyeOff, Mail, Lock, 
  Sparkles, ArrowRight, AlertTriangle, 
  Check, Video, BookOpen, Award
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI KITA

export default function LoginClient() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError(''); 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');

    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        setShowSuccessOverlay(true);
        toast.dismiss();
        
        setTimeout(() => {
          // 🔥 PERBAIKAN: Redirect Organizer dan Superadmin ke Dashboard Admin 🔥
          const userRole = data.data.user.role;
          if (userRole === 'superadmin' || userRole === 'organizer') {
             router.push('/admin/dashboard');
          } else {
             router.push('/beranda');
          }
        }, 2000);
      } else {
        setError(data.message || 'Email atau kata sandi salah. Silakan coba lagi.');
        setLoading(false);
      }
    } catch (err) {
      setError('Gagal terhubung ke server. Pastikan koneksi internet stabil.');
      setLoading(false);
    } 
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setError('');
      const loadToast = toast.loading("Memverifikasi akun Google Anda...");

      try {
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
          
          setTimeout(() => {
            // 🔥 PERBAIKAN: Redirect Organizer dan Superadmin ke Dashboard Admin 🔥
            const userRole = json.data.user.role;
            if (userRole === 'superadmin' || userRole === 'organizer') {
               router.push('/admin/dashboard');
            } else {
               router.push('/beranda');
            }
          }, 2000);
        } else {
          toast.error(json.message || "Gagal masuk dengan Google.", { id: loadToast });
          setError("Login via Google terkendala. Silakan gunakan form email.");
          setIsGoogleLoading(false);
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi server.", { id: loadToast });
        setError("Koneksi server terputus. Silakan coba login manual.");
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Login Google dibatalkan.");
      setIsGoogleLoading(false);
      setError("Login Google dibatalkan. Silakan masuk menggunakan email.");
    }
  });

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900">
      
      {/* 🔥 FULLSCREEN SUCCESS OVERLAY 🔥 */}
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5 md:mb-6 shadow-xl shadow-emerald-100 border border-emerald-100"
            >
              <Check size={40} className="md:w-12 md:h-12" strokeWidth={3} />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2 md:mb-3"
            >
              Berhasil Masuk!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-slate-500 font-medium max-w-md mx-auto text-sm md:text-base leading-relaxed"
            >
              Selamat datang kembali di Amania. Menyiapkan akses produk digital & kelas Anda...
            </motion.p>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="mt-8 md:mt-10 flex items-center gap-2 text-slate-400 text-xs md:text-sm font-semibold"
            >
              <Loader2 size={16} className="animate-spin text-indigo-500 md:w-[18px] md:h-[18px]" /> Mengarahkan...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KOLOM KIRI: FORM LOGIN */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar">
        
        {/* Header / Logo */}
        <div className="p-6 sm:px-12 md:p-8 lg:px-16 xl:px-24 flex-none flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 md:gap-3 group">
            <img src="/logo-amania.png" alt="Amania" className="h-6 md:h-8 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">Amania</span>
          </Link>
          <Link href="/register" className="text-xs md:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:block">
            Belum punya akun? Daftar
          </Link>
        </div>

        {/* Kontainer Form Inti */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 max-w-2xl mx-auto w-full">
          
          <div className="mb-8 md:mb-10 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-2 md:mb-3">
              Selamat Datang
            </h1>
            <p className="text-slate-500 md:text-slate-600 font-medium text-sm md:text-base px-4 sm:px-0">
              Masuk untuk mengakses e-produk, mengikuti webinar, dan mengunduh sertifikat resmi Anda di Amania.
            </p>
          </div>

          {/* Banner Error Modern */}
          {error && (
            <div className="mb-6 md:mb-8 p-3 md:p-4 bg-rose-50/80 text-rose-700 text-xs md:text-sm font-semibold rounded-xl md:rounded-2xl border border-rose-200/60 flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-500 md:w-5 md:h-5" />
              <div>
                 <h5 className="font-bold text-rose-800 mb-0.5">Pemberitahuan</h5>
                 <p className="text-rose-700 font-medium text-[11px] md:text-[13px] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Tombol Google Kustom */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={isGoogleLoading || loading || showSuccessOverlay}
            className="w-full flex items-center justify-center gap-2.5 md:gap-3 bg-white border border-slate-300 md:border-2 md:border-slate-200 hover:bg-slate-50 hover:border-slate-400 md:hover:border-slate-300 text-slate-800 font-bold py-3 md:py-3.5 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6 md:mb-8 shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-100 text-sm md:text-base"
          >
            {isGoogleLoading ? (
              <Loader2 size={18} className="animate-spin text-slate-400 md:w-5 md:h-5" />
            ) : (
              <svg className="w-4 h-4 md:w-5 md:h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.7 17.58V20.34H19.26C21.34 18.43 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.16 22.02 18.73 20.34L15.7 17.58C14.85 18.17 13.52 18.5 12 18.5C9.07 18.5 6.57 16.53 5.71 13.88H2.56V16.73C4.3 20.19 7.89 23 12 23Z" fill="#34A853"/>
                <path d="M5.71 13.88C5.49 13.23 5.36 12.63 5.36 12C5.36 11.37 5.49 10.77 5.71 10.12V7.27H2.56C1.94 8.5 1.58 9.92 1.58 11.42C1.58 12.92 1.94 14.34 2.56 15.57L5.71 13.88Z" fill="#FBBC05"/>
                <path d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.34 3.88C17.16 1.86 14.97 0.900002 12 0.900002C7.89 0.900002 4.3 3.69 2.56 7.15L5.71 10.01C6.57 7.37 9.07 5.38 12 5.38Z" fill="#EA4335"/>
              </svg>
            )}
            {isGoogleLoading ? 'Memproses...' : 'Masuk Cepat dengan Google'}
          </button>

          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <hr className="flex-1 border-slate-200" />
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">ATAU EMAIL</span>
            <hr className="flex-1 border-slate-200" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Email Akun</label>
              <div className="relative">
                <Mail className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-[18px] md:h-[18px]" size={16} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required 
                  disabled={isGoogleLoading || loading || showSuccessOverlay}
                  placeholder="nama@email.com"
                  className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-sm text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all disabled:opacity-60 disabled:bg-slate-50" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 md:mb-2">
                <label className="block text-[10px] md:text-xs font-bold text-slate-700 uppercase tracking-wide">Kata Sandi</label>
                <Link href="/lupa-sandi" className="text-[10px] md:text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all">Lupa Sandi?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" size={14} />
                <input 
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required 
                  disabled={isGoogleLoading || loading || showSuccessOverlay}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-10 text-sm text-slate-950 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all disabled:opacity-60 disabled:bg-slate-50" 
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  disabled={isGoogleLoading || loading || showSuccessOverlay}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50 p-1 md:p-0"
                >
                  {showPassword ? <EyeOff size={16} className="md:w-4 md:h-4" /> : <Eye size={16} className="md:w-4 md:h-4" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || isGoogleLoading || showSuccessOverlay}
              className="w-full bg-indigo-600 text-white py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 md:mt-4 focus:outline-none focus:ring-4 focus:ring-indigo-600/30"
            >
              {loading ? <Loader2 size={16} className="animate-spin md:w-[18px] md:h-[18px]" /> : null}
              {loading ? 'Mengecek Data...' : 'Masuk Sekarang'}
              {!loading && <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />}
            </button>
          </form>

          {/* Footer Mobile Only */}
          <div className="mt-8 text-center sm:hidden">
            <p className="text-xs font-medium text-slate-500">
              Belum punya akun? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>

      {/* KOLOM KANAN: VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        
        {/* 🔥 GAMBAR BACKGROUND DARI HASIL PENCARIAN AI 🔥 */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url('http://googleusercontent.com/image_collection/image_retrieval/13535098923783399998')` }} 
        ></div>

        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-950/95"></div>
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-16 xl:p-24 max-w-3xl text-white">
          <div className="mb-10 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="text-indigo-300" size={32} />
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-black leading-[1.15] mb-8 tracking-tighter">
            Tingkatkan Keahlianmu <span className="text-indigo-400">Sekarang.</span>
          </h2>
          
          <p className="text-lg text-slate-300 mb-14 font-medium leading-relaxed max-w-xl">
            Satu portal untuk semua kebutuhan edukasi digital Anda. Akses kembali e-produk, sesi webinar, online course, dan klaim sertifikat resmi Anda di Amania.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl transition-transform hover:-translate-y-1 duration-300">
              <Video className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">Webinar & Course</h4>
                <p className="text-xs text-slate-400 mt-1">Ikuti sesi webinar live eksklusif dan pelajari kembali materi kelas interaktif dari mana saja.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl transition-transform hover:-translate-y-1 duration-300">
              <BookOpen className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">E-Produk Premium</h4>
                <p className="text-xs text-slate-400 mt-1">Akses instan dan tak terbatas ke e-book, template, dan produk digital yang telah Anda miliki.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl md:col-span-2 transition-transform hover:-translate-y-1 duration-300">
              <Award className="text-emerald-400 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">Sertifikat Resmi</h4>
                <p className="text-xs text-slate-400 mt-1">Dapatkan dan unduh e-sertifikat resmi setiap kali Anda menyelesaikan kursus atau menghadiri webinar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94a3b8; }
      `}</style>
    </div>
  );
}