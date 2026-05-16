'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../components/LanguageContext';

export default function PorukePage() {
  const { t, lang } = useLanguage();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadConversations() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (messages) {
        const profileIds = [...new Set(messages.flatMap(m => [m.sender_id, m.receiver_id]))];
        const listingIds = [...new Set(messages.map(m => m.listing_id))];

        const [{ data: profilesData }, { data: listingsData }] = await Promise.all([
          supabase.from('profiles').select('id, username').in('id', profileIds),
          supabase.from('listings').select('id, title, image_url').in('id', listingIds)
        ]);

        const profilesMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p.username }), {});
        const listingsMap = (listingsData || []).reduce((acc, l) => ({ ...acc, [l.id]: l }), {});

        const groups = {};
        messages.forEach(msg => {
          const otherId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
          const convId = `${msg.listing_id}-${otherId}`;
          const listing = listingsMap[msg.listing_id] || {};
          
          if (!groups[convId]) {
            groups[convId] = {
              id: convId,
              listing_id: msg.listing_id,
              listing_title: listing.title || t.unknownListing,
              listing_image: listing.image_url,
              other_id: otherId,
              other_username: profilesMap[otherId] || t.userFallback,
              last_message: msg.content,
              last_message_at: msg.created_at,
              unread_count: 0,
              messages: []
            };
          }
          
          if (!msg.is_read && msg.receiver_id === currentUser.id) {
            groups[convId].unread_count++;
          }
          groups[convId].messages.push(msg);
        });

        setConversations(Object.values(groups).sort((a, b) => 
          new Date(b.last_message_at) - new Date(a.last_message_at)
        ));
      }

      setLoading(false);
    }
    loadConversations();

    const channel = supabase
      .channel('inbox-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, t]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-6 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-500 hover:border-white/20 hover:bg-[#0A0A0A]/80 hover:scale-[1.01] active:scale-[0.99]";

  return (
    <div className="flex-1 bg-transparent py-16 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{t.messagesTitle}</h1>
            <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.3em]">
              {t.messagesSub}
            </p>
          </div>
          <Link
            href="/profil"
            className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors mb-2"
          >
            {t.backToProfile}
          </Link>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-24 text-center">
            <div className="text-7xl mb-8 opacity-10 grayscale">📭</div>
            <p className="text-xl font-black text-white uppercase tracking-tight mb-4">
              {t.noConversations}
            </p>
            <p className="text-[13px] text-white/20 uppercase tracking-widest font-bold mb-10">
              {t.noConversationsSub}
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-black hover:bg-[#185FA5] hover:text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-xl"
            >
              {t.browseAds}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {conversations.map(conv => (
              <Link 
                key={conv.id}
                href={`/poruke/${conv.id}`}
                className="block"
              >
                <div className={`${cardClasses} flex gap-6 items-center ${conv.unread_count > 0 ? 'border-[#185FA5]/40 bg-[#185FA5]/5' : ''}`}>
                  
                  {/* Listing Image Thumbnail */}
                  <div className="w-20 h-20 rounded-2xl bg-[#050505] overflow-hidden shrink-0 relative flex items-center justify-center border border-white/5 shadow-xl transition-all group-hover:border-white/20">
                    {conv.listing_image ? (
                      <div className="relative w-full h-full">
                        <Image src={conv.listing_image} alt={conv.listing_title} fill className="object-cover" />
                      </div>
                    ) : (
                      <span className="text-3xl opacity-10">📦</span>
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-[#E24B4A] rounded-full shadow-[0_0_10px_#E24B4A] animate-pulse"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="font-black text-white text-lg tracking-tight truncate">
                        {conv.other_username || t.userFallback}
                      </div>
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
                          day: '2-digit', month: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-[11px] font-black text-[#185FA5] uppercase tracking-[0.2em] mb-2 truncate">
                      {conv.listing_title}
                    </div>
                    <p className={`text-[14px] truncate tracking-tight ${conv.unread_count > 0 ? 'text-white font-bold' : 'text-white/40 font-medium'}`}>
                      {conv.last_message}
                    </p>
                  </div>

                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
