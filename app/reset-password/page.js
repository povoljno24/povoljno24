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

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#f5f5f5]">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 w-full max-w-[400px] shadow-sm">
        <h1 className="text-xl font-semibold mb-6 text-gray-900 text-center">{t.resetPassword}</h1>

        <form onSubmit={handleUpdate}>
          <div className="mb-6">
            <label className="text-[13px] text-gray-600 block mb-1.5 font-medium">{t.newPassword}</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#185FA5] hover:bg-[#0C447C] cursor-pointer'}`}
          >
            {loading ? t.loading : t.updatePassword}
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
      </div>
    </div>
  );
}
