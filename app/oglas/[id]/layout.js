import { createBrowserClient } from '@supabase/ssr';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();

  if (!listing) {
    return {
      title: 'Oglas nije pronađen',
    };
  }

  return {
    title: listing.title,
    description: listing.description ? listing.description.substring(0, 160) : `Kupite ${listing.title} na Povoljno24.rs. Cena: ${listing.price} RSD.`,
    openGraph: {
      title: listing.title,
      description: listing.description ? listing.description.substring(0, 160) : `Kupite ${listing.title} na Povoljno24.rs.`,
      images: listing.image_url ? [listing.image_url] : [],
    },
  };
}

export default function OglasLayout({ children }) {
  return <>{children}</>;
}
