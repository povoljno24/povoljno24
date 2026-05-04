'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../components/LanguageContext';

export default function KakoFunkcionise() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <section className="bg-[#E6F1FB] py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0C447C] mb-6 leading-tight">
            {t.hifTitle}
          </h1>
          <p className="text-lg text-[#185FA5] mb-10 max-w-2xl mx-auto">
            {t.hifSub}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/postoglas" className="bg-[#185FA5] hover:bg-[#0C447C] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
              {t.startSelling}
            </Link>
            <Link href="/" className="bg-white hover:bg-gray-50 text-[#185FA5] border border-[#185FA5] px-8 py-3.5 rounded-xl font-semibold transition-all shadow-sm">
              {t.exploreAds}
            </Link>
          </div>
        </div>
      </section>

      {/* For Whom Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.forWhom}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {t.forWhomSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 h-full flex flex-col justify-center transition-transform hover:-translate-y-1">
              <div className="text-5xl mb-6">🛒</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.forBuyers}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {t.forBuyersSub}
              </p>
              <ul className="space-y-3 text-gray-700">
                {t.forBuyersList.map((item, i) => (
                  <li key={i} className="flex items-center gap-3"><span className="text-[#1D9E75] text-xl">✓</span> {item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f0f7fd] p-10 rounded-3xl border border-[#d6ebfa] h-full flex flex-col justify-center transition-transform hover:-translate-y-1">
              <div className="text-5xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-[#0C447C] mb-4">{t.forSellers}</h3>
              <p className="text-[#185FA5] mb-6 leading-relaxed">
                {t.forSellersSub}
              </p>
              <ul className="space-y-3 text-[#185FA5]">
                {t.forSellersList.map((item, i) => (
                  <li key={i} className="flex items-center gap-3"><span className="text-[#0C447C] text-xl">✓</span> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works steps */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">{t.stepsTitle}</h2>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.step1Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.step1Sub}</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.step2Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.step2Sub}</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center relative z-10">
              <div className="w-16 h-16 bg-[#E6F1FB] text-[#185FA5] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t.step3Title}</h3>
              <p className="text-gray-600 leading-relaxed">{t.step3Sub}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">{t.whyTitle}</h2>
          
          <div className="grid sm:grid-cols-2 gap-8 text-left">
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">🛡️</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t.whySecurity}</h4>
                <p className="text-gray-600">{t.whySecuritySub}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">⚡</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t.whySpeed}</h4>
                <p className="text-gray-600">{t.whySpeedSub}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">💬</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t.whyMessages}</h4>
                <p className="text-gray-600">{t.whyMessagesSub}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[#1D9E75] text-3xl shrink-0">📱</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{t.whyMobile}</h4>
                <p className="text-gray-600">{t.whyMobileSub}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#185FA5] py-16 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">{t.ctaTitle}</h2>
        <p className="text-[#d6ebfa] text-lg mb-8 max-w-2xl mx-auto">
          {t.ctaSub}
        </p>
        <Link href="/register" className="inline-block bg-white text-[#185FA5] px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
          {t.ctaBtn}
        </Link>
      </section>
    </div>
  );
}
