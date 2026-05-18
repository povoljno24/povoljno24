'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-transparent border-t border-white/5 px-8 py-20 flex flex-col sm:flex-row justify-between items-center gap-8 mt-auto">
      <div className="flex flex-col items-center sm:items-start gap-1">
        <span className="text-xl font-black text-white tracking-tighter">Povoljno<span className="text-[#185FA5]">24</span></span>
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/20">© {new Date().getFullYear()} Precision Built</span>
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mt-1.5">
          <span>made by</span>
          <a 
            href="https://pixelsurgestudio.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-black bg-gradient-to-r from-[#52b87f] to-[#e8c97a] bg-clip-text text-transparent hover:opacity-80 transition-opacity tracking-[0.25em]"
          >
            Pixel Surge Studio
          </a>
        </div>
      </div>
      <div className="flex gap-10">
        <Link href="/o-nama" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t.aboutUs}</Link>
        <Link href="/pomoc" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t.help}</Link>
        <Link href="/uslovi" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t.terms}</Link>
        <Link href="/kontakt" className="text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t.contact}</Link>
      </div>
    </footer>
  );
}
