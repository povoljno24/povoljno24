'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';

export default function PhoneVerification({ onVerified }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter Code
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Format check: ensure it starts with +
    if (!phone.startsWith('+')) {
      setError(t.phoneVerifyFormatError);
      setLoading(false);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (otpError) {
      setError(t.reportError + otpError.message);
    } else {
      setStep(2);
    }
    setLoading(false);
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: code,
      type: 'sms',
    });

    if (verifyError) {
      setError(t.phoneVerifyCodeError);
    } else {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone: phone, phone_verified: true })
        .eq('id', data.user.id);

      if (profileError) {
        setError(t.updateProfileError + profileError.message);
      } else {
        setSuccess(true);
        if (onVerified) onVerified(phone);
      }
    }
    setLoading(false);
  }

  if (success) {
    return (
      <div className="bg-[#EAF3DE] border border-[#d3ecc1] rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="text-lg font-bold text-[#3B6D11] mb-1">{t.phoneVerifySuccess}</h3>
        <p className="text-sm text-[#3B6D11]/80">{t.phoneVerifyConnected.replace('{phone}', phone)}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{t.phoneVerifyTitle}</h3>
      
      {step === 1 ? (
        <form onSubmit={handleSendCode} className="space-y-4">
          <p className="text-sm text-gray-500">{t.phoneVerifySub}</p>
          <div>
            <label className="text-[12px] font-semibold text-gray-400 uppercase mb-1.5 block">{t.phone}</label>
            <input 
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+381 60 123 4567"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] transition-all"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#185FA5] hover:bg-[#0C447C] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
          >
            {loading ? t.phoneVerifySendingCode : t.phoneVerifySendCode}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <p className="text-sm text-gray-500">{t.phoneVerifyEnterCode} <strong>{phone}</strong>.</p>
          <div>
            <label className="text-[12px] font-semibold text-gray-400 uppercase mb-1.5 block">{t.phoneVerifySmsCode}</label>
            <input 
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center font-bold tracking-widest outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              {t.back}
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#1D9E75] hover:bg-[#157a5a] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loading ? t.phoneVerifyVerifying : t.phoneVerifyConfirm}
            </button>
          </div>
        </form>
      )}

      {error && <p className="mt-4 text-xs text-[#E24B4A] text-center bg-red-50 py-2 rounded-lg">{error}</p>}
    </div>
  );
}
