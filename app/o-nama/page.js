'use client';
import { useLanguage } from '../../components/LanguageContext';

export default function AboutUs() {
  const { t } = useLanguage();
  return (
    <div className="flex-1 bg-transparent py-32 px-6">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-5xl font-black text-white mb-16 tracking-tight uppercase">{t.aboutUs}</h1>
        <div className="space-y-12">
          <p className="text-xl leading-relaxed text-white font-medium">
            {t.aboutText1}
          </p>
          <p className="text-[15px] leading-[2] text-white/40 font-bold uppercase tracking-widest">
            {t.aboutText2}
          </p>
          <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 mt-16 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">{t.ourMission}</h3>
            <p className="text-white/60 text-lg leading-relaxed italic">
              &quot;{t.missionText}&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
