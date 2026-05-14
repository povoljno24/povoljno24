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
    { key: 'avatar', label: t.addAvatar || "Add Avatar", completed: !!profile.avatar_url, weight: 25 },
    { key: 'name', label: t.addFullName || "Add Full Name", completed: !!profile.full_name, weight: 25 },
    { key: 'bio', label: t.addBio || "Add Bio", completed: !!profile.bio, weight: 25 },
    { key: 'phone', label: t.verifyPhone || "Verify Phone", completed: !!profile.phone_verified, weight: 25 },
  ];

  const progress = checks.reduce((acc, curr) => curr.completed ? acc + curr.weight : acc, 0);
  const is100 = progress === 100;

  useEffect(() => {
    if (is100 && !completedMilestone && profile.verification_level < 2) {
      showToast(t.profileCompleteSuccess || "Profile 100% complete!", 'success');
      setCompletedMilestone(true);
      
      // Update verification level to 2 (Verified)
      supabase.from('profiles').update({ verification_level: 2 }).eq('id', user.id).then(() => {
          // Can refresh the profile here or handle it at the page level
      });
    }
  }, [progress, completedMilestone, profile, user, t, showToast, is100]);

  if (is100) {
    return (
      <div className="bg-[#EAF3DE] rounded-2xl border border-[#d3ecc1] p-5 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-xl shrink-0">
            ✓
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1D9E75]">{t.profileCompleteness || "Profile Completeness"}: 100%</h3>
            <p className="text-[12px] text-[#3B6D11]">{t.profileCompleteSuccess || "Profile 100% complete! You earned the Verified badge."}</p>
          </div>
        </div>
      </div>
    );
  }

  const nextStep = checks.find(c => !c.completed);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{t.profileCompleteness || "Profile Completeness"}</h3>
          <p className="text-[12px] text-gray-500 mt-1">
             {t.nextStep || "Next Step"}: <span className="font-semibold text-[#185FA5]">{nextStep?.label}</span>
          </p>
        </div>
        <div className="text-xl font-bold text-[#1D9E75]">{progress}%</div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden w-full relative">
        <div 
          className="h-full bg-gradient-to-r from-[#185FA5] to-[#1D9E75] transition-all duration-1000 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex gap-1.5 flex-wrap">
        {checks.map((check) => (
          <div 
            key={check.key} 
            className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
              check.completed 
                ? 'bg-[#EAF3DE] border-[#d3ecc1] text-[#3B6D11]' 
                : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}
          >
            {check.completed ? '✓ ' : ''}{check.label}
          </div>
        ))}
      </div>
    </div>
  );
}
