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
      window.location.href = `/poruke/${listingId}-${receiverId}`;
    }
    setSendingMsg(false);
  }

  if (msgSent) {
    return (
      <div className="bg-[#EAF3DE] border border-[#d3ecc1] rounded-lg p-4 text-center">
        <p className="text-[#3B6D11] text-sm font-medium">{t.contactSent}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder={t.contactPlaceholder}
        rows={4}
        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] transition-all resize-y"
      />
      <button
        onClick={handleSendMessage}
        disabled={sendingMsg}
        className={`w-full py-3.5 text-white rounded-xl text-[15px] font-semibold transition-colors ${sendingMsg ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
      >
        {sendingMsg ? t.contactSending : t.contactSend}
      </button>
      {msgError && <p className="text-[#E24B4A] text-[13px] text-center">{msgError}</p>}
    </div>
  );
}
