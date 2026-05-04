'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from './LanguageContext';

export default function NotificationDropdown({ userId, onClose }) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifications() {
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
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function markAsRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  return (
    <div className="absolute top-10 right-0 w-[300px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">{t.notifications}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm italic">{t.loading}</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-3xl mb-2 opacity-20">🔔</div>
            <p className="text-sm text-gray-500">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <Link 
                key={n.id}
                href={n.type === 'message' ? `/poruke` : `/oglas/${n.listing_id}`}
                onClick={() => markAsRead(n.id)}
                className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${!n.is_read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-100">
                  {n.listings?.image_url ? (
                    <Image src={n.listings.image_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xl">{n.type === 'message' ? '💬' : '📉'}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-900 font-medium leading-snug line-clamp-2">
                    {n.content}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString('sr-RS')}</p>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#185FA5] mt-1 shrink-0" />}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link 
        href="/notifikacije" 
        onClick={onClose}
        className="block p-3 text-center text-[12px] font-bold text-[#185FA5] hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        {t.seeAllNotifications}
      </Link>
    </div>
  );
}
