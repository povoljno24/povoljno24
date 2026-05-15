"use client";
import { useLanguage } from './LanguageContext';

export default function UserBadges({ profile, user, listingsCount = 0, averageRating = null }) {
  const { t } = useLanguage();

  if (!profile || !user) return null;

  const badges = [];

  // 1. Verified Seller
  if (profile.verification_level >= 2) {
    badges.push({
      id: 'verified',
      label: t.verifiedSeller || "Verifikovan Prodavac",
      icon: '🛡️',
      color: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20 shadow-[0_0_15px_rgba(29,158,117,0.1)]'
    });
  }

  // 2. Povoljno Veteran (> 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (user.created_at && new Date(user.created_at) < oneYearAgo) {
    badges.push({
      id: 'veteran',
      label: t.badgeVeteran || "Veteran",
      icon: '🌟',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]'
    });
  }

  // 3. Top Contributor (> 10 active listings)
  if (listingsCount >= 10) {
    badges.push({
      id: 'top_contributor',
      label: t.badgeTopContributor || "Top Prodavac",
      icon: '🏆',
      color: 'bg-[#185FA5]/10 text-[#185FA5] border-[#185FA5]/20 shadow-[0_0_15px_rgba(24,95,165,0.1)]'
    });
  }

  // 4. Highly Rated
  if (averageRating !== null && averageRating >= 4.5) {
    badges.push({
      id: 'highly_rated',
      label: t.badgeHighlyRated || "Najbolje Ocenjen",
      icon: '⭐',
      color: 'bg-white/5 text-white border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {badges.map(badge => (
        <span 
          key={badge.id}
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${badge.color}`}
          title={badge.label}
        >
          <span className="text-[12px]">{badge.icon}</span> {badge.label}
        </span>
      ))}
    </div>
  );
}
