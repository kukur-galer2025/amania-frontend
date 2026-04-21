"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, MessageCircle, 
  CreditCard, UserCircle, Award, Calendar, 
  ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, Hash, ArrowLeft, X 
} from 'lucide-react';
import Link from 'next/link';

const categoryColors: Record<string, { bg: string, text: string, border: string, iconBg: string, hoverBorder: string }> = {
  "Pembayaran": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", iconBg: "bg-emerald-100 text-emerald-600", hoverBorder: "hover:border-emerald-300" },
  "Akun": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", iconBg: "bg-blue-100 text-blue-600", hoverBorder: "hover:border-blue-300" },
  "Sertifikat": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", iconBg: "bg-amber-100 text-amber-600", hoverBorder: "hover:border-amber-300" },
  "Program": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", iconBg: "bg-indigo-100 text-indigo-600", hoverBorder: "hover:border-indigo-300" }
};

export default function SupportClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const adminWaLink = "https://wa.me/628122718132?text=Halo%20Admin%20Amania,%20saya%20membutuhkan%20bantuan%20terkait...";

  // 🔥 KONTEN FAQ YANG SUDAH DISESUAIKAN: E-PRODUCT (TRIPAY) VS EVENT (MANUAL ADMIN) 🔥
  const faqs = [
    { id: 1, category: "Pembayaran", question: "Berapa lama proses verifikasi pembayaran?", answer: "Untuk E-Product, verifikasi berjalan otomatis melalui Tripay Gateway dalam 1-5 menit. Sedangkan untuk Event/Kelas Live, verifikasi dilakukan secara manual oleh Admin maksimal 1x24 jam kerja setelah Anda mengunggah bukti transfer." },
    { id: 2, category: "Program", question: "Apakah saya bisa membatalkan pendaftaran event atau E-Product?", answer: "Sesuai Kebijakan Pengembalian Dana (Refund) kami, produk digital dan tiket event yang sudah dibeli bersifat final dan tidak dapat dibatalkan atau di-refund." },
    { id: 3, category: "Sertifikat", question: "Dimana saya bisa mengunduh e-sertifikat kegiatan?", answer: "E-sertifikat akan muncul di menu 'Sertifikat Kelulusan' (jika tersedia untuk event tersebut) setelah Anda menyelesaikan seluruh rangkaian acara dan mengisi absensi kehadiran." },
    { id: 4, category: "Akun", question: "Bagaimana cara mengubah informasi profil saya?", answer: "Anda dapat masuk ke menu 'Kelola Profil' di sidebar dasbor utama untuk memperbarui nama, foto, dan kontak pribadi Anda." },
    { id: 5, category: "Pembayaran", question: "Bagaimana jika saya salah mentransfer nominal pembayaran?", answer: "Untuk E-Product (Tripay), sistem otomatis membatalkan pesanan jika nominal tidak sesuai. Untuk pendaftaran Event (Transfer Manual), segera hubungi Admin melalui tombol WhatsApp di bawah dengan melampirkan bukti transfer agar dapat dibantu verifikasi." },
    { id: 6, category: "Program", question: "Apakah Live Event (Webinar) mendapatkan tayangan ulang?", answer: "Ya, hampir seluruh event live kami menyediakan tayangan ulang (recording) yang bisa diakses selamanya melalui dasbor kelas Anda." },
    { id: 7, category: "Akun", question: "Saya lupa kata sandi, bagaimana cara masuk kembali?", answer: "Klik tombol 'Lupa Password' pada halaman login. Sistem kami akan mengirimkan instruksi pemulihan langsung ke kotak masuk email Anda." },
    { id: 8, category: "Sertifikat", question: "Terdapat kesalahan nama di sertifikat, apakah bisa diperbaiki?", answer: "Tentu. Pastikan profil Anda sudah diperbarui dengan nama yang benar, lalu hubungi tim Admin untuk memproses cetak ulang sertifikat secara manual." },
    { id: 9, category: "Pembayaran", question: "Metode pembayaran apa saja yang diterima?", answer: "Pembelian E-Product mendukung metode otomatis (VA Bank, E-Wallet, QRIS) via Tripay. Sedangkan pendaftaran Event menggunakan metode Transfer Bank Manual yang rekeningnya tertera saat Anda mendaftar." },
    { id: 10, category: "Program", question: "Di mana saya bisa mendapatkan tautan Zoom meeting?", answer: "Tautan (Link) meeting akan muncul secara otomatis di halaman detail event/kelas minimal 30 menit sebelum acara resmi dimulai." },
    { id: 11, category: "Akun", question: "Apakah satu akun Amania boleh diakses oleh beberapa orang?", answer: "Tidak diperbolehkan. Untuk menjaga hak cipta dan keamanan data Anda, sistem kami dapat mendeteksi dan memblokir aktivitas masuk dari lokasi/perangkat yang mencurigakan secara bersamaan." },
    { id: 12, category: "Sertifikat", question: "Apakah sertifikat Amania memiliki kredibilitas?", answer: "Sangat. E-sertifikat kami dilengkapi dengan sistem validasi barcode unik yang dapat dipindai oleh pihak perekrut (HRD) untuk memastikan keasliannya." },
    { id: 13, category: "Program", question: "Bagaimana cara mendapatkan file presentasi pemateri?", answer: "File presentasi (PDF/Slide) biasanya akan diunggah oleh panitia di bagian 'Dokumen Pendukung' pada detail kelas setelah acara selesai." },
    { id: 14, category: "Pembayaran", question: "Apakah ada biaya layanan/admin tambahan?", answer: "Untuk E-Product, terdapat biaya layanan payment gateway (Tripay) yang transparan saat checkout. Untuk Event (Transfer Manual), tidak ada potongan atau biaya admin tambahan selain harga tiket." }
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
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-24 selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* ════ BACKGROUND PATTERN ════ */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-[400px] md:h-[500px] flex justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]" />
        <div className="absolute top-[-20%] w-[400px] md:w-[700px] h-[300px] md:h-[500px] bg-indigo-500/10 blur-[100px] md:blur-[120px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 space-y-8 md:space-y-12">
        
        {/* Tombol Kembali */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-indigo-600 mb-2 transition-colors bg-white px-4 py-2.5 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 hover:border-indigo-200 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Beranda
          </Link>
        </motion.div>

        {/* ════ SECTION 1: HERO & SEARCH ════ */}
        <div className="text-center space-y-4 md:space-y-5 px-2 sm:px-0">
          <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 bg-white border border-slate-200 rounded-full text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest shadow-sm">
            <Hash size={12} className="text-indigo-500" /> Pusat Bantuan Amania
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] drop-shadow-sm">
            Bagaimana kami bisa <br className="sm:hidden"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">membantu?</span>
          </h1>
          
          {/* SEARCH BAR */}
          <div className="relative max-w-2xl mx-auto mt-6 md:mt-8 group">
            <div className="absolute inset-0 bg-indigo-500/10 blur-[30px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10 w-5 h-5 transition-colors group-focus-within:text-indigo-500" strokeWidth={2.5} />
            <input 
              type="text"
              placeholder="Cari kendala kelas, pembayaran, atau akun..."
              className="relative w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
              value={searchTerm}
              onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); 
              }}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full z-10 transition-colors">
                  <X size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ════ SECTION 2: COLORFUL CATEGORIES ════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { icon: CreditCard, label: "Pembayaran", id: "Pembayaran", style: categoryColors["Pembayaran"] },
            { icon: UserCircle, label: "Akun & Profil", id: "Akun", style: categoryColors["Akun"] },
            { icon: Award, label: "Sertifikat", id: "Sertifikat", style: categoryColors["Sertifikat"] },
            { icon: Calendar, label: "Program/Event", id: "Program", style: categoryColors["Program"] },
          ].map((cat, i) => (
            <button 
              key={i} 
              onClick={() => {
                  setSearchTerm(cat.id);
                  setCurrentPage(1);
              }}
              className={`p-4 md:p-6 bg-white border border-slate-200 rounded-[1.25rem] md:rounded-[1.5rem] shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] transition-all duration-300 group flex flex-col items-center text-center cursor-pointer ${cat.style.hoverBorder}`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-4 transition-transform group-hover:scale-110 shadow-inner ${cat.style.iconBg}`}>
                <cat.icon size={22} className="md:w-6 md:h-6" strokeWidth={2.5} />
              </div>
              <span className="text-[11px] md:text-xs font-black text-slate-700 uppercase tracking-wide">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* ════ SECTION 3: FAQ LIST ════ */}
        <div className="space-y-4 md:space-y-6 pt-4 md:pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 border-b border-slate-200 pb-3 md:pb-4">
            <div className="flex items-center gap-2 md:gap-2.5">
              <ShieldCheck className="text-indigo-500 md:w-6 md:h-6" size={20} strokeWidth={2.5} />
              <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Topik Pertanyaan</h2>
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start sm:self-auto">
              Menampilkan {currentData.length} dari {filteredFaqs.length} hasil
            </span>
          </div>

          <div className="space-y-3 md:space-y-4">
            {currentData.length > 0 ? (
              currentData.map((faq, index) => {
                const badgeStyle = categoryColors[faq.category] || categoryColors["Program"];
                const isOpen = activeFaq === index;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    key={faq.id} 
                    className={`bg-white border rounded-[1rem] md:rounded-[1.25rem] overflow-hidden transition-all duration-300 ${isOpen ? 'border-indigo-300 shadow-[0_8px_30px_rgba(79,70,229,0.08)]' : 'border-slate-200 hover:border-indigo-200 shadow-sm'}`}
                  >
                    <button 
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-5 py-4 md:px-6 md:py-5 flex items-start justify-between text-left hover:bg-slate-50 transition-colors group"
                    >
                      <div className="pr-4 md:pr-6">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                            {faq.category}
                          </span>
                        </div>
                        <h3 className={`text-sm md:text-base font-bold leading-snug transition-colors ${isOpen ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`mt-1 shrink-0 w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 ${isOpen ? 'bg-indigo-600 border-indigo-600 text-white rotate-180 shadow-md' : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-500'}`}>
                        <ChevronDown size={14} strokeWidth={2.5} />
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
                          <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1 text-slate-600 text-sm font-medium leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-16 md:py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">Topik tidak ditemukan</h3>
                <p className="text-sm font-medium text-slate-500">Coba gunakan kata kunci lain atau hubungi admin di bawah.</p>
              </div>
            )}
          </div>

          {/* ════ PAGINATION CONTROLS ════ */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-6 md:pt-8">
              <button 
                onClick={handlePrevPage} disabled={currentPage === 1}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronLeft size={18} strokeWidth={2.5} />
              </button>
              
              <div className="flex items-center gap-1.5 px-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      currentPage === i + 1 
                      ? 'bg-slate-900 text-white border border-slate-900 scale-105 shadow-md' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleNextPage} disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 transition-all shadow-sm"
              >
                <ChevronRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

        {/* ════ SECTION 4: ADMIN CONTACT ════ */}
        <div className="relative bg-slate-950 rounded-[2rem] p-6 sm:p-8 md:p-12 overflow-hidden shadow-2xl mt-12 md:mt-16">
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-500/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none -translate-x-1/4 translate-y-1/4" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="text-center md:text-left space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1]">Masih butuh <br className="hidden md:block" /> bantuan admin?</h2>
              <p className="text-slate-400 font-medium text-sm md:text-base max-w-md">
                Jangan ragu untuk menghubungi tim dukungan Amania. Kami siap membantu menyelesaikan kendala teknis Anda.
              </p>
            </div>
            
            <a 
              href={adminWaLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-indigo-50 text-indigo-900 rounded-xl font-bold transition-all hover:-translate-y-1 active:translate-y-0 shadow-[0_10px_25px_rgba(255,255,255,0.15)] shrink-0 w-full sm:w-auto text-sm"
            >
              <MessageCircle size={20} className="text-indigo-600" strokeWidth={2.5} />
              Chat via WhatsApp
              <ArrowRight size={16} className="text-slate-400 ml-2" strokeWidth={2.5} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}