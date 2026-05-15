'use client';
import { useState } from 'react';
import { useLanguage } from '../../components/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const lastGlobalSend = localStorage.getItem('global_contact_cooldown');
    if (lastGlobalSend && Date.now() - parseInt(lastGlobalSend, 10) < 60000) {
      setError(t.contactRateLimit || "Molimo sačekajte 60 sekundi pre slanja nove poruke.");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://formsubmit.co/ajax/alex@pixelsurgestudio.dev', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        localStorage.setItem('global_contact_cooldown', Date.now().toString());
        setSent(true);
      } else {
        setError(t.errorPrefix + 'Failed to send message.');
      }
    } catch (err) {
      setError(t.errorPrefix + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-[15px]";
  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="flex-1 bg-transparent py-32 px-6">
      <div className="max-w-[540px] mx-auto bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 sm:p-16 shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <h1 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">{t.contact}</h1>
        <p className="text-[13px] text-white/40 mb-12 font-bold uppercase tracking-widest">{t.contactSub}</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-5 rounded-2xl mb-10 text-[11px] font-black uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        {sent ? (
          <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/20 text-[#1D9E75] p-10 rounded-[2.5rem] text-center animate-in zoom-in duration-500">
            <div className="text-5xl mb-6 opacity-40">📧</div>
            <p className="text-lg font-black uppercase tracking-tight mb-2">{t.messageSent}</p>
            <p className="text-[11px] font-black uppercase tracking-widest opacity-60">{t.messageSentSub}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div>
              <label className={labelClasses}>{t.nameLabel}</label>
              <input 
                name="name"
                type="text" 
                required 
                placeholder="John Doe"
                className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>{t.emailLabel}</label>
              <input 
                name="email"
                type="email" 
                required 
                placeholder="john@example.com"
                className={inputClasses} 
              />
            </div>
            <div>
              <label className={labelClasses}>{t.messageLabel}</label>
              <textarea 
                name="message"
                rows={5} 
                required 
                placeholder="How can we help?"
                className={inputClasses + " resize-none"} 
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl active:scale-95
                ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer'}`}
            >
              {loading ? t.loadingLabel : t.sendMessage}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
