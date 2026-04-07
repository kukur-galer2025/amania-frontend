"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, Eye, Search, 
  Loader2, Ticket, X, Mail, User, CreditCard, 
  AlertTriangle, MessageSquare, Filter, Calendar, MapPin, Hash, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Utama
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  
  // State Filter
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State Alasan Penolakan
  const [rejectionReason, setRejectionReason] = useState('');

  // 🔗 AMBIL STORAGE URL DARI .ENV
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  // State Modal Konfirmasi
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: number | null;
    action: 'verify' | 'reject' | null;
    title: string;
    desc: string;
  }>({
    isOpen: false, id: null, action: null, title: '', desc: ''
  });

  const fetchRegistrations = async () => {
    try {
      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch('/admin/registrations');
      const json = await res.json();
      if (json.success) setRegistrations(json.data);
    } catch (error) {
      toast.error("Gagal mengambil data pendaftar");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const selectedDetail = registrations.find(r => r.id === selectedDetailId) || null;

  const uniqueEvents = Array.from(new Set(registrations.map(r => r.event?.id)))
    .map(id => registrations.find(r => r.event?.id === id)?.event)
    .filter(Boolean);

  const triggerConfirm = (id: number, action: 'verify' | 'reject') => {
    setRejectionReason(''); 
    setConfirmModal({
      isOpen: true,
      id: id,
      action: action,
      title: action === 'verify' ? 'Verifikasi Pendaftaran?' : 'Tolak Pendaftaran?',
      desc: action === 'verify' 
        ? 'Peserta akan menerima tiket aktif dan dapat mengakses ruang kelas.' 
        : 'Berikan alasan penolakan agar peserta dapat memahami kendala pembayarannya.'
    });
  };

  // 🔥 OPTIMISTIC UPDATE YANG AMAN 🔥
  const executeAction = async () => {
    if (!confirmModal.id || !confirmModal.action) return;
    
    if (confirmModal.action === 'reject' && rejectionReason.trim().length < 5) {
      toast.error("Mohon berikan alasan penolakan (min 5 karakter).");
      return;
    }
    
    const { id, action } = confirmModal;
    const currentReason = rejectionReason;
    
    setConfirmModal({ ...confirmModal, isOpen: false });
    
    // Simpan status sebelum ada error
    const backupRegistrations = [...registrations];
    
    // Update State secara lokal agar instan
    setRegistrations(prev => 
      prev.map(reg => {
        if (reg.id === id) {
          return { 
            ...reg, 
            status: action === 'verify' ? 'verified' : 'rejected',
            rejection_reason: action === 'reject' ? currentReason : null,
            ticket_code: action === 'verify' && !reg.ticket_code ? 'AM-PROCESSING' : reg.ticket_code
          };
        }
        return reg;
      })
    );
    
    setSelectedDetailId(null);
    
    const loadToast = toast.loading("Memproses di server...");
    
    try {
      const payload = action === 'reject' ? { reason: currentReason } : {};

      // 🔥 PENGGUNAAN APIFETCH 🔥
      const res = await apiFetch(`/admin/registrations/${id}/${action}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        
        // 🔥 UPDATE AMAN: Pertahankan objek event & user agar teks tidak jadi "Event Dihapus" 🔥
        setRegistrations(prev => prev.map(reg => {
          if (reg.id === id) {
             return {
               ...reg,
               ...json.data,
               event: reg.event, // GARANSI event tidak hilang
               user: reg.user // GARANSI user tidak hilang
             };
          }
          return reg;
        }));
      } else {
        // Rollback
        setRegistrations(backupRegistrations);
        toast.error(json.message || "Gagal memproses", { id: loadToast });
      }
    } catch (error) {
      setRegistrations(backupRegistrations);
      toast.error("Terjadi kesalahan jaringan", { id: loadToast });
    }
  };

  // Filter Data
  const filteredData = useMemo(() => registrations.filter(reg => {
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesEvent = filterEvent === 'all' || reg.event_id?.toString() === filterEvent;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      reg.name?.toLowerCase().includes(searchLower) ||
      reg.email?.toLowerCase().includes(searchLower) ||
      reg.ticket_code?.toLowerCase().includes(searchLower) ||
      reg.event?.title?.toLowerCase().includes(searchLower);
      
    return matchesStatus && matchesEvent && matchesSearch;
  }), [registrations, filterStatus, filterEvent, searchQuery]);

  if (loading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 md:gap-4">
      <Loader2 className="animate-spin text-slate-400 md:w-8 md:h-8" size={28} />
      <span className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Data Registrasi...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-24">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 md:mt-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Kelola Registrasi</h1>
          <p className="mt-1 text-xs md:text-sm text-slate-500">Verifikasi pendaftaran peserta dan validasi bukti pembayaran tiket.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Segmented Status Filter */}
          <div className="flex p-0.5 bg-slate-100/80 border border-slate-200 rounded-lg overflow-x-auto custom-scrollbar w-full sm:w-auto">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'verified', label: 'Terverifikasi' },
              { id: 'rejected', label: 'Ditolak' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md transition-all whitespace-nowrap ${
                  filterStatus === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Select Event Filter */}
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" size={14} />
            <select 
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full sm:w-[200px] bg-white border border-slate-200 rounded-lg py-2.5 md:py-3 pl-9 pr-3 text-xs md:text-sm font-medium text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none shadow-sm truncate cursor-pointer"
            >
              <option value="all">Semua Program Event</option>
              {uniqueEvents.map((ev: any) => (
                <option key={ev.id} value={ev.id.toString()}>{ev.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" size={14} />
          <input 
            type="text" 
            placeholder="Cari nama, email, tiket..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 md:py-3 pl-9 pr-3 text-xs md:text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner transition-all"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200 min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Info Peserta</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Program & Kelas</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tindakan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredData.length > 0 ? filteredData.map((reg) => {
                
                // 🔥 LOGIKA TIPE AKSES 🔥
                const isFree = parseFloat(reg.total_amount) === 0;
                const isPremium = reg.tier === 'premium';
                
                let tierLabel = '';
                if (isPremium) {
                   tierLabel = isFree ? 'VIP (Free)' : 'VIP';
                } else {
                   tierLabel = isFree ? 'Basic (Free)' : 'Basic';
                }

                return (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors group">
                    
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-bold text-slate-900 truncate max-w-[200px]">{reg.name}</div>
                      <div className="text-[10px] md:text-[11px] text-slate-500 flex items-center gap-1 md:gap-1.5 mt-0.5 truncate">
                        <Mail size={10} className="text-slate-400 md:w-3 md:h-3" /> {reg.email}
                      </div>
                    </td>
                    
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="text-xs md:text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-[250px]" title={reg.event?.title}>
                        {reg.event?.title || <span className="text-rose-500 italic">Event Dihapus</span>}
                      </div>
                      <div className="flex items-center gap-1.5 md:gap-2 mt-1 md:mt-1.5">
                         <span className={`inline-flex items-center px-1.5 md:px-2 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase tracking-widest border ${isPremium ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                           {tierLabel}
                         </span>
                         <span className="text-[10px] md:text-[11px] font-bold text-slate-600">
                           {isFree ? 'Gratis' : `Rp ${parseFloat(reg.total_amount).toLocaleString('id-ID')}`}
                         </span>
                      </div>
                    </td>
                    
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                      {reg.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          <CheckCircle2 size={10} className="md:w-3 md:h-3" /> Diverifikasi
                        </span>
                      )}
                      {reg.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20">
                          <XCircle size={10} className="md:w-3 md:h-3" /> Ditolak
                        </span>
                      )}
                      {reg.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          <Loader2 size={10} className="animate-spin md:w-3 md:h-3" /> Menunggu
                        </span>
                      )}
                    </td>
                    
                    <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap text-right">
                       <button 
                         onClick={() => setSelectedDetailId(reg.id)}
                         className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-[10px] md:text-xs font-bold transition-colors shadow-sm"
                       >
                         <Eye size={12} className="text-slate-400 md:w-3.5 md:h-3.5" /> Detail
                       </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-16 md:py-20 text-center">
                    <Search size={32} className="mx-auto mb-3 md:mb-4 text-slate-300 md:w-10 md:h-10" />
                    <h3 className="text-xs md:text-sm font-bold text-slate-900">Tidak ada pendaftar</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedDetail && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedDetailId(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-2xl relative max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200"
              onClick={(e) => e.stopPropagation()} 
            >
              <div className="px-5 md:px-6 py-3.5 md:py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 md:gap-3">
                  <h2 className="text-base md:text-lg font-bold text-slate-900">Detail Pendaftaran</h2>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${
                    selectedDetail.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                    selectedDetail.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedDetail.status}
                  </span>
                </div>
                <button onClick={() => setSelectedDetailId(null)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors p-1.5 rounded-lg">
                  <X size={18} className="md:w-5 md:h-5" />
                </button>
              </div>

              <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-5 md:space-y-6 custom-scrollbar">
                
                {selectedDetail.status === 'rejected' && selectedDetail.rejection_reason && (
                  <div className="bg-rose-50 border border-rose-100 p-3 md:p-4 rounded-xl flex items-start gap-2.5 md:gap-3">
                    <MessageSquare size={16} className="text-rose-500 shrink-0 mt-0.5 md:w-[18px] md:h-[18px]" />
                    <div>
                      <p className="text-[10px] md:text-xs font-bold text-rose-900 mb-0.5">Catatan Penolakan Admin</p>
                      <p className="text-[11px] md:text-sm font-medium text-rose-700 leading-relaxed">"{selectedDetail.rejection_reason}"</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Ticket size={14} className="text-indigo-500 md:w-4 md:h-4" /> Informasi Kelas
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid gap-4">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar size={10} className="text-slate-400 md:w-3 md:h-3"/> Program</p>
                      <p className="text-xs md:text-sm font-bold text-slate-900">{selectedDetail.event?.title || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Hash size={10} className="text-slate-400 md:w-3 md:h-3"/> Kode Tiket</p>
                         <p className="text-xs md:text-sm font-mono font-bold text-slate-900">{selectedDetail.ticket_code || 'Belum Digenerate'}</p>
                       </div>
                       <div>
                         <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldCheck size={10} className="text-slate-400 md:w-3 md:h-3"/> Tipe Akses</p>
                         <p className="text-xs md:text-sm font-bold text-slate-900 uppercase">
                            {selectedDetail.tier === 'premium' 
                              ? (parseFloat(selectedDetail.total_amount) === 0 ? 'VIP (Free)' : 'VIP') 
                              : (parseFloat(selectedDetail.total_amount) === 0 ? 'Basic (Free)' : 'Basic')
                            }
                         </p>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                   <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                     <User size={14} className="text-blue-500 md:w-4 md:h-4" /> Data Peserta
                   </h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-white px-2">
                     <div>
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Lengkap</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{selectedDetail.name}</p>
                     </div>
                     <div>
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Alamat Email</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900 truncate">{selectedDetail.email}</p>
                     </div>
                     <div className="sm:col-span-2">
                       <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Waktu Pendaftaran</p>
                       <p className="text-xs md:text-sm font-bold text-slate-900">
                          {new Date(selectedDetail.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })} WIB
                       </p>
                     </div>
                   </div>
                </div>

                {parseFloat(selectedDetail.total_amount) > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] md:text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CreditCard size={14} className="text-emerald-500 md:w-4 md:h-4" /> Detail Pembayaran
                    </h3>
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between mb-2">
                       <span className="text-[10px] md:text-xs font-bold text-slate-600 uppercase tracking-wider">Total Dibayar</span>
                       <span className="text-base md:text-lg font-black text-emerald-700">Rp {parseFloat(selectedDetail.total_amount).toLocaleString('id-ID')}</span>
                    </div>

                    <div>
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Bukti Transfer:</p>
                      {selectedDetail.payment_proof ? (
                        <div 
                           onClick={() => setSelectedProof(`${STORAGE_URL}/${selectedDetail.payment_proof}`)}
                           className="relative w-full h-32 md:h-48 bg-slate-100 rounded-xl overflow-hidden cursor-pointer border border-slate-200 group"
                        >
                           <img src={`${STORAGE_URL}/${selectedDetail.payment_proof}`} alt="Bukti Bayar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <span className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 shadow-sm"><Eye size={14} className="md:w-4 md:h-4"/> Lihat Penuh</span>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full py-8 md:py-10 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[10px] md:text-xs font-bold">
                          Belum ada bukti transfer diunggah.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {selectedDetail.status === 'pending' && (
                <div className="px-5 md:px-6 py-4 md:py-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => triggerConfirm(selectedDetail.id, 'reject')}
                    className="flex-1 py-2.5 md:py-3 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <XCircle size={16} className="md:w-[18px] md:h-[18px]" /> Tolak 
                  </button>
                  <button 
                    onClick={() => triggerConfirm(selectedDetail.id, 'verify')}
                    className="flex-1 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]" /> Verifikasi Valid
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl md:rounded-3xl shadow-xl max-w-sm w-full overflow-hidden border border-slate-200"
            >
              <div className="p-6 md:p-8 text-center border-b border-slate-100">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center mb-4 md:mb-5 border-[6px] shadow-inner ${
                  confirmModal.action === 'verify' ? 'bg-emerald-50 text-emerald-600 border-emerald-50/50' : 'bg-rose-50 text-rose-600 border-rose-50/50'
                }`}>
                  {confirmModal.action === 'verify' ? <CheckCircle2 size={24} className="md:w-8 md:h-8" /> : <AlertTriangle size={24} className="md:w-8 md:h-8" />}
                </div>
                <h3 className="text-lg md:text-xl font-black text-slate-900 mb-1.5 md:mb-2">{confirmModal.title}</h3>
                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed px-2">{confirmModal.desc}</p>
              </div>

              <div className="p-6 md:p-8 bg-slate-50/50">
                {confirmModal.action === 'reject' && (
                  <div className="mb-5 md:mb-6">
                     <label className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Alasan Penolakan</label>
                     <textarea 
                       value={rejectionReason}
                       onChange={(e) => setRejectionReason(e.target.value)}
                       placeholder="Contoh: Bukti transfer tidak terbaca..."
                       className="w-full p-3 md:p-4 bg-white border border-slate-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 rounded-xl text-xs md:text-sm font-medium outline-none transition-all min-h-[100px] resize-none shadow-sm"
                     />
                  </div>
                )}

                <div className="flex gap-3 md:gap-4">
                  <button 
                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    className="flex-1 py-2.5 md:py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs md:text-sm font-bold transition-colors shadow-sm"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={executeAction}
                    className={`flex-1 py-2.5 md:py-3 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-sm ${
                      confirmModal.action === 'verify' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    }`}
                  >
                    Konfirmasi
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProof && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
            onClick={() => setSelectedProof(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              className="relative max-w-3xl w-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()} 
            >
              <button onClick={() => setSelectedProof(null)} className="absolute -top-12 md:-top-16 right-0 p-2 md:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                <X size={20} className="md:w-6 md:h-6" />
              </button>
              <img src={selectedProof} alt="Bukti Transfer Penuh" className="w-full max-h-[85vh] object-contain rounded-xl md:rounded-2xl shadow-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
    </div>
  );
}