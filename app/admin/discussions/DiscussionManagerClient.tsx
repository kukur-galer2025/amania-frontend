"use client";
import { safeStorage } from '@/app/utils/safeStorage';

import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/app/utils/api';
import toast from 'react-hot-toast';
import { 
  MessageSquare, Loader2, Send, Search, Filter, 
  CheckCircle2, Clock, ChevronRight, UserCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscussionManagerClient() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unanswered' | 'answered'>('all');
  
  const [activeThread, setActiveThread] = useState<any>(null);
  const [replyBody, setReplyBody] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{isOpen: boolean; id: number | null}>({isOpen: false, id: null});
  
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    const userStr = safeStorage.getItem('user');
    if (userStr) setMe(JSON.parse(userStr));
    fetchDiscussions();
  }, [filterStatus]);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all' ? '/admin/discussions' : `/admin/discussions?status=${filterStatus}`;
      const res = await apiFetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setDiscussions(json.data);
        // If active thread is open, update its data
        if (activeThread) {
           const updated = json.data.find((d: any) => d.id === activeThread.id);
           if (updated) setActiveThread(updated);
           else setActiveThread(null);
        }
      } else {
        toast.error('Gagal mengambil data diskusi');
      }
    } catch {
      toast.error('Kesalahan server');
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !activeThread) return;

    setSendingReply(true);
    try {
      const res = await apiFetch(`/admin/discussions/${activeThread.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ body: replyBody })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Balasan terkirim!');
        setReplyBody('');
        fetchDiscussions();
      } else {
        toast.error(json.message || 'Gagal mengirim balasan');
      }
    } catch {
      toast.error('Terjadi kesalahan server');
    } finally {
      setSendingReply(false);
    }
  };

  const deleteDiscussion = async () => {
    if (!deleteConfirmModal.id) return;
    setDeletingId(deleteConfirmModal.id);
    try {
      const res = await apiFetch(`/admin/discussions/${deleteConfirmModal.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Diskusi dihapus');
        if (activeThread?.id === deleteConfirmModal.id) setActiveThread(null);
        fetchDiscussions();
      } else {
        toast.error('Gagal menghapus diskusi');
      }
    } catch {
      toast.error('Terjadi kesalahan');
    } finally {
      setDeletingId(null);
      setDeleteConfirmModal({isOpen: false, id: null});
    }
  };

  // Helper to check if a thread is answered by current user
  const isAnsweredByMe = (thread: any) => {
    if (!me || !thread.replies) return false;
    return thread.replies.some((r: any) => r.user_id === me.id);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[700px] max-h-[85vh]">
      
      {/* ── LEFT PANEL: LIST OF DISCUSSIONS ── */}
      <div className={`w-full md:w-1/3 lg:w-[400px] border-r border-slate-200 flex flex-col bg-slate-50/50 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header & Filters */}
        <div className="p-5 border-b border-slate-200 bg-white">
           <h2 className="text-lg font-black text-slate-800 mb-4">Kotak Masuk</h2>
           <div className="flex bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setFilterStatus('all')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Semua</button>
             <button onClick={() => setFilterStatus('unanswered')} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${filterStatus === 'unanswered' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Belum Dibalas</button>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {loading && discussions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <Loader2 size={32} className="animate-spin mb-4" />
                <p className="text-sm font-medium">Memuat diskusi...</p>
             </div>
           ) : discussions.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center">
                <MessageSquare size={48} className="mb-4 opacity-30" />
                <p className="text-sm font-medium">Tidak ada diskusi ditemukan.</p>
             </div>
           ) : (
             <div className="divide-y divide-slate-100">
               {discussions.map(d => {
                 const answered = isAnsweredByMe(d);
                 return (
                   <div 
                     key={d.id} 
                     onClick={() => setActiveThread(d)}
                     className={`p-4 cursor-pointer transition-colors ${activeThread?.id === d.id ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'hover:bg-white border-l-4 border-transparent'}`}
                   >
                     <div className="flex justify-between items-start mb-2">
                       <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate max-w-[70%]">
                         <UserCircle2 size={14} className="text-slate-400" />
                         {d.user?.name}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                         {new Date(d.created_at).toLocaleDateString()}
                       </span>
                     </div>
                     <p className="text-xs font-bold text-slate-500 truncate mb-2">{d.lesson?.section?.course?.title}</p>
                     <p className="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">{d.body}</p>
                     
                     <div className="flex items-center gap-2">
                       {answered ? (
                         <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded flex items-center gap-1">
                           <CheckCircle2 size={12} /> Sudah dibalas
                         </span>
                       ) : (
                         <span className="px-2 py-1 bg-rose-100 text-rose-600 text-[10px] font-bold rounded flex items-center gap-1">
                           <Clock size={12} /> Belum dibalas
                         </span>
                       )}
                       <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                         {d.replies?.length || 0} Balasan
                       </span>
                     </div>
                   </div>
                 );
               })}
             </div>
           )}
        </div>
      </div>

      {/* ── RIGHT PANEL: THREAD DETAIL ── */}
      <div className={`flex-1 flex flex-col bg-white relative ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
        {!activeThread ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300">
             <MessageSquare size={64} className="mb-4 opacity-50" />
             <p className="text-lg font-bold text-slate-400">Pilih diskusi untuk melihat detail</p>
          </div>
        ) : (
          <>
            {/* Header Thread */}
            <div className="p-4 md:p-6 border-b border-slate-200 flex items-center gap-4 bg-white shrink-0 shadow-sm z-10">
               <button onClick={() => setActiveThread(null)} className="md:hidden p-2 bg-slate-100 rounded-lg text-slate-600">
                 <ChevronRight size={20} className="rotate-180" />
               </button>
               <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-slate-800 truncate">{activeThread.lesson?.title}</h3>
                  <p className="text-xs font-bold text-slate-500 truncate">{activeThread.lesson?.section?.course?.title}</p>
               </div>
               <button onClick={() => setDeleteConfirmModal({isOpen: true, id: activeThread.id})} disabled={deletingId === activeThread.id} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg shrink-0">
                  Hapus Thread
               </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
               {/* Original Question */}
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0">
                    {activeThread.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative">
                     <span className="absolute -left-2 top-0 w-4 h-4 bg-white border-l border-t border-slate-200 transform -skew-x-12 -z-10"></span>
                     <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-sm text-slate-800">{activeThread.user?.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-2">Siswa</span></span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(activeThread.created_at).toLocaleString()}</span>
                     </div>
                     <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{activeThread.body}</p>
                  </div>
               </div>

               {/* Replies */}
               {activeThread.replies?.map((r: any) => {
                 const isMe = me && r.user_id === me.id;
                 return (
                   <div key={r.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${isMe ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                        {r.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className={`flex-1 p-4 rounded-2xl border shadow-sm relative ${isMe ? 'bg-indigo-50 border-indigo-100 rounded-tr-none' : 'bg-white border-slate-200 rounded-tl-none'}`}>
                         <span className={`absolute top-0 w-4 h-4 transform -z-10 ${isMe ? '-right-2 bg-indigo-50 border-r border-t border-indigo-100 skew-x-12' : '-left-2 bg-white border-l border-t border-slate-200 -skew-x-12'}`}></span>
                         <div className="flex justify-between items-end mb-2">
                            <span className="font-bold text-sm text-slate-800 flex items-center gap-2">
                               {r.user?.name}
                               {(r.user?.role === 'creator' || r.user?.role === 'superadmin') && (
                                  <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold">Instruktur</span>
                               )}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(r.created_at).toLocaleString()}</span>
                         </div>
                         <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{r.body}</p>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Reply Form */}
            <div className="p-4 border-t border-slate-200 bg-white">
               <form onSubmit={sendReply} className="flex gap-3">
                  <textarea
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    placeholder="Ketik balasan Anda di sini..."
                    className="flex-1 border border-slate-300 rounded-xl p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-slate-50"
                    rows={2}
                  />
                  <button 
                    type="submit" 
                    disabled={!replyBody.trim() || sendingReply}
                    className="px-5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                  >
                    {sendingReply ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
               </form>
            </div>
          </>
        )}
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl relative max-w-sm w-full overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-6">
                 <h3 className="text-lg font-black text-slate-900 mb-2">Hapus Diskusi?</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Apakah Anda yakin ingin menghapus seluruh diskusi ini beserta semua balasannya? Tindakan ini tidak dapat dibatalkan.
                 </p>
              </div>
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                 <button 
                   onClick={() => setDeleteConfirmModal({isOpen: false, id: null})}
                   className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={deleteDiscussion}
                   disabled={deletingId !== null}
                   className="px-4 py-2 rounded-lg text-sm font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors flex items-center gap-2"
                 >
                   {deletingId !== null ? <Loader2 size={16} className="animate-spin" /> : null}
                   Ya, Hapus
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
