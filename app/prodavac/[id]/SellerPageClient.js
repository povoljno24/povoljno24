'use client';
import { useLanguage } from '../../../components/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import StarRating from '../../../components/StarRating';
import ReviewList from '../../../components/ReviewList';
import UserBadges from '../../../components/UserBadges';

export function SellerPageClient({ profile, listings, avgRating, reviewCount, totalEarnings, packagesSent, id }) {
  const { t } = useLanguage();

  const joinYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : '';

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group";

  return (
    <div className="flex-1 bg-transparent py-16 px-6">
      <div className="max-w-[1000px] mx-auto">
        <Link
          href="/"
          className="inline-block mb-10 text-[11px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all bg-white/[0.03] border border-white/10 px-8 py-3 rounded-full"
        >
          {t.backToListings}
        </Link>

        {/* Seller Card */}
        <div className={cardClasses}>
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#185FA5]/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-10">
            <div className="w-24 h-24 rounded-full bg-white/[0.03] flex items-center justify-center text-3xl font-black text-[#185FA5] shrink-0 border border-white/10 relative overflow-hidden shadow-2xl">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" fill className="object-cover" />
              ) : (
                profile.username ? profile.username[0].toUpperCase() : '?'
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                  {profile.full_name || profile.username || t.userWord}
                </h1>
                <UserBadges profile={profile} user={profile} listingsCount={listings.length} />
              </div>
              
              {profile.bio && (
                <p className="text-[15px] text-white/60 leading-relaxed italic mb-6">
                  &quot;{profile.bio}&quot;
                </p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Status</div>
                  <div className="text-sm font-bold text-[#1D9E75] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1D9E75] shadow-[0_0_10px_#1D9E75]"></span> {t.verifiedSeller}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Oglasa</div>
                  <div className="text-sm font-bold text-white">{listings.length}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Član od</div>
                  <div className="text-sm font-bold text-white">{joinYear}.</div>
                </div>
                {packagesSent > 0 && (
                  <div>
                    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">Paketa</div>
                    <div className="text-sm font-bold text-white">{packagesSent}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <StarRating rating={avgRating} size="md" />
              <span className="text-[11px] font-black text-white/20 uppercase tracking-widest">({reviewCount} {t.reviewCount})</span>
            </div>
            {profile.phone_verified && (
              <div className="flex items-center gap-3 px-5 py-2.5 bg-[#185FA5]/10 rounded-full border border-[#185FA5]/20">
                <span className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest">{t.verifiedPhone}</span>
                <div className="w-2 h-2 rounded-full bg-[#185FA5] shadow-[0_0_10px_#185FA5]"></div>
              </div>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mt-20">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-10">
            {t.sellerAds}
          </h2>
          
          {listings.length === 0 ? (
            <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-24 text-center">
              <div className="text-6xl mb-8 opacity-10">📦</div>
              <p className="text-[13px] font-black text-white/20 uppercase tracking-widest">{t.noSellerAds}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map(listing => (
                <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group">
                  <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-[#0A0A0A]/80 hover:scale-[1.02] hover:-translate-y-2 shadow-2xl flex flex-col h-full">
                    <div className="h-[240px] bg-[#050505] relative flex items-center justify-center overflow-hidden shrink-0 border-b border-white/5">
                      {listing.image_url ? (
                        <>
                          <div 
                            className="absolute inset-0 blur-3xl opacity-20 scale-125 pointer-events-none transition-all duration-1000 group-hover:scale-150"
                            style={{ backgroundImage: `url(${listing.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                          <Image 
                            src={listing.image_url} 
                            alt={listing.title} 
                            fill 
                            className="object-contain relative z-10 transition-transform duration-700 pointer-events-none group-hover:scale-105" 
                            draggable={false}
                          />
                          <div className="absolute inset-0 z-20 bg-transparent" />
                        </>
                      ) : (
                        <span className="text-4xl opacity-10 grayscale">📦</span>
                      )}
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <div className="text-[10px] font-black text-[#185FA5] uppercase tracking-widest mb-3">🏷️ {t[`db_${listing.category}`] || listing.category}</div>
                      <div className="text-lg font-black text-white mb-3 line-clamp-2 leading-tight tracking-tight uppercase">
                        {listing.title}
                      </div>
                      <div className="text-2xl font-black text-white mt-auto pt-6 flex items-baseline gap-2">
                        {listing.price?.toLocaleString()} <span className="text-[11px] text-white/20 uppercase tracking-widest">RSD</span>
                      </div>
                      <div className="text-[10px] font-black text-white/20 mt-4 pt-4 border-t border-white/5 flex items-center gap-2 uppercase tracking-widest">
                        📍 {listing.city}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-10">
            {t.sellerReviews}
          </h2>
          <ReviewList userId={id} />
        </div>
      </div>
    </div>
  );
}
