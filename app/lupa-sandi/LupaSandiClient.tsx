"use client";

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck } from 'lucide-react';

export default function LupaSandiClient() {
  // Format nomor WA: hilangkan +, spasi, dan strip
  const waNumber = "628985477864";
  const waMessage = encodeURIComponent("Halo Admin Amania, saya lupa kata sandi akun saya. Mohon bantuannya untuk melakukan reset password.");

  return (
    <div className="flex min-h-screen bg-white font-sans antialiased text-slate-900">
      
      {/* KOLOM KIRI: INFO LUPA SANDI */}
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
            <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 text-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-emerald-100 shadow-sm mx-auto sm:mx-0">
              <ShieldCheck size={24} className="md:w-7 md:h-7" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight mb-3 md:mb-4">
              Lupa Kata Sandi?
            </h1>
            <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed">
              Jangan khawatir! Untuk menjaga keamanan data Anda, proses pemulihan kata sandi dilakukan secara manual. Tim admin kami siap membantu Anda memulihkan akses ke akun Amania.
            </p>
          </div>

          {/* KOTAK AKSI WHATSAPP */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            {/* Dekorasi tipis */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl group-hover:bg-emerald-200/50 transition-colors"></div>

            <h3 className="text-lg font-black text-emerald-950 mb-2 relative z-10">
              Hubungi Admin via WA
            </h3>
            <p className="text-xs md:text-sm text-emerald-700/80 font-medium mb-8 leading-relaxed relative z-10 max-w-sm">
              Klik tombol di bawah ini untuk terhubung langsung dengan admin kami. Admin akan segera memverifikasi dan mereset kata sandi Anda.
            </p>
            
            <a 
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank" rel="noopener noreferrer"
              className="relative z-10 w-full bg-emerald-500 text-white py-4 md:py-5 px-4 rounded-2xl text-sm md:text-base font-black hover:bg-emerald-600 transition-all shadow-[0_10px_20px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.6)] flex items-center justify-center gap-3 active:scale-95"
            >
              <MessageCircle size={22} strokeWidth={2.5} />
              Chat Admin Sekarang
            </a>
          </div>

        </div>
      </div>

      {/* KOLOM KANAN: VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1614064641913-6b71f301682b?q=80&w=2070&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/95 to-slate-950/95"></div>
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-16 xl:p-24 max-w-3xl text-white">
          <h2 className="text-4xl xl:text-5xl font-black leading-[1.15] mb-8 tracking-tighter">
            Keamanan Data Anda <span className="text-emerald-400">Prioritas Kami.</span>
          </h2>
          <p className="text-lg text-slate-300 mb-8 font-medium leading-relaxed max-w-xl">
            Kami menggunakan metode verifikasi langsung oleh admin untuk memastikan bahwa hanya pemilik sah yang dapat mereset dan mengakses akun Anda kembali.
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