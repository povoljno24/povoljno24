'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-transparent py-32 px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-5xl font-black text-white mb-16 tracking-tight uppercase">{t.help}</h1>
        <div className="space-y-16">
          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{t.faq1Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.faq1Text}</p>
          </section>
          
          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{t.faq2Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.faq2Text}</p>
          </section>

          <section className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 transition-all hover:border-white/20">
            <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{t.faq3Title}</h3>
            <p className="text-[15px] text-white/40 leading-relaxed font-bold uppercase tracking-widest">{t.faq3Text}</p>
          </section>

          <div className="bg-[#185FA5]/10 backdrop-blur-3xl p-12 rounded-[3rem] border border-[#185FA5]/20 mt-20 relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/20 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{t.needMoreHelp}</h3>
            <p className="text-white/60 mb-8 font-medium leading-relaxed">{t.contactSupportText}</p>
            <a href="mailto:alex@pixelsurgestudio.dev" className="inline-block bg-white text-black px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#185FA5] hover:text-white transition-all shadow-2xl">
              Support Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
