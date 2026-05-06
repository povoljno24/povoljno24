'use client';
import { useState } from 'react';
import { useLanguage } from '../../components/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://formspree.io/f/mzdogwll', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError(t.errorPrefix + 'Failed to send message.');
      }
    } catch (err) {
      setError(t.errorPrefix + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f5f5f5] py-16 px-6">
      <div className="max-w-[500px] mx-auto bg-white rounded-3xl border border-gray-200 p-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.contact}</h1>
        <p className="text-gray-500 mb-8">{t.contactSub}</p>

        {error && (
          <div className="bg-red-50 text-[#E24B4A] p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {sent ? (
          <div className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-2xl text-center">
            <div className="text-3xl mb-2">📧</div>
            <p className="font-bold">{t.messageSent}</p>
            <p className="text-sm mt-1">{t.messageSentSub}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-gray-600 mb-1.5 block">{t.nameLabel}</label>
              <input 
                name="name"
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-gray-600 mb-1.5 block">{t.emailLabel}</label>
              <input 
                name="email"
                type="email" 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-gray-600 mb-1.5 block">{t.messageLabel}</label>
              <textarea 
                name="message"
                rows={5} 
                required 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#185FA5] focus:ring-1 focus:ring-[#185FA5] outline-none transition-all resize-none"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-[#185FA5] hover:bg-[#0C447C] text-white py-4 rounded-xl font-bold transition-all shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? t.loadingLabel : t.sendMessage}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
