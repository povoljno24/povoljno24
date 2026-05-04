'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import StarRating from './StarRating';
import { useLanguage } from './LanguageContext';

export default function ReviewList({ userId }) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          rater:profiles!rater_id(username)
        `)
        .eq('ratee_id', userId)
        .order('created_at', { ascending: false });

      if (!error) {
        setReviews(data || []);
      }
      setLoading(false);
    }
    if (userId) fetchReviews();
  }, [userId]);

  if (loading) return <div className="animate-pulse space-y-3">
    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>)}
  </div>;

  if (reviews.length === 0) return (
    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <p className="text-sm text-gray-500">{t.noReviews}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-sm text-gray-900">{review.rater?.username || t.userWord}</div>
            <div className="text-[11px] text-gray-400">
              {new Date(review.created_at).toLocaleDateString('sr-RS')}
            </div>
          </div>
          <StarRating rating={review.score} size="sm" />
          <p className="text-[13px] text-gray-600 mt-2 leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
