"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, 
  Calendar, MapPin, CreditCard, Link as LinkIcon, 
  Settings, BookOpen, Plus, FileText, Video, Trash2, 
  UserPlus, Camera, AlertTriangle, Users, DollarSign, Award,
  ChevronRight, PlusCircle, AlignLeft, Building, Hash, 
  User, Tag, Star, Clock, Briefcase, Zap, Info, X, Lock
} from 'lucide-react'; 
import { apiFetch } from '@/app/utils/api'; 

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css';

// 🔥 HELPER BARU: MENANGANI TIMEZONE DENGAN BENAR 🔥
const formatForDatetimeLocal = (dateStr: string) => {
  if (!dateStr) return '';
  
  // Jika formatnya dari Laravel mengandung 'Z' (berarti format UTC ISO-8601)
  if (dateStr.endsWith('Z')) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    // Otomatis terjemahkan waktu UTC ke waktu WIB (Lokal Browser)
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  
  // Jika formatnya sudah string biasa seperti "2024-05-09 08:15:00"
  return dateStr.replace(' ', 'T').slice(0, 16);
};

// 🔥 HELPER SUBMIT: Memastikan format Y-m-d H:i:s aman 🔥
const formatSubmitDate = (dt: string) => {
  if (!dt) return '';
  const formatted = dt.replace('T', ' ');
  // Jika panjangnya 16 ("YYYY-MM-DD HH:mm"), tambahkan detik :00
  return formatted.length === 16 ? `${formatted}:00` : formatted;
};

