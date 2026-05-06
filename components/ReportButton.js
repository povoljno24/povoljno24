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
        className="text-[11px] text-gray-400 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1 mt-4"
      >
        {t.reportBtn}
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 cursor-pointer"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-[400px] p-8 shadow-2xl animate-in fade-in zoom-in duration-200 cursor-default"
            onClick={e => e.stopPropagation()}
          >
            {!submitted ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{t.reportTitle}</h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  {t.reportSub}
                </p>

                <div className="space-y-3 mb-8">
                  {t.reportReasons.map(r => (
                    <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group">
                      <input 
                        type="radio" 
                        name="reason" 
                        value={r} 
                        onChange={e => setReason(e.target.value)}
                        className="w-4 h-4 text-[#185FA5]"
                      />
                      <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{r}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t.reportCancel}
                  </button>
                  <button 
                    onClick={handleReport}
                    disabled={!reason || loading}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:bg-gray-300 transition-all active:scale-95"
                  >
                    {loading ? t.reportSending : t.reportSubmit}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t.reportSentTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{t.reportSentSub}</p>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                >
                  {t.reportCancel || 'Close'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
