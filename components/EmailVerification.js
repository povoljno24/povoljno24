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

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/[0.03] text-white placeholder:text-white/10 outline-none focus:border-[#185FA5] focus:bg-white/10 transition-all text-sm";
  const labelClasses = "text-[10px] font-black text-white/40 uppercase tracking-[0.3em] block mb-3 ml-1";

  return (
    <div className="bg-transparent">
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Verifikacija naloga</h3>
      <p className="text-[13px] text-white/40 font-medium mb-8 leading-relaxed">
        {step === 'input' 
          ? 'Unesite vaš email kako biste verifikovali nalog i otključali sve opcije.' 
          : 'Unesite kod koji smo vam poslali na email.'}
      </p>

      {step === 'input' ? (
        <div className="space-y-8">
          <div>
            <label className={labelClasses}>EMAIL ADRESA</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vash@email.com"
              className={inputClasses}
            />
          </div>
          <button
            onClick={handleSendOTP}
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]
              ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:bg-[#185FA5] hover:text-white cursor-pointer active:scale-[0.98]'}`}
          >
            {loading ? 'Slanje...' : 'Pošalji kod'}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <label className={labelClasses}>UNESITE KOD</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="123456"
              className={inputClasses + " text-center tracking-[1em] font-black text-lg"}
            />
          </div>
          <button
            onClick={handleVerifyOTP}
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-[0_20px_40px_rgba(0,0,0,0.3)]
              ${loading ? 'Verifikacija...' : 'bg-[#1D9E75] text-white hover:bg-[#167D5D] cursor-pointer active:scale-[0.98]'}`}
          >
            Potvrdi kod
          </button>
          <button
            onClick={() => setStep('input')}
            className="w-full text-[11px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-colors"
          >
            Nazad na unos emaila
          </button>
        </div>
      )}
    </div>
  );
}
