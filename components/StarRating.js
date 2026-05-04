'use client';
import { useState } from 'react';

export default function StarRating({ rating = 0, onRate = null, size = 'md', interactive = false }) {
  const [hover, setHover] = useState(0);
  
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate && onRate(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`bg-transparent border-none p-0 flex items-center justify-center ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={star <= (hover || rating) ? '#FFC107' : '#E0E0E0'}
            className={currentSize}
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </button>
      ))}
      {rating > 0 && !interactive && (
        <span className="ml-1.5 text-[13px] font-bold text-gray-700">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
