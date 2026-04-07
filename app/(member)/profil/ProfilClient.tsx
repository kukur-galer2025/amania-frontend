"use client";

import React, { useEffect, useState, useRef } from 'react';
import { User, Mail, Lock, Camera, Save, Loader2, CheckCircle2, AlertCircle, FileText, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function ProfilClient() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '', bio: ''
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔗 AMBIL STORAGE URL DARI .ENV
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
        bio: parsedUser.bio || ''
      });
      
      if (parsedUser.avatar) {
        setAvatarPreview(
          parsedUser.avatar.startsWith('http') 
            ? parsedUser.avatar 
            : `${STORAGE_URL}/${parsedUser.avatar}` // 🔥 Pakai Storage URL dinamis
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
    submitData.append('bio', formData.bio);
    if (formData.password) {
      submitData.append('password', formData.password);
      submitData.append('password_confirmation', formData.password_confirmation);
    }
    if (avatarFile) {
      submitData.append('avatar', avatarFile);
    }

    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/profile/update', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            // Hapus Content-Type agar browser mengatur form-data secara otomatis
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
    <div className="max-w-5xl mx-auto pb-24 font-sans animate-in fade-in duration-500">
      
      {/* FLOATING TOAST NOTIFICATION */}
      <div className="fixed top-4 md:top-8 left-4 right-4 md:left-0 md:right-0 z-[100] flex justify-center pointer-events-none">
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 bg-white min-w-[300px]"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <AlertCircle size={18} strokeWidth={2.5} />}
              </div>
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-sm text-slate-900 leading-none mb-1">
                  {toast.type === 'success' ? 'Berhasil Tersimpan' : 'Terjadi Kesalahan'}
                </h4>
                <p className="text-xs font-medium text-slate-500">{toast.text}</p>
              </div>
              <button 
                onClick={() => setToast({ ...toast, show: false })} 
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors ml-2 shrink-0"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OVERLAY LOADING */}
      <AnimatePresence>
         {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center"
            >
               <div className="bg-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span className="text-sm font-bold text-slate-700">Menyimpan data...</span>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* HEADER SECTION - Responsif */}
      <div className="pt-4 md:pt-8 pb-6 md:pb-8 border-b border-slate-200 mb-8 md:mb-10 px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-xs md:text-sm text-slate-500 font-medium mt-1 md:mt-2">Kelola informasi publik dan keamanan akun Amania Anda.</p>
      </div>

      {/* FORM SETTINGS */}
      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 px-4 md:px-0">
        
        {/* SECTION 1: PROFIL PUBLIK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1">Profil Publik</h3>
            <p className="text-xs md:text-sm text-slate-500">Informasi ini akan ditampilkan secara publik dan tercetak di E-Certificate Amania Anda.</p>
          </div>
          
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm">
            
            {/* Foto Profil Responsif */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 md:mb-8 border-b border-slate-100 pb-6 md:pb-8">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-slate-100 relative group-hover:ring-4 group-hover:ring-indigo-50 transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                    <Camera size={20} />
                  </div>
                </div>
              </div>
              <div className="text-left">
                <h4 className="text-sm md:text-base font-bold text-slate-900">Foto Profil</h4>
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1 mb-3">Rekomendasi ukuran 500x500px. Maksimal 2MB.</p>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors">
                  Ganti Foto
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="hidden" />
              </div>
            </div>

            {/* Nama & Bio */}
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wider">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wider">Tentang Saya (Bio)</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 text-slate-400" size={16} />
                  <textarea 
                    name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Tuliskan keahlian atau latar belakang pendidikan Anda..."
                    className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-400" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="h-px bg-slate-200 w-full" />

        {/* SECTION 2: KEAMANAN & KONTAK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600"/> Keamanan Akun</h3>
            <p className="text-xs md:text-sm text-slate-500">Perbarui email aktif dan ubah kata sandi untuk melindungi akun Amania Anda.</p>
          </div>
          
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 md:p-8 shadow-sm space-y-5 md:space-y-6">
            
            <div>
              <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wider">Email Terdaftar</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
              </div>
            </div>

            {/* Grid berubah di HP jadi tumpuk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wider">Kata Sandi Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Kosongkan jika tidak diubah" minLength={8} className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] md:text-[11px] font-bold text-slate-500 mb-1.5 md:mb-2 uppercase tracking-wider">Konfirmasi Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} placeholder="Ketik ulang sandi baru" minLength={8} className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BOTTOM FLOATING ACTION BAR - Responsif di HP */}
        <div className="fixed sm:sticky bottom-0 sm:bottom-6 left-0 right-0 sm:mt-12 bg-white sm:bg-white/80 backdrop-blur-md border-t sm:border border-slate-200 px-4 sm:px-6 py-4 sm:rounded-2xl shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] sm:shadow-lg flex items-center justify-between z-40 sm:z-auto">
          <div>
            <p className="text-sm md:text-base font-bold text-slate-800">Simpan Perubahan</p>
            <p className="text-[10px] text-slate-500 hidden md:block">Pastikan semua data sudah benar sebelum menyimpan.</p>
          </div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-5 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-70">
            <Save size={16} /> Simpan
          </button>
        </div>

      </form>
    </div>
  );
}