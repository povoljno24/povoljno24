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
      // Robust querying: separate ratings fetch from profiles fetch to prevent PostgREST FK ambiguity drops
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('ratings')
        .select('*')
        .eq('ratee_id', userId)
        .order('created_at', { ascending: false });

      if (!ratingsError && ratingsData) {
        const raterIds = [...new Set(ratingsData.map(r => r.rater_id).filter(Boolean))];
        let profilesMap = {};
        
        if (raterIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', raterIds);
            
          profilesMap = (profilesData || []).reduce((acc, p) => ({ ...acc, [p.id]: p.username }), {});
        }

        const enrichedReviews = ratingsData.map(r => ({
          ...r,
          rater: { username: profilesMap[r.rater_id] || t.userWord }
        }));

        setReviews(enrichedReviews);
      }
      setLoading(false);
    }
    if (userId) fetchReviews();
  }, [userId, t.userWord]);

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
        <div key={review.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
              <span>{review.rater?.username || t.userWord}</span>
              <span className="text-[10px] bg-[#E6F1FB] text-[#185FA5] px-1.5 py-0.5 rounded font-bold">Kupac</span>
            </div>
            <div className="text-[11px] text-gray-400">
              {new Date(review.created_at).toLocaleDateString('sr-RS')}
            </div>
          </div>
          <StarRating rating={review.score} size="sm" />
          <div className="mt-2.5 pt-2.5 border-t border-gray-50">
            {review.comment && review.comment.trim() ? (
              <p className="text-[13px] text-gray-700 leading-relaxed italic bg-gray-50/80 p-2.5 rounded-lg border-l-2 border-[#185FA5]">
                &quot;{review.comment.trim()}&quot;
              </p>
            ) : (
              <p className="text-[12px] text-gray-400 italic">
                Ocena bez dodatnog komentara.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
