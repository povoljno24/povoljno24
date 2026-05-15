'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../components/LanguageContext';

export default function Login() {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loginSchema = z.object({
    email: z.string().email(t.valEmail),
    password: z.string().min(6, t.valPasswordMin),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });

  async function onSubmit(data) {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ 
      email: data.email, 
      password: data.password 
    });
    
    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  }

  const inputClasses = (hasError) => `
    w-full px-5 py-4 rounded-2xl border text-[14px] outline-none transition-all duration-300
    bg-white/[0.03] text-white placeholder:text-white/10
    ${hasError 
      ? 'border-red-500/50 focus:border-red-500 focus:bg-red-500/5' 
      : 'border-white/5 focus:border-[#185FA5] focus:bg-white/10 focus:ring-1 focus:ring-[#185FA5]/50'}
  `;

  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-transparent py-32">
      <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl p-12 sm:p-16 rounded-[3rem] border border-white/10 w-full max-w-[480px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden group">
        {/* Subtle internal glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
        
        <h1 className="text-3xl font-black mb-12 text-white text-center tracking-tight uppercase">{t.loginTitle}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
          <div className="mb-6">
            <label className={labelClasses}>{t.emailLabel}</label>
            <input
              type="email"
              {...register('email')}
              placeholder={t.emailPlaceholder}
              className={inputClasses(errors.email)}
            />
            {errors.email && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.email.message}</p>}
          </div>

          <div className="mb-10">
            <label className={labelClasses}>{t.passwordLabel}</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••"
              className={inputClasses(errors.password)}
            />
            {errors.password && <p className="mt-2 text-[11px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.password.message}</p>}
            <div className="flex justify-end mt-4">
              <Link href="/forgot-password" size="sm" className="text-[11px] font-black text-[#185FA5] hover:text-white uppercase tracking-widest transition-colors">
                {t.forgotPassword}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-[13px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]
              ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer active:scale-[0.98]'}`}
          >
            {loading ? t.loggingIn : t.loginTitle}
          </button>
        </form>

        {message && (
          <p className="mt-8 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-center text-[#E24B4A] bg-red-500/10 border border-red-500/20">
            {message}
          </p>
        )}

        <p className="mt-10 text-[12px] font-bold text-white/40 text-center uppercase tracking-widest">
          {t.noAccount} <Link href="/register" className="text-white hover:text-[#185FA5] transition-colors">{t.register}</Link>
        </p>
      </div>
    </div>
  );
}