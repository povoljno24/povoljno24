'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.help}</h1>
        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.faq1Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.faq1Text}</p>
          </section>
          
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.faq2Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.faq2Text}</p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.faq3Title}</h3>
            <p className="text-gray-600 leading-relaxed">{t.faq3Text}</p>
          </section>

          <div className="bg-[#E6F1FB] p-8 rounded-2xl border border-[#d6ebfa] mt-12">
            <h3 className="text-lg font-bold text-[#0C447C] mb-2">{t.needMoreHelp}</h3>
            <p className="text-[#185FA5] mb-4">{t.contactSupportText}</p>
            <a href="mailto:support@povoljno24.rs" className="text-[#185FA5] font-bold hover:underline">support@povoljno24.rs</a>
          </div>
        </div>
      </div>
    </div>
  );
}
