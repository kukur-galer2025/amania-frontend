"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Save, ArrowLeft, Image as ImageIcon, Loader2, 
  Calendar, MapPin, CreditCard, Link as LinkIcon, Award,
  AlignLeft, FileText, Clock, Tag, Star, Zap, Info,
  DollarSign, Users, AlertTriangle, Lock
} from 'lucide-react';
import { apiFetch } from '@/app/utils/api'; // 🔥 API SAKTI

// Quill Editor
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-48 md:h-64 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
});
import 'react-quill-new/dist/quill.snow.css';

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // 🔥 State untuk Menangkap Error Validasi (422) per Kolom 🔥
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  
  // State untuk form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quota, setQuota] = useState('');
  const [basicPrice, setBasicPrice] = useState('0');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [certificateLink, setCertificateLink] = useState('');
  const [certificateTier, setCertificateTier] = useState<'all'|'premium'>('all'); // 🔥 Tambahan state
  
  // State Akses Privat
  const [joinLink, setJoinLink] = useState('');
  const [joinInstructions, setJoinInstructions] = useState('');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  };

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
      // Hapus error jika ada
      if (validationErrors.image) setValidationErrors(prev => ({ ...prev, image: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({}); // Reset pesan error sebelumnya

    if (!description || description === '<p><br></p>') {
      toast.error("Deskripsi event wajib diisi!");
      setValidationErrors(prev => ({ ...prev, description: ["Deskripsi wajib diisi."] }));
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("Waktu selesai harus lebih besar dari waktu mulai!");
      setValidationErrors(prev => ({ ...prev, end_time: ["Waktu selesai harus lebih besar dari waktu mulai."] }));
      return;
    }

    const loadToast = toast.loading("Membangun Ruang Event...");
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('venue', venue);
    formData.append('start_time', startTime.replace('T', ' ') + ':00'); 
    formData.append('end_time', endTime.replace('T', ' ') + ':00');
    
    // Pastikan angka valid
    formData.append('quota', quota.trim() || '0');
    formData.append('basic_price', basicPrice.trim() || '0'); 
    
    // Pastikan URL hanya di-append jika tidak kosong untuk menghindari error 'url' laravel
    if (joinLink.trim()) formData.append('join_link', joinLink.trim());
    if (joinInstructions.trim()) formData.append('join_instructions', joinInstructions.trim());
    if (premiumPrice.trim()) formData.append('premium_price', premiumPrice.trim());
    if (certificateLink.trim()) formData.append('certificate_link', certificateLink.trim());
    
    formData.append('certificate_tier', certificateTier);
    if (imageFile) formData.append('image', imageFile);

    try {
      const res = await apiFetch('/admin/events', {
        method: 'POST',
        headers: { 
            'Accept': 'application/json',
            'Content-Type': '' // Biarkan form-data
        },
        body: formData
      });

      const responseData = await res.json();

      if (res.ok && responseData.success !== false) {
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm">Event Berhasil Dibuat! 🎉</span>
            <span className="text-xs text-slate-500">Mengarahkan ke menu pengaturan lanjutan...</span>
          </div>, 
          { id: loadToast, duration: 4000 }
        );
        router.push(`/admin/events/edit/${responseData.data.id}`);
      } else {
        // 🔥 Tangkap Validation Errors (422) 🔥
        if (res.status === 422 && responseData.errors) {
            setValidationErrors(responseData.errors);
            
            // Ambil pesan error pertama untuk ditampilkan di Toast
            const firstErrorField = Object.keys(responseData.errors)[0];
            const firstErrorMsg = responseData.errors[firstErrorField][0];
            
            toast.error(`Validasi Gagal: ${firstErrorMsg}`, { id: loadToast });
        } else {
            toast.error(responseData.message || "Gagal membuat event", { id: loadToast });
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi sistem", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 py-4 md:py-8 px-2 sm:px-4 md:px-0">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 md:mb-8 mt-2 md:mt-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Buat Event Baru</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Buat program masterclass, webinar, atau bootcamp Amania baru.</p>
        </div>
        <Link href="/admin/events" className="inline-flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs md:text-sm font-medium text-slate-700 rounded-lg shadow-sm transition-colors w-full sm:w-auto">
          <ArrowLeft size={16} className="text-slate-400 md:w-4 md:h-4" /> Batal & Kembali
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* KOLOM KIRI */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">
          <div className="bg-white p-5 md:p-6 lg:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 md:space-y-6">
            
            {/* Judul Event */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <AlignLeft size={14} className={`${validationErrors.title ? 'text-rose-500' : 'text-indigo-500'} md:w-3.5 md:h-3.5`} /> Judul Program
              </label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => { setTitle(e.target.value); if(validationErrors.title) setValidationErrors({...validationErrors, title: []}); }}
                placeholder="Contoh: Bootcamp Fullstack Laravel"
                className={`w-full bg-white border rounded-lg py-2.5 px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 transition-all placeholder:font-normal placeholder:text-slate-400 ${
                    validationErrors.title 
                    ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500 bg-rose-50/50' 
                    : 'border-slate-300 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
                required
              />
              {validationErrors.title && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.title[0]}</p>}
            </div>

            {/* Banner/Thumbnail */}
            <div className="space-y-1.5 md:space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon size={14} className={`${validationErrors.image ? 'text-rose-500' : 'text-purple-500'} md:w-3.5 md:h-3.5`} /> Banner Visual
                </label>
                <span className="text-[9px] md:text-[10px] font-medium text-slate-500">Rasio 21:9 | Maks 10MB</span>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full aspect-[21/9] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group ${
                    validationErrors.image 
                    ? 'border-rose-400 bg-rose-50' 
                    : 'border-slate-300 hover:border-indigo-500 bg-slate-50'
                }`}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                       <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-sm flex items-center gap-1.5 md:gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <ImageIcon size={14} className="text-slate-700 md:w-4 md:h-4" /> 
                          <span className="text-[10px] md:text-xs font-semibold text-slate-700">Ganti Gambar</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center group-hover:scale-105 transition-transform duration-300">
                    <div className={`w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-2 md:mb-3 transition-colors ${validationErrors.image ? 'text-rose-400' : 'text-slate-400 group-hover:text-indigo-600'}`}>
                      <ImageIcon size={18} className="md:w-5 md:h-5" />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-slate-700 block mb-0.5 md:mb-1">Pilih File Banner</span>
                    <span className="text-[9px] md:text-xs text-slate-500 block">Klik atau seret file ke sini</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
              {validationErrors.image && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.image[0]}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[11px] md:text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className={`${validationErrors.description ? 'text-rose-500' : 'text-emerald-500'} md:w-3.5 md:h-3.5`} /> Deskripsi Detail & Kurikulum
              </label>
              <div className={`rounded-xl overflow-hidden border bg-white ${validationErrors.description ? 'border-rose-400' : 'border-slate-300'}`}>
                <ReactQuill theme="snow" value={description} onChange={(val) => { setDescription(val); if(validationErrors.description) setValidationErrors({...validationErrors, description: []}); }} modules={modules} placeholder="Tuliskan detail acara yang akan dibahas..." />
              </div>
              {validationErrors.description && <p className="text-[10px] text-rose-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle size={10}/> {validationErrors.description[0]}</p>}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: PENGATURAN TEKNIS */}
        <div className="space-y-5 md:space-y-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 md:space-y-6 lg:sticky lg:top-24">
            
            {/* JADWAL & LOKASI */}
            <h3 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 border-b border-slate-100 pb-2 md:pb-3">
              <Calendar size={14} className="text-slate-400 md:w-4 md:h-4" /> Informasi Publik
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={10} className={`${validationErrors.start_time ? 'text-rose-500' : 'text-emerald-500'} md:w-3 md:h-3`} /> Waktu Mulai
                </label>
                <input type="datetime-local" value={startTime} onChange={(e) => { setStartTime(e.target.value); if(validationErrors.start_time) setValidationErrors({...validationErrors, start_time: []}); }} className={`w-full bg-white border rounded-lg py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.start_time ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} required />
                {validationErrors.start_time && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.start_time[0]}</p>}
              </div>
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={10} className={`${validationErrors.end_time ? 'text-rose-500' : 'text-rose-500'} md:w-3 md:h-3`} /> Waktu Selesai
                </label>
                <input type="datetime-local" value={endTime} onChange={(e) => { setEndTime(e.target.value); if(validationErrors.end_time) setValidationErrors({...validationErrors, end_time: []}); }} className={`w-full bg-white border rounded-lg py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.end_time ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} required />
                {validationErrors.end_time && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.end_time[0]}</p>}
              </div>
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={10} className={`${validationErrors.venue ? 'text-rose-500' : 'text-blue-500'} md:w-3 md:h-3`} /> Lokasi (Publik)
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                  <input type="text" value={venue} onChange={(e) => { setVenue(e.target.value); if(validationErrors.venue) setValidationErrors({...validationErrors, venue: []}); }} placeholder="Misal: Zoom Meeting" className={`w-full bg-white border rounded-lg py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.venue ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} required />
                </div>
                {validationErrors.venue && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.venue[0]}</p>}
              </div>
            </div>

            {/* LINK & INSTRUKSI PRIVAT */}
            <div className="space-y-3 md:space-y-4 bg-indigo-50/50 p-3 md:p-4 rounded-xl border border-indigo-100">
              <h3 className="text-[11px] md:text-xs font-bold text-indigo-900 flex items-center gap-1.5 md:gap-2">
                <Zap size={12} className="text-indigo-500 md:w-3.5 md:h-3.5" /> Akses Privat (Khusus Peserta)
              </h3>
              <p className="text-[9px] md:text-[10px] font-medium text-indigo-600/80 leading-tight">
                Hanya akan terlihat oleh peserta yang status tiketnya sudah Diverifikasi.
              </p>
              
              <div className="space-y-2.5 md:space-y-3">
                <div className="relative">
                  <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 md:w-3.5 md:h-3.5" />
                  <input 
                    type="url" 
                    value={joinLink} 
                    onChange={(e) => { setJoinLink(e.target.value); if(validationErrors.join_link) setValidationErrors({...validationErrors, join_link: []}); }} 
                    placeholder="Link Akses (Zoom / WA Group)" 
                    className={`w-full bg-white border rounded-lg py-2 pl-8 md:pl-9 pr-3 text-xs md:text-sm font-medium outline-none transition-all placeholder:text-slate-400 ${validationErrors.join_link ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} 
                  />
                  {validationErrors.join_link && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.join_link[0]}</p>}
                </div>
                <div className="relative">
                  <Info size={12} className="absolute left-3 top-2.5 md:top-3 text-indigo-400 md:w-3.5 md:h-3.5" />
                  <textarea 
                    value={joinInstructions} 
                    onChange={(e) => { setJoinInstructions(e.target.value); if(validationErrors.join_instructions) setValidationErrors({...validationErrors, join_instructions: []}); }} 
                    placeholder="Instruksi (Misal: Password Zoom)" 
                    rows={3}
                    className={`w-full bg-white border rounded-lg py-2 pl-8 md:pl-9 pr-3 text-xs md:text-sm font-medium outline-none transition-all placeholder:text-slate-400 resize-none ${validationErrors.join_instructions ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`}
                  />
                  {validationErrors.join_instructions && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.join_instructions[0]}</p>}
                </div>
              </div>
            </div>

            {/* TIKET & INVESTASI */}
            <h3 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 border-b border-slate-100 pb-2 md:pb-3 pt-2">
              <DollarSign size={14} className="text-slate-400 md:w-4 md:h-4" /> Pengaturan Tiket
            </h3>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={10} className={`${validationErrors.quota ? 'text-rose-500' : 'text-amber-500'} md:w-3 md:h-3`} /> Kuota Peserta
                </label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                  <input type="number" value={quota} onChange={(e) => { setQuota(e.target.value); if(validationErrors.quota) setValidationErrors({...validationErrors, quota: []}); }} placeholder="0 = Tidak Terbatas" className={`w-full bg-white border rounded-lg py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.quota ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} required />
                </div>
                {validationErrors.quota && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.quota[0]}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1 md:space-y-1.5">
                  <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag size={10} className={`${validationErrors.basic_price ? 'text-rose-500' : 'text-emerald-500'} md:w-3 md:h-3`} /> Basic (Rp)
                  </label>
                  <input type="number" value={basicPrice} onChange={(e) => { setBasicPrice(e.target.value); if(validationErrors.basic_price) setValidationErrors({...validationErrors, basic_price: []}); }} placeholder="0 = Gratis" className={`w-full bg-white border rounded-lg py-2.5 px-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.basic_price ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} required />
                  {validationErrors.basic_price && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.basic_price[0]}</p>}
                </div>
                <div className="space-y-1 md:space-y-1.5">
                  <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Star size={10} className={`${validationErrors.premium_price ? 'text-rose-500' : 'text-violet-500'} md:w-3 md:h-3`} /> VIP (Rp)
                  </label>
                  <input type="number" value={premiumPrice} onChange={(e) => { setPremiumPrice(e.target.value); if(validationErrors.premium_price) setValidationErrors({...validationErrors, premium_price: []}); }} placeholder="Opsional" className={`w-full bg-white border rounded-lg py-2.5 px-3 text-xs md:text-sm font-bold text-slate-900 outline-none transition-all ${validationErrors.premium_price ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                  {validationErrors.premium_price && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.premium_price[0]}</p>}
                </div>
              </div>
            </div>

            {/* ASET TAMBAHAN */}
            <h3 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-1.5 md:gap-2 border-b border-slate-100 pb-2 md:pb-3 pt-2">
              <Award size={14} className="text-slate-400 md:w-4 md:h-4" /> Aset Tambahan
            </h3>

            <div className="space-y-3 md:space-y-4">
              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Award size={10} className={`${validationErrors.certificate_link ? 'text-rose-500' : 'text-amber-500'} md:w-3 md:h-3`} /> Link E-Certificate
                </label>
                <div className="relative">
                  <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 md:w-4 md:h-4" />
                  <input type="url" value={certificateLink} onChange={(e) => { setCertificateLink(e.target.value); if(validationErrors.certificate_link) setValidationErrors({...validationErrors, certificate_link: []}); }} placeholder="https://..." className={`w-full bg-white border rounded-lg py-2.5 pl-9 md:pl-10 pr-3 text-xs md:text-sm font-medium text-slate-900 outline-none transition-all ${validationErrors.certificate_link ? 'border-rose-500 bg-rose-50 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} />
                </div>
                {validationErrors.certificate_link && <p className="text-[10px] text-rose-500 font-bold mt-1">{validationErrors.certificate_link[0]}</p>}
              </div>

              <div className="space-y-1 md:space-y-1.5">
                <label className="text-[10px] md:text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={10} className="text-rose-500 md:w-3 md:h-3" /> Akses E-Certificate
                </label>
                <select 
                  value={certificateTier} 
                  onChange={(e) => setCertificateTier(e.target.value as 'all'|'premium')} 
                  className="w-full bg-white border border-slate-300 rounded-lg py-2.5 px-3 text-xs md:text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="all">Semua Peserta (Basic & VIP)</option>
                  <option value="premium">Khusus Peserta VIP (Premium)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white py-3 md:py-3.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-70 shadow-sm"
            >
              {loading ? <Loader2 size={14} className="animate-spin md:w-4 md:h-4" /> : <Save size={14} className="md:w-4 md:h-4" />}
              {loading ? 'Menyiapkan...' : 'Simpan & Lanjutkan'}
            </button>
          </div>
        </div>

      </form>

      <style jsx global>{`
        .ql-container { font-family: 'Inter', sans-serif; font-size: 0.9rem; min-height: 200px; border-bottom-left-radius: 0.75rem; border-bottom-right-radius: 0.75rem; }
        @media (min-width: 768px) {
          .ql-container { min-height: 250px; font-size: 0.95rem; }
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