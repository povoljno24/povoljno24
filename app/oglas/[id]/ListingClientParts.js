'use client';
import { useLanguage } from '../../../components/LanguageContext';
import Link from 'next/link';
import StarRating from '../../../components/StarRating';
import FavoriteButton from './FavoriteButton';
import ReportButton from '../../../components/ReportButton';
import UserBadges from '../../../components/UserBadges';
import Image from 'next/image';

export function ListingBreadcrumbs({ listing }) {
  const { t } = useLanguage();
  return (
    <nav className="flex items-center gap-3 text-[10px] text-white/40 font-black uppercase tracking-[0.2em] overflow-x-auto whitespace-nowrap no-scrollbar">
      <Link href="/" className="hover:text-white transition-colors">{t.breadcrumbHome}</Link>
      <span className="opacity-20 text-[14px]">/</span>
      <Link href={`/?category=${listing.category}`} className="hover:text-white transition-colors">
        {t[`db_${listing.category}`] || listing.category}
      </Link>
      <span className="opacity-20 text-[14px]">/</span>
      <Link href={`/?city=${listing.city}`} className="hover:text-white transition-colors">{listing.city}</Link>
      <span className="opacity-20 text-[14px]">/</span>
      <span className="text-white truncate max-w-[150px]">{listing.title}</span>
    </nav>
  );
}

export function ListingDetails({ listing }) {
  const { lang, t } = useLanguage();
  return (
    <div className="p-8 sm:p-12">
      <div className="flex justify-between items-start mb-6 gap-6">
        <h1 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">{listing.title}</h1>
        <span className="text-[10px] font-black bg-[#1D9E75]/10 text-[#1D9E75] rounded-full px-4 py-2 shrink-0 border border-[#1D9E75]/20 shadow-[0_0_15px_rgba(29,158,117,0.1)] uppercase tracking-widest">
          {t.verifiedBadge}
        </span>
      </div>

      <div className="text-5xl font-black text-white mb-10 tracking-tighter">
        {listing.price?.toLocaleString()} <span className="text-xl text-white/20 uppercase tracking-widest font-bold">RSD</span>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] px-5 py-2.5 rounded-full text-white/60 border border-white/5">📍 {listing.city}</span>
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] px-5 py-2.5 rounded-full text-white/60 border border-white/5">
          🏷️ {t[`db_${listing.category}`] || listing.category}
        </span>
        {listing.condition && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-full border ${listing.condition === 'Novo' ? 'bg-white text-black border-white' : 'bg-white/[0.03] text-white/40 border-white/5'}`}>
            ✨ {t[`db_${listing.condition.toLowerCase()}`] || listing.condition}
          </span>
        )}
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/[0.03] px-5 py-2.5 rounded-full text-white/60 border border-white/5">
          🕐 {new Date(listing.created_at).toLocaleDateString('sr-RS')}
        </span>
      </div>

      <div className="mb-12">
        <FavoriteButton listingId={listing.id} />
      </div>

      <div className="border-t border-white/5 pt-10">
        <h2 className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-6">{t.descriptionLabel}</h2>
        <p className="text-[16px] text-white/80 leading-relaxed whitespace-pre-wrap font-medium">
          {listing.description || t.noDescription}
        </p>
      </div>

      <div className="flex justify-between items-center mt-12 pt-8 border-t border-white/5">
        <ReportButton listingId={listing.id} />
        <div className="text-[10px] font-black text-white/10 uppercase tracking-widest">ID: {String(listing.id).substring(0, 8)}</div>
      </div>
    </div>
  );
}

export function SellerCard({ seller, listingUserId }) {
  const { t } = useLanguage();
  return (
    <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative group transition-all duration-500 hover:border-white/20">
      <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.3em] mb-8">{t.sellerLabel}</div>
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center text-2xl font-black text-[#185FA5] shrink-0 border border-white/10 group-hover:border-white/40 transition-all duration-500 relative overflow-hidden">
          {seller.avatar_url ? (
            <Image src={seller.avatar_url} alt="" fill className="object-cover" />
          ) : (
            seller.username ? seller.username[0].toUpperCase() : '?'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-white text-xl truncate tracking-tight mb-1">{seller.username || t.userWord}</div>
          <div className="flex items-center gap-3 mb-2">
            <StarRating rating={seller.avgRating} size="sm" />
            <span className="text-[10px] font-bold text-white/20">({seller.reviewCount})</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <UserBadges profile={seller} user={seller} averageRating={seller.avgRating} />
      </div>
      
      {seller.phone_verified && (
        <div className="mb-8 p-5 bg-[#1D9E75]/10 rounded-2xl border border-[#1D9E75]/20 flex items-center justify-between shadow-[0_0_20px_rgba(29,158,117,0.05)]">
          <div>
            <div className="text-[9px] font-black text-[#1D9E75] uppercase tracking-widest mb-1">{t.verified2}</div>
            <div className="text-sm font-bold text-white">{t.verifiedSeller}</div>
          </div>
          <div className="bg-[#1D9E75] text-white p-1.5 rounded-full shadow-[0_0_10px_#1D9E75]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      <Link
        href={`/prodavac/${listingUserId}`}
        className="w-full text-center block text-[11px] font-black uppercase tracking-[0.2em] text-white bg-white/5 hover:bg-white hover:text-black px-6 py-4 rounded-2xl transition-all border border-white/10"
      >
        {t.sellerAllAds}
      </Link>
    </div>
  );
}

export function ContactHeader() {
  const { t } = useLanguage();
  return (
    <div className="bg-[#185FA5] px-8 py-5 flex items-center gap-3">
      <div className="p-2 bg-white/10 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-4 h-4 shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </div>
      <h2 className="text-white font-black text-[13px] uppercase tracking-widest">{t.contactSeller}</h2>
    </div>
  );
}
