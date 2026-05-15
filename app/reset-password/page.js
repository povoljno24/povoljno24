'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../components/LanguageContext';

export default function ResetPassword() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(t.passwordUpdated);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    setLoading(false);
  }

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-[15px]";

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-transparent">
      <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 w-full max-w-[480px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <h1 className="text-3xl font-black mb-10 text-white text-center uppercase tracking-tight">{t.resetPassword}</h1>

        <form onSubmit={handleUpdate} className="space-y-8">
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-4 ml-1">{t.newPassword}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 text-black bg-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${loading ? 'opacity-20 cursor-not-allowed' : 'hover:bg-[#185FA5] hover:text-white cursor-pointer'}`}
          >
            {loading ? t.loading : t.updatePassword}
          </button>
        </form>

        {message && (
          <div className="mt-8 p-5 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-2xl animate-in fade-in zoom-in duration-300">
            <p className="text-[12px] text-[#1D9E75] text-center font-black uppercase tracking-widest">
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in fade-in zoom-in duration-300">
            <p className="text-[12px] text-red-500 text-center font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
