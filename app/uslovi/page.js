'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.terms}</h1>
        <div className="prose prose-sm text-gray-600 space-y-8">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">1. {t.terms1Title}</h3>
            <p className="leading-relaxed">{t.terms1Text}</p>
          </section>
          
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">2. {t.terms2Title}</h3>
            <p className="leading-relaxed">{t.terms2Text}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">3. {t.terms3Title}</h3>
            <p className="leading-relaxed">{t.terms3Text}</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-3">4. {t.terms4Title}</h3>
            <p className="leading-relaxed">{t.terms4Text}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
