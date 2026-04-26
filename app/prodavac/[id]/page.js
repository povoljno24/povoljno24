import { supabaseServer } from '../../../lib/supabase-server';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

async function getSellerData(id) {
  const [{ data: profile }, { data: listings }] = await Promise.all([
    supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single(),
    supabaseServer
      .from('listings')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
  ]);
  return { profile, listings: listings || [] };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { profile } = await getSellerData(id);
  const name = profile?.username || 'Prodavac';
  return {
    title: `${name} | Povoljno24`,
    description: `Pogledajte sve aktivne oglase prodavca ${name} na Povoljno24.`,
  };
}

export default async function SellerPage({ params }) {
  const { id } = await params;
  const { profile, listings } = await getSellerData(id);

  if (!profile) notFound();

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
          ← Nazad na oglase
        </Link>

        {/* Seller Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-[#E6F1FB] flex items-center justify-center text-3xl font-bold text-[#185FA5] shrink-0 border-2 border-white shadow">
            {profile.username ? profile.username[0].toUpperCase() : '?'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {profile.username || 'Korisnik'}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span className="text-[#1D9E75] font-bold text-base">
                  {profile.verification_level || 1}
                </span>
                <span>Nivo verifikacije</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span className="font-semibold text-gray-800">{listings.length}</span>
                <span>aktivnih oglasa</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                <span>Član od</span>
                <span className="font-semibold text-gray-800">{joinYear}.</span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold bg-[#EAF3DE] text-[#3B6D11] px-2.5 py-1 rounded-full border border-[#d3ecc1] shrink-0">
            ✓ Proveren prodavac
          </span>
        </div>

        {/* Listings Grid */}
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Oglasi prodavca
        </h2>
        {listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3 opacity-40">📦</div>
            <p className="text-gray-500 text-sm">Ovaj prodavac nema aktivnih oglasa.</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
            {listings.map(listing => (
              <Link key={listing.id} href={`/oglas/${listing.id}`} className="block group h-full">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-[#185FA5] transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
                  <div 
                    className="h-[160px] bg-gray-900 relative flex items-center justify-center overflow-hidden shrink-0 border-b border-gray-100 select-none"
                    onContextMenu={(e) => e.preventDefault()}
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
      </div>
    </div>
  );
}
