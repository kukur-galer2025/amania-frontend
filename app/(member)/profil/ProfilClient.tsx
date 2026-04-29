"use client";

import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Lock, Camera, Save, Loader2, CheckCircle2, AlertCircle, FileText, X, ShieldCheck, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api';

export default function ProfilClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', password_confirmation: '', bio: ''
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({ 
        ...formData, 
        name: parsedUser.name, 
        email: parsedUser.email,
        phone: parsedUser.phone || '', 
        bio: parsedUser.bio || ''
      });
      
      if (parsedUser.avatar) {
        setAvatarPreview(
          parsedUser.avatar.startsWith('http') 
            ? parsedUser.avatar 
            : `${STORAGE_URL}/${parsedUser.avatar}`
        );
      } else {
        setAvatarPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(parsedUser.name)}&background=4f46e5&color=fff&size=200`);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); 
    }
  };

  const showToast = (type: string, text: string) => {
    setToast({ show: true, type, text });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.password_confirmation) {
      return showToast('error', 'Konfirmasi kata sandi tidak cocok.');
    }

    setLoading(true);

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('bio', formData.bio);
    if (formData.password) {
      submitData.append('password', formData.password);
      submitData.append('password_confirmation', formData.password_confirmation);
    }
    if (avatarFile) {
      submitData.append('avatar', avatarFile);
    }

    try {
      const res = await apiFetch('/profile/update', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': '' 
        },
        body: submitData
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        showToast('success', 'Profil Anda berhasil diperbarui!');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        showToast('error', data.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      showToast('error', 'Gagal terhubung ke server. Pastikan API menyala.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto pb-28 md:pb-24 font-sans animate-in fade-in duration-500 w-full min-w-0">
      
      {/* ── FLOATING TOAST NOTIFICATION ── */}
      <div className="fixed top-4 md:top-8 left-4 right-4 md:left-0 md:right-0 z-[100] flex justify-center pointer-events-none">
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 px-4 md:px-5 py-3 md:py-4 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100 bg-white min-w-[300px] max-w-sm w-full"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
              </div>
              <div className="flex-1 pr-2 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 leading-tight mb-0.5 truncate">
                  {toast.type === 'success' ? 'Berhasil Tersimpan' : 'Terjadi Kesalahan'}
                </h4>
                <p className="text-[11px] md:text-xs font-medium text-slate-500 leading-relaxed">{toast.text}</p>
              </div>
              <button 
                onClick={() => setToast({ ...toast, show: false })} 
                className="text-slate-400 hover:text-slate-700 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors shrink-0"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── OVERLAY LOADING ── */}
      <AnimatePresence>
         {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] flex items-center justify-center w-full min-w-0 p-4"
            >
               <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white px-6 md:px-8 py-5 md:py-6 rounded-[1.5rem] shadow-2xl flex flex-col items-center gap-4 border border-slate-100 min-w-[200px]">
                  <Loader2 className="animate-spin text-indigo-600" size={36} strokeWidth={2.5} />
                  <span className="text-xs md:text-sm font-bold tracking-wide text-slate-700">Menyimpan data...</span>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* ── HEADER SECTION ── */}
      <div className="pt-4 md:pt-8 pb-6 md:pb-8 border-b border-slate-200 mb-8 md:mb-10 px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 md:mt-2">Kelola informasi publik dan keamanan akun Amania Anda.</p>
      </div>

      {/* ── FORM SETTINGS ── */}
      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 px-4 md:px-0 w-full min-w-0">
        
        {/* SECTION 1: PROFIL PUBLIK */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full min-w-0">
          <div className="w-full lg:w-[280px] shrink-0">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1.5 md:mb-2">Profil Publik</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Informasi ini akan ditampilkan secara publik di forum dan tercetak pada E-Certificate Amania Anda.</p>
          </div>
          
          <div className="flex-1 bg-white border border-slate-200/80 rounded-[2rem] p-5 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] w-full min-w-0">
            
            {/* Foto Profil Responsif (Tengah di HP, Kiri di Desktop) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 mb-8 border-b border-slate-100 pb-8">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-slate-100 shadow-md bg-slate-50 relative group-hover:ring-4 group-hover:ring-indigo-100 transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Camera size={24} />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center sm:items-start justify-center pt-2">
                <h4 className="text-sm md:text-base font-bold text-slate-900">Foto Profil</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1 mb-3.5 max-w-xs">Rekomendasi rasio 1:1 (Persegi). Ukuran maksimal 5MB (JPG/PNG).</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm">
                  Pilih Foto Baru
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
              </div>
            </div>

            {/* Input Nama & Bio */}
            <div className="space-y-5 md:space-y-6 w-full min-w-0">
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nama Lengkap Sesuai Gelar</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required 
                         className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Tentang Saya (Bio Pendek)</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <textarea 
                    name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Ceritakan latar belakang pendidikan atau profesi Anda..."
                    className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-400 shadow-inner" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        {/* SECTION 2: KEAMANAN & KONTAK */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 w-full min-w-0">
          <div className="w-full lg:w-[280px] shrink-0">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1.5 md:mb-2 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600"/> Kontak & Keamanan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">Perbarui email aktif, nomor telepon (WhatsApp), dan ganti kata sandi untuk keamanan ekstra.</p>
          </div>
          
          <div className="flex-1 bg-white border border-slate-200/80 rounded-[2rem] p-5 md:p-8 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] space-y-6 md:space-y-8 w-full min-w-0">
            
            {/* Kontak Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required 
                         className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Nomor HP / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="08123456789" 
                         className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-inner" />
                </div>
              </div>
            </div>

            {/* Keamanan Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 pt-6 border-t border-slate-100">
              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kosongkan jika tidak diubah" minLength={8} 
                         className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-inner" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-[11px] font-black text-slate-500 mb-2 uppercase tracking-widest">Konfirmasi Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="Ketik ulang sandi baru" minLength={8} 
                         className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 shadow-inner" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── BOTTOM FLOATING ACTION BAR ── */}
        <div className="fixed sm:sticky bottom-0 sm:bottom-6 left-0 right-0 sm:mt-12 bg-white/90 sm:bg-white/80 backdrop-blur-xl border-t sm:border border-slate-200 px-5 sm:px-8 py-4 sm:py-5 sm:rounded-[1.5rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sm:shadow-lg flex items-center justify-between z-40 sm:z-auto w-full min-w-0">
          <div className="min-w-0 pr-4">
            <p className="text-sm md:text-base font-black text-slate-900 truncate">Simpan Perubahan</p>
            <p className="text-[10px] md:text-xs text-slate-500 hidden md:block">Pastikan data yang Anda masukkan valid dan aktif.</p>
          </div>
          <button type="submit" disabled={loading} className="bg-slate-900 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-600 transition-all shadow-md flex items-center gap-2 shrink-0 disabled:opacity-70">
            <Save size={16} /> <span className="hidden sm:inline">Simpan</span>
          </button>
        </div>

      </form>
    </div>
  );
}