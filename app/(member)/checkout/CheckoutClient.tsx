"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // 🔥 GANTI JADI useSearchParams
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, XCircle, ShieldCheck, 
  UploadCloud, Loader2, Image as ImageIcon, Ticket, 
  CreditCard, Camera, Copy, Info, Check, Gem, AlertTriangle, User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function CheckoutClient() {
  const router = useRouter();
  
  // 🔥 AMBIL SLUG DARI URL PARAMETER (?slug=...) 🔥
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ticketType, setTicketType] = useState<'free' | 'premium'>('free');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // STATE OVERLAY SUKSES & ERROR
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showErrorOverlay, setShowErrorOverlay] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (!slug) return; // Tunggu URL terbaca

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Silakan masuk atau daftar terlebih dahulu untuk melakukan checkout.");
      router.push('/login');
      return; 
    }

    const fetchEvent = async () => {
      try {
        const res = await apiFetch(`/events/${slug}`);
        const json = await res.json();
        if (json.success) {
          setEvent(json.data);
          if (json.data.premium_price > 0) setTicketType('premium');
        } else {
          toast.error("Program tidak ditemukan");
        }
      } catch (error) {
        toast.error("Gagal memuat detail checkout");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [slug, router]);

  const priceToPay = event 
    ? (ticketType === 'free' ? (event.basic_price || 0) : (event.premium_price || event.basic_price || 0)) 
    : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return toast.error("File terlalu besar (Maks 5MB)");
      setPaymentProof(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token) { 
      toast.error("Sesi Anda telah habis. Silakan login kembali."); 
      router.push('/login'); 
      return; 
    }
    
    if (priceToPay > 0 && !paymentProof) {
      return toast.error("Harap unggah bukti transfer pembayaran Anda.");
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Memverifikasi pendaftaran...");

    const formData = new FormData();
    formData.append('event_id', event?.id);
    formData.append('tier', ticketType); 
    
    if (priceToPay > 0 && paymentProof) {
      formData.append('payment_proof', paymentProof);
    }

    try {
      const res = await apiFetch('/register-event', {
        method: 'POST',
        body: formData // Otomatis mengirim sebagai FormData tanpa error Boundary
      });

      const json = await res.json();
      
      if (res.ok && json.success !== false) {
        toast.dismiss(loadToast); 
        setSuccessMessage(json.message || "Pendaftaran berhasil!");
        setShowSuccessOverlay(true);

        setTimeout(() => {
            router.push('/dashboard/ticket');
        }, 3500);

      } else {
        toast.dismiss(loadToast);
        setIsSubmitting(false); 

        if (json.message && json.message.toLowerCase().includes('sudah terdaftar')) {
            setErrorMessage(json.message);
            setShowErrorOverlay(true);

            setTimeout(() => {
                router.push('/dashboard/ticket');
            }, 4000);
        } else {
            toast.error(json.message || "Gagal mendaftar.", { duration: 5000 });
        }
      }
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error("Terjadi kesalahan koneksi ke server.");
      setIsSubmitting(false);
    } 
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4 w-full">
      <Loader2 size={32} className="text-indigo-600 animate-spin" />
      <span className="text-sm font-medium text-slate-500 break-words">Mempersiapkan jalur aman Amania...</span>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center w-full min-w-0">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 shrink-0">
         <XCircle size={32} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2 break-words w-full">Program Tidak Ditemukan</h2>
      <p className="text-slate-500 text-sm max-w-md font-medium mb-8 break-words w-full">Tautan checkout mungkin sudah kedaluwarsa atau program telah dihapus.</p>
      <button onClick={() => router.push('/events')} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm shrink-0">
        Kembali ke Katalog Amania
      </button>
    </div>
  );

  // 🔥 LOGIKA ORGANIZER 🔥
  const isSuperadmin = !event.organizer || event.organizer.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : event.organizer.name;
  const organizerAvatar = !isSuperadmin && event.organizer?.avatar ? `${STORAGE_URL}/${event.organizer.avatar}` : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans overflow-x-hidden w-full">
      
      {/* ==================================================== */}
      {/* OVERLAY SUKSES */}
      {/* ==================================================== */}
      <AnimatePresence>
        {showSuccessOverlay && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center w-full min-w-0"
            >
                <motion.div 
                    initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-100 shrink-0"
                >
                    <Check size={48} strokeWidth={3} />
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 break-words w-full"
                >
                    Pendaftaran Berhasil!
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="text-slate-500 font-medium max-w-md mx-auto text-sm md:text-base leading-relaxed break-words w-full"
                >
                    {successMessage}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                    className="mt-8 md:mt-10 flex items-center gap-2 text-slate-400 text-xs md:text-sm font-semibold shrink-0"
                >
                    <Loader2 size={16} className="animate-spin text-emerald-500" /> <span className="truncate">Mengarahkan ke Dashboard Tiket...</span>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* OVERLAY ERROR (SUDAH TERDAFTAR) */}
      {/* ==================================================== */}
      <AnimatePresence>
        {showErrorOverlay && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 text-center w-full min-w-0"
            >
                <motion.div 
                    initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100 shrink-0"
                >
                    <AlertTriangle size={48} strokeWidth={2.5} />
                </motion.div>
                
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3 break-words w-full"
                >
                    Pendaftaran Dibatalkan
                </motion.h2>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="text-slate-500 font-medium max-w-md mx-auto text-sm md:text-base leading-relaxed break-words w-full"
                >
                    {errorMessage}
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
                    className="mt-8 md:mt-10 flex items-center gap-2 text-slate-400 text-xs md:text-sm font-semibold shrink-0"
                >
                    <Loader2 size={16} className="animate-spin text-rose-500" /> <span className="truncate">Membuka halaman Tiket Anda...</span>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-900 transition-colors p-1 md:p-0 shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <ShieldCheck size={18} className="text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-900 text-xs md:text-sm tracking-tight truncate">Amania Secure Checkout</span>
            </div>
          </div>
          <div className="text-[10px] md:text-xs font-semibold text-slate-500 flex items-center gap-1 md:gap-1.5 shrink-0 pl-2">
            <CreditCard size={14} /> <span className="hidden sm:inline">Transaksi Aman</span>
          </div>
        </div>
      </nav>

      {/* Kontainer Utama */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-12 items-start w-full min-w-0">
        
        {/* KOLOM KIRI */}
        <div className="space-y-6 md:space-y-8 order-2 lg:order-1 min-w-0 w-full">
          <section className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm w-full overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 w-full">
              <Ticket size={20} className="text-indigo-600 shrink-0" />
              <h2 className="text-sm md:text-base font-bold text-slate-900 break-words w-full">Pilih Kategori Akses</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {/* TIKET BASIC */}
              <div 
                onClick={() => setTicketType('free')}
                className={`relative p-4 md:p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col h-full min-w-0 w-full ${
                  ticketType === 'free' 
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-sm' 
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`absolute top-4 right-4 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${ticketType === 'free' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {ticketType === 'free' && <div className="w-2 h-2 bg-white rounded-full shrink-0" />}
                </div>
                
                <div className="min-w-0 w-full">
                  <span className={`inline-flex w-fit text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-3 truncate ${ticketType === 'free' ? 'text-indigo-600' : 'text-slate-500'}`}>
                    Basic Access
                  </span>
                  <h3 className={`text-xl md:text-2xl font-extrabold mb-4 md:mb-5 break-words w-full ${ticketType === 'free' ? 'text-slate-900' : 'text-slate-700'}`}>
                    {event.basic_price === 0 ? 'Gratis' : `Rp ${event.basic_price.toLocaleString('id-ID')}`}
                  </h3>
                </div>
                
                <ul className="space-y-2.5 md:space-y-3 mt-auto pt-3 md:pt-4 border-t border-slate-100 w-full min-w-0">
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-600 w-full min-w-0">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">Akses Ruang Kelas</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-400 w-full min-w-0">
                    <XCircle size={14} className="shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">Sertifikat Kelulusan</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-400 w-full min-w-0">
                    <XCircle size={14} className="shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">Akses Materi & Rekaman</span>
                  </li>
                </ul>
              </div>

              {/* TIKET VIP */}
              <div 
                onClick={() => { if(event.premium_price > 0) setTicketType('premium') }}
                className={`relative p-4 md:p-5 rounded-xl border-2 transition-all duration-300 flex flex-col h-full min-w-0 w-full ${
                  event.premium_price === 0 || !event.premium_price 
                  ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                  : ticketType === 'premium' 
                    ? 'border-amber-500 bg-amber-50/20 shadow-sm cursor-pointer' 
                    : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                }`}
              >
                {event.premium_price > 0 && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] md:text-[9px] font-bold px-2.5 md:px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <Gem size={10} className="shrink-0"/> VIP
                  </div>
                )}
                
                <div className={`absolute top-4 md:top-5 right-4 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${ticketType === 'premium' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                  {ticketType === 'premium' && <div className="w-2 h-2 bg-white rounded-full shrink-0" />}
                </div>

                <div className="min-w-0 w-full">
                  <span className={`inline-flex w-fit text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-2 md:mb-3 truncate ${ticketType === 'premium' ? 'text-amber-600' : 'text-slate-500'}`}>
                    Full Access
                  </span>
                  <h3 className={`text-xl md:text-2xl font-extrabold mb-4 md:mb-5 break-words w-full ${ticketType === 'premium' ? 'text-slate-900' : 'text-slate-700'}`}>
                    {event.premium_price > 0 ? `Rp ${event.premium_price.toLocaleString('id-ID')}` : 'N/A'}
                  </h3>
                </div>
                
                <ul className="space-y-2.5 md:space-y-3 mt-auto pt-3 md:pt-4 border-t border-slate-100 w-full min-w-0">
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-700 w-full min-w-0">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">Akses Ruang Kelas Penuh</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-700 w-full min-w-0">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">E-Certificate Terverifikasi</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-xs font-medium text-slate-700 w-full min-w-0">
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0 md:w-4 md:h-4 mt-0.5" /> <span className="break-words w-full">Unduh Materi & Rekaman</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION PEMBAYARAN */}
          <AnimatePresence>
            {priceToPay > 0 && (
              <motion.section 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} 
                className="overflow-hidden w-full min-w-0"
              >
                <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 md:space-y-6 w-full min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 border-b border-slate-100 pb-3 md:pb-4 w-full min-w-0">
                    <CreditCard size={20} className="text-indigo-600 shrink-0" />
                    <h2 className="text-sm md:text-base font-bold text-slate-900 break-words w-full">Metode & Bukti Pembayaran</h2>
                  </div>

                  {/* Rekening Tujuan */}
                  <div className="space-y-3 w-full min-w-0">
                    <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider break-words w-full">Transfer Ke Rekening Berikut</label>
                    
                    {((event?.bank_accounts || event?.bankAccounts))?.length > 0 ? (
                      (event.bank_accounts || event.bankAccounts).map((bank: any, idx: number) => {
                        const bankCode = bank.bank_code?.toLowerCase();
                        const localLogoPath = `/logos/${bankCode}.png`; 

                        return (
                          <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group min-w-0 w-full">
                            <div className="flex items-center gap-3 md:gap-4 min-w-0 w-full">
                              {/* Wadah Logo */}
                              <div className="w-12 md:w-14 h-8 md:h-10 bg-white rounded border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden relative">
                                <img 
                                  src={localLogoPath} 
                                  alt={bank.bank_code} 
                                  className="max-h-full max-w-full object-contain relative z-10"
                                  onError={(e) => { 
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      parent.innerHTML = `<span class="text-[10px] font-black text-indigo-600 uppercase">${bank.bank_code?.substring(0, 3)}</span>`;
                                    }
                                  }}
                                />
                              </div>

                              {/* Info Rekening */}
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate w-full">{bank.bank_code}</p>
                                <h4 className="text-xs md:text-sm font-black text-slate-900 tracking-tight break-words w-full">{bank.account_number}</h4>
                                <p className="text-[11px] md:text-xs font-medium text-slate-500 truncate w-full">A/n {bank.account_holder}</p>
                              </div>
                            </div>

                            {/* Tombol Salin */}
                            <button 
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(bank.account_number); 
                                toast.success("Nomor Rekening disalin!");
                              }}
                              className="flex items-center justify-center gap-1.5 md:gap-2 w-full sm:w-auto px-3 md:px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] md:text-xs font-bold text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm mt-1 sm:mt-0 shrink-0"
                            >
                              <Copy size={14} className="md:w-4 md:h-4 shrink-0" /> <span className="truncate">Salin</span>
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 w-full min-w-0">
                          <p className="text-[11px] md:text-xs font-medium text-slate-500 break-words w-full">Menunggu informasi rekening dari Amania.</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Bukti */}
                  <div className="pt-3 md:pt-4 border-t border-slate-100 w-full min-w-0">
                    <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 w-full min-w-0">
                      <Camera size={14} className="text-slate-400 md:w-4 md:h-4 shrink-0" /> <span className="truncate flex-1">Unggah Bukti Transfer <span className="text-rose-500">*</span></span>
                    </label>
                    <div 
                      onClick={() => fileRef.current?.click()} 
                      className={`w-full h-32 md:h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group min-w-0 ${proofPreview ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400'}`}
                    >
                      {proofPreview ? (
                        <>
                          <img src={proofPreview} className="w-full h-full object-cover" alt="Preview" />
                          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm w-full h-full">
                            <span className="bg-white px-3 md:px-4 py-1.5 rounded-md text-[11px] md:text-xs font-semibold flex items-center gap-1.5 md:gap-2 shrink-0 max-w-[90%]"><ImageIcon size={14} className="shrink-0"/> <span className="truncate">Ganti File</span></span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 w-full min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm mx-auto mb-2 md:mb-3 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0">
                            <UploadCloud size={18} className="md:w-5 md:h-5 shrink-0" />
                          </div>
                          <p className="text-[11px] md:text-xs font-semibold text-slate-700 mb-1 break-words w-full">Klik untuk memilih file</p>
                          <p className="text-[9px] md:text-[10px] text-slate-500 truncate w-full">Maks. 5MB (JPG, PNG)</p>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>

                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* KOLOM KANAN (Order Summary) */}
        <aside className="lg:sticky lg:top-24 order-1 lg:order-2 w-full min-w-0">
          <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/40 relative overflow-hidden w-full min-w-0">
            
            <h3 className="text-sm font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 break-words w-full">Ringkasan Pesanan</h3>
            
            {/* Event Info */}
            <div className="flex gap-3 md:gap-4 mb-5 md:mb-6 w-full min-w-0">
              <div className="w-16 md:w-20 h-12 md:h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                {event?.image ? (
                  <img src={`${STORAGE_URL}/${event.image}`} className="w-full h-full object-cover" alt="Thumbnail" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16} className="md:w-5 md:h-5" /></div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <h4 className="font-semibold text-slate-900 text-xs md:text-sm leading-tight truncate w-full">{event?.title}</h4>
                <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
                  <span className={`text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider truncate shrink-0 max-w-[120px] ${ticketType === 'free' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-100 text-amber-700'}`}>
                    {ticketType === 'free' ? 'Basic Access' : 'VIP Access'}
                  </span>
                </div>
              </div>
            </div>

            {/* 🔥 KOTAK ORGANIZER/PENYELENGGARA 🔥 */}
            {event.organizer && (
              <div className="w-full min-w-0 mb-5 md:mb-6 pt-4 md:pt-5 border-t border-slate-100">
                <h3 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <User size={12} className="text-slate-400 shrink-0" /> Penyelenggara
                </h3>
                <div className="flex items-center gap-2.5 w-full min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {organizerAvatar ? (
                      <img src={organizerAvatar} alt={organizerName} className="w-full h-full object-cover rounded-full" />
                    ) : isSuperadmin ? (
                      <img src="/logo-amania.png" alt="Amania" className="w-4 h-4 object-contain" />
                    ) : (
                      <User size={14} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate w-full flex items-center gap-1">
                      {organizerName}
                      {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500 shrink-0" />}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium truncate w-full">
                      {isSuperadmin ? 'Tim Internal Amania' : 'Mitra Amania'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Price Calculation */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-100 w-full min-w-0">
              <div className="flex justify-between items-center text-xs md:text-sm min-w-0 w-full">
                <span className="text-slate-500 font-medium shrink-0">Harga Tiket</span>
                <span className="font-semibold text-slate-900 text-right truncate min-w-0 max-w-[150px]">{priceToPay === 0 ? 'Gratis' : `Rp ${priceToPay.toLocaleString('id-ID')}`}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm min-w-0 w-full">
                <span className="text-slate-500 font-medium shrink-0">Pajak & Layanan</span>
                <span className="font-semibold text-emerald-600 text-right shrink-0">Rp 0</span>
              </div>
              <div className="pt-3 md:pt-4 border-t border-slate-200 flex justify-between items-end min-w-0 w-full">
                <span className="font-bold text-slate-900 text-xs md:text-sm shrink-0">Total Bayar</span>
                <span className="text-xl md:text-2xl font-extrabold text-indigo-600 tracking-tight text-right truncate min-w-0 max-w-[160px] md:max-w-[200px]">
                  {priceToPay === 0 ? 'Rp 0' : `Rp ${priceToPay.toLocaleString('id-ID')}`}
                </span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isSubmitting || showSuccessOverlay || showErrorOverlay}
              className="w-full py-3 md:py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs md:text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 md:gap-2 shadow-sm shrink-0 min-w-0 px-2"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin md:w-4 md:h-4 shrink-0" /> : <ShieldCheck size={16} className="md:w-4 md:h-4 shrink-0" />}
              <span className="truncate">{isSubmitting ? 'Memproses...' : (priceToPay === 0 ? 'Daftar Sekarang' : 'Konfirmasi Pembayaran')}</span>
            </button>

            {priceToPay > 0 && (
              <div className="mt-4 md:mt-5 flex items-start gap-1.5 md:gap-2 text-slate-500 w-full min-w-0">
                <Info size={14} className="shrink-0 mt-0.5 text-slate-400 md:w-3.5 md:h-3.5" />
                <p className="text-[9px] md:text-[10px] leading-relaxed break-words w-full">
                  Proses verifikasi transfer memakan waktu maksimal 1x24 jam kerja Amania.
                </p>
              </div>
            )}
          </div>
        </aside>

      </main>
    </div>
  );
}