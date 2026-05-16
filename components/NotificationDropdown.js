'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';

export default function NotificationDropdown({ userId, onClose }) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, listings(title, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      if (error.code === 'PGRST205' || error.code === 'PGRST200') {
        setNotifications([]);
      } else {
        console.error(error);
      }
    } else {
      setNotifications(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    window.dispatchEvent(new Event('counts_changed'));
  }

  return (
    <div className="absolute top-12 right-0 w-[320px] bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.7)] z-[100] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">{t.notifications}</h3>
        <button onClick={onClose} className="text-white/20 hover:text-white transition-colors text-xl">×</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="p-12 text-center text-white/20 text-[12px] font-bold uppercase tracking-widest animate-pulse">{t.loading}</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4 opacity-10">🔔</div>
            <p className="text-[12px] font-black uppercase tracking-widest text-white/20">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((n) => (
              <Link 
                key={n.id}
                href={n.type === 'message' ? `/poruke` : `/oglas/${n.listing_id}`}
                onClick={() => markAsRead(n.id)}
                className={`flex gap-4 p-5 hover:bg-white/[0.05] transition-all ${!n.is_read ? 'bg-white/[0.02]' : ''}`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex-shrink-0 overflow-hidden relative border border-white/5">
                  {n.listings?.image_url ? (
                    <Image src={n.listings.image_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl opacity-40">{n.type === 'message' ? '💬' : '📉'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] leading-snug line-clamp-2 ${!n.is_read ? 'text-white font-bold' : 'text-white/60 font-medium'}`}>
                    {n.content}
                  </p>
                  <p className="text-[10px] font-bold text-white/20 mt-2 uppercase tracking-widest">{new Date(n.created_at).toLocaleDateString('sr-RS')}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#185FA5] mt-1 shrink-0 shadow-[0_0_10px_#185FA5]" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link 
        href="/notifikacije" 
        onClick={onClose}
        className="block p-4 text-center text-[11px] font-black uppercase tracking-[0.2em] text-[#185FA5] hover:bg-white/[0.05] transition-all border-t border-white/5"
      >
        {t.seeAllNotifications}
      </Link>
    </div>
  );
}
