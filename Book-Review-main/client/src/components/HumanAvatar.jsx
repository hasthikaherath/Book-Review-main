import React from 'react';

export default function HumanAvatar({ user, size = 'md' }) {
  const color = user?.avatarColor || '#F59E0B';
  const dim = {
    xs: 'w-6 h-6 rounded-full',
    sm: 'w-8 h-8 rounded-full',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-14 h-14 rounded-2xl'
  }[size] || 'w-10 h-10 rounded-xl';

  return (
    <div
      className={`relative overflow-hidden shrink-0 flex items-center justify-center border border-white/25 shadow-md ${dim}`}
      style={{
        background: `radial-gradient(circle at 30% 25%, ${color}, #1E1B2E 85%)`
      }}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full">
        {/* Warm ambient halo */}
        <circle cx="32" cy="32" r="30" fill={color} fillOpacity="0.18" />
        {/* Shoulders / Cozy Sweater */}
        <path
          d="M12 60 C14 44, 50 44, 52 60 Z"
          fill="rgba(15, 23, 42, 0.82)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.5"
        />
        {/* Sweater Collar Detail */}
        <path d="M24 47 Q32 53 40 47" stroke={color} strokeWidth="2" fill="none" />
        {/* Warm Human Head Silhouette */}
        <circle cx="32" cy="26" r="11.5" fill="#FDE68A" fillOpacity="0.92" />
        {/* Styled Hair */}
        <path
          d="M20 25 C20 14, 44 14, 44 25 C41 19, 25 19, 20 25 Z"
          fill="#1E1B2E"
        />
        {/* Friendly Eyes & Warm Smile */}
        <circle cx="28" cy="26.5" r="1.3" fill="#1E1B2E" />
        <circle cx="36" cy="26.5" r="1.3" fill="#1E1B2E" />
        <path
          d="M28.5 31 Q32 34 35.5 31"
          stroke="#92400E"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

