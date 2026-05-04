'use client';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-100 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
      <span className="text-sm text-gray-500">© {new Date().getFullYear()} Povoljno24.rs</span>
      <div className="flex gap-4">
        <Link href="/o-nama" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">{t.aboutUs}</Link>
        <Link href="/pomoc" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">{t.help}</Link>
        <Link href="/uslovi" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">{t.terms}</Link>
        <Link href="/kontakt" className="text-xs text-gray-600 hover:text-[#185FA5] transition-colors">{t.contact}</Link>
      </div>
    </footer>
  );
}
