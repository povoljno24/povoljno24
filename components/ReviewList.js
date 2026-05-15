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

  if (loading) return (
    <div className="space-y-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-white/[0.03] border border-white/5 rounded-3xl animate-pulse"></div>
      ))}
    </div>
  );

  if (reviews.length === 0) return (
    <div className="bg-[#0A0A0A]/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-20 text-center">
      <div className="text-5xl mb-6 opacity-10">⭐</div>
      <p className="text-[13px] font-black text-white/20 uppercase tracking-widest">{t.noReviews}</p>
    </div>
  );

  const cardClasses = "bg-[#0A0A0A]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 shadow-[0_32px_64px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-500 hover:border-white/20";

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className={cardClasses}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center text-sm font-black text-white/40">
                {review.rater?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div className="font-black text-white text-base tracking-tight mb-1">{review.rater?.username || t.userWord}</div>
                <div className="text-[9px] font-black text-[#185FA5] uppercase tracking-widest bg-[#185FA5]/10 px-2.5 py-1 rounded-full border border-[#185FA5]/20 inline-block">Kupac</div>
              </div>
            </div>
            <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {new Date(review.created_at).toLocaleDateString('sr-RS')}
            </div>
          </div>
          
          <div className="mb-6">
            <StarRating rating={review.score} size="sm" />
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            {review.comment && review.comment.trim() ? (
              <p className="text-[15px] text-white/80 leading-relaxed font-medium tracking-tight italic">
                &quot;{review.comment.trim()}&quot;
              </p>
            ) : (
              <p className="text-[12px] text-white/20 italic font-bold uppercase tracking-widest">
                Ocena bez komentara.
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
