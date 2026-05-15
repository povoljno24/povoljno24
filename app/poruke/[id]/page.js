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

      window.dispatchEvent(new Event('counts_changed'));
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
        const isFromOther = newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id;
        const isFromMe = newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId;
        
        if (isFromOther || isFromMe) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (isFromOther) {
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then(() => {
              window.dispatchEvent(new Event('counts_changed'));
            });
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
      console.error(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
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
    if (listing?.user_id !== user.id) return;

    setSending(true);
    const content = "📦 [SISTEM] Prodavac je označio predmet kao poslat.";
    
    await supabase.from('listings').update({ 
      status: 'shipped',
      buyer_id: otherUserId 
    }).eq('id', listingId);

    const { data, error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      is_read: false
    }).select().single();

    if (error) {
      console.error(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setListing(prev => ({ ...prev, status: 'shipped', buyer_id: otherUserId }));
    }
    setSending(false);
  }

  async function handleActionReceived() {
    if (!user || sending) return;
    if (listing?.user_id === user.id) return;

    setSending(true);
    const content = "✅ [SISTEM] Kupac je potvrdio prijem predmeta. Transakcija je uspešno završena!";
    
    await supabase.from('listings').update({ status: 'collected' }).eq('id', listingId);

    const { data, error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: otherUserId,
      content,
      is_read: false
    }).select().single();

    if (error) {
      console.error(t.sendError + error.message);
    } else if (data) {
      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setListing(prev => ({ ...prev, status: 'collected' }));
      
      await supabase.from('notifications').insert({
        user_id: otherUserId,
        type: 'kpi_prompt',
        content: `Predmet "${listing.title}" je preuzet! Molimo popunite podatke o prodaji.`,
        listing_id: listingId
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
      console.error(t.ratingError + error.message);
    } else {
      setHasRated(true);
      setShowRatingForm(false);
      const commentText = ratingComment.trim() ? `\nKomentar: "${ratingComment.trim()}"` : '';
      await supabase.from('messages').insert({
        listing_id: listingId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: `Korisnik vas je ocenio sa ${ratingScore} zvezdica.${commentText}`,
        is_read: false
      });
    }
    setSubmittingRating(false);
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  const hasSent = messages.some(m => m.content.startsWith('📦 [SISTEM]'));
  const hasReceived = messages.some(m => m.content.startsWith('✅ [SISTEM]'));
  const isSeller = listing?.user_id === user?.id;
  const isBuyer = listing && listing?.user_id !== user?.id;

  const cardClasses = "bg-[#0A0A0A]/80 backdrop-blur-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)]";
  const inputClasses = "flex-1 bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-[15px] text-white placeholder:text-white/20 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all";

  return (
    <div className="flex-1 flex flex-col bg-transparent h-[calc(100vh-64px)] relative">
      
      {/* Header */}
      <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl border-b border-white/10 px-8 py-5 flex items-center gap-6 sticky top-0 z-[50] shadow-2xl">
        <Link href="/poruke" className="p-3 -ml-3 text-white/20 hover:text-white transition-all bg-white/[0.03] rounded-full border border-white/5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link href={`/prodavac/${otherUserId}`} className="font-black text-white text-lg tracking-tight truncate hover:text-[#185FA5] transition-colors">
              {otherUser?.username || t.userWord}
            </Link>
            {otherUser?.verification_level > 0 && (
              <span className="text-[9px] font-black bg-[#1D9E75]/10 text-[#1D9E75] px-2 py-0.5 rounded-full border border-[#1D9E75]/20 uppercase tracking-widest">
                🛡️ Verified
              </span>
            )}
          </div>
          <Link href={`/oglas/${listingId}`} className="text-[11px] font-black text-[#185FA5] uppercase tracking-widest truncate block hover:text-white transition-colors">
            {listing?.title}
          </Link>
        </div>
        
        {!hasRated && user.id !== otherUserId && (
          <button 
            onClick={() => setShowRatingForm(true)}
            className="text-[10px] font-black text-black bg-white hover:bg-[#1D9E75] hover:text-white px-5 py-2.5 rounded-full transition-all uppercase tracking-widest shadow-xl"
          >
            {listing?.user_id === user.id ? t.rateBuyer : t.rateSeller}
          </button>
        )}
      </div>

      {/* Status Controller Banner */}
      <div className="bg-[#185FA5]/10 backdrop-blur-2xl border-b border-[#185FA5]/20 px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner border border-white/5">
            {hasReceived ? '🎉' : hasSent ? '🚚' : '🤝'}
          </div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed">
            <span className="text-white/20">Status: </span>
            {hasReceived ? (
              <span className="text-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.1)]">Završeno</span>
            ) : hasSent ? (
              <span className="text-[#185FA5]">Poslato</span>
            ) : (
              <span className="text-white/40">U toku</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isSeller && !hasSent && (
            <button
              onClick={handleActionSent}
              disabled={sending}
              className="bg-[#185FA5] text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full transition-all shadow-[0_15px_30px_rgba(24,95,165,0.2)] hover:scale-105 active:scale-95 disabled:opacity-20"
            >
              📦 Označi slanje
            </button>
          )}
          {isBuyer && hasSent && !hasReceived && (
            <button
              onClick={handleActionReceived}
              disabled={sending}
              className="bg-[#1D9E75] text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-3 rounded-full transition-all shadow-[0_15px_30px_rgba(29,158,117,0.2)] hover:scale-105 active:scale-95 disabled:opacity-20 animate-pulse"
            >
              ✅ Potvrdi prijem
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {messages.map((msg, idx) => {
          if (msg.content.startsWith('📦 [SISTEM]') || msg.content.startsWith('✅ [SISTEM]')) {
            const isDelivery = msg.content.startsWith('✅ [SISTEM]');
            const cleanText = msg.content.replace('📦 [SISTEM] ', '').replace('✅ [SISTEM] ', '');
            return (
              <div key={msg.id || idx} className="my-10 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className={`px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] border backdrop-blur-3xl shadow-2xl flex items-center gap-4 max-w-[80%]
                  ${isDelivery 
                    ? 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20 shadow-[0_0_40px_rgba(29,158,117,0.1)]' 
                    : 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20 shadow-[0_0_40px_rgba(24,95,165,0.1)]'
                }`}>
                  <span className="text-xl shrink-0">{isDelivery ? '🎉' : '📦'}</span>
                  <span className="leading-relaxed">{cleanText}</span>
                </div>
                <div className="text-[9px] font-black text-white/10 mt-3 uppercase tracking-widest">
                  {new Date(msg.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          }

          const isMe = msg.sender_id === user.id;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] sm:max-w-[65%] rounded-[2rem] px-8 py-5 shadow-2xl relative group transition-all duration-300 hover:scale-[1.01]
                ${isMe 
                  ? 'bg-[#185FA5] text-white rounded-tr-none shadow-[0_20px_40px_rgba(24,95,165,0.2)]' 
                  : 'bg-white/[0.03] text-white border border-white/10 rounded-tl-none backdrop-blur-3xl'}`}>
                <p className="text-[16px] leading-relaxed font-medium tracking-tight">{msg.content}</p>
                <div className={`text-[9px] font-black mt-3 uppercase tracking-widest ${isMe ? 'text-white/40' : 'text-white/20'} text-right`}>
                  {new Date(msg.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl border-t border-white/10 p-8">
        <form onSubmit={handleSendMessage} className="max-w-[900px] mx-auto flex gap-4">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={t.messagePlaceholder}
            className={inputClasses}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className={`w-16 h-16 rounded-2xl transition-all shadow-2xl flex items-center justify-center shrink-0 border
              ${!newMessage.trim() || sending 
                ? 'bg-white/5 border-white/5 text-white/10' 
                : 'bg-white border-white text-black hover:bg-[#185FA5] hover:text-white hover:border-[#185FA5] active:scale-90'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-12 w-full max-w-[500px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden">
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#1D9E75]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <h3 className="text-3xl font-black text-white mb-10 tracking-tight uppercase">{listing?.user_id === user.id ? t.rateBuyer : t.rateSeller}</h3>
            
            <div className="mb-10">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-4 ml-1">{t.yourRating}</label>
              <div className="flex justify-center bg-white/[0.03] py-8 rounded-[2rem] border border-white/5">
                <StarRating rating={ratingScore} onRate={setRatingScore} size="lg" interactive={true} />
              </div>
            </div>
            
            <div className="mb-12">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-4 ml-1">{t.comment}</label>
              <textarea 
                value={ratingComment}
                onChange={e => setRatingComment(e.target.value)}
                placeholder={t.commentPlaceholder}
                rows={3}
                className="w-full bg-white/[0.03] border border-white/5 rounded-[2rem] px-8 py-6 text-white text-base outline-none focus:border-[#1D9E75] transition-all resize-none"
              />
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRatingForm(false)}
                className="flex-1 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white bg-white/5 transition-all"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSubmitRating}
                disabled={submittingRating}
                className="flex-1 py-5 rounded-2xl bg-[#1D9E75] text-white text-[11px] font-black uppercase tracking-widest hover:bg-[#157a5a] transition-all shadow-[0_20px_40px_rgba(29,158,117,0.2)] disabled:opacity-20"
              >
                {submittingRating ? t.sending2 : t.sendRating}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
