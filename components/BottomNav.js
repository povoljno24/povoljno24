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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A]/80 backdrop-blur-3xl border-t border-white/10 z-[100] shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-20 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-500 ${isActive ? 'text-white scale-110' : 'text-white/20'}`}
            >
              <span className={`text-xl ${isActive ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : ''}`}>{item.icon}</span>
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'opacity-100' : 'opacity-40'}`}>{t[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
