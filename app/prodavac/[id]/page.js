import { supabaseServer } from '../../../lib/supabase-server';
import { notFound } from 'next/navigation';
import { SellerPageClient } from './SellerPageClient';

async function getSellerData(id) {
  const [{ data: profile, error: profileError }, { data: listings, error: listingsError }, { data: ratings }] = await Promise.all([
    supabaseServer
      .from('profiles')
      .select('id, username, full_name, bio, avatar_url, created_at, phone, phone_verified, verification_level')
      .eq('id', id)
      .single(),
    supabaseServer
      .from('listings')
      .select('id, title, price, city, category, image_url, created_at, user_id')
      .eq('user_id', id)
      .order('created_at', { ascending: false }),
    supabaseServer
      .from('ratings')
      .select('score')
      .eq('ratee_id', id)
  ]);

  if (profileError) console.error('[getSellerData] profile error:', profileError.message);
  if (listingsError) console.error('[getSellerData] listings error:', listingsError.message);

  const avgRating = ratings?.length > 0 
    ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length 
    : 0;

  return { 
    profile, 
    listings: listings || [], 
    avgRating, 
    reviewCount: ratings?.length || 0 
  };
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
  const { profile, listings, avgRating, reviewCount } = await getSellerData(id);

  if (!profile) notFound();

  return (
    <SellerPageClient 
      profile={profile}
      listings={listings}
      avgRating={avgRating}
      reviewCount={reviewCount}
      id={id}
    />
  );
}
