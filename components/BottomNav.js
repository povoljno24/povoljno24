'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { labelKey: 'home', icon: '🏠', path: '/' },
    { labelKey: 'messages', icon: '💬', path: '/poruke' },
    { labelKey: 'post', icon: '➕', path: '/postoglas' },
    { labelKey: 'profile', icon: '👤', path: '/profil' },
  ];

  return (
    <div className="sm:hidden fixed bottom-6 left-6 right-6 bg-white/75 backdrop-blur-2xl border border-white/20 z-[100] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${isActive ? 'text-[#185FA5] scale-105' : 'text-gray-400'}`}
            >
              <span className={`text-xl ${isActive ? 'drop-shadow-[0_0_8px_rgba(24,95,165,0.4)]' : 'opacity-70'} transition-transform`}>{item.icon}</span>
              <span className={`text-[10px] font-extrabold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{t[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
