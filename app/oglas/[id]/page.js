import { supabaseServer } from '../../../lib/supabase-server';
import Link from 'next/link';
import ContactForm from './ContactForm';
import FavoriteButton from './FavoriteButton';
import ImageGallery from './ImageGallery';

async function getListing(id) {
  const { data, error } = await supabaseServer
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
}

async function getSellerProfile(userId) {
  const { data } = await supabaseServer
    .from('profiles')
    .select('username, verification_level, created_at')
    .eq('id', userId)
    .single();
  return data;
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) {
    return {
      title: 'Oglas nije pronađen | Povoljno24',
      description: 'Traženi oglas više ne postoji ili je obrisan.',
    };
  }
  return {
    title: `${listing.title} | Povoljno24`,
    description: listing.description
      ? listing.description.substring(0, 160)
      : `Kupite ${listing.title} povoljno na Povoljno24.`,
    openGraph: {
      title: `${listing.title} - ${listing.price?.toLocaleString()} RSD`,
      description: listing.description
        ? listing.description.substring(0, 160)
        : `Kupite ${listing.title} povoljno na Povoljno24.`,
      url: `https://povoljno24.rs/oglas/${listing.id}`,
      siteName: 'Povoljno24',
      images: [{ url: listing.image_url || '/default-og.png', width: 800, height: 600, alt: listing.title }],
      locale: 'sr_RS',
      type: 'website',
    },
  };
}

export default async function OglasPage({ params }) {
  const { id } = await params;
  const listing = await getListing(id);

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500">Oglas nije pronađen.</p>
      </div>
    );
  }

  const seller = await getSellerProfile(listing.user_id);

  return (
    <div className="flex-1 bg-[#f5f5f5]">
      <div className="max-w-[900px] mx-auto my-8 px-6">
        <Link href="/" className="inline-block mb-6 text-sm text-gray-600 hover:text-[#185FA5] transition-colors">
          ← Nazad na oglase
        </Link>

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Listing Details */}
          <div className="space-y-4">
            {/* Image Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <ImageGallery images={[listing.image_url]} title={listing.title} />

              <div className="p-6">
                <div className="flex justify-between items-start mb-3 gap-4">
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">{listing.title}</h1>
                  <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] rounded-full px-2.5 py-1 shrink-0 mt-1 border border-[#d3ecc1]">
                    ✓ Proveren
                  </span>
                </div>

                <div className="text-[30px] font-extrabold text-[#185FA5] mb-5">
                  {listing.price?.toLocaleString()} RSD
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">📍 {listing.city}</span>
                  <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">🏷️ {listing.category}</span>
                  <span className="text-[12px] bg-gray-50 px-3 py-1.5 rounded-lg text-gray-600 font-medium border border-gray-100">
                    🕐 {new Date(listing.created_at).toLocaleDateString('sr-RS')}
                  </span>
                </div>

                <FavoriteButton listingId={listing.id} />

                <div className="border-t border-gray-100 mt-5 pt-5">
                  <h2 className="text-sm font-semibold mb-3 text-gray-900">Opis</h2>
                  <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {listing.description || 'Nema opisa.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Seller + Contact (sticky on large screens) */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Seller Card */}
            {seller && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Prodavac</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#E6F1FB] flex items-center justify-center text-lg font-bold text-[#185FA5] shrink-0">
                    {seller.username ? seller.username[0].toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-[15px] truncate">{seller.username || 'Korisnik'}</div>
                    <div className="text-[11px] text-gray-400">
                      Član od {seller.created_at ? new Date(seller.created_at).getFullYear() : '—'}.
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-[#EAF3DE] text-[#3B6D11] px-2 py-0.5 rounded-full border border-[#d3ecc1] shrink-0">
                    ✓ Proveren
                  </span>
                </div>
                <Link
                  href={`/prodavac/${listing.user_id}`}
                  className="w-full text-center block text-[12px] font-semibold text-[#185FA5] bg-[#E6F1FB] hover:bg-[#d0e5f7] px-4 py-2.5 rounded-lg transition-colors"
                >
                  Svi oglasi prodavca →
                </Link>
              </div>
            )}

            {/* Contact Form — PROMINENT */}
            <div className="bg-white rounded-2xl border-2 border-[#185FA5] shadow-md overflow-hidden">
              <div className="bg-[#185FA5] px-5 py-3.5 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-4 h-4 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
                <h2 className="text-white font-semibold text-[14px]">Kontaktiraj prodavca</h2>
              </div>
              <div className="p-5">
                <ContactForm listingId={listing.id} receiverId={listing.user_id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}