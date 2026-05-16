import { supabaseServer } from '../../../lib/supabase-server';
import ImageGallery from './ImageGallery';
import { ListingBreadcrumbs, ListingDetails, SellerCard, ContactHeader } from './ListingClientParts';
import { createClient } from '../../../lib/supabase-server-auth';
import { safeJsonStringify } from '../../../lib/security';
import dynamic from 'next/dynamic';

const ContactForm = dynamic(() => import('./ContactForm'), { ssr: false });

async function getListing(id) {
  const { data, error } = await supabaseServer
    .from('listings')
    .select('id, title, description, price, category, city, condition, image_url, images, user_id, status, buyer_id, created_at')
    .eq('id', id)
    .single();
  if (error || !data) {
    console.error('[getListing] id:', id, 'error:', error?.message);
    return null;
  }
  return data;
}

async function getSellerProfile(userId) {
  const [{ data: profile }, { data: ratings }] = await Promise.all([
    supabaseServer
      .from('profiles')
      .select('username, verification_level, created_at, phone, phone_verified, avatar_url')
      .eq('id', userId)
      .single(),
    supabaseServer
      .from('ratings')
      .select('score')
      .eq('ratee_id', userId)
  ]);
  
  const avgRating = ratings?.length > 0 
    ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length 
    : 0;

  return { ...profile, avgRating, reviewCount: ratings?.length || 0 };
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
      title: `${listing.title} - ${listing.price?.toLocaleString()} RSD u ${listing.city}`,
      description: listing.description
        ? listing.description.substring(0, 160)
        : `Kupite ${listing.title} povoljno na Povoljno24. Najbolja ponuda u gradu ${listing.city}.`,
      url: `https://povoljno24.com/oglas/${listing.id}`,
      siteName: 'Povoljno24',
      images: [{ url: listing.image_url || '/default-og.png', width: 800, height: 600, alt: listing.title }],
      locale: 'sr_RS',
      type: 'website',
    },
    alternates: {
      canonical: `https://povoljno24.com/oglas/${listing.id}`,
    },
  };
}

export default async function OglasPage({ params }) {
  const { id } = await params;
  const listing = await getListing(id);

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const currentUser = userData?.user || null;

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <p className="text-white/40 font-black uppercase tracking-widest">Oglas nije pronađen.</p>
      </div>
    );
  }

  // Lifecycle visibility restrictions
  if (listing.status === 'shipped') {
    if (!currentUser || (currentUser.id !== listing.user_id && currentUser.id !== listing.buyer_id)) {
      return (
        <div className="flex-1 flex items-center justify-center bg-transparent">
          <p className="text-white/40 font-black uppercase tracking-widest">Ovaj oglas je prodat i više nije javan.</p>
        </div>
      );
    }
  }

  if (listing.status === 'collected') {
    return (
      <div className="flex-1 flex items-center justify-center bg-transparent">
        <p className="text-white/40 font-black uppercase tracking-widest">Ovaj oglas je uspešno prodat i obrisan.</p>
      </div>
    );
  }

  const seller = await getSellerProfile(listing.user_id);

  return (
    <div className="flex-1 bg-transparent py-12">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Structured Data (Schema.org) - Safely Escaped */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonStringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": listing.title,
              "image": listing.images || [listing.image_url],
              "description": listing.description,
              "brand": {
                "@type": "Brand",
                "name": "Povoljno24"
              },
              "offers": {
                "@type": "Offer",
                "url": `https://povoljno24.rs/oglas/${listing.id}`,
                "priceCurrency": "RSD",
                "price": listing.price,
                "itemCondition": listing.condition === 'Novo' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
                "availability": "https://schema.org/InStock",
                "areaServed": {
                  "@type": "City",
                  "name": listing.city
                }
              }
            })
          }}
        />

        {/* Breadcrumbs */}
        <ListingBreadcrumbs listing={listing} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start mt-8">

          {/* LEFT: Listing Details */}
          <div className="space-y-8">
            <div className="bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.6)]">
              <ImageGallery images={listing.images || [listing.image_url]} title={listing.title} />
              <ListingDetails listing={listing} />
            </div>
          </div>

          {/* RIGHT: Seller + Contact (sticky) */}
          <div className="space-y-8 lg:sticky lg:top-24">

            {/* Seller Card */}
            {seller && (
              <SellerCard seller={seller} listingUserId={listing.user_id} />
            )}

            {/* Contact Form */}
            {(!currentUser || currentUser.id !== listing.user_id) && (
              <div className="bg-[#0A0A0A]/80 backdrop-blur-3xl rounded-[2.5rem] border border-[#185FA5]/30 shadow-[0_32px_64px_rgba(24,95,165,0.1)] overflow-hidden">
                <ContactHeader />
                <div className="p-8">
                  <ContactForm listingId={listing.id} receiverId={listing.user_id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}