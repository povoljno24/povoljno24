'use client';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';
import { useLanguage } from './LanguageContext';

export default function RealtimeNotifications() {
  const { showToast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen for new messages
      const msgChannel = supabase.channel(`global_msgs_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        }, (payload) => {
          const newMsg = payload.new;
          // Don't show toast if we are on the chat page for this specific message
          if (window.location.pathname.includes(`/poruke/${newMsg.listing_id}-${newMsg.sender_id}`)) {
            return;
          }
          
          showToast(`${t.newMsgFrom || 'Nova poruka'}: ${newMsg.content.substring(0, 50)}...`, 'info');
        })
        .subscribe();

      // Listen for new notifications (like status changes, reviews, etc.)
      const notifChannel = supabase.channel(`global_notifs_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          showToast(payload.new.content, 'info');
        })
        .subscribe();

      return () => {
        supabase.removeChannel(msgChannel);
        supabase.removeChannel(notifChannel);
      };
    }

    setupRealtime();

    // Listen for auth changes to re-setup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setupRealtime();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [showToast, t]);

  return null;
}
