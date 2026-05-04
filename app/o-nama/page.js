'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function AboutUs() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-white py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.aboutUs}</h1>
        <div className="prose prose-blue text-gray-600 space-y-6">
          <p className="text-lg leading-relaxed">
            {t.aboutText1}
          </p>
          <p className="leading-relaxed">
            {t.aboutText2}
          </p>
          <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mt-10">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{t.ourMission}</h3>
            <p className="italic">
              "{t.missionText}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
