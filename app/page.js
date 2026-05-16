import { supabaseServer } from '../lib/supabase-server';
import HomeClient from './HomeClient';
import { getDictionary } from './dictionaries';

export default async function Home({ searchParams }) {
  const lang = (await searchParams)?.lang || 'sr';
  const t = await getDictionary(lang);

  // Initial fetch on server for better LCP
  const { data: initialListings } = await supabaseServer
    .from('listings')
    .select('id, title, price, city, category, image_url, created_at, user_id, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 19);

  return <HomeClient initialListings={initialListings || []} t={t} lang={lang} />;
}