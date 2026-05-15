"use client";
import { useLanguage } from './LanguageContext';
import { useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

export default function ProfileProgress({ profile, user }) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [completedMilestone, setCompletedMilestone] = useState(false);

  if (!profile || !user) return null;

  const checks = [
    { key: 'avatar', label: t.addAvatar || "Profilna Slika", completed: !!profile.avatar_url, weight: 25 },
    { key: 'name', label: t.addFullName || "Ime i prezime", completed: !!profile.full_name, weight: 25 },
    { key: 'bio', label: t.addBio || "Biografija", completed: !!profile.bio, weight: 25 },
    { key: 'phone', label: t.verifyPhone || "Verifikacija", completed: !!profile.phone_verified, weight: 25 },
  ];

  const progress = checks.reduce((acc, curr) => curr.completed ? acc + curr.weight : acc, 0);
  const is100 = progress === 100;

  useEffect(() => {
    if (is100 && !completedMilestone && profile.verification_level < 2) {
      showToast(t.profileCompleteSuccess || "Profil je 100% popunjen!", 'success');
      setCompletedMilestone(true);
      
      supabase.from('profiles').update({ verification_level: 2 }).eq('id', user.id).then(() => {
          // Profile level updated
      });
    }
  }, [progress, completedMilestone, profile, user, t, showToast, is100]);

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-500 hover:border-white/20";

  if (is100) {
    return (
      <div className={cardClasses}>
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#1D9E75]/10 rounded-full blur-[40px] pointer-events-none" />
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-2xl shrink-0 shadow-[0_0_30px_rgba(29,158,117,0.4)]">
            ✓
          </div>
          <div>
            <h3 className="text-[10px] font-black text-[#1D9E75] uppercase tracking-[0.3em] mb-1">{t.profileCompleteness || "Profil popunjen"}: 100%</h3>
            <p className="text-[14px] font-bold text-white/60 tracking-tight">{t.profileCompleteSuccess || "Profil je kompletan! Dobili ste status Verifikovanog člana."}</p>
          </div>
        </div>
      </div>
    );
  }

  const nextStep = checks.find(c => !c.completed);

  return (
    <div className={cardClasses}>
       <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#185FA5]/10 rounded-full blur-[40px] pointer-events-none" />
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">{t.profileCompleteness || "Profil popunjenost"}</h3>
          <p className="text-[14px] font-bold text-white tracking-tight">
             {t.nextStep || "Sledeći korak"}: <span className="text-[#185FA5]">{nextStep?.label}</span>
          </p>
        </div>
        <div className="text-3xl font-black text-white">{progress}%</div>
      </div>
      
      <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden w-full relative border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-[#185FA5] via-[#1D9E75] to-[#1D9E75] transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(24,95,165,0.4)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 flex gap-2 flex-wrap">
        {checks.map((check) => (
          <div 
            key={check.key} 
            className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border transition-all duration-300 ${
              check.completed 
                ? 'bg-[#1D9E75]/10 border-[#1D9E75]/20 text-[#1D9E75] shadow-[0_0_15px_rgba(29,158,117,0.1)]' 
                : 'bg-white/[0.03] border-white/5 text-white/20'
            }`}
          >
            {check.completed ? '✓ ' : ''}{check.label}
          </div>
        ))}
      </div>
    </div>
  );
}
