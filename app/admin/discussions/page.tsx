import React from 'react';
import DiscussionManagerClient from './DiscussionManagerClient';
import { MessageSquare } from 'lucide-react';

export default function DiscussionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manajemen Diskusi (Q&A)</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Pantau dan balas semua pertanyaan dari siswa di berbagai kursus.</p>
        </div>
      </div>

      <DiscussionManagerClient />
    </div>
  );
}
