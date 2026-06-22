"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 ShoppingCart, Trash2, ArrowRight, Loader2, 
 CreditCard, Store, ShoppingBag, ShieldCheck, 
 Info, Banknote, Layers, FileText, X, CheckCircle2, AlertCircle, Check, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 🔥 CUSTOM ICON: fa-money style
const FaMoneyIcon = ({ className }: { className?: string }) => (
 <svg className={className} fill="currentColor" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg">
 <path d="M128 160h320v192H128V160zm64 32v128h192V192H192zM32 64h512c17.7 0 32 14.3 32 32v384c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32zm64 64v256h384V128H96z"/>
 </svg>
);

export default function CartClient() {
 const router = useRouter();
 const [cartItems, setCartItems] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 // 🔥 STATE BARU UNTUK CHECKBOX MULTI-SELECT 🔥
 const [selectedItems, setSelectedItems] = useState<number[]>([]);

 const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
 const [paymentProof, setPaymentProof] = useState<File | null>(null);
 const [checkoutLoading, setCheckoutLoading] = useState(false);

 const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

 const formatRupiah = (price: number) => {
 if (price === 0) return 'Gratis';
 return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
 };

 // 🔥 KALKULASI DYNAMIS BERDASARKAN ITEM YANG DIPILIH (CHECKED) 🔥
 const totals = useMemo(() => {
 const selectedCartObjects = cartItems.filter(item => selectedItems.includes(item.id));
 
 let original = 0;
 let price = 0;

 selectedCartObjects.forEach(item => {
 const itemOriginal = item.product.original_price || (item.product.price * 5);
 original += itemOriginal;
 price += item.product.price;
 });

 return {
 count: selectedCartObjects.length,
 totalOriginal: original,
 totalPrice: price,
 totalDiscount: original - price
 };
 }, [cartItems, selectedItems]);

 const fetchCart = async () => {
 try {
 const res = await apiFetch('/cart', {
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` }
 });
 const json = await res.json();
 if (res.ok && json.success) {
 setCartItems(json.data);
 // Pertahankan pilihan user sebelumnya. Jika baru pertama load, pilih semua.
 setSelectedItems(prev => prev.length > 0 ? prev.filter(id => json.data.some((item: any) => item.id === id)) : json.data.map((item: any) => item.id));
 }
 } catch (error) {
 toast.error('Gagal memuat keranjang.');
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchCart();
 const handleCartUpdated = () => fetchCart();
 window.addEventListener('cartUpdated', handleCartUpdated);
 return () => window.removeEventListener('cartUpdated', handleCartUpdated);
 }, []);

 // 🔥 LOGIKA CHECKBOX 🔥
 const handleToggleSelect = (id: number) => {
 setSelectedItems(prev => 
 prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
 );
 };

 const handleToggleSelectAll = () => {
 if (selectedItems.length === cartItems.length) {
 setSelectedItems([]); // Kosongkan jika sudah terpilih semua
 } else {
 setSelectedItems(cartItems.map(item => item.id)); // Pilih semua
 }
 };

 const handleRemoveItem = async (id: number) => {
 const tid = toast.loading('Menghapus produk...');
 try {
 const res = await apiFetch(`/cart/${id}`, {
 method: 'DELETE',
 headers: { 'Authorization': `Bearer ${safeStorage.getItem('token')}` }
 });
 if (res.ok) {
 toast.success('Produk dihapus', { id: tid });
 // Hapus dari state selected secara manual agar tidak ada id hantu tertinggal
 setSelectedItems(prev => prev.filter(itemId => itemId !== id));
 window.dispatchEvent(new Event('cartUpdated'));
 fetchCart(); 
 }
 } catch (error) {
 toast.error('Gagal menghapus', { id: tid });
 }
 };

 const handleOpenPaymentModal = async () => {
 if (selectedItems.length === 0) {
 toast.error("Pilih setidaknya satu produk untuk di-checkout!");
 return;
 }

 setIsPaymentModalOpen(true);
 };

 const handleProcessCheckout = async () => {
 if (!paymentProof) { toast.error("Unggah bukti transfer terlebih dahulu!"); return; }
 if (selectedItems.length === 0) { toast.error("Tidak ada item yang dipilih."); return; }

 setCheckoutLoading(true);
 const tid = toast.loading('Membuka gerbang pembayaran...');
 try {
 const formData = new FormData();
 formData.append('method', 'MANUAL_QRIS');
 selectedItems.forEach(id => {
 formData.append('cart_ids[]', id.toString());
 });
 if (paymentProof) {
 formData.append('payment_proof', paymentProof);
 }

 const res = await apiFetch('/checkout/e-product', {
 method: 'POST',
 headers: {
 'Authorization': `Bearer ${safeStorage.getItem('token')}`
 },
 body: formData
 });
 const json = await res.json();
 if (res.ok && json.success) {
 if (json.checkout_url) {
 toast.success('Pesanan dibuat, mengarahkan!', { id: tid });
 window.location.href = json.checkout_url; 
 } else {
 toast.success('Pemesanan berhasil! Menunggu konfirmasi admin.', { id: tid });
 setIsPaymentModalOpen(false);
 router.push('/my-e-products');
 }
 } else {
 toast.error(json.message || 'Gagal checkout', { id: tid });
 }
 } catch (error) {
 toast.error('Terjadi kesalahan sistem', { id: tid });
 } finally {
 setCheckoutLoading(false);
 }
 };



 if (loading) return (
 <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 relative z-10">
 <Loader2 className="animate-spin text-amber-600 w-12 h-12"/>
 <p className="text-sm font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest animate-pulse">Sinkronisasi Keranjang...</p>
 </div>
 );

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 animate-in fade-in duration-700 relative z-10">
 
 <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-50 dark:bg-amber-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>
 <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal"></div>

 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-200 dark:border-slate-700/50 pb-8">
 <div className="flex items-center gap-4">
 <div className="p-4 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl shadow-lg dark:shadow-black/20 shadow-orange-500/20">
 <ShoppingCart size={32} strokeWidth={2.5} />
 </div>
 <div>
 <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Keranjang Belanja</h1>
 <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
 <ShoppingBag size={16} className="text-amber-600"/> {cartItems.length} Aset Digital Tersimpan
 </p>
 </div>
 </div>
 <Link href="/e-products" className="text-xs md:text-sm font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300 flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-2 rounded-xl transition-transform w-fit shadow-sm dark:shadow-black/10">
 <Store size={16} /> Lanjut Belanja
 </Link>
 </div>

 {cartItems.length === 0 ? (
 <div className="bg-white dark:bg-[#111827] backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700/50 hover:border-amber-400 dark:hover:border-amber-500/50 rounded-[2.5rem] p-12 md:p-24 flex flex-col items-center text-center shadow-sm dark:shadow-black/10 group">
 <div className="w-24 h-24 bg-slate-50 dark:bg-[#111827] rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:-translate-y-2 transition-transform duration-500 border border-slate-100 dark:border-slate-700/50">
 <ShoppingCart size={40} className="text-amber-400" strokeWidth={2} />
 </div>
 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Wah, Keranjangmu Kosong!</h2>
 <p className="text-slate-500 dark:text-slate-400 mb-10 max-w-md leading-relaxed font-medium text-sm md:text-base">
 Sepertinya Anda belum memilih materi premium. Yuk, jelajahi pustaka digital Amania dan tingkatkan keahlian Anda sekarang.
 </p>
 <Link href="/e-products" className="px-10 py-4 bg-gradient-to-r from-orange-600 to-amber-700 hover:from-orange-500 hover:to-amber-600 text-white rounded-2xl font-black transition-transform shadow-lg dark:shadow-black/20 shadow-amber-900/20 active:scale-95 flex items-center gap-3">
 Eksplorasi Produk <ArrowRight size={20} />
 </Link>
 </div>
 ) : (
 <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
 
 {/* DAFTAR ITEM (KIRI) */}
 <div className="flex-1 w-full flex flex-col gap-4">
 
 {/* 🔥 PANEL PILIH SEMUA 🔥 */}
 <div className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm dark:shadow-black/10">
 <button onClick={handleToggleSelectAll} className="flex items-center gap-3 group px-2">
 <div className={`w-5 h-5 md:w-6 md:h-6 rounded-[8px] border-2 flex items-center justify-center transition-transform ${selectedItems.length === cartItems.length && cartItems.length > 0 ? 'bg-amber-50 dark:bg-amber-500 border-amber-500 shadow-md dark:shadow-black/15 shadow-amber-500/20' : 'border-slate-300 dark:border-slate-600 group-hover:border-amber-400 bg-slate-50 dark:bg-[#111827]'}`}>
 {selectedItems.length === cartItems.length && cartItems.length > 0 && <Check size={16} className="text-white" strokeWidth={3} />}
 </div>
 <span className="text-sm md:text-base font-black text-slate-700 dark:text-slate-300 select-none">Pilih Semua ({cartItems.length})</span>
 </button>
 </div>

 <div className="space-y-4">
 {cartItems.map((item) => {
 const itemOriginal = item.product.original_price || (item.product.price * 5);
 const itemDiscountPercent = Math.round(((itemOriginal - item.product.price) / itemOriginal) * 100);
 const isSelected = selectedItems.includes(item.id);

 return (
 <div key={item.id} className={`group flex flex-row items-center gap-3 md:gap-4 p-3 md:p-5 bg-white dark:bg-[#111827] rounded-[1.5rem] md:rounded-[2rem] border shadow-sm dark:shadow-black/10 transition-transform duration-300 relative overflow-hidden ${isSelected ? 'border-amber-400 dark:border-amber-500/50 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.12)]' : 'border-slate-100 dark:border-slate-700/50 hover:border-amber-200 dark:hover:border-amber-500/30'}`}>
 <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-50/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"/>
 
 {/* CHECKBOX INDIVIDUAL */}
 <button onClick={() => handleToggleSelect(item.id)} className="shrink-0 pl-1 md:pl-2 relative z-10 flex items-center justify-center">
 <div className={`w-5 h-5 md:w-6 md:h-6 rounded-[8px] border-2 flex items-center justify-center transition-transform ${isSelected ? 'bg-amber-50 dark:bg-amber-500 border-amber-500 shadow-md dark:shadow-black/15 shadow-amber-500/20' : 'border-slate-300 dark:border-slate-600 group-hover:border-amber-400 bg-slate-50 dark:bg-[#111827]'}`}>
 {isSelected && <Check size={16} className="text-white" strokeWidth={3} />}
 </div>
 </button>

 <div className="w-[70px] sm:w-[110px] md:w-[130px] shrink-0 rounded-2xl overflow-hidden shadow-md dark:shadow-black/15 border border-slate-100 dark:border-slate-700/50 aspect-[3/4] relative z-10 bg-slate-900 cursor-pointer" onClick={() => router.push(`/e-products/${item.product.slug}`)}>
 {item.product.cover_image ? (
 <img src={`${STORAGE_URL}/${item.product.cover_image}`} alt={item.product.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
 ) : (
 <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700/50 text-slate-300 dark:text-slate-500"><FileText size={24} /></div>
 )}
 <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-white/40 to-transparent mix-blend-overlay z-10 pointer-events-none"/>
 </div>

 <div className="flex-1 flex flex-col min-w-0 py-1 relative z-10 h-full justify-between">
 <div className="flex justify-between items-start gap-2 md:gap-4">
 <div className="min-w-0 cursor-pointer pr-1 md:pr-2" onClick={() => router.push(`/e-products/${item.product.slug}`)}>
 <h3 className="text-sm md:text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-orange-700 mb-2">{item.product.title}</h3>
 <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mt-1">
 <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider rounded-md border border-amber-100 dark:border-amber-500/20 flex items-center gap-1">
 <Layers size={10} /> Digital Asset
 </span>
 <span className="hidden sm:inline text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-400">• Akses Selamanya</span>
 </div>
 </div>
 <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-rose-400 hover:text-white hover:bg-rose-50 dark:bg-rose-500 rounded-full transition-transform shrink-0 border border-transparent hover:border-rose-600 shadow-sm dark:shadow-black/10 hover:shadow-rose-500/20 mt-[-5px] md:mt-0">
 <Trash2 size={16} strokeWidth={2.5} />
 </button>
 </div>

 <div className="mt-auto pt-3 md:pt-4 flex flex-col xl:flex-row xl:items-end justify-between gap-1">
 {item.product.price > 0 && (
 <div className="flex items-center gap-1.5">
 <span className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-400 line-through decoration-rose-500/40">
 {formatRupiah(itemOriginal)}
 </span>
 <span className="text-[8px] sm:text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-1.5 py-0.5 rounded">
 {itemDiscountPercent}% OFF
 </span>
 </div>
 )}
 <p className="text-base sm:text-lg md:text-2xl font-black text-slate-900 dark:text-white tracking-tight w-full">
 {formatRupiah(item.product.price)}
 </p>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* RINGKASAN TAGIHAN (KANAN) */}
 <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24">
 <div className="bg-white dark:bg-[#111827] p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-700/50 shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative overflow-hidden">
 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 dark:bg-amber-500/10 rounded-full -mr-16 -mt-16 opacity-50"/>
 
 <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-2 relative z-10">
 <CreditCard size={24} className="text-amber-600"/> Ringkasan Belanja
 </h2>
 
 <div className="space-y-3 mb-6 relative z-10 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
 {cartItems.filter(item => selectedItems.includes(item.id)).length === 0 ? (
 <p className="text-sm font-medium text-slate-400 dark:text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-[#111827] rounded-xl border border-dashed border-slate-200 dark:border-slate-700/50">
 Belum ada produk yang dipilih
 </p>
 ) : (
 cartItems.filter(item => selectedItems.includes(item.id)).map((item) => (
 <div key={item.id} className="flex justify-between items-start gap-4 text-sm">
 <span className="text-slate-600 dark:text-slate-400 font-medium line-clamp-2 leading-snug">{item.product.title}</span>
 <span className="font-bold text-slate-800 dark:text-slate-200 shrink-0">{formatRupiah(item.product.price)}</span>
 </div>
 ))
 )}
 </div>

 <div className="border-t border-slate-100 dark:border-slate-700/50 my-5 relative z-10"></div>

 <div className="space-y-4 mb-8 relative z-10">
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500 dark:text-slate-400 font-bold">Total Harga ({totals.count} barang)</span>
 <span className="font-bold text-slate-400 dark:text-slate-400 line-through">{formatRupiah(totals.totalOriginal)}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500 dark:text-slate-400 font-bold">Potongan Diskon</span>
 <span className="font-black text-rose-500">- {formatRupiah(totals.totalDiscount)}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="text-slate-500 dark:text-slate-400 font-bold">Biaya Layanan</span>
 <span className="font-black text-emerald-500">Gratis</span>
 </div>
 </div>

 <div className="pt-6 border-t-2 border-dashed border-slate-100 dark:border-slate-700/50 mb-10 relative z-10">
 <div className="flex justify-between items-center">
 <span className="text-sm font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">Total Tagihan</span>
 <span className="text-2xl md:text-3xl font-black text-orange-600 tracking-tighter">
 {formatRupiah(totals.totalPrice)}
 </span>
 </div>
 </div>

 <div className="space-y-3 relative z-10">
 <button 
 onClick={handleOpenPaymentModal} 
 disabled={selectedItems.length === 0}
 className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 md:py-5 rounded-2xl font-black text-sm md:text-base transition-transform shadow-[0_8px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_20px_rgba(5,150,105,0.4)] active:scale-95 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:shadow-none group overflow-hidden relative"
 >
 {selectedItems.length > 0 && <span className="absolute inset-0 w-full h-full -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]"/>}
 <FaMoneyIcon className={`shrink-0 w-[20px] h-[14px] ${selectedItems.length === 0 ? 'text-slate-400 dark:text-slate-400' : 'text-emerald-100'}`} />
 <span className="relative z-10">Bayar Sekarang</span>
 </button>
 <div className="flex items-center justify-center gap-2 pt-4 opacity-50">
 <ShieldCheck size={16} className="text-slate-400 dark:text-slate-400 shrink-0"/>
 <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest truncate">Secure 256-bit SSL Payment</span>
 </div>
 </div>
 </div>

 <div className="mt-6 p-6 bg-amber-50 dark:bg-amber-500/10 rounded-3xl border border-amber-100 dark:border-amber-500/20 flex gap-4">
 <Info className="text-amber-500 shrink-0" size={20} />
 <p className="text-[11px] md:text-xs text-amber-800 dark:text-amber-400 leading-relaxed font-medium">
 Setelah pembayaran terverifikasi, akses materi akan otomatis terbuka di halaman <strong>Koleksi E-Produk</strong> Anda.
 </p>
 </div>
 </div>
 </div>
 )}

 {/* MODAL PEMBAYARAN TRIPAY */}
 <AnimatePresence>
 {isPaymentModalOpen && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPaymentModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"/>
 <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-[#111827] rounded-[2rem] shadow-2xl dark:shadow-black/25 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
 <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-center bg-amber-50 dark:bg-amber-500/10/30">
 <div><h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Pilih Pembayaran</h3><p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Transaksi Aman & Terenkripsi</p></div>
 <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700/50 rounded-full text-slate-400 dark:text-slate-400 hover:text-rose-500"><X size={18}/></button>
 </div>
 <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar flex-1">
 <div className="space-y-6 w-full">
 <div className="text-center">
 <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">Transfer via QRIS</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Silakan scan kode QRIS di bawah ini untuk melakukan pembayaran.</p>
 <div className="bg-white p-2 rounded-xl inline-block border border-slate-200 dark:border-slate-700 shadow-sm mx-auto mb-3">
 <img src="/qris-amania.jpeg" alt="QRIS Amania" className="w-48 h-auto object-contain mx-auto rounded-lg" />
 </div>
 <div>
    <a href="/qris-amania.jpeg" download="QRIS-Amania.jpeg" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors border border-amber-200 dark:border-amber-500/20">
        <Download size={14} /> Unduh QRIS
    </a>
 </div>
 </div>
 <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
 <h4 className="text-sm font-black text-slate-900 dark:text-white mb-3">Upload Bukti Transfer</h4>
 <input
 type="file"
 accept="image/*"
 onChange={(e) => {
 if (e.target.files && e.target.files.length > 0) {
 setPaymentProof(e.target.files[0]);
 }
 }}
 className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 dark:file:bg-amber-900/30 dark:file:text-amber-400 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-2"
 />
 {paymentProof && (
 <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
 <CheckCircle2 size={12} /> File terpilih: {paymentProof.name}
 </p>
 )}
 </div>
 </div>
 </div>
 <div className="p-5 md:p-6 bg-white dark:bg-[#111827] border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="w-full sm:w-auto text-center sm:text-left"><p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase mb-1">Total Tagihan</p><p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{formatRupiah(totals.totalPrice)}</p></div>
 
 {/* 🔥 TOMBOL CHECKOUT MODAL TRIPAY 🔥 */}
 <button onClick={handleProcessCheckout} disabled={!paymentProof || checkoutLoading} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg dark:shadow-black/20 shadow-emerald-600/20 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 dark:text-slate-400 transition-transform flex items-center justify-center gap-2">
 {checkoutLoading ? <Loader2 className="animate-spin shrink-0" size={18}/> : <FaMoneyIcon className="shrink-0 w-[20px] h-[14px]"/>} {checkoutLoading ? 'Memproses...' : 'Bayar Sekarang'}
 </button>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <style jsx global>{`
 .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
 .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
 .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 6px; }
 .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #cbd5e1; }
 @keyframes shimmer { 100% { transform: translateX(100%); } }
 `}</style>
 </div>
 );
}