"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit, Trash2, XCircle, Loader2, Ticket,
  Search, ToggleLeft, ToggleRight, Tag, Calendar, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

interface Voucher {
  id: number;
  code: string;
  name: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  used_count: number;
  applicable_to: 'all' | 'e_product' | 'course';
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyForm = {
  code: '',
  name: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_purchase: '',
  max_uses: '',
  applicable_to: 'all' as 'all' | 'e_product' | 'course',
  expires_at: '',
  is_active: true,
};

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers]     = useState<Voucher[]>([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [form, setForm]             = useState({ ...emptyForm });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const res  = await apiFetch('/admin/vouchers');
      const json = await res.json();
      if (res.ok && json.success) setVouchers(json.data);
    } catch {
      toast.error('Gagal mengambil data voucher');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const openModal = (voucher: Voucher | null = null) => {
    if (voucher) {
      setEditingId(voucher.id);
      setForm({
        code:           voucher.code,
        name:           voucher.name,
        discount_type:  voucher.discount_type,
        discount_value: String(voucher.discount_value),
        min_purchase:   voucher.min_purchase > 0 ? String(voucher.min_purchase) : '',
        max_uses:       voucher.max_uses ? String(voucher.max_uses) : '',
        applicable_to:  voucher.applicable_to,
        expires_at:     voucher.expires_at ? voucher.expires_at.substring(0, 16) : '',
        is_active:      voucher.is_active,
      });
    } else {
      setEditingId(null);
      setForm({ ...emptyForm });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => { setEditingId(null); setForm({ ...emptyForm }); }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.discount_value) {
      return toast.error('Kode, nama, dan nilai diskon wajib diisi!');
    }
    if (form.discount_type === 'percent' && Number(form.discount_value) > 100) {
      return toast.error('Diskon persen tidak boleh lebih dari 100%!');
    }

    setIsSubmitting(true);
    const loadToast = toast.loading(editingId ? 'Menyimpan perubahan...' : 'Membuat voucher...');

    const payload: any = {
      code:           form.code.trim().toUpperCase(),
      name:           form.name.trim(),
      discount_type:  form.discount_type,
      discount_value: Number(form.discount_value),
      applicable_to:  form.applicable_to,
      is_active:      form.is_active,
    };
    if (form.min_purchase)  payload.min_purchase = Number(form.min_purchase);
    if (form.max_uses)      payload.max_uses     = Number(form.max_uses);
    if (form.expires_at)    payload.expires_at   = form.expires_at;

    try {
      const url = editingId ? `/admin/vouchers/${editingId}` : '/admin/vouchers';
      const res  = await apiFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        fetchVouchers();
        closeModal();
      } else {
        const errMsg = json.errors
          ? Object.values(json.errors as Record<string, string[]>).flat().join(', ')
          : json.message || 'Gagal menyimpan voucher.';
        toast.error(errMsg, { id: loadToast });
      }
    } catch {
      toast.error('Terjadi kesalahan server.', { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus voucher ini? Aksi ini tidak dapat dibatalkan.')) return;
    const loadToast = toast.loading('Menghapus voucher...');
    try {
      const res  = await apiFetch(`/admin/vouchers/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message, { id: loadToast });
        fetchVouchers();
      } else {
        toast.error(json.message || 'Gagal menghapus.', { id: loadToast });
      }
    } catch {
      toast.error('Terjadi kesalahan.', { id: loadToast });
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const res  = await apiFetch(`/admin/vouchers/${id}/toggle`, { method: 'PATCH' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        fetchVouchers();
      } else {
        toast.error(json.message || 'Gagal mengubah status.');
      }
    } catch {
      toast.error('Terjadi kesalahan.');
    }
  };

  const filtered = vouchers.filter(v =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const applicableLabel = (val: string) => {
    if (val === 'e_product') return 'E-Produk';
    if (val === 'course')    return 'Kursus';
    return 'Semua';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Kelola Voucher</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
              {vouchers.length} voucher terdaftar
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text" placeholder="Cari kode / nama..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none w-full md:w-56 transition-all"
            />
          </div>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-violet-700 transition-all shadow-md shrink-0"
          >
            <Plus size={16} /> <span className="hidden sm:block">Buat Voucher</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Kode</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Nama</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Diskon</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Berlaku Untuk</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Pemakaian</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Kedaluwarsa</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px]">Status</th>
              <th className="px-5 py-4 font-bold uppercase tracking-wider text-[10px] text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                <Loader2 size={32} className="animate-spin mx-auto mb-3 text-violet-500" />Memuat data...
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                <Ticket size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-700">Belum ada voucher</p>
                <p className="text-xs text-slate-400 mt-1">Klik "Buat Voucher" untuk membuat voucher baru</p>
              </td></tr>
            ) : (
              filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-lg text-xs tracking-widest">
                      {v.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{v.name}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600">
                    {v.discount_type === 'percent'
                      ? `${v.discount_value}%`
                      : formatRupiah(v.discount_value)}
                    {v.min_purchase > 0 && (
                      <span className="block text-[11px] font-normal text-slate-400">
                        Min. {formatRupiah(v.min_purchase)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {applicableLabel(v.applicable_to)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <div className="flex items-center gap-1 text-xs">
                      <Users size={12} className="text-slate-400" />
                      {v.used_count} / {v.max_uses ?? '∞'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {v.expires_at
                      ? new Date(v.expires_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                      : <span className="text-slate-300">Tidak ada</span>}
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleToggle(v.id)} className="transition-colors">
                      {v.is_active
                        ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><ToggleRight size={20} className="text-emerald-500" /> Aktif</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><ToggleLeft size={20} /> Nonaktif</span>}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openModal(v)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <h2 className="text-lg font-black text-slate-900">
                  {editingId ? 'Edit Voucher' : 'Buat Voucher Baru'}
                </h2>
                <button onClick={closeModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="voucherForm" onSubmit={handleSubmit} className="space-y-4">

                  {/* Kode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Kode Voucher <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" required value={form.code}
                      onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="Cth: DISKON20"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold tracking-widest focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Kode akan otomatis dikapitalkan.</p>
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Nama / Deskripsi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text" required value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Cth: Diskon Spesial Pelanggan VIP"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                    />
                  </div>

                  {/* Tipe & Nilai Diskon */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Tipe Diskon <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={form.discount_type}
                        onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      >
                        <option value="percent">Persen (%)</option>
                        <option value="fixed">Nominal (Rp)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Nilai Diskon <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number" required min={1} max={form.discount_type === 'percent' ? 100 : undefined}
                        value={form.discount_value}
                        onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                        placeholder={form.discount_type === 'percent' ? '10' : '50000'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Min Pembelian & Maks Pemakaian */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Min. Pembelian (Rp)
                      </label>
                      <input
                        type="number" min={0} value={form.min_purchase}
                        onChange={e => setForm(f => ({ ...f, min_purchase: e.target.value }))}
                        placeholder="0 = tidak ada"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Maks. Pemakaian
                      </label>
                      <input
                        type="number" min={1} value={form.max_uses}
                        onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                        placeholder="Kosong = unlimited"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Berlaku Untuk & Tanggal Expire */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Berlaku Untuk
                      </label>
                      <select
                        value={form.applicable_to}
                        onChange={e => setForm(f => ({ ...f, applicable_to: e.target.value as 'all' | 'e_product' | 'course' }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      >
                        <option value="all">Semua Produk</option>
                        <option value="e_product">E-Produk saja</option>
                        <option value="course">Kursus saja</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Kedaluwarsa
                      </label>
                      <input
                        type="datetime-local" value={form.expires_at}
                        onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Status Aktif */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Status Voucher</p>
                      <p className="text-xs text-slate-500 mt-0.5">Voucher aktif dapat digunakan oleh pembeli</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                      className="transition-colors"
                    >
                      {form.is_active
                        ? <ToggleRight size={36} className="text-emerald-500" />
                        : <ToggleLeft size={36} className="text-slate-300" />}
                    </button>
                  </div>

                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={closeModal} disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" form="voucherForm" disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-md disabled:opacity-70">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Voucher'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

