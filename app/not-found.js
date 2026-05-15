'use client';
import Link from 'next/link';
import { useLanguage } from './components/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent relative overflow-hidden">
      {/* Cinematic background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#185FA5]/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="text-[120px] md:text-[180px] font-black text-white/5 leading-none mb-4 select-none tracking-tighter">404</h1>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 uppercase tracking-tight">Izgubljeni u svemiru</h2>
        <p className="text-[14px] md:text-[16px] text-white/30 mb-16 font-black uppercase tracking-[0.4em] leading-relaxed mx-auto max-w-md">
          Stranica koju tražite više ne postoji ili je premestena u drugu dimenziju.
        </p>
        
        <Link 
          href="/" 
          className="inline-block bg-white text-black px-16 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[#185FA5] hover:text-white transition-all shadow-2xl active:scale-95"
        >
          Povratak na početak
        </Link>
      </div>

      {/* Decorative glass elements */}
      <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-white/[0.02] border border-white/5 rounded-3xl rotate-12 backdrop-blur-3xl" />
      <div className="absolute top-40 right-1/4 w-24 h-24 bg-white/[0.02] border border-white/5 rounded-full -rotate-12 backdrop-blur-3xl" />
    </div>
  );
}
