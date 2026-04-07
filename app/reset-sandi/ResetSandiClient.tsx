"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, Lock, Eye, EyeOff, ArrowRight, AlertTriangle, Check 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function ResetSandiClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) setError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !email) {
      return setError('Link tidak valid. Pastikan Anda menyalin seluruh link dari email.');
    }

    if (formData.password !== formData.password_confirmation) {
      return setError('Konfirmasi kata sandi tidak cocok.');
    }

    setLoading(true);
    setError('');

    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          token: token,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setShowSuccessOverlay(true);
        toast.dismiss();
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setError(data.message || 'Gagal mengubah sandi. Token kedaluwarsa.');
        setLoading(false);
      }
    } catch (err) {
      setError('Gagal terhubung ke server.');
      setLoading(false);
    } 
  };

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">Link pemulihan tidak valid. Silakan minta link baru.</p>
          <Link href="/lupa-sandi" className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md">Minta Link Baru</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900 overflow-x-hidden">
      
      <AnimatePresence>
        {showSuccessOverlay && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center">
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl"><Check size={40} className="md:w-[48px] md:h-[48px]" strokeWidth={3} /></motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3 px-4">Sandi Berhasil Diubah!</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-slate-500 font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed px-4">Akun Amania Anda sudah aman. Silakan masuk menggunakan sandi baru.</motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex items-center gap-2 text-slate-400 text-xs md:text-sm font-semibold"><Loader2 size={16} className="animate-spin text-indigo-500" /> Mengarahkan ke login...</motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8 flex-none flex items-center justify-between border-b md:border-none border-slate-100 bg-white md:bg-transparent sticky top-0 md:relative z-20">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/logo-amania.png" alt="Amania" className="h-6 md:h-8 w-auto" />
            <span className="text-lg md:text-xl font-extrabold text-slate-950 tracking-tight mt-0.5">Amania</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-8 md:mb-10 text-center sm:text-left">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-50 text-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-indigo-100 shadow-sm mx-auto sm:mx-0"><Lock size={24} className="md:w-7 md:h-7" /></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-2 md:mb-3">Buat Sandi Baru</h1>
            <p className="text-slate-600 font-medium text-xs md:text-sm leading-relaxed px-2 sm:px-0">Masukkan kata sandi baru untuk akun <span className="font-bold text-slate-800">{email}</span>.</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 md:p-4 bg-red-50/80 text-red-700 text-xs md:text-sm font-semibold rounded-xl border border-red-200/60 flex items-start gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4 md:space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Kata Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required minLength={8} placeholder="Minimal 8" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-12 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-slate-700 mb-1.5 md:mb-2 uppercase tracking-wide">Ulangi Sandi Baru</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type={showPassword ? "text" : "password"} name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required minLength={8} placeholder="Ketik ulang" className="w-full bg-white border border-slate-300 md:border-slate-200 rounded-xl py-2.5 md:py-3 pl-10 md:pl-11 pr-4 text-sm focus:outline-none focus:border-indigo-600 transition-all" />
              </div>
            </div>
            <button type="submit" disabled={loading || showSuccessOverlay} className="w-full bg-indigo-600 text-white py-3 md:py-3.5 rounded-xl text-sm md:text-base font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Sandi Baru'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555949963-aa79dcee57d5?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/95 to-slate-950/95"></div>
        <div className="relative z-10 p-16 xl:p-24 text-white max-w-3xl">
          <h2 className="text-4xl xl:text-5xl font-black leading-tight mb-8 tracking-tighter">Keamanan Data Anda <span className="text-indigo-400">Telah Dipulihkan.</span></h2>
          <p className="text-lg text-slate-300 leading-relaxed">Tinggal satu langkah lagi. Gunakan kata sandi yang kuat agar akun Anda tetap terlindungi.</p>
        </div>
      </div>
    </div>
  );
}