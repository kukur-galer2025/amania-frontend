"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, Search, Loader2, CheckCircle2, Clock, ListTodo,
  Calendar, Flag, Trash2, Edit3, X, CircleDot, Target,
  MessageSquare, ChevronDown, ChevronUp, Send, Tag, Columns, List,
  GripVertical, MoreHorizontal, CheckSquare, Square, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api';

// --- TYPES ---
type Subtask = { id: number; title: string; is_completed: boolean; };
type Comment = { id: number; body: string; user: { name: string }; created_at: string; };
type Task = {
  id: number; title: string; description: string | null;
  priority: 'low' | 'medium' | 'high'; status: 'pending' | 'in_progress' | 'completed';
  label_name: string | null; label_color: string | null;
  due_date: string | null; completed_at: string | null; created_at: string;
  subtasks: Subtask[]; comments: Comment[];
  subtask_progress: number | null; subtask_count: number; subtask_done: number; comments_count: number;
};

// --- CONFIGS ---
const PRIORITY_CFG = {
  high:   { label: 'Tinggi', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
  medium: { label: 'Sedang', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
  low:    { label: 'Rendah', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};
const STATUS_CFG = {
  pending:     { label: 'To Do', icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100', headerBg: 'bg-slate-500', border: 'border-slate-200' },
  in_progress: { label: 'In Progress', icon: CircleDot, color: 'text-blue-600', bg: 'bg-blue-50', headerBg: 'bg-blue-500', border: 'border-blue-200' },
  completed:   { label: 'Done', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', headerBg: 'bg-emerald-500', border: 'border-emerald-200' },
};
const LABEL_COLORS = [
  { name: 'Merah', value: '#EF4444' }, { name: 'Oranye', value: '#F97316' },
  { name: 'Kuning', value: '#EAB308' }, { name: 'Hijau', value: '#22C55E' },
  { name: 'Biru', value: '#3B82F6' }, { name: 'Ungu', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' }, { name: 'Abu', value: '#6B7280' },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [labelFilter, setLabelFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [labels, setLabels] = useState<{label_name: string; label_color: string}[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [formLabelName, setFormLabelName] = useState('');
  const [formLabelColor, setFormLabelColor] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [formSubtasks, setFormSubtasks] = useState<{title: string, is_completed?: boolean}[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Detail drawer
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // --- DATA FETCHING ---
  const fetchTasks = useCallback(async () => {
    try {
      const res = await apiFetch('/admin/tasks');
      const json = await res.json();
      if (res.ok && json.success) {
        setTasks(json.data);
        setStats(json.stats);
        if (json.labels) setLabels(json.labels);
      }
    } catch { toast.error('Gagal memuat task.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const q = searchQuery.toLowerCase();
      const matchSearch = t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchLabel = labelFilter === 'all' || t.label_name === labelFilter;
      return matchSearch && matchStatus && matchLabel;
    });
  }, [tasks, searchQuery, statusFilter, labelFilter]);

  // --- HANDLERS ---
  const openCreateModal = (status?: string) => {
    setEditingTask(null); setFormTitle(''); setFormDescription(''); setFormPriority('medium');
    setFormDueDate(''); setFormLabelName(''); setFormLabelColor('');
    setFormSubtasks([]);
    setFormStatus((status as any) || 'pending');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task); setFormTitle(task.title); setFormDescription(task.description || '');
    setFormPriority(task.priority); 
    // Format YYYY-MM-DD HH:mm:ss to YYYY-MM-DDTHH:mm for datetime-local input
    setFormDueDate(task.due_date ? task.due_date.slice(0, 16).replace(' ', 'T') : '');
    setFormLabelName(task.label_name || ''); setFormLabelColor(task.label_color || '');
    setFormSubtasks(task.subtasks.map(s => ({ title: s.title, is_completed: s.is_completed })));
    setFormStatus(task.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) { toast.error('Judul wajib diisi.'); return; }
    setSubmitting(true);
    try {
      const url = editingTask ? `/admin/tasks/${editingTask.id}` : '/admin/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle, description: formDescription || null, priority: formPriority,
          due_date: formDueDate || null, label_name: formLabelName || null,
          label_color: formLabelColor || null, status: formStatus,
          subtasks: formSubtasks,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) { toast.success(json.message); setShowModal(false); fetchTasks(); }
      else toast.error(json.message || 'Gagal.');
    } catch { toast.error('Error.'); } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (taskId: number) => {
    try {
      const res = await apiFetch(`/admin/tasks/${taskId}/toggle`, { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success) { toast.success(json.message); fetchTasks(); }
    } catch { toast.error('Gagal.'); }
  };

  const handleMoveTask = async (taskId: number, newStatus: string) => {
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

    try {
      const res = await apiFetch(`/admin/tasks/${taskId}/move`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, position: 0 }),
      });
      const json = await res.json();
      if (res.ok && json.success) { fetchTasks(); }
      else { fetchTasks(); toast.error(json.message); }
    } catch { toast.error('Gagal memindahkan task.'); fetchTasks(); }
  };

  const handleDelete = async (taskId: number) => {
    try {
      const res = await apiFetch(`/admin/tasks/${taskId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message); setDeletingId(null);
        if (selectedTask?.id === taskId) setSelectedTask(null);
        fetchTasks();
      }
    } catch { toast.error('Gagal.'); }
  };

  // Subtask handlers
  const handleAddSubtask = async (taskId: number) => {
    const title = newSubtask.trim();
    if (!title) return;
    
    // Optimistic UI Update untuk Tambah Subtask
    setNewSubtask('');
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = [...t.subtasks, { id: Date.now(), title, is_completed: false, position: t.subtasks.length + 1 }];
        const done = newSubtasks.filter(s => s.is_completed).length;
        const total = newSubtasks.length;
        return { ...t, subtasks: newSubtasks, subtask_done: done, subtask_count: total, subtask_progress: total > 0 ? Math.round((done / total) * 100) : null };
      }
      return t;
    }));

    try {
      await apiFetch(`/admin/tasks/${taskId}/subtasks`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchTasks();
    } catch { toast.error('Gagal.'); fetchTasks(); }
  };

  const handleToggleSubtask = async (taskId: number, subtaskId: number) => {
    // Optimistic UI Update untuk menghindari lag
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = t.subtasks.map(s => s.id === subtaskId ? { ...s, is_completed: !s.is_completed } : s);
        const done = newSubtasks.filter(s => s.is_completed).length;
        const total = newSubtasks.length;
        return {
          ...t,
          subtasks: newSubtasks,
          subtask_done: done,
          subtask_progress: total > 0 ? Math.round((done / total) * 100) : null
        };
      }
      return t;
    }));

    try {
      await apiFetch(`/admin/tasks/${taskId}/subtasks/${subtaskId}/toggle`, { method: 'POST' });
      // Fetch ulang di background untuk memastikan sinkronisasi akhir
      fetchTasks();
    } catch { 
      toast.error('Gagal.'); 
      fetchTasks(); // Revert jika gagal
    }
  };

  const handleDeleteSubtask = async (taskId: number, subtaskId: number) => {
    // Optimistic UI Update untuk Hapus Subtask
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtasks = t.subtasks.filter(s => s.id !== subtaskId);
        const done = newSubtasks.filter(s => s.is_completed).length;
        const total = newSubtasks.length;
        return { ...t, subtasks: newSubtasks, subtask_done: done, subtask_count: total, subtask_progress: total > 0 ? Math.round((done / total) * 100) : null };
      }
      return t;
    }));

    try {
      await apiFetch(`/admin/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
      fetchTasks();
    } catch { toast.error('Gagal.'); fetchTasks(); }
  };

  // Comment handlers
  const handleAddComment = async (taskId: number) => {
    if (!newComment.trim()) return;
    try {
      const res = await apiFetch(`/admin/tasks/${taskId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment }),
      });
      const json = await res.json();
      if (res.ok && json.success) { setNewComment(''); fetchTasks(); }
    } catch { toast.error('Gagal.'); }
  };

  const handleDeleteComment = async (taskId: number, commentId: number) => {
    try {
      await apiFetch(`/admin/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' });
      fetchTasks();
    } catch { toast.error('Gagal.'); }
  };

  const formatDateTime = (d: string) => {
    const date = new Date(d);
    return date.toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':');
  };
  const isOverdue = (t: Task) => t.due_date && t.status !== 'completed' && new Date(t.due_date) < new Date();

  // Keep selectedTask in sync
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find(t => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
      else setSelectedTask(null);
    }
  }, [tasks]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Memuat Tasks...</p>
      </div>
    );
  }

  // --- TASK CARD COMPONENT ---
  const TaskCard = ({ task }: { task: Task }) => {
    const priority = PRIORITY_CFG[task.priority];
    const overdue = isOverdue(task);
    return (
      <div
        onClick={() => setSelectedTask(task)}
        className={`bg-white rounded-xl border p-3.5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group ${
          task.status === 'completed' ? 'border-emerald-100 opacity-70' : overdue ? 'border-rose-200' : 'border-slate-200'
        }`}
      >
        {/* Label */}
        {task.label_name && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: task.label_color || '#6B7280' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: task.label_color || '#6B7280' }}>{task.label_name}</span>
          </div>
        )}
        {/* Title */}
        <h4 className={`font-bold text-sm leading-snug ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </h4>
        {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
        {/* Meta row */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${priority.bg} ${priority.color} ${priority.border} border`}>
            <Flag size={9} />{priority.label}
          </span>
          {task.due_date && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>
              <Calendar size={10} />{formatDateTime(task.due_date)}
            </span>
          )}
        </div>
        {/* Footer: subtasks & comments */}
        <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-slate-100">
          {task.subtask_count > 0 && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${task.subtask_done === task.subtask_count ? 'text-emerald-500' : 'text-slate-400'}`}>
              <CheckSquare size={11} />{task.subtask_done}/{task.subtask_count}
            </span>
          )}
          {task.subtask_progress !== null && (
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${task.subtask_progress}%` }} />
            </div>
          )}
          {task.comments_count > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
              <MessageSquare size={11} />{task.comments_count}
            </span>
          )}
        </div>
      </div>
    );
  };

  // --- KANBAN VIEW ---
  const KanbanView = () => {
    const columns = ['pending', 'in_progress', 'completed'] as const;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map(status => {
          const cfg = STATUS_CFG[status];
          const Icon = cfg.icon;
          const colTasks = filteredTasks.filter(t => t.status === status);
          return (
            <div key={status} className={`rounded-2xl border ${cfg.border} bg-slate-50/50 flex flex-col min-h-[300px]`}>
              {/* Column header */}
              <div className={`px-4 py-3 rounded-t-2xl flex items-center justify-between ${cfg.headerBg}`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-white" />
                  <span className="text-sm font-black text-white">{cfg.label}</span>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <button
                  onClick={() => openCreateModal(status)}
                  className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
                >
                  <Plus size={14} />
                </button>
              </div>
              {/* Column body */}
              <div
                className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[60vh]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = Number(e.dataTransfer.getData('taskId'));
                  if (taskId) handleMoveTask(taskId, status);
                }}
              >
                {colTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-300">
                    <ListTodo size={28} className="mx-auto mb-2" />
                    <p className="text-xs font-semibold">Kosong</p>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('taskId', String(task.id))}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <TaskCard task={task} />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- LIST VIEW ---
  const ListView = () => (
    <div className="space-y-2.5">
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <ListTodo size={48} className="mx-auto mb-4 text-slate-200" />
          <h3 className="text-lg font-bold text-slate-700">Belum Ada Task</h3>
          <p className="text-sm text-slate-400 mt-1">Mulai tambahkan tugas pertama Anda!</p>
          <button onClick={() => openCreateModal()} className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2">
            <Plus size={16} /> Tambah Task
          </button>
        </div>
      ) : (
        filteredTasks.map(task => {
          const priority = PRIORITY_CFG[task.priority];
          const status = STATUS_CFG[task.status];
          const StatusIcon = status.icon;
          const overdue = isOverdue(task);
          return (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md group ${
                task.status === 'completed' ? 'border-emerald-100 opacity-70' : overdue ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleStatus(task.id); }}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    task.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' :
                    task.status === 'in_progress' ? 'bg-blue-500 border-blue-500 text-white' :
                    'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 size={14} />}
                  {task.status === 'in_progress' && <CircleDot size={12} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-bold text-sm ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</h4>
                    {task.label_name && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border" style={{ color: task.label_color || '#6B7280', backgroundColor: (task.label_color || '#6B7280') + '15', borderColor: (task.label_color || '#6B7280') + '30' }}>
                        <Tag size={9} />{task.label_name}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${priority.bg} ${priority.color} ${priority.border}`}>
                      <Flag size={9} />{priority.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {task.due_date && (
                      <span className={`text-[11px] font-semibold flex items-center gap-1 ${overdue ? 'text-rose-500' : 'text-slate-400'}`}>
                        <Calendar size={11} />{formatDateTime(task.due_date)}
                      </span>
                    )}
                    {task.subtask_count > 0 && (
                      <span className={`text-[11px] font-bold flex items-center gap-1 ${task.subtask_done === task.subtask_count ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <CheckSquare size={11} />{task.subtask_done}/{task.subtask_count}
                      </span>
                    )}
                    {task.comments_count > 0 && (
                      <span className="text-[11px] font-bold flex items-center gap-1 text-slate-400">
                        <MessageSquare size={11} />{task.comments_count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(task); }} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); }} className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // --- DETAIL DRAWER ---
  const DetailDrawer = () => {
    if (!selectedTask) return null;
    const task = selectedTask;
    const priority = PRIORITY_CFG[task.priority];
    const status = STATUS_CFG[task.status];
    const StatusIcon = status.icon;

    return (
      <div className="fixed inset-0 z-[100] flex justify-end">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
        <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <h3 className="text-lg font-black text-slate-900 truncate pr-4">Detail Task</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => openEditModal(task)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit3 size={16} /></button>
              <button onClick={() => setDeletingId(task.id)} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
              <button onClick={() => setSelectedTask(null)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Title & Status */}
            <div>
              <h2 className={`text-xl font-black ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</h2>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <div className="relative inline-block cursor-pointer hover:opacity-80 transition-opacity">
                  <select
                    value={task.status}
                    onChange={(e) => handleMoveTask(task.id, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Ubah Status"
                  >
                    <option value="pending">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Done</option>
                  </select>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${status.bg} ${status.color} ${status.border}`}>
                    <StatusIcon size={13} />{status.label}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${priority.bg} ${priority.color} ${priority.border}`}>
                  <Flag size={11} />{priority.label}
                </span>
                {task.label_name && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border" style={{ color: task.label_color || '#6B7280', backgroundColor: (task.label_color || '#6B7280') + '12', borderColor: (task.label_color || '#6B7280') + '30' }}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.label_color || '#6B7280' }} />
                    {task.label_name}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Deskripsi</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              {task.due_date && (
                <div className={`p-3 rounded-xl border ${isOverdue(task) ? 'border-rose-200 bg-rose-50' : 'border-slate-100 bg-slate-50'}`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Tenggat</p>
                  <p className={`text-sm font-bold ${isOverdue(task) ? 'text-rose-600' : 'text-slate-700'}`}>{formatDateTime(task.due_date)}</p>
                </div>
              )}
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Dibuat</p>
                <p className="text-sm font-bold text-slate-700">{formatDateTime(task.created_at)}</p>
              </div>
            </div>

            {/* SUBTASKS / CHECKLIST */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare size={13} /> Checklist {task.subtask_count > 0 && `(${task.subtask_done}/${task.subtask_count})`}
                </p>
              </div>
              {task.subtask_progress !== null && (
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div className={`h-full rounded-full transition-all duration-500 ${task.subtask_progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${task.subtask_progress}%` }} />
                </div>
              )}
              <div className="space-y-1.5">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2.5 group/sub">
                    <button
                      onClick={() => handleToggleSubtask(task.id, sub.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                        sub.is_completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {sub.is_completed && <CheckCircle2 size={12} />}
                    </button>
                    <span className={`flex-1 text-sm ${sub.is_completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{sub.title}</span>
                    <button
                      onClick={() => handleDeleteSubtask(task.id, sub.id)}
                      className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                      title="Hapus checklist"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2.5">
                <input
                  type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Tambah item checklist..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(task.id); }}}
                />
                <button onClick={() => handleAddSubtask(task.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* COMMENTS */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare size={13} /> Catatan ({task.comments.length})
              </p>
              <div className="space-y-3 mb-3">
                {task.comments.map(c => (
                  <div key={c.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 group/comment">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-600">{c.user.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">{formatDateTime(c.created_at)}</span>
                        <button onClick={() => handleDeleteComment(task.id, c.id)} className="opacity-0 group-hover/comment:opacity-100 p-1 rounded text-slate-300 hover:text-rose-500">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.body}</p>
                  </div>
                ))}
                {task.comments.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Belum ada catatan.</p>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis catatan..."
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(task.id); }}}
                />
                <button onClick={() => handleAddComment(task.id)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest mb-2">
            <Target size={12} /> Manajemen Task
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">To-Do List</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola tugas harian Anda dengan tampilan Kanban atau List.</p>
        </div>
        <button onClick={() => openCreateModal()} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 active:scale-95">
          <Plus size={18} /> Tambah Task
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
          { label: 'To Do', value: stats.pending, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: 'In Progress', value: stats.in_progress, icon: CircleDot, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Done', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className={`bg-white p-4 rounded-xl border ${s.border} shadow-sm flex items-center gap-3`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg} ${s.color}`}><Icon size={18} /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        {/* View toggle */}
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button onClick={() => setViewMode('kanban')} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Columns size={14} /> Kanban
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <List size={14} /> List
          </button>
        </div>
        {/* Label filter */}
        {labels.length > 0 && (
          <select value={labelFilter} onChange={(e) => setLabelFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer shadow-sm">
            <option value="all">Semua Label</option>
            {labels.map((l, i) => <option key={i} value={l.label_name}>{l.label_name}</option>)}
          </select>
        )}
        {/* Status filter (list mode) */}
        {viewMode === 'list' && (
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto">
            {[{ key: 'all', label: 'Semua' }, { key: 'pending', label: 'To Do' }, { key: 'in_progress', label: 'In Progress' }, { key: 'completed', label: 'Done' }].map(f => (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${statusFilter === f.key ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        )}
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input type="text" placeholder="Cari task..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full shadow-sm" />
        </div>
      </div>

      {/* MAIN VIEW */}
      {viewMode === 'kanban' ? <KanbanView /> : <ListView />}

      {/* DETAIL DRAWER */}
      <DetailDrawer />

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{editingTask ? 'Edit Task' : 'Tambah Task Baru'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Judul <span className="text-rose-500">*</span></label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Judul task..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" autoFocus />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Detail..." rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Prioritas</label>
                  <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer">
                    <option value="low">🟢 Rendah</option><option value="medium">🟡 Sedang</option><option value="high">🔴 Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tenggat</label>
                  <input type="datetime-local" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Label</label>
                  <input type="text" value={formLabelName} onChange={(e) => setFormLabelName(e.target.value)} placeholder="Contoh: Bug Fix"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Warna Label</label>
                  <div className="flex gap-1.5 flex-wrap py-1">
                    {LABEL_COLORS.map(c => (
                      <button type="button" key={c.value} onClick={() => setFormLabelColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${formLabelColor === c.value ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c.value }} title={c.name} />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* CHECKLIST / SUBTASKS IN MODAL */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center justify-between">
                  <span>Checklist ({formSubtasks.length})</span>
                  <button type="button" onClick={() => setFormSubtasks([...formSubtasks, { title: '' }])} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    <Plus size={12} /> Tambah Item
                  </button>
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {formSubtasks.map((sub, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={sub.title} 
                        onChange={(e) => {
                          const newSubs = [...formSubtasks];
                          newSubs[index].title = e.target.value;
                          setFormSubtasks(newSubs);
                        }} 
                        placeholder={`Item checklist ${index + 1}...`}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setFormSubtasks(formSubtasks.filter((_, i) => i !== index))}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formSubtasks.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                      Belum ada checklist. Klik "Tambah Item" untuk membuat.
                    </p>
                  )}
                </div>
              </div>

              {!editingTask && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Status Awal</label>
                  <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none cursor-pointer">
                    <option value="pending">📋 To Do</option><option value="in_progress">🔄 In Progress</option><option value="completed">✅ Done</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Batal</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {editingTask ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deletingId && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-rose-500" /></div>
            <h3 className="text-lg font-black text-slate-900">Hapus Task?</h3>
            <p className="text-sm text-slate-500 mt-2">Termasuk subtask dan catatan terkait.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200">Batal</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 shadow-lg shadow-rose-200">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
