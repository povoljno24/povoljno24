'use client';
import { useState } from 'react';

export default function StarRating({ rating = 0, onRate = null, size = 'md', interactive = false }) {
  const [hover, setHover] = useState(0);
  
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-8 h-8',
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`bg-transparent border-none p-0 flex items-center justify-center transition-all ${interactive ? 'cursor-pointer hover:scale-125 active:scale-90' : 'cursor-default'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= (hover || rating) ? '#FFC107' : 'rgba(255,255,255,0.05)'}
            stroke={star <= (hover || rating) ? '#FFC107' : 'rgba(255,255,255,0.1)'}
            strokeWidth="1"
            className={`${currentSize} transition-colors duration-300 ${star <= (hover || rating) ? 'drop-shadow-[0_0_8px_rgba(255,193,7,0.4)]' : ''}`}
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
      {rating > 0 && !interactive && (
        <span className="ml-2 text-[11px] font-black text-white/40 uppercase tracking-widest">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
