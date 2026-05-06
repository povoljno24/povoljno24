'use client';
import { useLanguage } from '../../../components/LanguageContext';
import Link from 'next/link';
import StarRating from '../../../components/StarRating';
import FavoriteButton from './FavoriteButton';
import ReportButton from '../../../components/ReportButton';

export function ListingBreadcrumbs({ listing }) {
  const { t } = useLanguage();
  return (
    <nav className="flex items-center gap-2 mb-6 text-[12px] text-gray-400 font-medium overflow-x-auto whitespace-nowrap pb-2 sm:pb-0">
      <Link href="/" className="hover:text-[#185FA5] transition-colors">{t.breadcrumbHome}</Link>
      <span className="opacity-30">/</span>
      <Link href={`/?category=${listing.category}`} className="hover:text-[#185FA5] transition-colors capitalize">
        {t[`db_${listing.category}`] || listing.category}
      </Link>
      <span className="opacity-30">/</span>
      <Link href={`/?city=${listing.city}`} className="hover:text-[#185FA5] transition-colors">{listing.city}</Link>
      <span className="opacity-30">/</span>
      <span className="text-gray-600 truncate max-w-[150px]">{listing.title}</span>
    </nav>
  );
}

export function ListingDetails({ listing }) {
  const { lang, t } = useLanguage();
  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-3 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
        <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] rounded-full px-2.5 py-1 shrink-0 mt-1 border border-[#d3ecc1]">
          {t.verifiedBadge}
        </span>
      </div>

      <div className="text-[30px] font-extrabold text-[#185FA5] mb-5">
        {listing.price?.toLocaleString()} RSD
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">📍 {listing.city}</span>
        <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">
          🏷️ {t[`db_${listing.category}`] || listing.category}
        </span>
        {listing.condition && (
          <span className={`text-[12px] px-3 py-1.5 rounded-lg font-bold border ${listing.condition === 'Novo' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
            ✨ {t[`db_${listing.condition.toLowerCase()}`] || listing.condition}
          </span>
        )}
        <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">
          🕐 {new Date(listing.created_at).toLocaleDateString('sr-RS')}
        </span>
      </div>

      <FavoriteButton listingId={listing.id} />

      <div className="border-t border-gray-100 mt-5 pt-5">
        <h2 className="text-sm font-semibold mb-3 text-gray-900">{t.descriptionLabel}</h2>
        <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
          {listing.description || t.noDescription}
        </p>
      </div>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
        <ReportButton listingId={listing.id} />
        <div className="text-[11px] text-gray-400">ID: {String(listing.id).substring(0, 8)}</div>
      </div>
    </div>
  );
}

export function SellerCard({ seller, listingUserId }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">{t.sellerLabel}</div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-full bg-[#E6F1FB] flex items-center justify-center text-lg font-bold text-[#185FA5] shrink-0">
          {seller.username ? seller.username[0].toUpperCase() : '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-[15px] truncate">{seller.username || t.userWord}</div>
          <div className="flex items-center gap-2">
            <StarRating rating={seller.avgRating} size="sm" />
            <span className="text-[10px] text-gray-400">({seller.reviewCount})</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full border border-[#d3ecc1] shrink-0">
          {t.verifiedBadge}
        </span>
      </div>
      
      {seller.phone_verified && (
        <div className="mb-4 p-3 bg-[#EAF3DE] rounded-xl border border-[#d3ecc1] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-[#3B6D11] uppercase tracking-wider mb-0.5">{t.phoneLabel}</div>
            <div className="text-[14px] font-bold text-gray-900">{seller.phone}</div>
          </div>
          <div className="bg-[#3B6D11] text-white p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      <Link
        href={`/prodavac/${listingUserId}`}
        className="w-full text-center block text-[12px] font-semibold text-[#185FA5] bg-[#E6F1FB] hover:bg-[#d0e5f7] px-4 py-2.5 rounded-lg transition-colors"
      >
        {t.sellerAllAds}
      </Link>
    </div>
  );
}

export function ContactHeader() {
  const { t } = useLanguage();
  return (
    <div className="bg-[#185FA5] px-5 py-3.5 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4 shrink-0">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
      <h2 className="text-white font-semibold text-[14px]">{t.contactSeller}</h2>
    </div>
  );
}
