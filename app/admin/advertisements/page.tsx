"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, ExternalLink, RefreshCw, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 
import Link from 'next/link';

const PLACEMENT_OPTIONS = [
  { value: 'beranda',  label: 'Beranda',        emoji: '🏠' },
  { value: 'webinar',  label: 'Webinar',        emoji: '🎓' },
  { value: 'eproduct', label: 'E-Produk',       emoji: '📦' },
  { value: 'course',   label: 'Kursus',         emoji: '📚' },
  { value: 'article',  label: 'Artikel/Jurnal', emoji: '📰' },
];

export default function AdminAdvertisementsPage() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [placements, setPlacements] = useState<string[]>(['beranda']);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [order, setOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const fetchAds = async () => {
    try {
      const res = await apiFetch('/admin/advertisements');
      const json = await res.json();
      if(json.success) setAds(json.data);
    } catch (error) {
      toast.error('Gagal mengambil data iklan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const resetForm = () => {
    setPlacements(['beranda']);
    setTitle('');
    setUrl('');
    setOrder('0');
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    setEditingAd(null);
  };

  const handleOpenModal = (ad: any = null) => {
    resetForm();
    if(ad) {
      setEditingAd(ad);
      // Handle both array and legacy string formats
      const p = ad.placement;
      if (Array.isArray(p)) {
        setPlacements(p);
      } else if (typeof p === 'string') {
        try {
          const parsed = JSON.parse(p);
          setPlacements(Array.isArray(parsed) ? parsed : [p]);
        } catch {
          setPlacements([p]);
        }
      }
      setTitle(ad.title);
      setUrl(ad.url || '');
      setOrder(ad.order.toString());
      setIsActive(ad.is_active);
      setImagePreview(`${STORAGE_URL}/${ad.image_path}`);
    }
    setIsModalOpen(true);
  };

  const togglePlacement = (val: string) => {
    setPlacements(prev => {
      if (prev.includes(val)) {
        // Don't allow empty — at least 1 placement required
        if (prev.length <= 1) return prev;
        return prev.filter(p => p !== val);
      }
      return [...prev, val];
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!title.trim()) return toast.error("Judul wajib diisi");
    if(!editingAd && !imageFile) return toast.error("Gambar iklan wajib diunggah");
    if(placements.length === 0) return toast.error("Pilih minimal 1 lokasi tampil");

    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan iklan...');

    try {
      const formData = new FormData();
      formData.append('placement', JSON.stringify(placements));
      formData.append('title', title);
      formData.append('url', url);
      formData.append('order', order);
      formData.append('is_active', isActive ? '1' : '0');
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let res;
      if (editingAd) {
        res = await apiFetch(`/admin/advertisements/${editingAd.id}`, {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await apiFetch('/admin/advertisements', {
          method: 'POST',
          body: formData,
        });
      }

      if (res.ok) {
        toast.success('Iklan berhasil disimpan', { id: toastId });
        setIsModalOpen(false);
        fetchAds();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Gagal menyimpan iklan', { id: toastId });
      }
    } catch (error) {
      toast.error('Terjadi kesalahan koneksi', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const res = await apiFetch(`/admin/advertisements/${id}/toggle`, {
        method: 'PATCH'
      });
      if(res.ok) {
        fetchAds();
        toast.success("Status berhasil diubah");
      }
    } catch(err) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Yakin ingin menghapus iklan ini?")) return;
    const toastId = toast.loading('Menghapus iklan...');
    try {
      const res = await apiFetch(`/admin/advertisements/${id}`, { method: 'DELETE' });
      if(res.ok) {
        toast.success("Iklan dihapus", { id: toastId });
        fetchAds();
      }
    } catch(err) {
      toast.error("Gagal menghapus iklan", { id: toastId });
    }
  };

  // Helper: parse placement for display
  const getPlacementLabels = (placement: any): string[] => {
    let arr: string[] = [];
    if (Array.isArray(placement)) {
      arr = placement;
    } else if (typeof placement === 'string') {
      try {
        const parsed = JSON.parse(placement);
        arr = Array.isArray(parsed) ? parsed : [placement];
      } catch {
        arr = [placement];
      }
    }
    return arr;
  };

  const getPlacementLabel = (val: string) => PLACEMENT_OPTIONS.find(o => o.value === val)?.label || val;
  const getPlacementEmoji = (val: string) => PLACEMENT_OPTIONS.find(o => o.value === val)?.emoji || '📌';

  return (
    <div className="max-w-7xl mx-auto py-6 md:py-8 px-4 sm:px-6 md:px-8 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kelola Iklan / Banner Promo</h1>
          <p className="mt-1 text-sm text-slate-500">Unggah dan atur iklan yang tampil di berbagai halaman user.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> Tambah Iklan
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi Tampil</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tautan (URL)</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Urutan</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Memuat data iklan...</p>
                  </td>
                </tr>
              ) : ads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-base font-bold text-slate-900">Belum ada iklan.</p>
                  </td>
                </tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-32 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 relative">
                          <img src={`${STORAGE_URL}/${ad.image_path}`} alt={ad.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{ad.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">Diupload: {new Date(ad.created_at).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {getPlacementLabels(ad.placement).map((p: string) => (
                          <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {getPlacementEmoji(p)} {getPlacementLabel(p)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ad.url ? (
                        <a href={ad.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-bold">
                          Kunjungi <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-black text-slate-700">{ad.order}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(ad.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${ad.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}
                      >
                        {ad.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(ad)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM IKLAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-black text-slate-900">{editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Gambar Banner</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[21/9] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 bg-slate-50 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-colors relative"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">Klik untuk upload gambar</p>
                        <p className="text-[10px] text-slate-400 mt-1">Rekomendasi rasio: 21:9 (Landscape) untuk halaman utama, atau 4:5 (Persegi) untuk Artikel.</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Format: JPG, PNG, WEBP (Max 10MB)</p>
                      </div>
                    )}
                    {imagePreview && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                        Ganti Gambar
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Judul Promo / Iklan <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    value={title} onChange={e => setTitle(e.target.value)} required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none" 
                    placeholder="Contoh: Diskon Kemerdekaan 50%" 
                  />
                </div>

                {/* Multi-Placement Checkbox Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                    Lokasi Tampil <span className="text-rose-500">*</span>
                    <span className="text-slate-400 normal-case tracking-normal ml-1">(pilih 1 atau lebih)</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PLACEMENT_OPTIONS.map(opt => {
                      const selected = placements.includes(opt.value);
                      return (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => togglePlacement(opt.value)}
                          className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-200 ${
                            selected
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm shadow-indigo-500/10'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                            selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 border border-slate-300'
                          }`}>
                            {selected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div>
                            <span className="text-sm font-bold block leading-none">{opt.emoji} {opt.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">URL Tujuan (Opsional)</label>
                  <input 
                    type="url" 
                    value={url} onChange={e => setUrl(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none" 
                    placeholder="Contoh: https://amania.id/events/diskon-merdeka" 
                  />
                </div>

                {/* Order + Status */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Urutan</label>
                    <input 
                      type="number" 
                      value={order} onChange={e => setOrder(e.target.value)} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Status</label>
                    <div className="flex items-center mt-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="ml-3 text-sm font-bold text-slate-700">{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </label>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingAd ? 'Simpan Perubahan' : 'Tambah Iklan'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
