'use client';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../components/LanguageContext';

export default function ContactForm({ listingId, receiverId }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgError, setMsgError] = useState('');

  async function handleSendMessage() {
    setSendingMsg(true);
    setMsgError('');
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMsgError(t.contactMustLogin);
      setSendingMsg(false);
      return;
    }
    
    if (!message.trim()) {
      setMsgError(t.contactEmpty);
      setSendingMsg(false);
      return;
    }
    
    // Cooldown check
    const lastSendTime = localStorage.getItem(`contact_cooldown_${listingId}`);
    if (lastSendTime && Date.now() - parseInt(lastSendTime, 10) < 30000) {
      setMsgError(t.contactRateLimit || "Molimo sačekajte 30 sekundi.");
      setSendingMsg(false);
      return;
    }

    const { error } = await supabase.from('messages').insert({
      listing_id: listingId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: message,
      is_read: false,
    });
    
    if (error) {
      setMsgError(t.reportError + error.message);
    } else {
      localStorage.setItem(`contact_cooldown_${listingId}`, Date.now().toString());
      window.location.href = `/poruke/${listingId}-${receiverId}`;
    }
    setSendingMsg(false);
  }

  const inputClasses = "w-full px-6 py-5 rounded-[1.5rem] border border-white/5 bg-white/[0.03] text-white placeholder:text-white/20 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-[15px] resize-none";

  if (msgSent) {
    return (
      <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl p-6 text-center animate-in zoom-in duration-300">
        <p className="text-[#1D9E75] text-[13px] font-black uppercase tracking-widest">{t.contactSent}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={t.contactPlaceholder}
        rows={4}
        className={inputClasses}
      />
      <button
        onClick={handleSendMessage}
        disabled={sendingMsg}
        className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]
          ${sendingMsg ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer active:scale-[0.98]'}`}
      >
        {sendingMsg ? t.contactSending : t.contactSend}
      </button>
      {msgError && <p className="text-[#E24B4A] text-[11px] font-black uppercase tracking-widest text-center animate-in slide-in-from-top-2 duration-300">{msgError}</p>}
    </div>
  );
}
