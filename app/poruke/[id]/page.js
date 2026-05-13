'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StarRating from '../../../components/StarRating';
import { useLanguage } from '../../../components/LanguageContext';

export default function ChatPage() {
  const { t } = useLanguage();
  const { id } = useParams();
  // The first part is the listingId (integer), the rest is otherUserId (UUID)
  const parts = id.split('-');
  const listingId = parts[0];
  const otherUserId = parts.slice(1).join('-');
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [listing, setListing] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Rating state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const messagesEndRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function init() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) { router.push('/login'); return; }
      setUser(currentUser);

      // Fetch Listing & Other User Info
      const [listingRes, profileRes] = await Promise.all([
        supabase.from('listings').select('*').eq('id', listingId).single(),
        supabase.from('profiles').select('username, verification_level').eq('id', otherUserId).single(),
      ]);

      setListing(listingRes.data);
      setOtherUser(profileRes.data);

      // Fetch Initial Messages
      const { data: initialMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });

      setMessages(initialMessages || []);
      
      // Check if already rated
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('rater_id', currentUser.id)
        .eq('ratee_id', otherUserId)
        .eq('listing_id', listingId)
        .maybeSingle();
      
      if (existingRating) setHasRated(true);

      setLoading(false);
      
      // Mark as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('listing_id', listingId)
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', otherUserId)
        .eq('is_read', false);
    }

    init();
  }, [id, router, listingId, otherUserId]);

  useEffect(() => {
    if (!user || !listingId || !otherUserId) return;

    // Subscribe to REALTIME
    const channel = supabase
      .channel(`chat-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `listing_id=eq.${listingId}`
      }, (payload) => {
        const newMsg = payload.new;
        // Verify if message belongs to this conversation
        const isFromOther = newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id;
        const isFromMe = newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId;
        
        if (isFromOther || isFromMe) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          // If from other, mark as read immediately
          if (isFromOther) {
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, listingId, otherUserId]);

  useEffect(scrollToBottom, [messages]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    let content = newMessage.trim();
    setNewMessage('');

    // Adversarial input sanitization: Prevent users from manually typing system message prefixes to spoof state milestones
    if (content.startsWith('📦 [SISTEM]') || content.startsWith('✅ [SISTEM]')) {
      content = "[Korisnik] " + content;
    }

    const { data, error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      is_read: false
    }).select().single();

    if (error) {
      alert(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      // Create notification for receiver
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'message',
        content: `Nova poruka od ${user.user_metadata?.username || 'korisnika'}: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        listing_id: listingId
      });
    }
    setSending(false);
  }

  async function handleActionSent() {
    if (!user || sending) return;
    // Strict ownership runtime gate: Verify that the executing account owns the targeted listing asset
    if (listing?.user_id !== user.id) {
      alert("Bezbednosna provera: Samo vlasnik oglasa može označiti slanje pošiljke.");
      return;
    }

    setSending(true);
    const content = "📦 [SISTEM] Prodavac je označio predmet kao poslat.";
    const { data, error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      is_read: false
    }).select().single();

    if (error) {
      alert(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
    setSending(false);
  }

  async function handleActionReceived() {
    if (!user || sending) return;
    // Strict ownership runtime gate: Verify that the executing account is the interlocutor/buyer
    if (listing?.user_id === user.id) {
      alert("Bezbednosna provera: Samo kupac može potvrditi prijem pošiljke.");
      return;
    }

    setSending(true);
    const content = "✅ [SISTEM] Kupac je potvrdio prijem predmeta. Transakcija je uspešno završena!";
    const { data, error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      is_read: false
    }).select().single();

    if (error) {
      alert(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
    }
    setSending(false);
  }

  async function handleSubmitRating() {
    if (!user) return;
    setSubmittingRating(true);

    const { error } = await supabase.from('ratings').insert({
      rater_id: user.id,
      ratee_id: otherUserId,
      listing_id: listingId,
      score: ratingScore,
      comment: ratingComment
    });

    if (error) {
      alert(t.ratingError + error.message);
    } else {
      setHasRated(true);
      setShowRatingForm(false);
      // Optional: send a message that user has been rated
      await supabase.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: `Korisnik vas je ocenio sa ${ratingScore} zvezdica.`,
        is_read: false
      });
    }
    setSubmittingRating(false);
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
      <div className="w-8 h-8 border-2 border-[#185FA5] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const hasSent = messages.some(m => m.content.startsWith('📦 [SISTEM]'));
  const hasReceived = messages.some(m => m.content.startsWith('✅ [SISTEM]'));
  const isSeller = listing?.user_id === user?.id;
  const isBuyer = listing && listing?.user_id !== user?.id;

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <Link href="/poruke" className="p-2 -ml-2 text-gray-400 hover:text-[#185FA5] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/prodavac/${otherUserId}`} className="inline-flex items-center gap-2 font-bold text-gray-900 truncate hover:text-[#185FA5] transition-colors group">
            <span>{otherUser?.username || t.userWord}</span>
            {otherUser?.verification_level > 0 && (
              <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] px-1.5 py-0.5 rounded border border-[#d3ecc1] shrink-0 group-hover:bg-[#d9ebd0] transition-colors" title="Verifikovan nivo">
                🛡️ Nivo {otherUser.verification_level}
              </span>
            )}
          </Link>
          <Link href={`/oglas/${listingId}`} className="text-[12px] text-[#185FA5] font-medium truncate block hover:underline">
            {t.listingLabel}{listing?.title}
          </Link>
        </div>
        
        {listing?.user_id === otherUserId && !hasRated && user.id !== otherUserId && (
          <button 
            onClick={() => setShowRatingForm(true)}
            className="text-[11px] font-bold text-white bg-[#1D9E75] hover:bg-[#157a5a] px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            {t.rateSeller}
          </button>
        )}
      </div>

      {/* Transaction Lifecycle Status Controller Banner */}
      <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left shadow-inner shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base">{hasReceived ? '🎉' : hasSent ? '🚚' : '🤝'}</span>
          <div className="text-[12px] text-amber-900 leading-tight">
            <span className="font-bold">Status dogovora: </span>
            {hasReceived ? (
              <span className="text-[#1D9E75] font-extrabold">Paket je uspešno preuzet. Završeno!</span>
            ) : hasSent ? (
              <span className="text-amber-800 font-semibold">Predmet je poslat. Čeka se potvrda kupca o preuzimanju.</span>
            ) : (
              <span className="text-gray-600">U toku pregovori. Prodavac može označiti slanje po dogovoru.</span>
            )}
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2 shrink-0">
          {isSeller && !hasSent && (
            <button
              onClick={handleActionSent}
              disabled={sending}
              className="bg-[#185FA5] hover:bg-[#0C447C] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              📦 Označi kao poslato
            </button>
          )}
          {isBuyer && hasSent && !hasReceived && (
            <button
              onClick={handleActionReceived}
              disabled={sending}
              className="bg-[#1D9E75] hover:bg-[#157a5a] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 animate-pulse"
            >
              ✅ Potvrdi prijem paketa
            </button>
          )}
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[400px] shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.rateSeller}</h3>
            <div className="mb-4">
              <label className="text-[13px] text-gray-500 block mb-2">{t.yourRating}</label>
              <StarRating rating={ratingScore} onRate={setRatingScore} size="lg" interactive={true} />
            </div>
            <div className="mb-6">
              <label className="text-[13px] text-gray-500 block mb-2">{t.comment}</label>
              <textarea 
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowRatingForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSubmitRating}
                disabled={submittingRating}
                className="flex-1 py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#157a5a] transition-colors disabled:opacity-50"
              >
                {submittingRating ? t.sending2 : t.sendRating}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          // Intercept system event notifications
          if (msg.content.startsWith('📦 [SISTEM]') || msg.content.startsWith('✅ [SISTEM]')) {
            const isDelivery = msg.content.startsWith('✅ [SISTEM]');
            const cleanText = msg.content.replace('📦 [SISTEM] ', '').replace('✅ [SISTEM] ', '');
            return (
              <div key={msg.id || idx} className="my-6 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold shadow-sm max-w-[90%] border ${
                  isDelivery 
                    ? 'bg-[#EAF3DE] text-[#3B6D11] border-[#d3ecc1]' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <span className="text-base shrink-0">{isDelivery ? '🎉' : '📦'}</span>
                  <span className="text-left">{cleanText}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          }

          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] shadow-sm
                ${isMe 
                  ? 'bg-[#185FA5] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                {msg.content}
                <div className={`text-[10px] mt-1 opacity-60 text-right ${isMe ? 'text-white' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 pb-8 sm:pb-4">
        <form onSubmit={handleSendMessage} className="max-w-[700px] mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={t.messagePlaceholder}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center
              ${!newMessage.trim() || sending 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-[#185FA5] text-white hover:bg-[#0C447C] active:scale-95'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
