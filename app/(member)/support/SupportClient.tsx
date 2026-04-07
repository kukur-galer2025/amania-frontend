"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, MessageCircle, 
  CreditCard, UserCircle, Award, Calendar, 
  ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Hash
} from 'lucide-react';

const categoryColors: Record<string, { bg: string, text: string, border: string, iconBg: string, hoverBorder: string }> = {
  "Pembayaran": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", iconBg: "bg-emerald-100 text-emerald-600", hoverBorder: "hover:border-emerald-300" },
  "Akun": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", iconBg: "bg-blue-100 text-blue-600", hoverBorder: "hover:border-blue-300" },
  "Sertifikat": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", iconBg: "bg-amber-100 text-amber-600", hoverBorder: "hover:border-amber-300" },
  "Event": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", iconBg: "bg-purple-100 text-purple-600", hoverBorder: "hover:border-purple-300" }
};

export default function SupportClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const adminWaLink = "https://wa.me/628122718132?text=Halo%20Admin%20Amania,%20saya%20membutuhkan%20bantuan%20terkait...";

  const faqs = [
    { id: 1, category: "Pembayaran", question: "Berapa lama proses verifikasi pembayaran?", answer: "Proses verifikasi otomatis biasanya memakan waktu 1-5 menit. Namun jika Anda melakukan upload manual, admin akan melakukan verifikasi maksimal dalam 1x24 jam kerja." },
    { id: 2, category: "Event", question: "Apakah saya bisa membatalkan pendaftaran event?", answer: "Pendaftaran yang sudah dibayar tidak dapat dibatalkan atau di-refund, namun Anda tetap akan mendapatkan rekaman materi jika berhalangan hadir." },
    { id: 3, category: "Sertifikat", question: "Dimana saya bisa mengunduh sertifikat?", answer: "Sertifikat akan muncul di menu 'Sertifikat Kelulusan' setelah Anda menyelesaikan seluruh rangkaian acara dan mengisi link absensi yang disediakan." },
    { id: 4, category: "Akun", question: "Bagaimana cara mengubah profil dan foto?", answer: "Anda dapat masuk ke menu 'Pengaturan' atau 'Profil Saya' di sidebar untuk memperbarui informasi pribadi dan foto profil Anda." },
    { id: 5, category: "Pembayaran", question: "Bagaimana jika saya salah mentransfer nominal?", answer: "Jangan panik. Segera hubungi Admin Pusat melalui tombol WhatsApp di bawah dengan melampirkan bukti transfer dan jelaskan kesalahan nominalnya untuk diproses manual." },
    { id: 6, category: "Event", question: "Apakah event ini mendapatkan rekaman (replay)?", answer: "Ya, hampir seluruh event premium kami menyediakan rekaman materi yang bisa diakses selamanya melalui dashboard Ruang Belajar Anda." },
    { id: 7, category: "Akun", question: "Saya lupa kata sandi, bagaimana cara memulihkannya?", answer: "Klik 'Lupa Password' pada halaman login. Kami akan mengirimkan instruksi pemulihan ke email Anda yang terdaftar." },
    { id: 8, category: "Sertifikat", question: "Nama di sertifikat salah, apakah bisa diperbaiki?", answer: "Tentu. Pastikan profil Anda sudah menggunakan nama yang benar, lalu hubungi Admin untuk melakukan cetak ulang sertifikat secara manual." },
    { id: 9, category: "Pembayaran", question: "Metode pembayaran apa saja yang tersedia?", answer: "Kami mendukung berbagai metode seperti Transfer Bank (VA), E-Wallet (OVO, Dana, LinkAja), hingga QRIS untuk kemudahan transaksi." },
    { id: 10, category: "Event", question: "Di mana saya bisa mendapatkan link zoom/meeting?", answer: "Link meeting akan muncul di halaman detail program pada menu 'Ruang Belajar' minimal 30 menit sebelum acara dimulai." },
    { id: 11, category: "Akun", question: "Apakah satu akun bisa digunakan di banyak perangkat?", answer: "Untuk menjaga keamanan data, kami membatasi login maksimal pada 2 perangkat secara bersamaan." },
    { id: 12, category: "Sertifikat", question: "Apakah sertifikat Amania diakui secara profesional?", answer: "Ya, sertifikat kami dilengkapi dengan identitas unik yang sah dan dapat diverifikasi keasliannya oleh perekrut atau perusahaan." },
    { id: 13, category: "Event", question: "Bagaimana cara mendapatkan materi presentasi pembicara?", answer: "File presentasi (PDF/Slide) biasanya akan diunggah di bagian akses dokumen pada detail kelas setelah acara selesai." },
    { id: 14, category: "Pembayaran", question: "Apakah ada biaya admin untuk setiap transaksi?", answer: "Biaya admin bervariasi tergantung metode pembayaran (payment gateway) yang dipilih, transparan dan dapat dilihat sebelum checkout." }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFaqs.slice(start, start + itemsPerPage);
  }, [filteredFaqs, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setActiveFaq(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20 md:pb-24 selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[400px] md:h-[500px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-[-10%] w-[300px] md:w-[600px] h-[200px] md:h-[400px] bg-indigo-50/50 blur-[80px] md:blur-[100px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 space-y-8 md:space-y-12">
        
        {/* SECTION 1: HERO & SEARCH */}
        <div className="text-center space-y-4 md:space-y-5 px-2 sm:px-0">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1 md:px-3 bg-white border border-slate-200 rounded-full text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Hash size={10} className="text-indigo-500 md:w-3 md:h-3" /> Pusat Bantuan Amania
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Bagaimana kami bisa <br className="sm:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">membantu?</span>
          </h1>
          
          {/* SEARCH BAR */}
          <div className="relative max-w-2xl mx-auto mt-6 md:mt-8 group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-xl md:rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10 md:w-5 md:h-5" size={16} />
            <input 
              type="text"
              placeholder="Cari kendala pendaftaran, pembayaran, atau akun..."
              className="relative w-full bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl py-3 md:py-4 pl-10 md:pl-14 pr-4 md:pr-6 text-xs md:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); 
              }}
            />
          </div>
        </div>

        {/* SECTION 2: COLORFUL CATEGORIES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: CreditCard, label: "Pembayaran", id: "Pembayaran", style: categoryColors["Pembayaran"] },
            { icon: UserCircle, label: "Akun & Profil", id: "Akun", style: categoryColors["Akun"] },
            { icon: Award, label: "Sertifikat", id: "Sertifikat", style: categoryColors["Sertifikat"] },
            { icon: Calendar, label: "Program/Event", id: "Event", style: categoryColors["Event"] },
          ].map((cat, i) => (
            <button 
              key={i} 
              onClick={() => {
                  setSearchTerm(cat.id);
                  setCurrentPage(1);
              }}
              className={`p-4 md:p-6 bg-white border-2 border-slate-100 rounded-xl md:rounded-2xl hover:shadow-md transition-all group flex flex-col items-center text-center cursor-pointer ${cat.style.hoverBorder}`}
            >
              <div className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center mb-2 md:mb-4 transition-transform group-hover:scale-110 shadow-sm border border-white/50 ${cat.style.iconBg}`}>
                <cat.icon size={20} className="md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] md:text-xs font-extrabold text-slate-700">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* SECTION 3: FAQ LIST */}
        <div className="space-y-4 md:space-y-6 pt-2 md:pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 border-b border-slate-100 pb-3 md:pb-4">
            <div className="flex items-center gap-2 md:gap-2.5">
              <ShieldCheck className="text-slate-400 md:w-5 md:h-5" size={16} />
              <h2 className="text-base md:text-lg font-extrabold text-slate-900">Pertanyaan Sering Diajukan</h2>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
              Menampilkan {currentData.length} dari {filteredFaqs.length} hasil
            </span>
          </div>

          <div className="space-y-2.5 md:space-y-3">
            {currentData.length > 0 ? (
              currentData.map((faq, index) => {
                const badgeStyle = categoryColors[faq.category] || categoryColors["Event"];
                const isOpen = activeFaq === index;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={faq.id} 
                    className={`bg-white border rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-slate-300 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm'}`}
                  >
                    <button 
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-4 py-4 md:px-6 md:py-5 flex items-start justify-between text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="pr-4 md:pr-6">
                        <div className="flex items-center gap-2 mb-2 md:mb-2.5">
                          <span className={`text-[8px] md:text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 md:px-2.5 md:py-1 rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {faq.category}
                          </span>
                        </div>
                        <h3 className={`text-xs md:text-sm font-bold leading-snug transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-800'}`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`mt-1 shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-slate-900 border-slate-900 text-white rotate-180' : 'bg-white border-slate-200 text-slate-400'}`}>
                        <ChevronDown size={12} className="md:w-3.5 md:h-3.5" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-6 pb-4 md:pb-6 pt-1 md:pt-2 text-slate-500 text-xs md:text-sm font-medium leading-relaxed border-t border-slate-100">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 md:py-16 bg-white rounded-xl md:rounded-2xl border border-dashed border-slate-300 shadow-sm mx-1 md:mx-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 border border-slate-100">
                  <Search size={20} className="text-slate-400 md:w-6 md:h-6" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1">Topik tidak ditemukan</h3>
                <p className="text-xs md:text-sm font-medium text-slate-500 px-4">Coba gunakan kata kunci lain atau hubungi admin di bawah.</p>
              </div>
            )}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-4 md:pt-6">
              <button 
                onClick={handlePrevPage} disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={14} className="md:w-4 md:h-4" />
              </button>
              
              <div className="flex items-center gap-1 md:gap-1.5 px-1 md:px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-sm ${
                      currentPage === i + 1 
                      ? 'bg-slate-900 text-white border border-slate-900 scale-105' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNextPage} disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight size={14} className="md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>

        {/* SECTION 4: ADMIN CONTACT */}
        <div className="relative bg-slate-900 rounded-2xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 overflow-hidden shadow-2xl border border-slate-800 mt-6 md:mt-8">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-indigo-500/20 blur-[60px] md:blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
            <div className="text-center md:text-left space-y-2 md:space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">Masih butuh bantuan?</h2>
              <p className="text-slate-400 font-medium text-xs md:text-sm lg:text-base max-w-md px-2 md:px-0">
                Jangan ragu untuk menghubungi tim Customer Support Amania. Kami siap memandu Anda secara personal.
              </p>
            </div>
            
            <a 
              href={adminWaLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 md:gap-2.5 px-6 md:px-8 py-3 md:py-4 bg-white hover:bg-indigo-50 text-slate-900 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shrink-0 w-full sm:w-auto text-xs md:text-sm"
            >
              <MessageCircle size={16} className="text-indigo-600 md:w-[18px] md:h-[18px]" />
              Chat Admin Pusat
              <ArrowRight size={14} className="text-slate-400 md:w-4 md:h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}