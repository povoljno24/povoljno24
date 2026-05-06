'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
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

      // Fetch all messages involving the user
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (messages) {
        // Manually fetch related profiles and listings
        const profileIds = [...new Set(messages.flatMap(m => [m.sender_id, m.receiver_id]))];
        const listingIds = [...new Set(messages.map(m => m.listing_id))];

        const [{ data: profilesData }, { data: listingsData }] = await Promise.all([
          supabase.from('profiles').select('id, username').in('id', profileIds),
          supabase.from('listings').select('id, title, image_url').in('id', listingIds)
        ]);

        const profilesMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p.username }), {});
        const listingsMap = (listingsData || []).reduce((acc, l) => ({ ...acc, [l.id]: l }), {});

        // Group messages into conversations
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
  }, [router]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[13px] text-gray-500">{t.loadingConversations}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t.messagesTitle}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {t.messagesSub}
            </p>
          </div>
          <Link
            href="/profil"
            className="text-sm text-gray-500 hover:text-[#185FA5] transition-colors"
          >
            {t.backToProfile}
          </Link>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-30">📭</div>
            <p className="text-[15px] font-medium text-gray-700 mb-1">
              {t.noConversations}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {t.noConversationsSub}
            </p>
            <Link
              href="/"
              className="inline-block bg-[#185FA5] hover:bg-[#0C447C] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
            >
              {t.browseAds}
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {conversations.map(conv => (
              <Link 
                key={conv.id}
                href={`/poruke/${conv.id}`}
                className="block group"
              >
                <div className={`bg-white rounded-xl p-4 border transition-all group-hover:shadow-md group-hover:border-[#185FA5] flex gap-4 items-center
                  ${conv.unread_count > 0 ? 'border-[#185FA5] shadow-sm' : 'border-gray-200'}`}>
                  
                  {/* Listing Image Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-gray-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-gray-100 shadow-sm">
                    {conv.listing_image ? (
                      <img src={conv.listing_image} alt={conv.listing_title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl opacity-30">📦</span>
                    )}
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E24B4A] rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="font-semibold text-gray-900 text-[15px] truncate">
                        {conv.other_username || t.userFallback}
                      </div>
                      <div className="text-[11px] text-gray-400 shrink-0">
                        {new Date(conv.last_message_at).toLocaleDateString(lang === 'sr' ? 'sr-RS' : 'en-US', {
                          day: '2-digit', month: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-[13px] text-[#185FA5] font-medium mb-1 truncate">
                      {conv.listing_title}
                    </div>
                    <p className={`text-[13px] truncate ${conv.unread_count > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {conv.last_message}
                    </p>
                  </div>

                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
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
