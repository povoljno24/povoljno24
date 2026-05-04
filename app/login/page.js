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
      router.push('/');
    }
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f5f5]">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-[400px] shadow-sm">
        <h1 className="text-xl font-semibold mb-6 text-gray-900 text-center">{t.loginTitle}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.emailLabel}</label>
            <input
              type="email"
              {...register('email')}
              placeholder="tvoj@email.com"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.passwordLabel}</label>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:ring-1 transition-all ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#185FA5] focus:ring-[#185FA5]'}`}
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? t.loggingIn : t.loginTitle}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-[13px] text-[#E24B4A] text-center bg-red-50 py-2 rounded-md">
            {message}
          </p>
        )}

        <p className="mt-6 text-[13px] text-gray-600 text-center">
          {t.noAccount} <Link href="/register" className="text-[#185FA5] hover:underline font-medium">{t.register}</Link>
        </p>
      </div>
    </div>
  );
}