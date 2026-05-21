"use client";

// Layout khusus untuk halaman belajar kursus
// Bypass member layout sidebar agar tampilan full-screen dan immersive seperti Udemy
export default function LearnLayout({ children }: { children: React.ReactNode }) {
 return (
 <div className="min-h-screen bg-white dark:bg-slate-800">
 {children}
 </div>
 );
}