export default function EditEventClient() {
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'detail' | 'material' | 'speaker' | 'bank'>('detail');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State: Detail Event
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quota, setQuota] = useState('');
  const [basicPrice, setBasicPrice] = useState('0');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [certificateLink, setCertificateLink] = useState('');
  const [certificateTier, setCertificateTier] = useState<'all' | 'premium'>('all');
  
  // State Akses Privat
  const [joinLink, setJoinLink] = useState('');
  const [joinInstructions, setJoinInstructions] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State: Array Multi Bank
  const [banks, setBanks] = useState<any[]>([]);

  // State: Materi
  const [materials, setMaterials] = useState<any[]>([]);
  const [matType, setMatType] = useState<'video' | 'file'>('file');
  const [matTitle, setMatTitle] = useState('');
  const [matLink, setMatLink] = useState('');
  const [matAccess, setMatAccess] = useState<'all' | 'premium'>('all');
  const [matFile, setMatFile] = useState<File | null>(null);
  const matFileRef = useRef<HTMLInputElement>(null);

  // State: Speaker
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [spkName, setSpkName] = useState('');
  const [spkRole, setSpkRole] = useState('');
  const [spkPhoto, setSpkPhoto] = useState<File | null>(null);
  const [spkPhotoPreview, setSpkPhotoPreview] = useState<string | null>(null);
  const spkPhotoRef = useRef<HTMLInputElement>(null);

  // State Custom Delete Modal
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: number | null, endpoint: 'materials' | 'speakers' | null}>({ 
    isOpen: false, id: null, endpoint: null 
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // State Validasi 422
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  useEffect(() => {
    if (deleteModal.isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [deleteModal.isOpen]);

  const fetchEventData = async () => {
    if (!eventId) {
       toast.error("ID Event tidak ditemukan di URL");
       setFetching(false);
       return;
    }

    try {
      const res = await apiFetch(`/admin/events/${eventId}`);
      const json = await res.json();
      
      if (json.success) {
        const ev = json.data;
        setTitle(ev.title || ''); 
        setDescription(ev.description || ''); 
        setVenue(ev.venue || '');
        
        // Formatter akan otomatis mendeteksi zona waktu UTC atau Format biasa
        setStartTime(formatForDatetimeLocal(ev.start_time));
        setEndTime(formatForDatetimeLocal(ev.end_time));
        
        setQuota(ev.quota?.toString() || ''); 
        setBasicPrice(ev.basic_price?.toString() || '0'); 
        setPremiumPrice(ev.premium_price?.toString() || ''); 
        setCertificateLink(ev.certificate_link || '');
        setCertificateTier(ev.certificate_tier || 'all'); 
        
        setJoinLink(ev.join_link || '');
        setJoinInstructions(ev.join_instructions || '');

        if (ev.image) setImagePreview(`${STORAGE_URL}/${ev.image}`);
        
        const knownBankCodes = ['bca', 'mandiri', 'bni', 'bri', 'bsi', 'btn', 'cimb', 'danamon', 'permata', 'jago', 'seabank', 'dana', 'gopay', 'ovo', 'shopeepay', 'linkaja'];
        
        if (ev.bank_accounts && ev.bank_accounts.length > 0) {
            const mappedBanks = ev.bank_accounts.map((b: any) => {
               const isKnown = knownBankCodes.includes(b.bank_code);
               return {
                  ...b,
                  bank_code: isKnown ? b.bank_code : 'lainnya',
                  custom_bank_name: isKnown ? '' : b.bank_code 
               };
            });
            setBanks(mappedBanks);
        } else {
            setBanks([{ bank_code: 'bca', account_number: '', account_holder: '', custom_bank_name: '' }]);
        }

        setMaterials(ev.materials || []); 
        setSpeakers(ev.speakers || []);
      }
    } catch { toast.error("Gagal sinkronisasi data"); } finally { setFetching(false); }
  };

  useEffect(() => { 
      if(eventId) fetchEventData(); 
  }, [eventId]);

  const handleBankChange = (index: number, field: string, value: string) => {
    const newBanks = [...banks];
    newBanks[index] = { ...newBanks[index], [field]: value };
    if (field === 'bank_code' && value !== 'lainnya') {
       newBanks[index].custom_bank_name = '';
    }
    setBanks(newBanks);
  };
  
  const addBank = () => setBanks([...banks, { bank_code: 'bca', account_number: '', account_holder: '', custom_bank_name: '' }]);
  const removeBank = (index: number) => setBanks(banks.filter((_, i) => i !== index));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File ditolak! Ukuran gambar maksimal adalah 10MB");
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (validationErrors.image) setValidationErrors(prev => ({ ...prev, image: [] }));
    }
  };

  const handleSaveEvent = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if(!eventId) return;

    const errors: Record<string, string[]> = {};

    if (!title.trim()) errors.title = ["Judul program wajib diisi."];
    if (!description || description === '<p><br></p>') errors.description = ["Deskripsi wajib diisi."];
    if (!venue.trim()) errors.venue = ["Lokasi acara wajib diisi."];
    if (!startTime) errors.start_time = ["Waktu mulai wajib ditentukan."];
    if (!endTime) errors.end_time = ["Waktu selesai wajib ditentukan."];
    
    // Validasi Logika Waktu
    if (startTime && endTime) {
      if (new Date(startTime) >= new Date(endTime)) {
        errors.end_time = ["Waktu selesai harus lebih lambat dari waktu mulai!"];
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Gagal menyimpan! Harap periksa form yang bertanda merah.");
      
      // Auto-switch ke tab detail jika error ada di form utama
      if (activeTab !== 'detail') setActiveTab('detail');
      return;
    }

    setValidationErrors({});
    setSaving(true);
    const loadToast = toast.loading("Menyimpan perubahan...");
    
    const formData = new FormData();
    formData.append('title', title.trim()); 
    formData.append('description', description);
    formData.append('venue', venue.trim()); 
    
    // Gunakan fungsi format yang aman untuk merubah ke Y-m-d H:i:s
    formData.append('start_time', formatSubmitDate(startTime));
    formData.append('end_time', formatSubmitDate(endTime)); 
    
    formData.append('quota', quota.trim() || '0');
    formData.append('basic_price', basicPrice.trim() || '0'); 
    
    if (joinLink.trim()) formData.append('join_link', joinLink.trim());
    if (joinInstructions.trim()) formData.append('join_instructions', joinInstructions.trim());

    if (premiumPrice.trim()) formData.append('premium_price', premiumPrice.trim());
    if (certificateLink.trim()) formData.append('certificate_link', certificateLink.trim());
    formData.append('certificate_tier', certificateTier); 
    
    if (imageFile) formData.append('image', imageFile);

    banks.forEach((bank, idx) => {
      if (bank.account_number && bank.account_holder) {
        const finalBankCode = bank.bank_code === 'lainnya' && bank.custom_bank_name ? bank.custom_bank_name : bank.bank_code;
        
        formData.append(`banks[${idx}][bank_code]`, finalBankCode);
        formData.append(`banks[${idx}][account_number]`, bank.account_number);
        formData.append(`banks[${idx}][account_holder]`, bank.account_holder);
      }
    });

    try {
      const res = await apiFetch(`/admin/events/${eventId}`, {
        method: 'POST', 
        body: formData
      });
      
      const resData = await res.json();

      if (res.ok && resData.success !== false) { 
        toast.success("Perubahan berhasil disimpan!", { id: loadToast }); 
        fetchEventData(); 
      } else { 
        let errorMessage = resData.message || "Gagal memperbarui data.";
        
        if (resData.errors && typeof resData.errors === 'object') {
           setValidationErrors(resData.errors);
           const errorsArray = Object.values(resData.errors) as string[][];
           if (errorsArray.length > 0 && errorsArray[0].length > 0) {
             errorMessage = errorsArray[0][0]; 
           }
           if (activeTab !== 'detail') setActiveTab('detail');
        }
        
        toast.error(errorMessage, { id: loadToast }); 
      }
    } catch { toast.error("Koneksi terputus. Pastikan server merespons.", { id: loadToast }); } finally { setSaving(false); }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!eventId) return;

    const loadToast = toast.loading("Menambahkan modul...");
    const fd = new FormData();
    fd.append('event_id', eventId); 
    fd.append('title', matTitle); 
    fd.append('type', matType);
    fd.append('access_tier', matAccess); 
    
    if (matType === 'file' && matFile) fd.append('file', matFile); else fd.append('link', matLink);
    
    try {
      const res = await apiFetch('/admin/materials', {
        method: 'POST', 
        body: fd
      });
      const resJson = await res.json();
      if (res.ok) { 
        toast.success("Modul ditambahkan!", { id: loadToast }); 
        setMatTitle(''); setMatLink(''); setMatFile(null); setMatAccess('all');
        if (matFileRef.current) matFileRef.current.value = ''; 
        fetchEventData(); 
      } else {
        toast.error(resJson.message || "Gagal mengunggah", { id: loadToast });
      }
    } catch { toast.error("Gagal koneksi"); }
  };

  const handleAddSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!eventId) return;

    if (!spkPhoto) return toast.error("Harap unggah foto instruktur");
    const loadToast = toast.loading("Mendaftarkan instruktur...");
    
    const fd = new FormData();
    fd.append('event_id', eventId); 
    fd.append('name', spkName); 
    fd.append('role', spkRole); 
    fd.append('photo', spkPhoto);
    
    try {
      const res = await apiFetch('/admin/speakers', {
        method: 'POST', 
        body: fd
      });
      if (res.ok) { 
        toast.success("Instruktur ditambahkan", { id: loadToast }); 
        setSpkName(''); setSpkRole(''); setSpkPhoto(null); setSpkPhotoPreview(null);
        if (spkPhotoRef.current) spkPhotoRef.current.value = ''; 
        fetchEventData(); 
      }
    } catch { toast.error("Gagal"); }
  };

  const openDeleteModal = (id: number, endpoint: 'materials' | 'speakers') => {
    setDeleteModal({ isOpen: true, id, endpoint });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id || !deleteModal.endpoint) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/${deleteModal.endpoint}/${deleteModal.id}`, {
        method: 'DELETE'
      });
      if (res.ok) { toast.success("Data berhasil dihapus"); fetchEventData(); } 
      else { toast.error("Gagal menghapus data"); }
    } catch { toast.error("Terjadi kesalahan koneksi"); } 
    finally { setIsDeleting(false); setDeleteModal({ isOpen: false, id: null, endpoint: null }); }
  };

  if (fetching) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 md:gap-4">
      <Loader2 className="animate-spin text-slate-400" size={28} />
      <span className="text-xs md:text-sm font-medium text-slate-500">Memuat konfigurasi program...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-8 px-2 sm:px-4 md:px-0 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 md:pb-24 relative">
      
      {/* MODAL KONFIRMASI HAPUS */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative">
              <button onClick={() => !isDeleting && setDeleteModal({ isOpen: false, id: null, endpoint: null })} disabled={isDeleting} className="absolute top-3 md:top-4 right-3 md:right-4 p-1.5 md:p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                <X size={18} />
              </button>
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4 md:mb-5 border-[6px] border-rose-50/50 shadow-inner">
                  <AlertTriangle size={28} strokeWidth={2.5} className="md:w-8 md:h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1.5 md:mb-2">Hapus Permanen?</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-6 md:mb-8 leading-relaxed px-2">Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus data ini dari sistem?</p>
                <div className="flex w-full gap-2.5 md:gap-3">
                  <button onClick={() => setDeleteModal({ isOpen: false, id: null, endpoint: null })} disabled={isDeleting} className="flex-1 py-2.5 md:py-3 bg-slate-100 text-slate-700 font-bold text-xs md:text-sm rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50">Batal</button>
                  <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-2.5 md:py-3 bg-rose-600 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mt-2 md:mt-0">
        <div>
          <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-slate-500 mb-1.5 md:mb-2">
            <Link href="/admin/events" className="hover:text-slate-900 transition-colors">Katalog Program</Link>
            <ChevronRight size={14} className="md:w-4 md:h-4" />
            <span className="text-slate-900 font-medium">Pengaturan Program</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug">{title || 'Pengaturan Program'}</h1>
        </div>
        <button onClick={() => handleSaveEvent()} disabled={saving} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-slate-800 disabled:opacity-70 transition-colors shadow-sm shrink-0">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} className="md:w-[18px] md:h-[18px]" />}
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-4 md:space-x-6 overflow-x-auto custom-scrollbar pb-1 md:pb-0" aria-label="Tabs">
          {[
            { id: 'detail', label: 'Informasi Umum', icon: Settings },
            { id: 'bank', label: 'Pembayaran', icon: CreditCard },
            { id: 'material', label: 'Kurikulum', icon: BookOpen },
            { id: 'speaker', label: 'Instruktur', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'} whitespace-nowrap border-b-2 py-3 md:py-4 px-1 text-xs md:text-sm font-medium flex items-center gap-1.5 md:gap-2 transition-colors`}
            >
              <tab.icon size={14} className="md:w-4 md:h-4" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-2">
        <AnimatePresence mode="wait">
          
          {/* TAB: DETAIL */}
          {activeTab === 'detail' && (
            <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} onSubmit={handleSaveEvent} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              {/* Kolom Kiri */}
              <div className="lg:col-span-2 space-y-5 md:space-y-6">
                <div className="bg-white p-5 md:p-6 lg:p-8 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm space-y-5 md:space-y-6">
                  
                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5"><AlignLeft size={14} className={`${validationErrors.title ? 'text-rose-500' : 'text-indigo-500'}`} /> Judul Program</label>
                    <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if(validationErrors.title) setValidationErrors({...validationErrors, title: []}); }} className={`w-full bg-white border rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.title ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                    {validationErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.title[0]}</p>}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5"><ImageIcon size={14} className={`${validationErrors.image ? 'text-rose-500' : 'text-purple-500'}`} /> Banner Utama</label>
                      <span className="text-[9px] md:text-[10px] font-medium text-slate-500">Rasio 21:9 (Maks 10MB)</span>
                    </div>
                    <div onClick={() => fileInputRef.current?.click()} className={`relative w-full aspect-video md:aspect-[21/9] rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden group transition-colors ${validationErrors.image ? 'border-rose-400 bg-rose-50 hover:border-rose-500' : 'border-slate-300 hover:border-indigo-500 bg-slate-50'}`}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Banner" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm flex items-center gap-1.5 md:gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                <ImageIcon size={14} className="text-slate-700 md:w-4 md:h-4" /> <span className="text-[10px] md:text-xs font-semibold text-slate-700">Ganti Gambar</span>
                             </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                           <ImageIcon size={20} className={`mx-auto mb-2 transition-colors md:w-6 md:h-6 ${validationErrors.image ? 'text-rose-400' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                           <span className="text-[10px] md:text-xs font-medium text-slate-600 block">Klik untuk memilih file</span>
                        </div>
                      )}
                    </div>
                    <input type="file" ref={fileInputRef} hidden onChange={handleImageChange} accept="image/*" />
                    {validationErrors.image && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.image[0]}</p>}
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <label className="text-[10px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5"><FileText size={14} className={`${validationErrors.description ? 'text-rose-500' : 'text-emerald-500'}`} /> Deskripsi Detail & Kurikulum</label>
                    <div className={`rounded-lg md:rounded-xl overflow-hidden border bg-white ${validationErrors.description ? 'border-rose-400' : 'border-slate-300'}`}>
                      <ReactQuill theme="snow" value={description} onChange={(val) => { setDescription(val); if(validationErrors.description) setValidationErrors({...validationErrors, description: []}); }} />
                    </div>
                    {validationErrors.description && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.description[0]}</p>}
                  </div>
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-5 md:space-y-6">
                <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm space-y-5 md:space-y-6 lg:sticky lg:top-24">
                  
                  <h3 className="text-xs md:text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 md:pb-3"><Calendar size={14} className="text-slate-400 inline mr-1.5 md:w-4 md:h-4" /> Informasi Publik</h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[9px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar size={10} className={`${validationErrors.start_time ? 'text-rose-500' : 'text-emerald-500'} md:w-3 md:h-3`} /> Waktu Mulai</label>
                      <input type="datetime-local" value={startTime} onChange={(e) => { setStartTime(e.target.value); if(validationErrors.start_time) setValidationErrors({...validationErrors, start_time: []}); }} className={`w-full bg-white border rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.start_time ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                      {validationErrors.start_time && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.start_time[0]}</p>}
                    </div>
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[9px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Clock size={10} className={`${validationErrors.end_time ? 'text-rose-500' : 'text-rose-500'} md:w-3 md:h-3`} /> Waktu Selesai</label>
                      <input type="datetime-local" value={endTime} onChange={(e) => { setEndTime(e.target.value); if(validationErrors.end_time) setValidationErrors({...validationErrors, end_time: []}); }} className={`w-full bg-white border rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.end_time ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                      {validationErrors.end_time && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.end_time[0]}</p>}
                    </div>
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[9px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={10} className={`${validationErrors.venue ? 'text-rose-500' : 'text-blue-500'} md:w-3 md:h-3`} /> Lokasi (Publik)</label>
                      <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                        <input type="text" value={venue} onChange={(e) => { setVenue(e.target.value); if(validationErrors.venue) setValidationErrors({...validationErrors, venue: []}); }} placeholder="Contoh: Zoom Meeting" className={`w-full bg-white border rounded-lg py-2 md:py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.venue ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                      </div>
                      {validationErrors.venue && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.venue[0]}</p>}
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4 bg-indigo-50/50 p-3 md:p-4 rounded-xl border border-indigo-100">
                    <h3 className="text-[11px] md:text-xs font-bold text-indigo-900 flex items-center gap-1.5 md:gap-2"><Zap size={12} className="text-indigo-500 md:w-3.5 md:h-3.5" /> Akses Privat</h3>
                    <p className="text-[9px] md:text-[10px] font-medium text-indigo-600/80 leading-tight">Hanya akan terlihat oleh peserta yang status tiketnya sudah Diverifikasi.</p>
                    
                    <div className="space-y-2.5 md:space-y-3">
                      <div className="relative">
                        <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 md:w-3.5 md:h-3.5" />
                        <input type="url" value={joinLink} onChange={(e) => { setJoinLink(e.target.value); if(validationErrors.join_link) setValidationErrors({...validationErrors, join_link: []}); }} placeholder="Link Akses (Zoom / WA Group)" className={`w-full bg-white border rounded-lg py-2 pl-8 md:pl-9 pr-3 text-xs md:text-sm font-medium outline-none transition-all placeholder:text-slate-400 ${validationErrors.join_link ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                        {validationErrors.join_link && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.join_link[0]}</p>}
                      </div>
                      <div className="relative">
                        <Info size={12} className="absolute left-3 top-2.5 md:top-3 text-indigo-400 md:w-3.5 md:h-3.5" />
                        <textarea value={joinInstructions} onChange={(e) => { setJoinInstructions(e.target.value); if(validationErrors.join_instructions) setValidationErrors({...validationErrors, join_instructions: []}); }} placeholder="Instruksi Akses (Misal: Password Zoom)" rows={3} className={`w-full bg-white border rounded-lg py-2 pl-8 md:pl-9 pr-3 text-xs md:text-sm font-medium outline-none transition-all placeholder:text-slate-400 resize-none ${validationErrors.join_instructions ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                        {validationErrors.join_instructions && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.join_instructions[0]}</p>}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 border-b border-slate-100 pb-2 md:pb-3 pt-2"><DollarSign size={14} className="text-slate-400 md:w-4 md:h-4" /> Pengaturan Tiket</h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Users size={10} className={`${validationErrors.quota ? 'text-rose-500' : 'text-amber-500'} md:w-3 md:h-3`} /> Kuota Peserta</label>
                      <div className="relative">
                        <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                        <input type="number" value={quota} onChange={(e) => { setQuota(e.target.value); if(validationErrors.quota) setValidationErrors({...validationErrors, quota: []}); }} placeholder="0 = Tidak Terbatas" className={`w-full bg-white border rounded-lg py-2 md:py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.quota ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                      </div>
                      {validationErrors.quota && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.quota[0]}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-1 md:space-y-1.5">
                        <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Tag size={10} className={`${validationErrors.basic_price ? 'text-rose-500' : 'text-emerald-500'} md:w-3 md:h-3`} /> Basic (Rp)</label>
                        <input type="number" value={basicPrice} onChange={(e) => { setBasicPrice(e.target.value); if(validationErrors.basic_price) setValidationErrors({...validationErrors, basic_price: []}); }} placeholder="0 = Gratis" className={`w-full bg-white border rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.basic_price ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                        {validationErrors.basic_price && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.basic_price[0]}</p>}
                      </div>
                      <div className="space-y-1 md:space-y-1.5">
                        <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Star size={10} className={`${validationErrors.premium_price ? 'text-rose-500' : 'text-violet-500'} md:w-3 md:h-3`} /> VIP (Rp)</label>
                        <input type="number" value={premiumPrice} onChange={(e) => { setPremiumPrice(e.target.value); if(validationErrors.premium_price) setValidationErrors({...validationErrors, premium_price: []}); }} placeholder="Opsional" className={`w-full bg-white border rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.premium_price ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                        {validationErrors.premium_price && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.premium_price[0]}</p>}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 border-b border-slate-100 pb-2 md:pb-3 pt-2"><Award size={14} className="text-slate-400 md:w-4 md:h-4" /> Aset Tambahan</h3>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Award size={10} className={`${validationErrors.certificate_link ? 'text-rose-500' : 'text-amber-500'} md:w-3 md:h-3`} /> Link E-Certificate</label>
                      <div className="relative">
                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                        <input type="url" value={certificateLink} onChange={(e) => { setCertificateLink(e.target.value); if(validationErrors.certificate_link) setValidationErrors({...validationErrors, certificate_link: []}); }} placeholder="https://..." className={`w-full bg-white border rounded-lg py-2 md:py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.certificate_link ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                      </div>
                      {validationErrors.certificate_link && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.certificate_link[0]}</p>}
                    </div>
                    <div className="space-y-1 md:space-y-1.5">
                      <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Lock size={10} className="text-rose-500 md:w-3 md:h-3" /> Akses E-Certificate
                      </label>
                      <select 
                        value={certificateTier} 
                        onChange={(e) => setCertificateTier(e.target.value as 'all'|'premium')} 
                        className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option value="all">Semua Peserta (Basic & VIP)</option>
                        <option value="premium">Khusus Peserta VIP (Premium)</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            </motion.form>
          )}

          {/* TAB: BANK */}
          {activeTab === 'bank' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="bg-white p-5 md:p-8 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-5 md:mb-6 pb-4 md:pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">Rekening Penerima</h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">Sediakan opsi rekening/e-wallet untuk pembayaran manual tiket.</p>
                </div>
                <button type="button" onClick={addBank} className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 md:gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs md:text-sm font-medium transition-colors">
                  <PlusCircle size={14} className="text-indigo-500 md:w-4 md:h-4" /> Tambah Rekening
                </button>
              </div>

              <div className="space-y-4">
                {banks.map((bank, index) => (
                  <div key={index} className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-start p-4 md:p-5 rounded-xl border border-slate-200 bg-slate-50/50">
                    
                    <div className="w-full md:w-1/4 space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Building size={12} className="text-blue-500" /> Nama Bank / E-Wallet
                      </label>
                      <select 
                        value={bank.bank_code} 
                        onChange={(e) => handleBankChange(index, 'bank_code', e.target.value)} 
                        className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <optgroup label="Bank Konvensional">
                          <option value="bca">Bank BCA</option>
                          <option value="mandiri">Bank Mandiri</option>
                          <option value="bni">Bank BNI</option>
                          <option value="bri">Bank BRI</option>
                          <option value="bsi">Bank BSI</option>
                          <option value="btn">Bank BTN</option>
                          <option value="cimb">CIMB Niaga</option>
                          <option value="danamon">Bank Danamon</option>
                          <option value="permata">Bank Permata</option>
                        </optgroup>
                        <optgroup label="Bank Digital">
                          <option value="jago">Bank Jago</option>
                          <option value="seabank">SeaBank</option>
                        </optgroup>
                        <optgroup label="E-Wallet">
                          <option value="dana">DANA</option>
                          <option value="gopay">GoPay</option>
                          <option value="ovo">OVO</option>
                          <option value="shopeepay">ShopeePay</option>
                          <option value="linkaja">LinkAja</option>
                        </optgroup>
                        <optgroup label="Lainnya">
                          <option value="lainnya">Lainnya... (Ketik Manual)</option>
                        </optgroup>
                      </select>
                      
                      {bank.bank_code === 'lainnya' && (
                        <motion.input 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          type="text" 
                          placeholder="Misal: Bank BJB" 
                          value={bank.custom_bank_name || ''} 
                          onChange={(e) => handleBankChange(index, 'custom_bank_name', e.target.value)} 
                          className="mt-2 w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                        />
                      )}
                    </div>
                    
                    <div className="w-full md:w-1/3 space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Hash size={12} className="text-amber-500" /> Nomor Rekening / HP
                      </label>
                      <input type="text" value={bank.account_number} onChange={(e) => handleBankChange(index, 'account_number', e.target.value)} placeholder="Contoh: 1234567890" className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    
                    <div className="w-full md:w-1/3 space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} className="text-emerald-500" /> Atas Nama
                      </label>
                      <input type="text" value={bank.account_holder} onChange={(e) => handleBankChange(index, 'account_holder', e.target.value)} placeholder="Nama Pemilik" className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                    </div>

                    {banks.length > 1 ? (
                      <button type="button" onClick={() => removeBank(index)} className="mt-2 md:mt-[22px] p-2 md:p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 self-end md:self-auto w-full md:w-auto flex justify-center">
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <div className="w-[38px] hidden md:block"></div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB: MATERIAL */}
          {activeTab === 'material' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <PlusCircle size={16} className="text-indigo-500 md:w-[18px] md:h-[18px]" /> Modul Baru
                </h3>
                
                <div className="mb-4 md:mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200 flex gap-2.5 md:gap-3">
                    <Info size={14} className="text-slate-500 shrink-0 mt-0.5 md:w-4 md:h-4" />
                    <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed">
                      Dokumen maksimal <strong>20 MB</strong>. Untuk video harap gunakan URL (YouTube).
                    </p>
                </div>

                <form onSubmit={handleAddMaterial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText size={12} className="text-blue-500 md:w-[14px] md:h-[14px]" /> Judul Modul
                    </label>
                    <input type="text" value={matTitle} onChange={(e) => setMatTitle(e.target.value)} placeholder="Contoh: Pengantar React" className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <AlignLeft size={12} className="text-slate-500 md:w-[14px] md:h-[14px]" /> Tipe Konten
                    </label>
                    <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                       <button type="button" onClick={() => setMatType('file')} className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all ${matType === 'file' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500'}`}>
                         <FileText size={12} className={matType === 'file' ? 'text-indigo-500 md:w-[14px] md:h-[14px]' : 'md:w-[14px] md:h-[14px]'} /> Dokumen
                       </button>
                       <button type="button" onClick={() => setMatType('video')} className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all ${matType === 'video' ? 'bg-white shadow-sm border border-slate-200 text-slate-900' : 'text-slate-500'}`}>
                         <Video size={12} className={matType === 'video' ? 'text-rose-500 md:w-[14px] md:h-[14px]' : 'md:w-[14px] md:h-[14px]'} /> Video URL
                       </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Lock size={12} className="text-amber-500 md:w-[14px] md:h-[14px]" /> Hak Akses Modul
                    </label>
                    <select 
                      value={matAccess} 
                      onChange={(e) => setMatAccess(e.target.value as 'all'|'premium')} 
                      className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Semua Peserta (Basic & VIP)</option>
                      <option value="premium">Khusus Peserta VIP (Premium)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      {matType === 'file' ? <FileText size={12} className="text-indigo-500 md:w-[14px] md:h-[14px]" /> : <LinkIcon size={12} className="text-rose-500 md:w-[14px] md:h-[14px]" />}
                      {matType === 'file' ? 'Upload File' : 'Link URL'}
                    </label>
                    {matType === 'file' ? (
                      <input key="mat-file" type="file" ref={matFileRef} onChange={(e) => setMatFile(e.target.files?.[0] || null)} className="w-full text-[10px] md:text-xs text-slate-500 file:mr-3 md:file:mr-4 file:py-1.5 md:file:py-2 file:px-3 md:file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 bg-slate-50 p-1.5 md:p-2 rounded-lg border border-slate-200 border-dashed" required />
                    ) : (
                      <input key="mat-link" type="url" value={matLink || ''} onChange={(e) => setMatLink(e.target.value)} placeholder="https://..." className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                    )}
                  </div>
                  
                  <button className="w-full mt-2 bg-slate-900 text-white py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">Tambahkan Modul</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                 <h4 className="text-xs md:text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
                   Kurikulum Tersedia <span className="bg-slate-100 text-slate-600 px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs border border-slate-200">{materials.length}</span>
                 </h4>
                 {materials.length === 0 ? (
                   <p className="text-xs md:text-sm text-slate-500 italic py-4">Belum ada modul yang ditambahkan.</p>
                 ) : (
                   <div className="grid gap-3">
                     {materials.map((m, i) => (
                       <div key={m.id} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex items-center justify-between group hover:border-slate-300 transition-colors shadow-sm">
                         <div className="flex items-center gap-3 md:gap-4 overflow-hidden pr-2">
                             <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center border shrink-0 ${m.type === 'video' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                               {m.type === 'video' ? <Video size={16} className="md:w-[18px] md:h-[18px]" /> : <FileText size={16} className="md:w-[18px] md:h-[18px]" />}
                             </div>
                             <div className="truncate">
                               <p className="text-[9px] md:text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 flex flex-wrap items-center gap-1.5 md:gap-2">
                                 Modul {i+1}
                                 <span className={`px-1.5 py-0.5 rounded-sm text-[7px] md:text-[8px] font-bold ${m.access_tier === 'premium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                   {m.access_tier === 'premium' ? '💎 VIP ONLY' : 'BASIC & VIP'}
                                 </span>
                               </p>
                               <h4 className="text-xs md:text-sm font-semibold text-slate-900 truncate">{m.title}</h4>
                             </div>
                         </div>
                         <button 
                           onClick={() => openDeleteModal(m.id, 'materials')} 
                           className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0"
                         >
                           <Trash2 size={14} className="md:w-4 md:h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </motion.div>
          )}

          {/* TAB: SPEAKER */}
          {activeTab === 'speaker' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              
              <div className="bg-white p-5 md:p-6 rounded-xl md:rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="text-sm md:text-base font-bold text-slate-900 mb-4 md:mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <UserPlus size={16} className="text-indigo-500 md:w-[18px] md:h-[18px]" /> Instruktur Baru
                </h3>
                
                <form onSubmit={handleAddSpeaker} className="space-y-4 md:space-y-6">
                  <div className="flex flex-col items-center gap-2 md:gap-3">
                    <div 
                      onClick={() => spkPhotoRef.current?.click()}
                      className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-slate-300 cursor-pointer group overflow-hidden bg-slate-50 hover:border-indigo-400 transition-colors"
                    >
                      {spkPhotoPreview ? (
                        <img src={spkPhotoPreview} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <Camera size={16} className="mb-1 md:w-5 md:h-5" />
                          <span className="text-[8px] md:text-[9px] font-medium">Foto</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[9px] md:text-[10px] font-medium text-white">Ganti</span>
                      </div>
                    </div>
                    <input type="file" ref={spkPhotoRef} hidden onChange={(e) => {
                        if(e.target.files?.[0]) {
                          setSpkPhoto(e.target.files[0]);
                          setSpkPhotoPreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }} accept="image/*" 
                    />
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <User size={12} className="text-emerald-500 md:w-[14px] md:h-[14px]" /> Nama Lengkap
                      </label>
                      <input type="text" value={spkName} onChange={(e) => setSpkName(e.target.value)} placeholder="Contoh: Budi Santoso" className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Briefcase size={12} className="text-amber-500 md:w-[14px] md:h-[14px]" /> Posisi / Keahlian
                      </label>
                      <input type="text" value={spkRole} onChange={(e) => setSpkRole(e.target.value)} placeholder="Senior Developer" className="w-full bg-white border border-slate-300 rounded-lg py-2 md:py-2.5 px-3 text-xs md:text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" required />
                    </div>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium hover:bg-slate-800 shadow-sm transition-colors">Tambahkan Instruktur</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-4">
                 <h4 className="text-xs md:text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 flex justify-between items-center">
                   Daftar Instruktur <span className="bg-slate-100 text-slate-600 px-2 md:px-2.5 py-0.5 rounded-full text-[10px] md:text-xs border border-slate-200">{speakers.length}</span>
                 </h4>
                 {speakers.length === 0 ? (
                    <p className="text-xs md:text-sm text-slate-500 italic py-4">Belum ada instruktur yang didaftarkan.</p>
                 ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                     {speakers.map((s) => (
                       <div key={s.id} className="bg-white p-3 md:p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm hover:border-slate-300 transition-colors">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                               <img src={`${STORAGE_URL}/${s.photo}`} className="w-full h-full object-cover" alt={s.name} />
                            </div>
                            <div className="truncate">
                              <h4 className="font-semibold text-xs md:text-sm text-slate-900 truncate">{s.name}</h4>
                              <p className="text-[10px] md:text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1"><Briefcase size={10} className="text-slate-400"/> {s.role}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => openDeleteModal(s.id, 'speakers')} 
                           className="p-1.5 md:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 shrink-0"
                         >
                           <Trash2 size={14} className="md:w-4 md:h-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        
        .ql-container { font-family: 'Inter', sans-serif; font-size: 0.9rem; min-height: 200px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
        @media (min-width: 768px) {
          .ql-container { font-size: 0.95rem; min-height: 250px; }
        }
        .ql-toolbar { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; background: #f8fafc; padding: 0.5rem !important; }
        @media (min-width: 768px) {
          .ql-toolbar { padding: 0.75rem !important; }
        }
        .ql-editor { line-height: 1.6; color: #334155; padding: 1rem !important; }
        @media (min-width: 768px) {
          .ql-editor { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}