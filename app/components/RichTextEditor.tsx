"use client";

import React, { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { Code2, Eye } from 'lucide-react';

// @ts-ignore
import 'react-quill-new/dist/quill.snow.css';
import 'katex/dist/katex.min.css';

// DAFTAR CUSTOM UKURAN & FONT
const SIZES = ['10px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '28px', '32px', '36px', '48px'];
const FONTS = ['Arial', 'Comic Sans MS', 'Courier New', 'Georgia', 'Helvetica', 'Inter', 'Times New Roman', 'Verdana'];

const ReactQuill = dynamic(
  async () => {
    const RQ = await import('react-quill-new');
    const katex = (await import('katex')).default;
    
    if (typeof window !== 'undefined') {
      (window as any).Quill = RQ.Quill;
      (window as any).katex = katex;
    }

    const Size = RQ.Quill.import('attributors/style/size');
    Size.whitelist = SIZES;
    RQ.Quill.register(Size, true);

    const Font = RQ.Quill.import('attributors/style/font');
    Font.whitelist = FONTS;
    RQ.Quill.register(Font, true);

    // @ts-ignore
    const ImageResize = (await import('quill-image-resize-module-react')).default;
    RQ.Quill.register('modules/imageResize', ImageResize);

    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: any) => <RQ.default ref={forwardedRef} {...props} />;
  },
  { 
    ssr: false, 
    loading: () => <div className="p-6 text-sm font-bold text-slate-400 animate-pulse">Memuat Editor Lengkap...</div> 
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      const formData = new FormData();
      formData.append('image', file);
      const loadingToast = toast.loading('Mengunggah gambar...');

      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        const response = await fetch(`${baseUrl}/admin/upload-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true) || { index: quill.getLength() };
          quill.insertEmbed(range.index, 'image', data.url);
          toast.success('Gambar berhasil diunggah!', { id: loadingToast });
        } else {
          toast.error(data.message || 'Gagal mengunggah gambar', { id: loadingToast });
        }
      } catch (error) {
        toast.error('Terjadi kesalahan jaringan', { id: loadingToast });
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'font': FONTS }, { 'size': SIZES }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'], 
        ['clean']
      ],
      handlers: { image: imageHandler }
    },
    imageResize: {
      parchment: typeof window !== 'undefined' ? (window as any).Quill?.import('parchment') : undefined,
      modules: ['Resize', 'DisplaySize']
    }
  }), []);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all flex flex-col relative">
      
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center z-10 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {isHtmlMode ? 'Mode Source Code (HTML)' : 'Mode Visual (WYSIWYG)'}
        </span>
        <button
          type="button"
          onClick={() => setIsHtmlMode(!isHtmlMode)}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
            isHtmlMode 
            ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700' 
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          {isHtmlMode ? <><Eye size={14} /> Kembali ke Visual</> : <><Code2 size={14} /> Edit Source HTML</>}
        </button>
      </div>

      {isHtmlMode ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[250px] p-6 font-mono text-sm leading-relaxed outline-none resize-y"
          style={{ backgroundColor: '#0f172a', color: '#34d399' }} 
          placeholder="<h1>Judul</h1><p>Ketik HTML di sini...</p>"
        />
      ) : (
        <ReactQuill 
          forwardedRef={quillRef} 
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder || 'Tuliskan soal, masukkan rumus, tabel, atau gambar...'}
        />
      )}

      <style jsx global>{`
        .ql-toolbar.ql-snow { 
          border: none !important; 
          border-bottom: 1px solid #e2e8f0 !important; 
          background: #f8fafc; 
          padding: 12px !important;
        }
        
        .ql-toolbar.ql-snow .ql-formats {
          margin-right: 15px !important;
          margin-bottom: 5px !important;
        }

        /* 🔴 PERBAIKAN SCROLL DROPDOWN 🔴 */
        .ql-snow .ql-picker-options {
          max-height: 220px !important; /* Batasi tinggi maksimal dropdown */
          overflow-y: auto !important;  /* Munculkan scrollbar jika konten melebihi batas */
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
          border-radius: 0.5rem !important;
        }

        /* Percantik tampilan Scrollbar di Dropdown */
        .ql-snow .ql-picker-options::-webkit-scrollbar {
          width: 6px;
        }
        .ql-snow .ql-picker-options::-webkit-scrollbar-track {
          background: #f1f5f9; 
        }
        .ql-snow .ql-picker-options::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 10px;
        }
        .ql-snow .ql-picker-options::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }

        /* Kustomisasi Lebar Dropdown */
        .ql-snow .ql-picker.ql-size { width: 75px !important; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value]::before {
          content: attr(data-value) !important;
        }
        .ql-snow .ql-picker.ql-size .ql-picker-label:not([data-value])::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item:not([data-value])::before {
          content: '14px' !important; 
        }

        .ql-snow .ql-picker.ql-font { width: 140px !important; }
        .ql-snow .ql-picker.ql-font .ql-picker-label[data-value]::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item[data-value]::before {
          content: attr(data-value) !important;
          font-family: attr(data-value) !important;
        }
        .ql-snow .ql-picker.ql-font .ql-picker-label:not([data-value])::before,
        .ql-snow .ql-picker.ql-font .ql-picker-item:not([data-value])::before {
          content: 'Default' !important; 
        }

        .ql-container.ql-snow { 
          border: none !important; 
          min-height: 250px; 
          font-family: inherit; 
          font-size: 14px; 
          color: #0f172a; 
        }
        
        .ql-editor { 
          min-height: 250px; 
          line-height: 1.6;
        }

        .ql-editor .ql-formula {
          background-color: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'KaTeX_Math', 'Times New Roman', serif;
        }
      `}</style>
    </div>
  );
}