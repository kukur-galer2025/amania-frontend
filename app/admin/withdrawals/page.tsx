"use client";

import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/app/utils/api';
import { safeStorage } from '@/app/utils/safeStorage';
import {
  CreditCard, Loader2, CheckCircle2, Clock, XCircle, Search, 
  UploadCloud, FileText, Landmark, DollarSign, Wallet, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WithdrawalsPage() {
  const [role, setRole] = useState<'superadmin' | 'creator' | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  
  // Modals
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedWd, setSelectedWd] = useState<any>(null);

  // Form Request
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  // Form Admin Action
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(safeStorage.getItem('user') || '{}');
    if (user && user.role) {
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (role) {
      fetchData();
    }
  }, [role]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resStats, resWd] = await Promise.all([
        apiFetch('/withdrawals/stats'),
        apiFetch('/withdrawals')
      ]);
      const jsonStats = await resStats.json();
      const jsonWd = await resWd.json();

      if (jsonStats.success) setStats(jsonStats.data);
      if (jsonWd.success) setWithdrawals(jsonWd.data);
    } catch {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);
  const formatDate = (d: string) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), bank_name: bankName, bank_account_name: bankAccountName, bank_account_number: bankAccountNumber })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setShowRequestModal(false);
        setAmount(''); setBankName(''); setBankAccountName(''); setBankAccountNumber('');
        fetchData();
      } else {
        toast.error(json.message || 'Gagal mengajukan.');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProof) return toast.error('Bukti transfer wajib diunggah.');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('transfer_proof', transferProof);
      // workaround for laravel POST with files
      const res = await apiFetch(`/withdrawals/${selectedWd.id}/approve`, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setShowApproveModal(false);
        setSelectedWd(null);
        setTransferProof(null);
        fetchData();
      } else {
        toast.error(json.message || 'Gagal.');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectNotes.trim()) return toast.error('Alasan penolakan wajib diisi.');
    setSubmitting(true);
    try {
      const res = await apiFetch(`/withdrawals/${selectedWd.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rejectNotes })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message);
        setShowRejectModal(false);
        setSelectedWd(null);
        setRejectNotes('');
        fetchData();
      } else {
        toast.error(json.message || 'Gagal.');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (s: string) => {
    if (s === 'approved') return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">Berhasil</span>;
    if (s === 'rejected') return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">Ditolak</span>;
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">Menunggu</span>;
  };

  if (loading) {
    return <div className="h-[60vh] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER & STATS */}
      {role === 'creator' ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Penarikan Dana</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Kelola pendapatan dan ajukan pencairan ke rekening Anda.</p>
            </div>
            <button 
              onClick={() => setShowRequestModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <Landmark size={18} /> Ajukan Penarikan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Wallet size={64} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Tersedia</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatRp(stats.available_balance)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Clock size={64} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menunggu Diproses</p>
              <p className="text-2xl font-black text-amber-600 mt-2">{formatRp(stats.total_pending)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={64} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Berhasil Ditarik</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">{formatRp(stats.total_withdrawn)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><DollarSign size={64} /></div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
              <p className="text-2xl font-black text-slate-900 mt-2">{formatRp(stats.total_revenue)}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verifikasi Penarikan</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Kelola dan proses pengajuan dana dari kreator.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pengajuan Menunggu</p>
              <p className="text-2xl font-black text-amber-600 mt-2">{stats.total_pending_requests} Pengajuan</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal Menunggu</p>
              <p className="text-2xl font-black text-amber-600 mt-2">{formatRp(stats.total_pending_amount)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Telah Dibayar</p>
              <p className="text-2xl font-black text-emerald-600 mt-2">{formatRp(stats.total_paid_amount)}</p>
            </div>
          </div>
        </>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                {role === 'superadmin' && <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Kreator</th>}
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Bank & Rekening</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Aksi / Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdrawals.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-medium">Belum ada data penarikan.</td></tr>
              ) : withdrawals.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-sm text-slate-600 font-medium">{formatDate(w.created_at)}</td>
                  {role === 'superadmin' && (
                    <td className="p-4">
                      <p className="text-sm font-bold text-slate-900">{w.user?.name}</p>
                      <p className="text-xs text-slate-500">{w.user?.email}</p>
                    </td>
                  )}
                  <td className="p-4 text-sm font-bold text-slate-900">{formatRp(w.amount)}</td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-slate-900">{w.bank_name}</p>
                    <p className="text-xs font-medium text-slate-500">{w.bank_account_number} a.n {w.bank_account_name}</p>
                  </td>
                  <td className="p-4">{getStatusBadge(w.status)}</td>
                  <td className="p-4">
                    {role === 'creator' && w.status === 'approved' && w.transfer_proof && (
                      <button onClick={() => { setSelectedWd(w); setShowProofModal(true); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <Eye size={14} /> Lihat Bukti
                      </button>
                    )}
                    {role === 'creator' && w.status === 'rejected' && w.notes && (
                      <p className="text-xs text-rose-500 font-medium max-w-[200px] truncate" title={w.notes}>Alasan: {w.notes}</p>
                    )}
                    {role === 'superadmin' && w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedWd(w); setShowApproveModal(true); }} className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-xs font-bold transition-colors">Proses</button>
                        <button onClick={() => { setSelectedWd(w); setShowRejectModal(true); }} className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-colors">Tolak</button>
                      </div>
                    )}
                    {role === 'superadmin' && w.status === 'approved' && w.transfer_proof && (
                      <button onClick={() => { setSelectedWd(w); setShowProofModal(true); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        <Eye size={14} /> Lihat Bukti
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AJUKAN PENARIKAN (CREATOR) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !submitting && setShowRequestModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900 mb-1">Ajukan Penarikan</h2>
            <p className="text-sm text-slate-500 mb-6">Saldo tersedia: <strong className="text-slate-800">{formatRp(stats.available_balance)}</strong></p>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Penarikan</label>
                <input type="number" min="50000" max={stats.available_balance} required value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Minimal Rp 50.000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank / E-Wallet</label>
                <input type="text" required value={bankName} onChange={e => setBankName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: BCA / GoPay" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Rekening</label>
                <input type="text" required value={bankAccountNumber} onChange={e => setBankAccountNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: 1234567890" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                <input type="text" required value={bankAccountName} onChange={e => setBankAccountName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Sesuai buku tabungan" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Ajukan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE (ADMIN) */}
      {showApproveModal && selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !submitting && setShowApproveModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-1">Proses Pencairan</h2>
            <p className="text-sm text-slate-500 mb-4">Upload bukti transfer untuk pengajuan dari <strong>{selectedWd.user?.name}</strong>.</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <p className="text-xs text-slate-500 mb-1">Total Transfer:</p>
              <p className="text-2xl font-black text-emerald-600 mb-3">{formatRp(selectedWd.amount)}</p>
              <p className="text-xs text-slate-500">Tujuan:</p>
              <p className="text-sm font-bold text-slate-800">{selectedWd.bank_name}</p>
              <p className="text-sm font-bold text-slate-800">{selectedWd.bank_account_number} a.n {selectedWd.bank_account_name}</p>
            </div>
            <form onSubmit={handleApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Upload Bukti Transfer (Image)</label>
                <input type="file" accept="image/*" required onChange={e => setTransferProof(e.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowApproveModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex justify-center items-center">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Selesai & Setujui'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT (ADMIN) */}
      {showRejectModal && selectedWd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !submitting && setShowRejectModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-1">Tolak Pencairan</h2>
            <p className="text-sm text-slate-500 mb-6">Berikan alasan mengapa penarikan ini ditolak.</p>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan</label>
                <textarea required rows={4} value={rejectNotes} onChange={e => setRejectNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Misal: Nomor rekening tidak valid..." />
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 flex justify-center items-center">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Tolak Penarikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PROOF */}
      {showProofModal && selectedWd?.transfer_proof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowProofModal(false)} />
          <div className="relative bg-white rounded-3xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Bukti Transfer</h3>
              <button onClick={() => setShowProofModal(false)} className="text-slate-400 hover:text-slate-700"><XCircle size={20} /></button>
            </div>
            <img src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${selectedWd.transfer_proof}`} alt="Bukti Transfer" className="w-full h-auto object-contain max-h-[70vh]" />
          </div>
        </div>
      )}

    </div>
  );
}
