'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-transparent py-32 px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-5xl font-black text-white mb-16 tracking-tight uppercase">{t.terms}</h1>
        <div className="space-y-16">
          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">1. {t.terms1Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.terms1Text}</p>
          </section>
          
          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">2. {t.terms2Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.terms2Text}</p>
          </section>

          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">3. {t.terms3Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.terms3Text}</p>
          </section>

          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">4. {t.terms4Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.terms4Text}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
