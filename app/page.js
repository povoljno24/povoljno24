import { supabaseServer } from '../lib/supabase-server';
import HomeClient from './HomeClient';

export default async function Home() {
  // Initial fetch on server for better LCP
  const { data: initialListings } = await supabaseServer
    .from('listings')
    .select('id, title, price, city, category, image_url, created_at, user_id, status')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(0, 19);

  return <HomeClient initialListings={initialListings || []} />;
}