'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';

export default function EmailVerification({ onVerified }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('input'); // 'input' or 'verify'
  const [loading, setLoading] = useState(false);

  async function handleSendOTP() {
    if (!email || !email.includes('@')) {
      showToast('Unesite validnu email adresu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false, // We only verify existing users
        }
      });

      if (error) throw error;

      setStep('verify');
      showToast('Kod je poslat na vaš email!', 'success');
    } catch (error) {
      console.error('OTP error:', error);
      showToast('Greška: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (!verificationCode) {
      showToast('Unesite kod.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: verificationCode,
        type: 'email'
      });

      if (error) throw error;

      // Update profile in DB to mark as verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ 
          phone_verified: true, // Reusing column for "Account Verified"
          phone: email 
        }).eq('id', user.id);
      }

      showToast('Email uspešno verifikovan!', 'success');
      if (onVerified) onVerified(email);
    } catch (error) {
      console.error('Verify error:', error);
      showToast('Netačan kod ili je istekao.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Verifikacija naloga</h3>
      <p className="text-sm text-gray-500 mb-6">
        {step === 'input' 
          ? 'Unesite vaš email kako biste verifikovali nalog i otključali sve opcije.' 
          : 'Unesite kod koji smo vam poslali na email.'}
      </p>

      {step === 'input' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">EMAIL ADRESA</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vash@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#185FA5] transition-all text-sm"
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full bg-[#185FA5] hover:bg-[#0C447C] text-white py-3 rounded-xl font-bold transition-all disabled:bg-gray-300"
          >
            {loading ? 'Slanje...' : 'Pošalji kod'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">UNESITE KOD</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#185FA5] transition-all text-sm text-center tracking-widest font-bold"
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className="w-full bg-[#1D9E75] hover:bg-[#167D5D] text-white py-3 rounded-xl font-bold transition-all disabled:bg-gray-300"
          >
            {loading ? 'Verifikacija...' : 'Potvrdi kod'}
          </button>
          <button
            onClick={() => setStep('input')}
            className="w-full text-sm text-gray-500 hover:underline"
          >
            Nazad na unos emaila
          </button>
        </div>
      )}
    </div>
  );
}
