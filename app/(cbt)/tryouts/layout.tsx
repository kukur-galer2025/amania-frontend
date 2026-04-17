"use client";

import React, { useState, useEffect } from 'react';
import { User, LogOut, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function CbtLayout({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("Peserta Amania");

  useEffect(() => {
    // Ambil data user dari localStorage agar Header menampilkan nama asli
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#e8ecf1] flex flex-col font-sans selection:bg-blue-200">
      
      {/* ─── HEADER KHUSUS CBT (GAYA BKN KLASIK) ─── */}
      <header className="bg-[#1e3a8a] border-b-4 border-[#d9534f] h-16 flex-shrink-0 sticky top-0 z-[100] shadow-md px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between">
          
          {/* Sisi Kiri: Logo */}
          <div className="flex items-center gap-3">
            {/* Menggunakan kotak tegas, bukan rounded-lg */}
            <div className="w-10 h-10 bg-white p-1 rounded-sm flex items-center justify-center shadow-sm">
              {/* Gunakan gambar logo amania jika ada, atau fallback inisial */}
              <img src="/logo-amania.png" alt="A" className="w-full h-full object-contain" />
            </div>
            <div className="text-white">
              <h1 className="text-sm md:text-base font-bold leading-tight tracking-wide uppercase">Sistem Seleksi Calon ASN</h1>
              <p className="text-[10px] md:text-[11px] text-blue-200 uppercase tracking-widest leading-none mt-1">Amania Evaluation System</p>
            </div>
          </div>

          {/* Sisi Tengah: Indikator Ujian (Gaya Alert BKN) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#d9534f] border border-[#d43f3a] rounded-sm text-white shadow-inner">
            <AlertTriangle size={14} className="text-yellow-300 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest">Simulasi CAT Berjalan</span>
          </div>

          {/* Sisi Kanan: Info Peserta & Keluar */}
          <div className="flex items-center gap-3 md:gap-4 text-white">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-blue-200 uppercase tracking-widest">Peserta Ujian</p>
              <p className="text-sm font-bold truncate max-w-[150px] uppercase">{userName}</p>
            </div>
            {/* Avatar kotak bergaya formal */}
            <div className="w-9 h-9 bg-[#337ab7] border border-[#2e6da4] rounded-sm flex items-center justify-center text-white shadow-sm shrink-0">
              <User size={20} />
            </div>
            
            <div className="w-px h-8 bg-blue-800 mx-1 hidden md:block"></div>
            
            {/* Tombol Emergency Keluar ala tombol BKN */}
            <Link 
              href="/tryouts/belajarku"
              className="flex items-center gap-2 px-3 py-1.5 bg-[#d9534f] hover:bg-red-700 text-white font-bold rounded-sm text-xs uppercase transition-colors border border-[#d43f3a]"
              title="Batalkan Ujian"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </Link>
          </div>

        </div>
      </header>

      {/* ─── MAIN CONTENT (AREA SOAL) ─── */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {children}
      </main>

      {/* Footer Klasik ala BKN */}
      <footer className="bg-[#f5f5f5] border-t border-gray-300 py-2 px-8 flex justify-center flex-shrink-0 z-50">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
          &copy; 2026 Amania Nusantara • Secure Exam Mode
        </p>
      </footer>

    </div>
  );
}