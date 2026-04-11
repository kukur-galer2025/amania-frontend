"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Target, Clock, Calendar, Flame, Eye, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import RichTextEditor from '@/app/components/RichTextEditor';
import ConfirmModal from '@/app/components/ConfirmModal';

export default function EditSkdTryoutPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; 
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<any[]>([]); // State Kategori
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    skd_tryout_category_id: '', // Diubah dari category
    duration_minutes: 100,
    price: 0,
    discount_price: '',
    discount_start_date: '',
    discount_end_date: '',
    is_hots: false,
    is_active: 1,
    description: '',
  });

  const formatDateTimeForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16); 
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 🔥 Fetch Category & Detail Tryout bersamaan 🔥
        const [resCat, resTryout] = await Promise.all([
          apiFetch('/admin/tryout/skd/tryout-categories'),
          apiFetch(`/admin/tryout/skd/tryouts/${id}`)
        ]);

        const jsonCat = await resCat.json();
        const jsonTryout = await resTryout.json();

        if (jsonCat.success) setCategories(jsonCat.data);

        if (resTryout.ok && jsonTryout.success) {
          const d = jsonTryout.data;
          setFormData({
            title: d.title,
            skd_tryout_category_id: d.skd_tryout_category_id?.toString() || '',
            duration_minutes: d.duration_minutes,
            price: d.price,
            discount_price: d.discount_price !== null ? d.discount_price : '',
            discount_start_date: formatDateTimeForInput(d.discount_start_date),
            discount_end_date: formatDateTimeForInput(d.discount_end_date),
            is_hots: d.is_hots == 1 || d.is_hots === true,
            is_active: d.is_active ? 1 : 0,
            description: d.description || '',
          });
        } else {
          toast.error('Data tryout tidak ditemukan');
          router.push('/admin/tryouts/skd/manage');
        }
      } catch (error) {
        toast.error('Gagal mengambil data dari server');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Judul tryout wajib diisi!');
    if (!formData.skd_tryout_category_id) return toast.error('Kategori wajib dipilih!');

    if (formData.discount_price && Number(formData.discount_price) >= Number(formData.price)) {
      return toast.error('Harga diskon harus lebih murah dari harga normal!');
    }
    if (formData.discount_start_date && formData.discount_end_date) {
      if (new Date(formData.discount_end_date) <= new Date(formData.discount_start_date)) {
        return toast.error('Tanggal akhir diskon harus lebih besar dari tanggal mulai!');
      }
    }

    setLoading(true);
    const payload = {
      ...formData,
      discount_price: formData.discount_price === '' ? null : Number(formData.discount_price),
      discount_start_date: formData.discount_start_date === '' ? null : formData.discount_start_date,
      discount_end_date: formData.discount_end_date === '' ? null : formData.discount_end_date,
    };

    try {
      const res = await apiFetch(`/admin/tryout/skd/tryouts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success('Perubahan berhasil disimpan!');
        router.push('/admin/tryouts/skd/manage');
      } else {
        toast.error(json.message || 'Terjadi kesalahan saat menyimpan data');
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/admin/tryout/skd/tryouts/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Tryout berhasil dihapus');
        router.push('/admin/tryouts/skd/manage'); 
      } else {
        toast.error(json.message || 'Gagal menghapus tryout');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
  };

  const formatTanggalIndo = (tglString: string) => {
    if (!tglString) return '';
    const date = new Date(tglString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  const isDiscountValidPreview = formData.discount_price && Number(formData.discount_price) < Number(formData.price);
  const diskonPersen = isDiscountValidPreview ? Math.round(((Number(formData.price) - Number(formData.discount_price)) / Number(formData.price)) * 100) : 0;

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Memuat Data Tryout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 relative">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/tryouts/skd/manage" className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors shadow-sm">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Edit Tryout SKD</h1>
          <p className="text-slate-500 text-sm font-medium">Perbarui informasi master tryout ujian Anda.</p>
        </div>
      </div>

      <form id="editTryoutForm" onSubmit={handleSubmit} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">1. Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Judul Tryout <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Kategori <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select 
                      name="skd_tryout_category_id" 
                      value={formData.skd_tryout_category_id} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>-- Pilih Kategori --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Durasi (Menit) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} min="1" required className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Label Spesial</label>
                <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name="is_hots" checked={formData.is_hots} onChange={handleChange} className="w-5 h-5 accent-rose-500 rounded cursor-pointer" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1"><Flame size={14} className="text-rose-500"/> Tandai sebagai Soal HOTS</span>
                    <span className="text-[10px] text-slate-500 font-medium">Beri badge khusus bahwa tryout ini lebih menantang.</span>
                  </div>
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Status Publikasi</label>
                <select name="is_active" value={formData.is_active} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none appearance-none">
                  <option value={1}>Aktif (Bisa dibeli/diakses)</option>
                  <option value={0}>Draft (Disembunyikan)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">2. Harga & Flash Sale</h3>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">Harga Normal <span className="text-rose-500">*</span></label>
                  <p className="text-[10px] font-medium text-indigo-600/70 mb-2">Harga asli sebelum ada potongan.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-sm">Rp</span>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} min="0" required placeholder="0" className="w-full bg-white border border-indigo-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1">Harga Diskon / Promo (Opsional)</label>
                  <p className="text-[10px] font-medium text-emerald-600/70 mb-2">Nominal rupiah harga akhir yang dibayar user.</p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-black text-sm">Rp</span>
                    <input type="number" name="discount_price" value={formData.discount_price} onChange={handleChange} min="0" placeholder="Contoh: 75000" className="w-full bg-white border border-emerald-200 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Mulai Diskon (Opsional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="datetime-local" name="discount_start_date" value={formData.discount_start_date} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Akhir Diskon (Opsional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="datetime-local" name="discount_end_date" value={formData.discount_end_date} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">3. Deskripsi & Gambar</h3>
            <div className="mb-8">
              <RichTextEditor value={formData.description} onChange={handleDescriptionChange} placeholder="Tuliskan deskripsi tryout, keunggulan, dll..." />
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 md:p-8 mt-8 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-slate-800 opacity-50"><Eye size={120} /></div>
            <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <Eye size={18} /> Live Preview Harga
            </h3>
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Tampilan yang akan dilihat oleh user:</p>
                {isDiscountValidPreview ? (
                  <>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-slate-500 line-through decoration-rose-500 decoration-2">
                        {formatRupiah(Number(formData.price))}
                      </span>
                      <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-md tracking-widest">
                        HEMAT {diskonPersen}%
                      </span>
                    </div>
                    <div className="text-4xl font-black text-emerald-400">
                      {formatRupiah(Number(formData.discount_price))}
                    </div>
                  </>
                ) : (
                  <div className="text-4xl font-black text-white">
                    {Number(formData.price) === 0 ? <span className="text-emerald-400">GRATIS</span> : formatRupiah(Number(formData.price))}
                  </div>
                )}
              </div>
              {isDiscountValidPreview && (formData.discount_start_date || formData.discount_end_date) && (
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl text-sm font-medium w-full md:max-w-sm">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2 text-xs uppercase tracking-widest">
                    <Calendar size={14} /> Periode Diskon:
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Mulai: <span className="text-white font-bold">{formData.discount_start_date ? formatTanggalIndo(formData.discount_start_date) : 'Sekarang'}</span><br/>
                    Berakhir: <span className="text-white font-bold">{formData.discount_end_date ? formatTanggalIndo(formData.discount_end_date) : 'Seterusnya'}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="px-6 sm:px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <button 
            type="button" 
            onClick={() => setDeleteModalOpen(true)}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 text-sm"
          >
            <Trash2 size={16} /> Hapus Tryout
          </button>

          <div className="flex items-center w-full sm:w-auto gap-3">
            <Link href="/admin/tryouts/skd/manage" className="w-full sm:w-auto px-5 py-2.5 text-center bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-all text-sm">
              Batal
            </Link>
            <button type="submit" form="editTryoutForm" disabled={loading} className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 text-sm">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Perubahan
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        type="danger"
        title="Hapus Tryout Ini?"
        message="Tindakan ini tidak bisa dibatalkan. Seluruh bank soal, pengaturan harga, dan data peserta yang terkait dengan Tryout ini akan terhapus secara permanen."
        confirmText="Ya, Hapus Permanen"
      />
    </div>
  );
}