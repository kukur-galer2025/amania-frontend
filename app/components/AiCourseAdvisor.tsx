"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Use same markdown components as AiMentor for consistent styling
const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-[13px]">{children}</p>,
  a: ({ href, children }: any) => {
    // Make sure links open internally using Next.js Link if they are relative, or external if absolute
    if (href?.startsWith('/')) {
      return <Link href={href} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{children}</Link>;
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">{children}</a>;
  },
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-[13px] leading-relaxed">{children}</li>,
  strong: ({ children }: any) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
  code: ({ children }: any) => <code className="bg-slate-100 dark:bg-slate-800 text-pink-500 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
};

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AiCourseAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestionChips, setSuggestionChips] = useState<string[]>([
    "Kursus apa yang cocok untuk pemula?",
    "Ada rekomendasi kursus marketing?",
    "Saya ingin belajar bikin website"
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // First time open
      setMessages([
        {
          role: 'model',
          content: "Halo! Saya Amania AI Course Advisor ✨\n\nCeritakan apa minat Anda, profesi saat ini, atau keahlian yang ingin Anda kuasai. Saya akan mencarikan kursus yang paling tepat untuk Anda!"
        }
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const extractSuggestionChips = (text: string) => {
    const parts = text.split('|||');
    if (parts.length > 1) {
      const cleanText = parts[0].trim();
      const rawChips = parts[1].split('|').map(c => c.trim()).filter(c => c.length > 0);
      return { cleanText, chips: rawChips };
    }
    return { cleanText: text, chips: [] };
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);
    setSuggestionChips([]);

    try {
      // Format messages for Gemini API
      // Only keep last 10 messages to save context limit
      const geminiMessages = newMessages.slice(-10).map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/course-advisor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ messages: geminiMessages })
      });

      if (!res.ok || !res.body) throw new Error('Gagal menghubungi AI');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      // Add temporary model message to append stream to
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.chunk) {
                fullResponse += data.chunk;
                
                // If it contains chips signature, don't show it in the text yet
                let displayText = fullResponse;
                if (fullResponse.includes('|||')) {
                    displayText = fullResponse.split('|||')[0];
                }

                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1].content = displayText;
                  return newMsgs;
                });
              }
            } catch (e) {
              console.error('Error parsing SSE json', e);
            }
          }
        }
      }

      // Process chips after stream ends
      const { cleanText, chips } = extractSuggestionChips(fullResponse);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].content = cleanText;
        return newMsgs;
      });
      if (chips.length > 0) {
        setSuggestionChips(chips);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: 'Maaf, saya sedang mengalami gangguan. Silakan coba beberapa saat lagi.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full shadow-[0_10px_40px_-10px_rgba(79,70,229,0.8)] flex items-center justify-center text-white z-50 hover:scale-105 transition-transform group"
          >
            <Sparkles size={24} className="group-hover:animate-pulse" />
            
            {/* Tooltip */}
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              AI Course Advisor
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* CHAT MODAL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-[calc(100vw-48px)] max-w-[380px] h-[550px] max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] border border-slate-200/50 dark:border-slate-700 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shrink-0 flex items-center justify-between shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white border border-white/20">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm">AI Course Advisor</h3>
                        <p className="text-indigo-100 text-[10px] flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online & Siap Membantu</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors relative z-10"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {msg.role === 'model' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                                <Bot size={14} />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-br-sm' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50 rounded-bl-sm'
                        }`}>
                            {msg.role === 'user' ? (
                                <p className="text-[13px] whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                                <ReactMarkdown components={MarkdownComponents}>
                                    {msg.content || '...'}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex items-end gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                            <Bot size={14} />
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-bl-sm p-3.5 shadow-sm flex gap-1.5">
                            <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                            <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                            <motion.div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/50 shrink-0">
                {/* Suggestions */}
                {!isTyping && suggestionChips.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-3 custom-scrollbar hide-scroll-bar">
                        {suggestionChips.map((chip, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(chip)}
                                className="whitespace-nowrap px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold rounded-full border border-indigo-100 dark:border-indigo-500/20 transition-colors"
                            >
                                {chip}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-end gap-2">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all p-1 flex">
                        <input 
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSend();
                            }}
                            placeholder="Tanya kursus yang cocok untukmu..."
                            className="w-full bg-transparent border-none text-[13px] text-slate-700 dark:text-slate-300 focus:ring-0 px-3 py-2 outline-none"
                            disabled={isTyping}
                        />
                    </div>
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="w-10 h-10 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors shadow-sm"
                    >
                        <Send size={16} className={input.trim() && !isTyping ? "ml-0.5" : ""} />
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
