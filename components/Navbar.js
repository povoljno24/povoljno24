'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnread(currentUser) {
    if (!currentUser) return;
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', currentUser.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      fetchUnread(currentUser);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (!currentUser) {
        setUnreadCount(0);
      } else {
        fetchUnread(currentUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-200 sticky top-0 z-50">
      <Link href="/" className="text-xl font-semibold text-[#185FA5] hover:opacity-90 transition-opacity">
        Povoljno<span className="text-[#E24B4A]">24</span>.rs
      </Link>

      <div className="flex items-center gap-5">
        <Link href="/" className="text-sm text-gray-600 hover:text-[#185FA5] transition-colors hidden sm:block">
          Oglasi
        </Link>
        <Link href="/kako-funkcionise" className="text-sm text-gray-600 hover:text-[#185FA5] transition-colors hidden sm:block">
          Kako funkcioniše
        </Link>

        {user ? (
          <>
            {/* Messages bell icon with badge */}
            <Link
              href="/poruke"
              title="Poruke"
              className="relative text-gray-500 hover:text-[#185FA5] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#E24B4A] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile link */}
            <Link href="/profil" className="text-sm text-gray-600 hover:text-[#185FA5] font-medium transition-colors">
              Profil
            </Link>
          </>
        ) : (
          <Link href="/login" className="text-sm text-gray-600 hover:text-[#185FA5] font-medium transition-colors">
            Prijavi se
          </Link>
        )}

        <Link
          href="/postoglas"
          className="bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm"
        >
          Postavi oglas
        </Link>
      </div>
    </nav>
  );
}
