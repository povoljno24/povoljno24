'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';
import { useLanguage } from './LanguageContext';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const [user, setUser] = useState(null);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchCounts = useCallback(async (currentUser) => {
    if (!currentUser) return;
    const [msgRes, notifRes] = await Promise.all([
      supabase.from('messages').select('*', { count: 'exact', head: true }).eq('receiver_id', currentUser.id).eq('is_read', false),
      supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('is_read', false)
    ]);
    setUnreadMsgCount(msgRes.count || 0);
    setNotifCount(notifRes.count || 0);
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) fetchCounts(currentUser);
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

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCounts]);

  useEffect(() => {
    if (!user) return;

    const handleCountsChanged = () => fetchCounts(user);
    window.addEventListener('counts_changed', handleCountsChanged);

    // Real-time subscriptions
    const msgChannel = supabase.channel(`msg_counts_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages'
      }, () => fetchCounts(user))
      .subscribe();
      
    const notifChannel = supabase.channel(`notif_counts_${user.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications'
      }, () => fetchCounts(user))
      .subscribe();

    return () => {
      window.removeEventListener('counts_changed', handleCountsChanged);
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user, fetchCounts]);

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sticky top-6 z-50 mx-auto max-w-[1200px] w-[calc(100%-3rem)] rounded-full transition-all duration-700 hover:bg-white/[0.05] hover:border-white/20 group">
      <Link href="/" className="text-xl sm:text-2xl font-extrabold tracking-tighter text-white hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1">
        Povoljno<span className="text-[#185FA5]">24</span>
      </Link>

      <div className="flex items-center gap-4 sm:gap-8">
        <Link href="/" className="text-[13px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all hidden md:block">
          {t.listings}
        </Link>
        <Link href="/kako-funkcionise" className="text-[13px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all hidden md:block">
          {t.howItWorks}
        </Link>

        {/* Language Toggle */}
        <button 
          onClick={() => setLang(lang === 'sr' ? 'en' : 'sr')}
          className="text-[10px] font-black text-white/40 hover:text-white border border-white/10 rounded-full py-1.5 px-3 transition-all bg-white/[0.02] hover:bg-white/10"
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
                className="p-2 text-white/40 hover:text-white transition-all bg-white/[0.03] border border-white/10 rounded-full cursor-pointer flex items-center justify-center hover:bg-white/10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {notifCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#185FA5] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_#185FA5] animate-pulse">
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
              className="relative p-2 text-white/40 hover:text-white transition-all bg-white/[0.03] border border-white/10 rounded-full flex items-center justify-center hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {unreadMsgCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#E24B4A] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_#E24B4A]">
                  {unreadMsgCount}
                </span>
              )}
            </Link>

            <Link href="/profil" className="text-[13px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all hidden sm:block">
              {t.profile}
            </Link>
          </>
        ) : (
          <Link href="/login" className="text-[13px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
            {t.login}
          </Link>
        )}

        <Link
          href="/postoglas"
          className="bg-white text-black hover:bg-[#185FA5] hover:text-white rounded-full px-6 py-2.5 text-[12px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 hidden sm:block"
        >
          {t.postAd}
        </Link>
      </div>
    </nav>
  );
}
