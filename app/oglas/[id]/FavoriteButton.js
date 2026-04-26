'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function FavoriteButton({ listingId }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listingId)
        .maybeSingle();

      setIsFavorited(!!data);
      setLoading(false);
    }
    checkFavorite();
  }, [listingId]);

  async function toggleFavorite() {
    if (!userId) {
      window.location.href = '/login';
      return;
    }
    setLoading(true);
    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);
      setIsFavorited(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: userId, listing_id: listingId });
      setIsFavorited(true);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      title={isFavorited ? 'Ukloni iz sačuvanih' : 'Sačuvaj oglas'}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50
        ${isFavorited
          ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
          : 'bg-white border-gray-300 text-gray-600 hover:border-[#185FA5] hover:text-[#185FA5] hover:bg-[#E6F1FB]'
        }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={isFavorited ? 0 : 2}
        className="w-4 h-4 transition-all duration-200"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {isFavorited ? 'Sačuvano' : 'Sačuvaj'}
    </button>
  );
}
