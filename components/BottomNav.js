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
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${isActive ? 'text-[#185FA5]' : 'text-gray-400'}`}
            >
              <span className={`text-xl ${isActive ? 'scale-110' : 'opacity-70'} transition-transform`}>{item.icon}</span>
              <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{t[item.labelKey]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
