'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../components/LanguageContext';

export default function NotifikacijePage() {
  const { t, lang } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      fetchNotifications(currentUser.id);

      // Subscribe to real-time changes
      const channel = supabase.channel('notif_page_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        }, () => fetchNotifications(currentUser.id))
        .subscribe();

      return () => supabase.removeChannel(channel);
    }
    init();
  }, [router]);

  async function fetchNotifications(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, listings(title, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setNotifications(data || []);
    }
    setLoading(false);
  }

  async function markAllAsRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  }

  async function markAsRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.notifications}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.notificationsSub}</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="text-[12px] font-bold text-[#185FA5] hover:underline bg-transparent border-none cursor-pointer"
            >
              {t.markAllAsRead}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
            <div className="text-5xl mb-4 opacity-20">🔔</div>
            <p className="text-gray-500 font-medium">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <Link 
                key={n.id}
                href={n.type === 'message' ? `/poruke` : `/oglas/${n.listing_id}`}
                onClick={() => markAsRead(n.id)}
                className={`flex gap-4 p-5 rounded-2xl border transition-all hover:shadow-md group relative
                  ${!n.is_read ? 'bg-white border-[#185FA5] shadow-sm' : 'bg-white border-gray-100 opacity-70 hover:opacity-100'}`}
              >
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden relative border border-gray-100 shadow-sm group-hover:border-[#185FA5] transition-colors">
                  {n.listings?.image_url ? (
                    <Image src={n.listings.image_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl">
                      {n.type === 'message' ? '💬' : '📉'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-[14px] leading-snug line-clamp-2 ${!n.is_read ? 'text-gray-900 font-bold' : 'text-gray-600 font-medium'}`}>
                      {n.content}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0 ml-4">
                      {new Date(n.created_at).toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {n.listings?.title && (
                    <p className="text-[12px] text-[#185FA5] font-semibold truncate">
                      {n.listings.title}
                    </p>
                  )}
                </div>

                {!n.is_read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#185FA5]" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
