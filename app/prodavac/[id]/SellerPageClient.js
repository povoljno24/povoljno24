'use client';
import { useLanguage } from '../../../components/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';

export function SellerPageClient({ profile, listings, avgRating, reviewCount, id }) {
  const { t } = useLanguage();

  const joinYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : '—';

  return (
    <div className="flex-1 bg-[#f5f5f5] py-10 px-6">
      <div className="max-w-[900px] mx-auto">
        <Link
          href="/"
          className="inline-block mb-6 text-sm text-gray-600 hover:text-[#185FA5] transition-colors"
        >
          {t.backToListings}
        </Link>

        {/* Seller Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#E6F1FB] overflow-hidden flex items-center justify-center text-3xl font-bold text-[#185FA5] shrink-0 border-2 border-white shadow relative">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt={profile.username} fill className="object-cover" />
            ) : (
              profile.username ? profile.username[0].toUpperCase() : '?'
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              {profile.full_name || profile.username || t.userWord}
              {profile.verification_level > 2 && (
                <span className="text-[#1D9E75] text-sm" title="Proveren član">🛡️</span>
              )}
            </h1>
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-1 mb-2 leading-relaxed italic">
                &quot;{profile.bio}&quot;
              </p>
            )}
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span className="text-[#1D9E75] font-bold text-base">
                  {profile.verification_level || 1}
                </span>
                <span>{t.verificationLevelLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span className="font-semibold text-gray-800">{listings.length}</span>
                <span>{t.activeAdsLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span>{t.memberSinceLabel}</span>
                <span className="font-semibold text-gray-800">{joinYear}.</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              <StarRating rating={avgRating} size="sm" />
              <span className="text-[12px] text-gray-500">({reviewCount} {t.reviewCount})</span>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#EAF3DE] text-[#3B6D11] px-2.5 py-1 rounded-full border border-[#d3ecc1] shrink-0">
            {t.verifiedSeller}
          </span>
          {profile.phone_verified && (
            <span className="text-[11px] font-semibold bg-[#E6F1FB] text-[#185FA5] px-2.5 py-1 rounded-full border border-[#d0e5f7] shrink-0">
              {t.verifiedPhone}
            </span>
          )}
        </div>

        {/* Listings Grid */}
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          {t.sellerAds}
        </h2>
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-40">📦</div>
            <p className="text-gray-500 text-sm">{t.noSellerAds}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {listings.map(listing => (
              <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group h-full">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#185FA5] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                  <div 
                    className="h-[160px] bg-gray-900 relative flex items-center justify-center overflow-hidden shrink-0 border-b border-gray-100 select-none"
                  >
                    {listing.image_url ? (
                      <>
                        {/* Blurred background */}
                        <div 
                          className="absolute inset-0 blur-md opacity-40 scale-110 pointer-events-none"
                          style={{ backgroundImage: `url(${listing.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <Image 
                          src={listing.image_url} 
                          alt={listing.title} 
                          fill 
                          className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                          draggable={false}
                        />
                        {/* Invisible protection layer */}
                        <div className="absolute inset-0 z-20 bg-transparent" />
                      </>
                    ) : (
                      <span className="text-3xl opacity-30 relative z-10 text-white">📦</span>
                    )}
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <div className="text-[14px] font-medium text-gray-800 mb-1 line-clamp-2 leading-snug group-hover:text-[#185FA5] transition-colors">
                      {listing.title}
                    </div>
                    <div className="text-[16px] font-bold text-[#185FA5] mt-auto pt-2">
                      {listing.price?.toLocaleString()} RSD
                    </div>
                    <div className="text-[11px] text-gray-500 mt-2 pt-2 border-t border-gray-50 flex items-center gap-1">
                      📍 {listing.city}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t.sellerReviews}
          </h2>
          <ReviewList userId={id} />
        </div>
      </div>
    </div>
  );
}
