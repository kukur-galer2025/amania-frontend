"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Target, ShieldAlert, Briefcase, ArrowRight, LayoutGrid } from 'lucide-react';

export default function TryoutPortalPage() {
  const MODULES = [
    {
      id: 'skd',
      title: 'SKD CPNS & Kedinasan',
      description: 'Kelola bank soal TWK, TIU, TKP, dan paket tryout ujian kedinasan.',
      icon: Target,
      color: 'indigo',
      link: '/admin/tryouts/skd/dashboard',
      status: 'active'
    },
    {
      id: 'polri',
      title: 'Psikotes Polri',
      description: 'Manajemen soal kecerdasan, kepribadian, kecermatan, dan sikap kerja.',
      icon: ShieldAlert,
      color: 'rose',
      link: '#',
      status: 'coming_soon'
    },
    {
      id: 'pppk',
      title: 'Seleksi PPPK',
      description: 'Modul kompetensi manajerial, sosiokultural, teknis, dan wawancara.',
      icon: Briefcase,
      color: 'emerald',
      link: '#',
      status: 'coming_soon'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <LayoutGrid size={32} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Portal Aplikasi CBT</h1>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Pilih modul ujian yang ingin Anda kelola. Setiap modul memiliki sistem penilaian, bank soal, dan dashboard yang dirancang khusus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {MODULES.map((mod, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            key={mod.id}
          >
            {mod.status === 'active' ? (
              <Link 
                href={mod.link}
                className={`block bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-${mod.color}-300 transition-all group h-full relative overflow-hidden`}
              >
                <div className={`w-14 h-14 bg-${mod.color}-50 text-${mod.color}-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <mod.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{mod.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8">
                  {mod.description}
                </p>
                <div className={`flex items-center gap-2 text-sm font-bold text-${mod.color}-600 mt-auto`}>
                  Masuk Workspace <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ) : (
              <div className="block bg-slate-50 rounded-[2rem] p-8 border border-slate-200 shadow-sm opacity-70 grayscale h-full relative overflow-hidden cursor-not-allowed">
                <div className="absolute top-6 right-6 bg-slate-200 text-slate-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">
                  Segera Hadir
                </div>
                <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center mb-6">
                  <mod.icon size={28} strokeWidth={2} />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-3">{mod.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}