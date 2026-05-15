'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useLanguage } from '../../components/LanguageContext';
import { useToast } from '../../components/ToastContext';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast(t.resetLinkSent, 'success');
    }
    setLoading(false);
  }

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-[15px]";
  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-transparent py-32">
      <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 w-full max-w-[480px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden group">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <h1 className="text-3xl font-black mb-4 text-white text-center uppercase tracking-tight">{t.resetPassword}</h1>
        <p className="text-[11px] text-white/20 text-center mb-10 font-black uppercase tracking-widest">{t.enterEmailReset}</p>

        <form onSubmit={handleReset} className="space-y-8">
          <div>
            <label className={labelClasses}>{t.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95
              ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer'}`}
          >
            {loading ? t.loading : t.resetPassword}
          </button>
        </form>

        <p className="mt-10 text-center">
          <Link href="/login" className="text-[10px] font-black text-[#185FA5] hover:text-white uppercase tracking-widest transition-all">
            ← {t.back}
          </Link>
        </p>
      </div>
    </div>
  );
}
