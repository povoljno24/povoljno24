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

  const fetchNotifications = async (userId) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, listings(title, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) {
      setNotifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    let channel;
    
    async function init() {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      
      if (!currentUser) {
        router.push('/login');
        return;
      }
      setUser(currentUser);
      fetchNotifications(currentUser.id);

      channel = supabase.channel('notif_page_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`
        }, () => fetchNotifications(currentUser.id))
        .subscribe();
    }
    
    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  async function markAllAsRead() {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    window.dispatchEvent(new Event('counts_changed'));
  }

  async function markAsRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    window.dispatchEvent(new Event('counts_changed'));
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-500 hover:border-white/20";

  return (
    <div className="flex-1 bg-transparent py-16 px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{t.notifications}</h1>
            <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em]">{t.notificationsSub}</p>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={markAllAsRead}
              className="text-[10px] font-black text-[#185FA5] hover:text-white uppercase tracking-widest bg-white/[0.03] border border-white/5 px-6 py-2 rounded-full transition-all"
            >
              {t.markAllAsRead}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-24 text-center">
            <div className="text-6xl mb-8 opacity-10">🔔</div>
            <p className="text-[13px] font-black text-white/20 uppercase tracking-widest">{t.noNotifications}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notifications.map((n) => (
              <Link 
                key={n.id}
                href={n.type === 'message' ? `/poruke` : `/oglas/${n.listing_id}`}
                onClick={() => markAsRead(n.id)}
                className={`${cardClasses} flex gap-6 items-center ${!n.is_read ? 'border-[#185FA5]/40 bg-[#185FA5]/5 shadow-[0_0_40px_rgba(24,95,165,0.1)]' : ''}`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#050505] overflow-hidden shrink-0 relative flex items-center justify-center border border-white/5 transition-all group-hover:border-white/20">
                  {n.listings?.image_url ? (
                    <Image src={n.listings.image_url} alt="" fill sizes="64px" className="object-cover" />
                  ) : (
                    <div className="text-3xl opacity-10 grayscale">
                      {n.type === 'message' ? '💬' : '📉'}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <p className={`text-[15px] leading-snug line-clamp-2 tracking-tight ${!n.is_read ? 'text-white font-black uppercase' : 'text-white/40 font-bold'}`}>
                      {n.content}
                    </p>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest shrink-0 ml-6">
                      {new Date(n.created_at).toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
                        day: '2-digit', month: '2-digit'
                      })}
                    </span>
                  </div>
                  {n.listings?.title && (
                    <p className="text-[11px] font-black text-[#185FA5] uppercase tracking-[0.2em] truncate">
                      🏷️ {n.listings.title}
                    </p>
                  )}
                </div>

                {!n.is_read && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#185FA5] shadow-[0_0_10px_#185FA5] animate-pulse" />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
