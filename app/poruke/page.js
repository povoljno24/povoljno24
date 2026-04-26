'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PorukePage() {
  const [user, setUser] = useState(null);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadMessages() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);

      const [receivedRes, sentRes] = await Promise.all([
        supabase
          .from('messages')
          .select('*')
          .eq('receiver_id', currentUser.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('messages')
          .select('*')
          .eq('sender_id', currentUser.id)
          .order('created_at', { ascending: false }),
      ]);

      setReceived(receivedRes.data || []);
      setSent(sentRes.data || []);

      // Mark all received as read
      const unreadIds = (receivedRes.data || []).filter(m => !m.is_read).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ is_read: true }).in('id', unreadIds);
      }

      setLoading(false);
    }
    loadMessages();
  }, [router]);

  const tabs = [
    { key: 'received', label: 'Primljene', count: received.filter(m => !m.is_read).length },
    { key: 'sent', label: 'Poslate', count: sent.length },
  ];

  const MessageCard = ({ msg, type }) => (
    <div className={`bg-white rounded-xl p-5 border transition-all hover:shadow-md
      ${type === 'received' && !msg.is_read ? 'border-[#185FA5] shadow-sm' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0
            ${type === 'received' ? 'bg-[#E6F1FB] text-[#185FA5]' : 'bg-gray-100 text-gray-600'}`}>
            {type === 'received' ? '📨' : '📤'}
          </div>
          <div>
            <div className="text-[12px] text-gray-400">
              {type === 'received' ? 'Poruka za oglas' : 'Vaša poruka za oglas'}
            </div>
            <Link
              href={`/oglas/${msg.listing_id}`}
              className="text-[13px] font-semibold text-[#185FA5] hover:underline"
            >
              Oglas #{msg.listing_id}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {type === 'received' && !msg.is_read && (
            <span className="text-[10px] font-bold bg-[#E24B4A] text-white rounded-full px-2 py-0.5">
              Novo
            </span>
          )}
          <span className="text-[11px] text-gray-400">
            {new Date(msg.created_at).toLocaleDateString('sr-RS', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-gray-100">
        {msg.content}
      </p>

      <div className="mt-3 flex justify-end">
        <Link
          href={`/oglas/${msg.listing_id}`}
          className="text-[12px] text-[#185FA5] font-medium hover:underline flex items-center gap-1"
        >
          Pogledaj oglas →
        </Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-[13px] text-gray-500">Učitavanje poruka...</p>
      </div>
    </div>
  );

  const currentMessages = activeTab === 'received' ? received : sent;

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Poruke</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Komunikacija sa kupcima i prodavcima
            </p>
          </div>
          <Link
            href="/profil"
            className="text-sm text-gray-500 hover:text-[#185FA5] transition-colors"
          >
            ← Profil
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-none
                ${activeTab === tab.key
                  ? 'bg-[#185FA5] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${activeTab === tab.key ? 'bg-white/25 text-white' : 'bg-[#E24B4A] text-white'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Messages List */}
        {currentMessages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-30">
              {activeTab === 'received' ? '📭' : '📤'}
            </div>
            <p className="text-[15px] font-medium text-gray-700 mb-1">
              {activeTab === 'received' ? 'Nema primljenih poruka' : 'Nisi poslao/la nijednu poruku'}
            </p>
            <p className="text-sm text-gray-400">
              {activeTab === 'received'
                ? 'Kupci će ti pisati kada budu zainteresovani za tvoje oglase.'
                : 'Pronađi oglas koji te zanima i pošalji poruku prodavcu.'}
            </p>
            {activeTab === 'sent' && (
              <Link
                href="/"
                className="inline-block mt-5 bg-[#185FA5] hover:bg-[#0C447C] text-white px-6 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Pregledaj oglase
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {currentMessages.map(msg => (
              <MessageCard key={msg.id} msg={msg} type={activeTab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
