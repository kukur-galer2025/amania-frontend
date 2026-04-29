"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Clock, ShieldCheck, ArrowRight, 
  Ticket, Calendar, MapPin, CheckCircle2, 
  XCircle, Loader2, UploadCloud, X, ChevronRight, AlertCircle, Sparkles, User, AlertTriangle, Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

export default function TicketDashboardClient() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk modal
  const [reuploadModal, setReuploadModal] = useState<{ isOpen: boolean; regId: number | null }>({ isOpen: false, regId: null });
  const [newProof, setNewProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchMyRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Sesi tidak valid, silakan login ulang");
        return setLoading(false);
      }

      const res = await apiFetch('/my-registrations');
      const json = await res.json();
      
      if (json.success) setRegistrations(json.data);
    } catch (error) {
      toast.error("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyRegistrations(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return toast.error("Maksimal ukuran file adalah 5MB.");
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) return toast.error("Format file tidak didukung.");
      setNewProof(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleReuploadSubmit = async () => {
    if (!newProof || !reuploadModal.regId) return;
    setIsUploading(true);
    const loadToast = toast.loading("Mengunggah dokumen...");
    
    try {
      const formData = new FormData();
      formData.append('payment_proof', newProof);

      const res = await apiFetch(`/registrations/${reuploadModal.regId}/reupload`, {
        method: 'POST',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': '' 
        },
        body: formData
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success("Bukti berhasil diperbarui. Menunggu tinjauan Admin Amania.", { id: loadToast });
        setReuploadModal({ isOpen: false, regId: null });
        setNewProof(null); setProofPreview(null);
        fetchMyRegistrations(); 
      } else {
        toast.error(json.message || "Gagal mengunggah", { id: loadToast });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan server.", { id: loadToast });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
  };

  const totalClasses = registrations.length;
  const pendingClasses = registrations.filter(r => r.status === 'pending').length;
  const activeClasses = registrations.filter(r => r.status === 'verified' || r.tier === 'free').length;

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500 break-words w-full text-center">Menyinkronkan data pendaftaran...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-12 w-full min-w-0 overflow-x-hidden selection:bg-indigo-100">
      
      {/* 🔥 HERO SECTION 🔥 */}
      <div className="relative w-full overflow-hidden bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] border border-slate-800 shadow-sm mt-4 min-w-0">
         <div className="absolute inset-0 opacity-30">
           <img 
             src="https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2070&auto=format&fit=crop" 
             alt="Ticket Dashboard Banner" 
             className="w-full h-full object-cover"
           />
         </div>
         
         <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-slate-900/20" />

         <div className="relative z-10 px-6 py-8 md:px-8 md:py-14 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full min-w-0">
            <div className="max-w-xl min-w-0 w-full">
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-indigo-300 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-3 md:mb-4 backdrop-blur-md shrink-0">
                 <Sparkles size={12} className="shrink-0" /> Dashboard Amania
               </motion.div>
               <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-2 break-words w-full">
                 Pusat Akses Tiket
               </motion.h1>
               <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 text-xs md:text-sm lg:text-base font-medium leading-relaxed break-words w-full">
                 Kelola seluruh pendaftaran, pantau status pembayaran, dan masuk ke ruang kelas Amania Anda.
               </motion.p>
            </div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="shrink-0 w-full md:w-auto">
               <Link href="/events" className="flex items-center justify-center gap-2 w-full px-5 md:px-6 py-2.5 md:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 group min-w-0">
                 <BookOpen size={16} className="shrink-0" /> <span className="hidden xs:inline truncate">Eksplorasi</span> <span className="truncate">Katalog</span>
                 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform shrink-0" />
               </Link>
            </motion.div>
         </div>
      </div>

      {/* STATS SECTION */}
      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm flex md:grid md:grid-cols-3 divide-x md:divide-y-0 divide-slate-200 overflow-x-auto relative z-20 md:-mt-6 mx-0 md:mx-4 lg:mx-8 custom-scrollbar w-auto min-w-0">
        <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors min-w-[200px] md:min-w-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <Ticket size={18} className="md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1 truncate w-full">Total Pendaftaran</p>
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 leading-none truncate w-full">{totalClasses}</p>
          </div>
        </div>
        <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors min-w-[200px] md:min-w-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={18} className="md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1 truncate w-full">Menunggu Verifikasi</p>
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 leading-none truncate w-full">{pendingClasses}</p>
          </div>
        </div>
        <div className="p-4 md:p-6 flex items-center gap-3 md:gap-4 hover:bg-slate-50/50 transition-colors min-w-[200px] md:min-w-0 flex-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck size={18} className="md:w-5 md:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5 md:mb-1 truncate w-full">Tiket Aktif</p>
            <p className="text-xl md:text-3xl font-extrabold text-slate-900 leading-none truncate w-full">{activeClasses}</p>
          </div>
        </div>
      </div>

      {/* LIST TICKETS SECTION */}
      <div className="space-y-4 md:space-y-5 px-1 md:px-0 w-full min-w-0">
        
        {/* 🔥 PENGUMUMAN / CATATAN PENTING 🔥 */}
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-r-xl md:rounded-r-2xl p-4 md:p-5 flex gap-3 md:gap-4 shadow-sm mx-1 md:mx-0 min-w-0 w-auto relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-rose-500/10 rotate-12">
             <AlertTriangle size={100} strokeWidth={2} />
          </div>

          <AlertTriangle size={24} className="text-rose-600 shrink-0 mt-0.5 relative z-10" strokeWidth={2.5} />
          
          <div className="flex flex-col gap-2 w-full min-w-0 text-xs md:text-sm leading-relaxed relative z-10">
            <p className="font-black text-rose-800 uppercase tracking-widest text-[11px] md:text-xs">Catatan Penting</p>
            <ul className="list-none space-y-3.5 text-rose-700/90 font-medium">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <span className="flex-1">
                  <strong>E-Ticket</strong> hanya digunakan apabila event berjalan secara <strong className="text-rose-900 bg-rose-100/80 px-1 rounded uppercase">offline</strong> (tunjukkan E-Ticket ini ke panitia di lokasi pendaftaran ulang).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                <span className="flex-1">
                  Apabila terdapat kendala terkait tiket, pembayaran, atau perubahan data, silakan hubungi Customer Service Amania.
                  <div className="mt-2.5">
                    <a href="https://wa.me/628985477864" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-xs shadow-sm shadow-[#25D366]/30 transition-all active:scale-95 group w-max">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="shrink-0 group-hover:scale-110 transition-transform">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                      </svg>
                      Hubungi Customer Service
                    </a>
                  </div>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <h2 className="text-base md:text-lg font-bold text-slate-900 px-1 md:px-2 mt-2 md:mt-4 break-words w-full">Riwayat Transaksi</h2>
        
        {registrations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 md:p-16 flex flex-col items-center text-center shadow-sm mx-1 md:mx-0 w-auto min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3 md:mb-4 shrink-0">
              <Ticket size={24} className="text-slate-400" />
            </div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 mb-1.5 break-words w-full">Belum ada transaksi</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-6 max-w-md leading-relaxed px-4 md:px-0 break-words w-full">Anda belum mendaftar di program apapun. Mulai perjalanan karir Anda dengan mengikuti kelas pertama di Amania.</p>
            <Link href="/events" className="px-5 md:px-6 py-2.5 bg-slate-900 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm inline-flex items-center gap-2 shrink-0">
               Cari Program <ArrowRight size={14} className="md:w-4 md:h-4 shrink-0" />
            </Link>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {registrations.map((reg, idx) => {
              const isApproved = reg.status === 'verified' || reg.tier === 'free';
              
              const isSuperadmin = !reg.event?.organizer || reg.event?.organizer?.role === 'superadmin';
              const organizerName = isSuperadmin ? 'Amania Official' : reg.event?.organizer?.name;

              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} key={reg.id} 
                  className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden group mx-1 md:mx-0 w-auto min-w-0"
                >
                  <div className="p-4 md:p-5 flex flex-col lg:flex-row gap-4 md:gap-6 items-start lg:items-center w-full min-w-0">
                    
                    {/* GAMBAR BANNER KELAS */}
                    <div className="w-full lg:w-56 h-40 sm:h-48 lg:h-32 rounded-lg md:rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center p-2">
                      {reg.event?.image ? (
                        <>
                          <div className="absolute inset-0 z-0">
                            <img src={`${STORAGE_URL}/${reg.event.image}`} className="w-full h-full object-cover blur-md opacity-40 scale-110" alt="blur-bg"/>
                          </div>
                          <img src={`${STORAGE_URL}/${reg.event.image}`} alt={reg.event.title} className="relative z-10 w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-lg" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><BookOpen size={24} className="md:w-7 md:h-7" /></div>
                      )}
                      
                      <div className="absolute top-2 left-2 z-20 lg:hidden flex gap-1.5 min-w-0">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50/90 backdrop-blur-sm text-emerald-700 border border-emerald-200/50 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm shrink-0 max-w-[120px]">
                            <CheckCircle2 size={10} className="shrink-0" /> <span className="truncate">Aktif</span>
                          </span>
                        ) : reg.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50/90 backdrop-blur-sm text-amber-700 border border-amber-200/50 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm shrink-0 max-w-[120px]">
                            <Clock size={10} className="shrink-0" /> <span className="truncate">Validasi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50/90 backdrop-blur-sm text-rose-700 border border-rose-200/50 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm shrink-0 max-w-[120px]">
                            <XCircle size={10} className="shrink-0" /> <span className="truncate">Ditolak</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 w-full min-w-0 space-y-2.5 md:space-y-3">
                      <div className="hidden lg:flex flex-wrap items-center gap-2 min-w-0 w-full">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <CheckCircle2 size={12} className="shrink-0" /> Aktif
                          </span>
                        ) : reg.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <Clock size={12} className="shrink-0" /> Menunggu Validasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                            <XCircle size={12} className="shrink-0" /> Ditolak
                          </span>
                        )}
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0">
                          {reg.tier === 'premium' ? 'VIP Access' : 'Basic'}
                        </span>
                      </div>
                      
                      <div className="min-w-0 w-full">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 lg:line-clamp-none break-words w-full">
                          {reg.event?.title || 'Program Tidak Tersedia'}
                        </h3>
                        <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1 truncate w-full">
                           <User size={10} className="text-indigo-400 shrink-0"/> {organizerName} {isSuperadmin && <ShieldCheck size={10} className="text-emerald-500 shrink-0" />}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 lg:gap-5 text-[11px] md:text-xs font-semibold text-slate-500 min-w-0 w-full flex-wrap">
                        <span className="flex items-center gap-1.5 min-w-0 shrink-0">
                          <Calendar size={14} className="text-slate-400 shrink-0"/> 
                          <span className="truncate">{reg.event ? new Date(reg.event.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                        </span>
                        
                        <span className="flex items-center gap-1.5 min-w-0 shrink-0">
                          <Clock size={14} className="text-slate-400 shrink-0"/> 
                          <span className="truncate">{reg.event ? `${formatTime(reg.event.start_time)} - ${formatTime(reg.event.end_time)} WIB` : '-'}</span>
                        </span>

                        <span className="flex items-center gap-1.5 min-w-0 shrink-0">
                          <MapPin size={14} className="text-slate-400 shrink-0"/> 
                          <span className="truncate max-w-[200px] sm:max-w-[150px] md:max-w-[200px]">{reg.event?.venue || '-'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto flex flex-col justify-center items-start lg:items-end gap-3 md:gap-4 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 md:pt-4 lg:pt-0 lg:pl-6 min-w-0 h-full">
                      <div className="text-left lg:text-right min-w-0 w-full">
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 md:mb-1 truncate w-full">Total Tagihan</p>
                        <p className="text-base md:text-lg font-extrabold text-slate-900 truncate w-full">Rp {parseFloat(reg.total_amount).toLocaleString('id-ID')}</p>
                      </div>
                      
                      {/* 🔥 TOMBOL ACTION 🔥 */}
                      <div className="flex flex-row lg:flex-col gap-2 w-full">
                        {isApproved ? (
                          <>
                            <Link 
                              href={`/my-events/${reg.event?.slug || reg.event?.id}`} 
                              className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-md shadow-indigo-600/20 group/btn shrink-0 min-w-0"
                            >
                              <Video size={14} className="shrink-0 group-hover/btn:scale-110 transition-transform" /> 
                              <span className="truncate">Masuk Kelas</span>
                            </Link>
                            <Link 
                              href={`/dashboard/ticket/${reg.event?.slug}`} 
                              className="flex-1 lg:w-full inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-colors shadow-sm group/btn shrink-0 min-w-0"
                            >
                              <Ticket size={14} className="shrink-0" /> 
                              <span className="truncate">E-Ticket</span>
                            </Link>
                          </>
                        ) : reg.status === 'pending' ? (
                          <button disabled className="w-full inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg md:rounded-xl text-[10px] md:text-xs font-semibold cursor-not-allowed shrink-0 min-w-0">
                            <Loader2 size={12} className="animate-spin md:w-3.5 md:h-3.5 shrink-0" /> <span className="truncate">Sedang Diproses</span>
                          </button>
                        ) : (
                          <button disabled className="w-full inline-flex items-center justify-center px-3 md:px-5 py-2 md:py-2.5 bg-rose-50 text-rose-400 border border-rose-100 rounded-lg md:rounded-xl text-[10px] md:text-xs font-semibold cursor-not-allowed shrink-0 min-w-0">
                            <span className="truncate">Dibatalkan</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {reg.status === 'rejected' && (
                    <div className="bg-rose-50/80 border-t border-rose-100 px-4 md:px-5 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 w-full min-w-0">
                      <div className="flex items-start gap-2.5 md:gap-3 w-full min-w-0">
                        <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5 md:w-[18px] md:h-[18px]" />
                        <div className="min-w-0 w-full">
                          <p className="text-[11px] md:text-xs font-bold text-rose-900 break-words w-full">Pembayaran ditolak</p>
                          <p className="text-[10px] md:text-[11px] font-medium text-rose-700 mt-0.5 md:mt-1 leading-relaxed break-words w-full">{reg.rejection_reason || 'Bukti transfer tidak terbaca atau nominal tidak sesuai tagihan.'}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setReuploadModal({ isOpen: true, regId: reg.id }); setNewProof(null); setProofPreview(null); }}
                        className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-md md:rounded-lg text-[10px] md:text-xs font-semibold transition-colors shadow-sm min-w-0"
                      >
                        <UploadCloud size={14} className="md:w-3.5 md:h-3.5 shrink-0" /> <span className="truncate">Unggah Ulang Bukti</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* MODAL RE-UPLOAD */}
      <AnimatePresence>
        {reuploadModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm w-full min-w-0"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 10, opacity: 0 }} 
              className="bg-white rounded-xl md:rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 min-w-0"
            >
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex justify-between items-center w-full min-w-0">
                <h2 className="text-sm md:text-base font-bold text-slate-900 break-words w-full">Unggah Ulang Bukti Transfer</h2>
                <button onClick={() => setReuploadModal({ isOpen: false, regId: null })} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 md:p-1.5 rounded-lg transition-colors shrink-0">
                  <X size={16} className="md:w-[18px] md:h-[18px]" />
                </button>
              </div>

              <div className="p-5 md:p-6 w-full min-w-0">
                <p className="text-xs md:text-sm font-medium text-slate-500 mb-4 md:mb-5 leading-relaxed break-words w-full">
                  Harap unggah ulang bukti transfer Anda. Pastikan gambar tidak buram, serta nama pengirim dan nominal terlihat dengan jelas.
                </p>
                
                <div 
                  onClick={() => fileRef.current?.click()} 
                  className={`w-full h-36 md:h-44 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative mb-2 min-w-0 ${proofPreview ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
                >
                  {proofPreview ? (
                    <>
                      <img src={proofPreview} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity backdrop-blur-sm w-full h-full">
                        <span className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-semibold text-slate-900 shadow-sm flex items-center gap-1.5 md:gap-2 shrink-0 max-w-[90%]"><UploadCloud size={14} className="shrink-0"/> <span className="truncate">Ganti Gambar</span></span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-500 p-4 w-full min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm shrink-0">
                        <UploadCloud size={18} className="text-slate-400 md:w-5 md:h-5 shrink-0" />
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-slate-700 break-words w-full">Pilih file untuk diunggah</p>
                      <p className="text-[9px] md:text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider truncate w-full">Format JPG, PNG (Maks 5MB)</p>
                    </div>
                  )}
                  <input type="file" ref={fileRef} onChange={handleFileChange} accept="image/jpeg, image/png" className="hidden" />
                </div>
              </div>

              <div className="px-5 md:px-6 py-3.5 md:py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 md:gap-3 w-full min-w-0">
                <button onClick={() => setReuploadModal({ isOpen: false, regId: null })} className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-slate-200 text-xs md:text-sm font-medium text-slate-700 rounded-lg md:rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0 min-w-0">
                  <span className="truncate">Batal</span>
                </button>
                <button 
                  onClick={handleReuploadSubmit} disabled={isUploading || !newProof}
                  className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-slate-900 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-semibold hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 min-w-0"
                >
                  {isUploading && <Loader2 size={14} className="animate-spin md:w-4 md:h-4 shrink-0" />}
                  <span className="truncate">{isUploading ? 'Menyimpan...' : 'Kirim Dokumen'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}