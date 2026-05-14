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
      label: t.verifiedSeller || "Verified seller",
      icon: '🛡️',
      color: 'bg-[#EAF3DE] text-[#3B6D11] border-[#d3ecc1]'
    });
  }

  // 2. Povoljno Veteran (> 1 year)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  if (user.created_at && new Date(user.created_at) < oneYearAgo) {
    badges.push({
      id: 'veteran',
      label: t.badgeVeteran || "Povoljno Veteran",
      icon: '🌟',
      color: 'bg-[#FFF3CD] text-[#856404] border-[#ffeeba]'
    });
  }

  // 3. Top Contributor (> 10 active listings)
  if (listingsCount >= 10) {
    badges.push({
      id: 'top_contributor',
      label: t.badgeTopContributor || "Top Contributor",
      icon: '🏆',
      color: 'bg-[#E6F1FB] text-[#185FA5] border-[#b8daff]'
    });
  }

  // 4. Highly Rated
  if (averageRating !== null && averageRating >= 4.5) {
    badges.push({
      id: 'highly_rated',
      label: t.badgeHighlyRated || "Highly Rated",
      icon: '⭐',
      color: 'bg-[#fdf0f0] text-[#E24B4A] border-[#fbdada]'
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map(badge => (
        <span 
          key={badge.id}
          className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${badge.color}`}
          title={badge.label}
        >
          <span>{badge.icon}</span> {badge.label}
        </span>
      ))}
    </div>
  );
}
