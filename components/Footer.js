'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white/40 backdrop-blur-xl border-t border-white/10 px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
      <span className="text-sm font-medium text-gray-500">© {new Date().getFullYear()} Povoljno24</span>
      <div className="flex gap-6">
        <Link href="/o-nama" className="text-[13px] font-medium text-gray-600 hover:text-[#185FA5] transition-colors">{t.aboutUs}</Link>
        <Link href="/pomoc" className="text-[13px] font-medium text-gray-600 hover:text-[#185FA5] transition-colors">{t.help}</Link>
        <Link href="/uslovi" className="text-[13px] font-medium text-gray-600 hover:text-[#185FA5] transition-colors">{t.terms}</Link>
        <Link href="/kontakt" className="text-[13px] font-medium text-gray-600 hover:text-[#185FA5] transition-colors">{t.contact}</Link>
      </div>
    </footer>
  );
}
