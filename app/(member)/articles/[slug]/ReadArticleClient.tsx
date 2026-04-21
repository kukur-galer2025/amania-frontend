"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  ArrowLeft, Calendar, User, 
  Share2, Bookmark, Facebook, Twitter, Link as LinkIcon, AlertCircle, ChevronRight, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/app/utils/api'; 

// Helper untuk membersihkan encoding karakter
const cleanHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/&amp;nbsp;/g, ' ')
             .replace(/&nbsp;/g, ' ');
};

export default function ReadArticleClient({ slug }: { slug: string }) {
  
  const [article, setArticle] = useState<any>(null);
  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://127.0.0.1:8000/storage';

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        // 🔥 Mengambil artikel utama dan daftar artikel lainnya secara bersamaan 🔥
        const [resArticle, resAll] = await Promise.all([
          apiFetch(`/articles/${slug}`),
          apiFetch('/articles')
        ]);

        const dataArticle = await resArticle.json();
        const dataAll = await resAll.json();

        if (dataArticle.success) {
          setArticle(dataArticle.data);
        } else {
          setArticle(null);
        }

        if (dataAll.success) {
          // Filter artikel yang sedang dibaca agar tidak muncul di sidebar, ambil 3 teratas
          const others = dataAll.data
            .filter((a: any) => a.slug !== slug)
            .slice(0, 3);
          setPopularArticles(others);
        }

      } catch (error) {
        toast.error("Gagal memuat artikel");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('id-ID', options).format(new Date(dateString));
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: article?.title || 'Artikel Amania',
      text: `Baca artikel menarik ini: ${article?.title || ''}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Membagikan dibatalkan');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Tautan artikel berhasil disalin!");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 w-full">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium text-sm">Memuat artikel...</p>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen flex items-center justify-center text-center bg-slate-50 p-4 w-full">
      <div className="max-w-md w-full bg-white p-8 md:p-10 border border-slate-200 rounded-2xl shadow-sm">
        <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
        <h1 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Artikel Tidak Ditemukan</h1>
        <p className="text-slate-500 mb-6 text-sm">Artikel yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
        <Link href="/articles" className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium text-sm rounded-xl hover:bg-slate-800 transition-colors">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden w-full">
      <motion.div className="fixed top-0 left-0 right-0 h-1 md:h-1.5 bg-blue-600 z-[100] origin-left" style={{ scaleX }} />

      <nav className="border-b border-slate-200 bg-white sticky top-0 z-20 w-full">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between w-full min-w-0">
          <Link href="/articles" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium text-xs md:text-sm shrink-0">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">Kembali</span>
          </Link>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <button onClick={handleShare} className="text-slate-500 hover:text-slate-900 p-2 hover:bg-slate-50 rounded-full transition-colors"><Share2 size={18} className="md:w-5 md:h-5" /></button>
            <button className="text-slate-500 hover:text-slate-900 p-2 hover:bg-slate-50 rounded-full transition-colors"><Bookmark size={18} className="md:w-5 md:h-5" /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12 flex flex-col lg:flex-row gap-10 lg:gap-16 w-full min-w-0">
        
        {/* KOLOM KIRI: ARTIKEL UTAMA */}
        <main className="w-full lg:w-[70%] min-w-0">
          
          <div className="flex items-center flex-wrap gap-1.5 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 md:mb-6 w-full">
            <Link href="/beranda" className="hover:text-blue-600">Amania</Link>
            <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
            <Link href="/articles" className="hover:text-blue-600">News</Link>
            <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
            <span className="text-red-600">{article.category?.name || 'Umum'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 leading-[1.25] tracking-tight mb-5 md:mb-6 break-words w-full">
            {article.title}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y border-slate-200 py-4 mb-6 md:mb-8 gap-4 w-full min-w-0">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {article.author?.avatar ? (
                  <img src={`${STORAGE_URL}/${article.author.avatar}`} alt={article.author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><User size={20} className="text-slate-400"/></div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs md:text-sm font-bold text-slate-900 flex items-center flex-wrap gap-1.5 truncate">
                  {article.author?.name || 'Tim Redaksi Amania'}
                  {article.author?.role === 'superadmin' && (
                    <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-[4px] text-[8px] md:text-[9px] uppercase tracking-wider shrink-0">Admin</span>
                  )}
                  {article.author?.role === 'organizer' && (
                    <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-[4px] text-[8px] md:text-[9px] uppercase tracking-wider shrink-0">Organizer</span>
                  )}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium flex items-center flex-wrap gap-1.5 mt-0.5 w-full">
                  {formatDate(article.created_at)} <span className="hidden sm:inline mx-1">•</span> <span className="sm:hidden">|</span> {article.read_time || 5} menit baca
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleShare} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"><LinkIcon size={14} className="md:w-4 md:h-4" /></button>
              <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#1877F2] hover:text-white transition-colors"><Facebook size={14} className="md:w-4 md:h-4" /></button>
              <button className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter size={14} className="md:w-4 md:h-4" /></button>
            </div>
          </div>

          <figure className="mb-8 md:mb-10 w-full min-w-0">
            <div className="w-full aspect-video bg-slate-100 overflow-hidden relative border border-slate-200 rounded-xl">
              {article.image ? (
                <img 
                  src={`${STORAGE_URL}/${article.image}`} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <BookOpen size={40} className="md:w-12 md:h-12" strokeWidth={1} />
                </div>
              )}
            </div>
            <figcaption className="text-[10px] md:text-xs text-slate-500 mt-2 md:mt-3 text-left italic border-l-2 border-slate-300 pl-2 md:pl-3 break-words w-full">
              Ilustrasi: {article.title} (Sumber: Dok. Amania)
            </figcaption>
          </figure>

          <article 
            className="prose-news break-words w-full min-w-0"
            dangerouslySetInnerHTML={{ __html: cleanHtml(article.content) }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 w-full min-w-0">
              <span className="text-[10px] md:text-xs font-bold uppercase text-slate-500 tracking-wider block mb-3">Tag Terkait:</span>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 md:px-3 md:py-1.5 bg-slate-100 text-slate-600 text-[10px] md:text-xs font-bold rounded-md hover:bg-slate-200 cursor-pointer transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* KOLOM KANAN: SIDEBAR */}
        <aside className="w-full lg:w-[30%] border-t border-slate-200 lg:border-t-0 pt-8 lg:pt-0 min-w-0">
          <div className="lg:sticky lg:top-24 w-full min-w-0">
            
            <div className="mb-10 w-full min-w-0">
              <h3 className="text-base md:text-lg font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-5 md:mb-6 inline-block w-full">
                Terpopuler
              </h3>
              
              <div className="space-y-5 md:space-y-6 w-full min-w-0">
                {/* 🔥 LOOPING ARTIKEL POPULER DARI DATABASE 🔥 */}
                {popularArticles.length > 0 ? (
                  popularArticles.map((popArt, idx) => (
                    <React.Fragment key={popArt.id}>
                      <Link href={`/articles/${popArt.slug}`} className="group block w-full min-w-0">
                        <span className="text-[10px] md:text-xs font-bold text-red-600 mb-1 block truncate">
                          {popArt.category?.name || 'Umum'}
                        </span>
                        <h4 className="text-xs md:text-sm font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 break-words">
                          {popArt.title}
                        </h4>
                        <span className="text-[9px] md:text-[10px] text-slate-500 mt-1.5 md:mt-2 block">
                          {new Date(popArt.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </Link>
                      {idx < popularArticles.length - 1 && <hr className="border-slate-100" />}
                    </React.Fragment>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">Belum ada artikel lain saat ini.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-900 p-5 md:p-6 text-white text-center rounded-xl md:rounded-2xl shadow-lg relative overflow-hidden group w-full shrink-0">
              <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <img src="/logo-amania.png" alt="Amania" className="mx-auto mb-3 md:mb-4 h-10 md:h-12 w-auto object-contain brightness-0 invert relative z-10" />
              <h5 className="text-base md:text-lg font-bold mb-1.5 md:mb-2 relative z-10 break-words">Tingkatkan Skillmu</h5>
              <p className="text-xs md:text-sm text-slate-400 mb-5 md:mb-6 leading-relaxed px-2 md:px-0 relative z-10 break-words">Akses ratusan kelas premium dan bootcamp eksklusif bersama Amania.</p>
              <Link href="/events" className="block w-full py-2.5 md:py-3 bg-blue-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-blue-500 transition-colors rounded-lg md:rounded-xl shadow-sm relative z-10">
                Lihat Katalog Kelas
              </Link>
            </div>

          </div>
        </aside>

      </div>

      <style jsx global>{`
        .prose-news { 
          font-family: 'Inter', system-ui, sans-serif; 
          font-size: 1rem; 
          line-height: 1.7; 
          color: #334155; 
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
          overflow-x: hidden;
        }
        @media (min-width: 768px) {
          .prose-news { font-size: 1.125rem; line-height: 1.8; } 
        }
        .prose-news p { margin-bottom: 1.25rem; }
        .prose-news h2 { 
          font-size: 1.5rem; 
          font-weight: 800; 
          color: #0f172a; 
          margin-top: 2.5rem; 
          margin-bottom: 1rem; 
          line-height: 1.3;
        }
        @media (min-width: 768px) {
           .prose-news h2 { font-size: 1.75rem; margin-top: 3rem; }
        }
        .prose-news h3 { 
          font-size: 1.25rem; 
          font-weight: 700; 
          color: #0f172a; 
          margin-top: 2rem; 
          margin-bottom: 1rem; 
        }
        @media (min-width: 768px) {
           .prose-news h3 { font-size: 1.5rem; }
        }
        .prose-news blockquote { 
          font-size: 1.125rem; 
          font-style: italic; 
          color: #0f172a; 
          border-left: 3px solid #ef4444; 
          padding-left: 1rem; 
          margin: 2rem 0; 
          background: #f8fafc;
          padding-top: 1rem; padding-bottom: 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        @media (min-width: 768px) {
           .prose-news blockquote { font-size: 1.25rem; background: transparent; padding-top: 0; padding-bottom: 0; border-left-width: 4px; padding-left: 1.5rem; margin: 2.5rem 0;}
        }
        .prose-news img, .prose-news iframe, .prose-news video { 
          margin: 2rem 0; 
          max-width: 100%; 
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          height: auto;
        }
        .prose-news ul, .prose-news ol { 
          margin-bottom: 1.25rem; 
          padding-left: 1.25rem; 
        }
        .prose-news li { margin-bottom: 0.5rem; }
        .prose-news strong { color: #0f172a; font-weight: 700; }
        .prose-news a { color: #2563eb; text-decoration: underline; text-underline-offset: 4px; font-weight: 500; word-break: break-all; }
      `}</style>
    </div>
  );
}