'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';
import { useToast } from './ToastContext';

export default function ReportButton({ listingId }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleReport() {
    if (!reason) return;
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showToast(t.reportMustLogin, 'error');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      listing_id: listingId,
      reason
    });

    if (error) {
      showToast(t.reportError + error.message, 'error');
    } else {
      showToast(t.reportSentTitle, 'success');
      setSubmitted(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitted(false);
        setReason('');
      }, 3000);
    }
    setLoading(false);
  }

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-red-500 transition-all bg-white/[0.03] border border-white/5 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 mt-4"
      >
        <span className="text-[12px]">🚩</span> {t.reportBtn}
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-8 animate-in fade-in duration-500"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] p-12 w-full max-w-[480px] shadow-[0_64px_128px_rgba(0,0,0,0.8)] relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
             <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            {!submitted ? (
              <>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">{t.reportTitle}</h3>
                <p className="text-[14px] text-white/40 mb-10 leading-relaxed font-bold uppercase tracking-widest">
                  {t.reportSub}
                </p>

                <div className="space-y-3 mb-12">
                  {t.reportReasons.map(r => (
                    <label key={r} className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] hover:border-white/20 cursor-pointer transition-all group">
                      <div className="relative w-5 h-5 flex items-center justify-center">
                        <input 
                          type="radio" 
                          name="reason" 
                          value={r} 
                          onChange={e => setReason(e.target.value)}
                          className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className="w-5 h-5 rounded-full border-2 border-white/10 peer-checked:border-red-500 transition-all" />
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 scale-0 peer-checked:scale-100 transition-transform absolute shadow-[0_0_10px_#ef4444]" />
                      </div>
                      <span className="text-sm text-white/60 font-black uppercase tracking-widest group-hover:text-white transition-colors">{r}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/20 hover:text-white bg-white/5 transition-all"
                  >
                    {t.reportCancel}
                  </button>
                  <button 
                    onClick={handleReport}
                    disabled={!reason || loading}
                    className="flex-1 py-5 rounded-2xl bg-red-500 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-600 shadow-[0_20px_40px_rgba(239,68,68,0.2)] disabled:opacity-20 transition-all active:scale-95"
                  >
                    {loading ? t.reportSending : t.reportSubmit}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.1)]">✓</div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">{t.reportSentTitle}</h3>
                <p className="text-[13px] text-white/40 font-black uppercase tracking-widest mb-10">{t.reportSentSub}</p>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-[#185FA5] hover:text-white transition-all shadow-xl"
                >
                  {t.reportCancel || 'Zatvori'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
