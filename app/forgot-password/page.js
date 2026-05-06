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

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f5f5]">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-[400px] shadow-sm">
        <h1 className="text-xl font-semibold mb-2 text-gray-900 text-center">{t.resetPassword}</h1>
        <p className="text-[13px] text-gray-500 text-center mb-6">{t.enterEmailReset}</p>

        <form onSubmit={handleReset}>
          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? t.loading : t.resetPassword}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-[13px] text-green-600 text-center bg-green-50 py-2 rounded-md font-medium">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 text-[13px] text-red-600 text-center bg-red-50 py-2 rounded-md font-medium">
            {error}
          </p>
        )}

        <p className="mt-6 text-[13px] text-gray-600 text-center">
          <Link href="/login" className="text-[#185FA5] hover:underline font-medium">← {t.back}</Link>
        </p>
      </div>
    </div>
  );
}
