"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { 
  ArrowLeft, Download, Calendar, MapPin, 
  Clock, User, Ticket, Loader2, AlertCircle, 
  CheckCircle2, Hash, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import { apiFetch } from '@/app/utils/api'; 

// 🔥 PROP `slug` DITERIMA DARI SERVER PAGE 🔥
export default function ETicketClient({ slug }: { slug: string }) {
  const router = useRouter();
  
  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    // 🔥 Menggunakan slug dari props langsung 🔥
    if (!slug) return; 

    const fetchTicketDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Sesi berakhir, silakan login.");
          return router.push('/login');
        }

        const res = await apiFetch('/my-registrations');
        const json = await res.json();
        
        if (json.success) {
          // Cari tiket yang sesuai dengan slug dari props
          const currentTicket = json.data.find((reg: any) => reg.event.slug === slug);
          if (currentTicket) {
            setTicketData(currentTicket);
          } else {
            setTicketData(null);
          }
        }
      } catch (error) {
        toast.error("Gagal mengambil data tiket.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicketDetail();
  }, [slug, router]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('premium-ticket-visual');
    if (!element || !ticketData) return;

    setIsDownloading(true);
    const toastId = toast.loading("Mempersiapkan E-Ticket Anda...");

    try {
      const dataUrl = await toPng(element, { 
        quality: 1, 
        pixelRatio: 4, 
        backgroundColor: '#ffffff',
        style: { transform: 'scale(1)', transformOrigin: 'top left', margin: '0' } 
      });
      
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [210, 84] }); 
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 84);
      pdf.save(`Amania_Ticket_${ticketData.ticket_code}.pdf`); 
      
      toast.success("E-Ticket berhasil diunduh!", { id: toastId });
    } catch (error) {
      toast.error("Gagal merender PDF.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 w-full min-w-0">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500 break-words">Memuat E-Ticket Anda...</span>
    </div>
  );

  if (!ticketData || ticketData.status === 'rejected') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4 w-full min-w-0">
      <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mb-5 md:mb-6 shrink-0">
        <AlertCircle size={28} className="text-rose-500" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 break-words w-full">Tiket Tidak Tersedia</h2>
      <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6 md:mb-8 break-words w-full">Pendaftaran untuk kelas ini tidak ditemukan atau akses Anda telah ditolak oleh sistem.</p>
      <button onClick={() => router.push('/dashboard/ticket')} className="px-5 md:px-6 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-medium text-slate-700 rounded-lg shadow-sm transition-colors shrink-0">
        Kembali ke Dashboard
      </button>
    </div>
  );

  if (ticketData.status === 'pending') return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-md mx-auto px-4 w-full min-w-0">
      <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mb-5 md:mb-6 shrink-0">
        <Clock size={28} className="text-amber-500" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-2 break-words w-full">Menunggu Verifikasi Admin</h2>
      <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-6 md:mb-8 break-words w-full">E-Ticket akan diterbitkan di halaman ini segera setelah pembayaran Anda berhasil dikonfirmasi oleh Admin Amania (Maks. 1x24 jam).</p>
      <button onClick={() => router.push('/dashboard/ticket')} className="px-5 md:px-6 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-medium text-slate-700 rounded-lg shadow-sm transition-colors shrink-0">
        Kembali ke Dashboard
      </button>
    </div>
  );

  const eventDate = new Date(ticketData.event?.start_time);
  
  // 🔥 LOGIKA ORGANIZER 🔥
  const isSuperadmin = !ticketData.event?.organizer || ticketData.event?.organizer?.role === 'superadmin';
  const organizerName = isSuperadmin ? 'Amania Official' : ticketData.event?.organizer?.name;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-5xl mx-auto pb-12 pt-2 md:pt-4 px-2 sm:px-0 w-full min-w-0 overflow-x-hidden">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-10 w-full min-w-0">
        <button onClick={() => router.push('/dashboard/ticket')} className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-semibold text-slate-700 rounded-lg shadow-sm transition-colors shrink-0">
          <ArrowLeft size={16} className="text-slate-400 md:w-4 md:h-4" /> Kembali
        </button>
        
        <button 
          onClick={handleDownloadPDF} disabled={isDownloading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs md:text-sm font-bold transition-colors shadow-sm disabled:opacity-70 shrink-0"
        >
          {isDownloading ? <Loader2 size={16} className="animate-spin md:w-4 md:h-4 shrink-0" /> : <Download size={16} className="md:w-4 md:h-4 shrink-0" />}
          <span className="truncate">{isDownloading ? 'Memproses PDF...' : 'Unduh PDF Tiket'}</span>
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-8 custom-scrollbar flex justify-start sm:justify-center rounded-2xl min-w-0">
        <article 
          id="premium-ticket-visual" 
          style={{ width: '850px', minWidth: '850px', height: '340px', minHeight: '340px' }}
          className="bg-white rounded-2xl shadow-md flex relative shrink-0 border border-slate-200 overflow-hidden font-sans mx-auto"
        >
          <section className="w-[580px] h-full flex flex-col justify-between p-8 bg-white relative z-10 shrink-0">
            <header className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 overflow-hidden rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100 shadow-sm">
                  <img src="/logo-amania.png" alt="Amania" className="w-full h-full object-contain p-1" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">Amania.id</h2>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Official Event Pass</p>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${ticketData.tier === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {ticketData.tier === 'premium' ? 'VIP Premium Access' : 'General Admission'}
              </div>
            </header>

            <div className="flex-1 flex flex-col justify-center min-h-0 py-1">
              <div className="mb-3 flex items-center gap-2">
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                   <CheckCircle2 size={14} className="text-emerald-500" /> Confirmed Registration
                 </span>
                 {/* 🔥 MENAMPILKAN PENYELENGGARA DI E-TICKET 🔥 */}
                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
                   <User size={12} className="text-indigo-500" /> {organizerName} {isSuperadmin && <ShieldCheck size={12} className="text-emerald-500" />}
                 </span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-[1.2] line-clamp-2 max-w-[95%] tracking-tight break-words">
                {ticketData.event?.title}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-5 border-t border-slate-100 mt-auto">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={12} className="text-indigo-500"/> Tanggal</p>
                <time className="text-sm font-bold text-slate-900 block truncate">
                  {eventDate.toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </time>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12} className="text-amber-500"/> Waktu Sesi</p>
                <time className="text-sm font-bold text-slate-900 block truncate">
                  {eventDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </time>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin size={12} className="text-rose-500"/> Lokasi / Media</p>
                <address className="text-sm font-bold text-slate-900 not-italic truncate w-[95%] block">
                  {ticketData.event?.venue}
                </address>
              </div>
            </div>
          </section>

          <div className="w-0 h-full border-l-[3px] border-dashed border-slate-300 absolute left-[580px] top-0 z-20"></div>
          <div className="w-8 h-8 bg-[#F8FAFC] rounded-full absolute -top-4 left-[580px] -translate-x-1/2 z-20 shadow-inner border-b border-slate-200"></div>
          <div className="w-8 h-8 bg-[#F8FAFC] rounded-full absolute -bottom-4 left-[580px] -translate-x-1/2 z-20 shadow-inner border-t border-slate-200"></div>

          <section className="w-[270px] h-full bg-slate-900 flex flex-col items-center justify-center p-6 relative z-10 text-center shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Scan To Entry</p>
            <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 mb-5">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${ticketData.ticket_code}&margin=0`} 
                alt={`QR Code ${ticketData.ticket_code}`} 
                className="w-[120px] h-[120px] object-contain"
                crossOrigin="anonymous" 
              />
            </div>

            <div className="w-full text-left bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/50 mb-3">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><User size={10}/> Attendee</p>
              <h4 className="text-xs font-bold text-white truncate mb-0.5" title={ticketData.name}>{ticketData.name}</h4>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 font-medium" title={ticketData.email}>{ticketData.email}</p>
            </div>

            <div className="mt-auto">
               <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
                 <Hash size={10} /> ID: {ticketData.ticket_code}
               </p>
            </div>
          </section>
        </article>
      </div>
    </motion.div>
  );
}