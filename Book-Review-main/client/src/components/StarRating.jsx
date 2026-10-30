import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, size = 16, readOnly = false }) {
  const [hoverVal, setHoverVal] = useState(0);
  const display = hoverVal || value;

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = !filled && display >= star - 0.5;
        if (readOnly) {
          return (
            <Star
              key={star}
              size={size}
              className={
                filled || half
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]'
                  : 'text-slate-700'
              }
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverVal(star)}
            onMouseLeave={() => setHoverVal(0)}
            onClick={() => onChange && onChange(star)}
            className="p-0.5 transition-transform hover:scale-110 focus:outline-none"
            title={`Rate ${star} out of 5 stars`}
          >
            <Star
              size={size}
              className={
                filled
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-600 hover:text-amber-300/60'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

