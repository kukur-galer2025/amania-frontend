"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isLoading = false,
  type = 'danger'
}: ConfirmModalProps) {
  
  // Konfigurasi Tema Warna berdasarkan tipe (danger/warning/info)
  const theme = {
    danger: {
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200',
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      btnConfirm: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200',
    },
    info: {
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      btnConfirm: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200',
    }
  }[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 px-4 sm:px-0">
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={!isLoading ? onClose : undefined} 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
          />
          
          {/* Modal Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"
          >
            {/* Tombol Close Pojok Kanan Atas */}
            {!isLoading && (
              <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            )}

            <div className="p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Icon Peringatan */}
              <div className={`w-14 h-14 ${theme.iconBg} ${theme.iconColor} rounded-2xl flex items-center justify-center shrink-0`}>
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              
              {/* Teks Konten */}
              <div className="flex-1 mt-2 sm:mt-0">
                <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">
                  {title}
                </h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Area Tombol */}
            <div className="bg-slate-50 px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <button 
                onClick={onClose} 
                disabled={isLoading}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm} 
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70 text-sm ${theme.btnConfirm}`}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}