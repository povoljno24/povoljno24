import { supabaseServer } from '../../../lib/supabase-server';
import ImageGallery from './ImageGallery';
import ContactForm from './ContactForm';
import { ListingBreadcrumbs, ListingDetails, SellerCard, ContactHeader } from './ListingClientParts';

async function getListing(id) {
  const { data, error } = await supabaseServer
    .from('listings')
    .select('*')
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
      .select('username, verification_level, created_at, phone, phone_verified')
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
      url: `https://povoljno24.rs/oglas/${listing.id}`,
      siteName: 'Povoljno24',
      images: [{ url: listing.image_url || '/default-og.png', width: 800, height: 600, alt: listing.title }],
      locale: 'sr_RS',
      type: 'website',
    },
    alternates: {
      canonical: `https://povoljno24.rs/oglas/${listing.id}`,
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
        {/* Structured Data (Schema.org) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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

        {/* Breadcrumbs — client component for i18n */}
        <ListingBreadcrumbs listing={listing} />

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* LEFT: Listing Details */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <ImageGallery images={listing.images || [listing.image_url]} title={listing.title} />
              {/* Client component for translatable content */}
              <ListingDetails listing={listing} />
            </div>
          </div>

          {/* RIGHT: Seller + Contact (sticky on large screens) */}
          <div className="space-y-4 lg:sticky lg:top-24">

            {/* Seller Card — client component for i18n */}
            {seller && (
              <SellerCard seller={seller} listingUserId={listing.user_id} />
            )}

            {/* Contact Form — PROMINENT */}
            <div className="bg-white rounded-2xl border-2 border-[#185FA5] shadow-md overflow-hidden">
              {/* Client component for translatable header */}
              <ContactHeader />
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