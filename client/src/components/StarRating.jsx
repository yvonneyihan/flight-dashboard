import React from 'react';
import { FiStar } from 'react-icons/fi';

export default function StarRating({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FiStar
          key={s}
          size={size}
          style={{
            color: s <= rating ? '#fbbf24' : 'var(--muted-foreground)',
            fill: s <= rating ? '#fbbf24' : 'none',
            opacity: s <= rating ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}