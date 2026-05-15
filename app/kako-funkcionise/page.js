'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../components/LanguageContext';

export default function KakoFunkcionise() {
  const { t } = useLanguage();
  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-[#0A0A0A]/80 group h-full flex flex-col justify-center";

  return (
    <div className="flex-1 bg-transparent">
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#185FA5]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight uppercase">
            {t.hifTitle}
          </h1>
          <p className="text-[16px] md:text-[18px] text-white/40 mb-12 max-w-2xl mx-auto font-black uppercase tracking-[0.3em] leading-relaxed">
            {t.hifSub}
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link href="/postoglas" className="bg-white text-black hover:bg-[#185FA5] hover:text-white px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95">
              {t.startSelling}
            </Link>
            <Link href="/" className="bg-white/[0.03] text-white border border-white/10 px-12 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-white/[0.08] transition-all active:scale-95">
              {t.exploreAds}
            </Link>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">{t.forWhom}</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-[13px] font-black uppercase tracking-widest">
              {t.forWhomSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className={cardClasses}>
               <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#1D9E75]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="text-6xl mb-10 grayscale opacity-20">🛒</div>
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">{t.forBuyers}</h3>
              <p className="text-white/60 mb-8 leading-relaxed font-medium">
                {t.forBuyersSub}
              </p>
              <ul className="space-y-4 text-[11px] font-black text-white/40 uppercase tracking-widest">
                {t.forBuyersList.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 transition-all hover:text-white"><span className="text-[#1D9E75] text-xl drop-shadow-[0_0_10px_#1D9E75]">✓</span> {item}</li>
                ))}
              </ul>
            </div>

            <div className={cardClasses}>
               <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="text-6xl mb-10 grayscale opacity-20">🚀</div>
              <h3 className="text-3xl font-black text-[#185FA5] mb-6 uppercase tracking-tight">{t.forSellers}</h3>
              <p className="text-white/60 mb-8 leading-relaxed font-medium">
                {t.forSellersSub}
              </p>
              <ul className="space-y-4 text-[11px] font-black text-white/40 uppercase tracking-widest">
                {t.forSellersList.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 transition-all hover:text-white"><span className="text-[#185FA5] text-xl drop-shadow-[0_0_10px_#185FA5]">✓</span> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-4xl font-black text-center text-white mb-24 uppercase tracking-tight">{t.stepsTitle}</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { id: 1, title: t.step1Title, sub: t.step1Sub },
              { id: 2, title: t.step2Title, sub: t.step2Sub },
              { id: 3, title: t.step3Title, sub: t.step3Sub }
            ].map((step) => (
              <div key={step.id} className="bg-[#0A0A0A]/40 backdrop-blur-3xl p-12 rounded-[2.5rem] border border-white/5 text-center transition-all hover:border-white/20 hover:bg-[#0A0A0A]/60 group">
                <div className="w-20 h-20 bg-white/[0.03] text-[#185FA5] border border-white/5 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-10 shadow-2xl transition-all group-hover:scale-110 group-hover:border-[#185FA5]/40 group-hover:bg-[#185FA5]/5">
                  {step.id}
                </div>
                <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">{step.title}</h3>
                <p className="text-[13px] text-white/40 font-black uppercase tracking-widest leading-relaxed">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-32 px-6">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-20 uppercase tracking-tight">{t.benefitsTitle || 'Naše Prednosti'}</h2>
          
          <div className="grid sm:grid-cols-2 gap-16 text-left">
            {[
              { icon: '🛡️', title: t.whySecurity, sub: t.whySecuritySub },
              { icon: '⚡', title: t.whySpeed, sub: t.whySpeedSub },
              { icon: '💬', title: t.whyMessages, sub: t.whyMessagesSub },
              { icon: '📱', title: t.whyMobile, sub: t.whyMobileSub }
            ].map((benefit, i) => (
              <div key={i} className="flex gap-8 group">
                <div className="text-5xl shrink-0 grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-[#185FA5] transition-colors">{benefit.title}</h4>
                  <p className="text-[14px] text-white/40 font-medium leading-relaxed">{benefit.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden bg-[#0A0A0A]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#185FA5]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 uppercase tracking-tight leading-tight">{t.ctaTitle}</h2>
          <p className="text-[14px] md:text-[16px] text-white/30 mb-16 max-w-2xl mx-auto font-black uppercase tracking-[0.4em] leading-relaxed">
            {t.ctaSub}
          </p>
          <Link href="/register" className="inline-block bg-white text-black px-16 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:bg-[#185FA5] hover:text-white transition-all shadow-2xl active:scale-95">
            {t.ctaBtn}
          </Link>
        </div>
      </section>
    </div>
  );
}
