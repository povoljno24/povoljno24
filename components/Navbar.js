'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  async function fetchCounts(currentUser) {
    if (!currentUser) return;
    const [msgRes, notifRes] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', currentUser.id).eq('is_read', false),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('is_read', false)
    ]);
    setUnreadMsgCount(msgRes.count || 0);
    setNotifCount(notifRes.count || 0);
  }

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      fetchCounts(currentUser);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) fetchCounts(currentUser);
      else {
        setUnreadMsgCount(0);
        setNotifCount(0);
      }
    });

    // Real-time subscriptions
    const msgChannel = supabase.channel('realtime_msg_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, async () => {
        const { data: { user: latestUser } } = await supabase.auth.getUser();
        if (latestUser) fetchCounts(latestUser);
      })
      .subscribe();
      
    const notifChannel = supabase.channel('realtime_notif_counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        const { data: { user: latestUser } } = await supabase.auth.getUser();
        if (latestUser) fetchCounts(latestUser);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(notifChannel);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/" className="text-lg sm:text-xl font-semibold text-[#185FA5] hover:opacity-90 transition-opacity shrink-0">
        Povoljno<span className="text-[#E24B4A]">24</span>.rs
      </Link>

      <div className="flex items-center gap-3 sm:gap-5">
        <Link href="/" className="text-sm text-gray-600 hover:text-[#185FA5] transition-colors hidden sm:block">
          {t.listings}
        </Link>
        <Link href="/kako-funkcionise" className="text-sm text-gray-600 hover:text-[#185FA5] transition-colors hidden sm:block">
          {t.howItWorks}
        </Link>

        {/* Language Toggle */}
        <button 
          onClick={() => setLang(lang === 'sr' ? 'en' : 'sr')}
          className="text-[11px] sm:text-[12px] font-bold text-gray-500 hover:text-[#185FA5] border border-gray-200 rounded-lg px-2 py-1 transition-colors bg-gray-50"
          title={t.langTooltip}
        >
          {lang === 'sr' ? 'EN' : 'SRB'}
        </button>

        {user ? (
          <>
            {/* Notifications bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-1.5 text-gray-500 hover:text-[#185FA5] transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#185FA5] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-sm animate-pulse">
                    {notifCount}
                  </span>
                )}
              </button>
              {showNotifs && <NotificationDropdown userId={user.id} onClose={() => setShowNotifs(false)} />}
            </div>

            {/* Messages bell icon */}
            <Link
              href="/poruke"
              title={t.messages}
              className="relative p-1.5 text-gray-500 hover:text-[#185FA5] transition-colors flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {unreadMsgCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#E24B4A] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full shadow-sm">
                  {unreadMsgCount}
                </span>
              )}
            </Link>

            {/* Profile link */}
            <Link href="/profil" className="text-sm text-gray-600 hover:text-[#185FA5] font-medium transition-colors hidden sm:block">
              {t.profile}
            </Link>
          </>
        ) : (
          <Link href="/login" className="text-sm text-gray-600 hover:text-[#185FA5] font-medium transition-colors">
            {t.login}
          </Link>
        )}

        <Link
          href="/postoglas"
          className="bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm hidden sm:block"
        >
          {t.postAd}
        </Link>
      </div>
    </nav>
  );
}
