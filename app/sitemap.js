import { supabaseServer } from '../lib/supabase-server';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://povoljno24.rs';

  // Get all listings
  const { data: listings } = await supabaseServer
    .from('listings')
    .select('id, updated_at')
    .order('created_at', { ascending: false });

  const listingUrls = (listings || []).map((listing) => ({
    url: `${baseUrl}/oglas/${listing.id}`,
    lastModified: listing.updated_at || new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${baseUrl}/kako-funkcionise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...listingUrls,
  ];
}
