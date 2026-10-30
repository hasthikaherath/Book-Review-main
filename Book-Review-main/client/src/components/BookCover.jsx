import React, { useState } from 'react';

export default function BookCover({ book = {}, size = 'md', is3D = true }) {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const colors = book.palette || ['#F59E0B', '#78350F', '#1C140D'];
  const [accent, mid, deep] = colors;

  const sizeClasses = {
    sm: 'w-14 h-20',
    md: 'w-28 h-40',
    lg: 'w-40 h-56',
    card: 'w-full aspect-[2/3]'
  }[size] || 'w-28 h-40';

  const spineWidth = size === 'sm' ? 7 : size === 'lg' ? 16 : 12;
  const pageDepth = size === 'sm' ? 5 : size === 'lg' ? 12 : 8;

  const bookId = book.id || book._id || 'book-fallback';
  const gradId = `grad-${bookId}-${size}`;

  const transform3D = is3D
    ? hovered
      ? 'rotateY(-24deg) rotateX(7deg) translateZ(10px) translateY(-4px)'
      : 'rotateY(-14deg) rotateX(4deg)'
    : hovered
    ? 'translateY(-4px)'
    : 'none';

  return (
    <div
      className={`relative shrink-0 select-none ${sizeClasses}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Physical Drop Shadow under the 3D book */}
      <div
        className="absolute -bottom-2.5 left-2 right-1 h-4 rounded-full bg-black/75 blur-md transition-all duration-500 pointer-events-none"
        style={{
          transform: hovered ? 'scaleX(1.06) translateY(3px)' : 'scaleX(0.96)'
        }}
      />

      {/* 3D Book Object Wrapper */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: transform3D
        }}
      >
        {/* 3D Left Hardcover Spine */}
        {is3D && (
          <div
            className="absolute top-0 bottom-0 left-0 rounded-l-sm border-y border-l border-white/25 flex flex-col items-center justify-between py-2 overflow-hidden"
            style={{
              width: `${spineWidth}px`,
              background: `linear-gradient(180deg, ${mid} 0%, ${deep} 50%, ${mid} 100%)`,
              transformOrigin: 'left center',
              transform: 'rotateY(-90deg)'
            }}
          >
            <div className="w-full h-0.5 bg-amber-300/50" />
            <div className="w-full h-0.5 bg-amber-300/30" />
          </div>
        )}

        {/* 3D Right Layered Cream Paper Pages Block */}
        {is3D && (
          <div
            className="absolute top-[3px] bottom-[3px] right-0 rounded-r-sm border-y border-r border-amber-100/30"
            style={{
              width: `${pageDepth}px`,
              background:
                'repeating-linear-gradient(90deg, #FDF8EE 0px, #E6DEC8 1.5px, #FAF3E3 3px)',
              transformOrigin: 'right center',
              transform: 'rotateY(90deg)'
            }}
          />
        )}

        {/* Front Hardcover Face */}
        <div
          className="relative w-full h-full rounded-r-xl rounded-l-[4px] overflow-hidden border border-white/20 shadow-[0_12px_30px_rgba(0,0,0,0.65)]"
          style={{
            background: `linear-gradient(145deg, ${deep} 0%, ${mid} 55%, ${deep} 100%)`
          }}
        >
          {/* Hardcover Hinge Groove & Warm Foil Sheen */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/50 via-white/15 to-transparent z-20 pointer-events-none" />
          <div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20"
            style={{
              background:
                'linear-gradient(115deg, transparent 20%, rgba(255,250,235,0.16) 48%, transparent 75%)'
            }}
          />

          {book.coverUrl && !imgError ? (
            <>
              <img
                src={book.coverUrl}
                alt={book.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover max-w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-white/10 pointer-events-none" />
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 200 300"
                className="absolute inset-0 w-full h-full opacity-85"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <radialGradient id={gradId} cx="50%" cy="38%" r="62%">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
                    <stop offset="65%" stopColor={mid} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={deep} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="200" height="300" fill={`url(#${gradId})`} />
                {/* Classic Book Frame Border */}
                <rect
                  x="16"
                  y="14"
                  width="172"
                  height="272"
                  rx="6"
                  fill="none"
                  stroke="rgba(255,255,255,0.14)"
                  strokeWidth="1"
                />

                {book.pattern === 'rings' && (
                  <g stroke={accent} fill="none" opacity="0.72">
                    <circle cx="105" cy="135" r="56" strokeWidth="1.2" strokeDasharray="4 4" />
                    <circle cx="105" cy="135" r="38" strokeWidth="1.5" />
                    <circle cx="105" cy="135" r="18" fill={accent} fillOpacity="0.28" />
                    <ellipse
                      cx="105"
                      cy="135"
                      rx="72"
                      ry="22"
                      strokeWidth="1.1"
                      transform="rotate(-24 105 135)"
                    />
                  </g>
                )}

                {book.pattern === 'orbital' && (
                  <g stroke={accent} fill="none" opacity="0.75">
                    <circle cx="105" cy="130" r="44" strokeWidth="1.5" />
                    <path d="M 32 155 Q 105 70 178 155" strokeWidth="1.2" />
                    <path
                      d="M 32 115 Q 105 200 178 115"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <circle cx="105" cy="130" r="9" fill={accent} />
                    <circle cx="145" cy="108" r="4" fill="#FFFBEB" />
                  </g>
                )}

                {book.pattern === 'trinary' && (
                  <g stroke={accent} fill="none" opacity="0.75">
                    <polygon points="105,68 160,166 50,166" strokeWidth="1.3" />
                    <polygon
                      points="105,184 160,86 50,86"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx="105" cy="68" r="6" fill={accent} />
                    <circle cx="160" cy="166" r="6" fill={accent} />
                    <circle cx="50" cy="166" r="6" fill={accent} />
                  </g>
                )}

                {book.pattern === 'matrix' && (
                  <g stroke={accent} opacity="0.6">
                    <line x1="50" y1="60" x2="50" y2="210" strokeWidth="1" strokeDasharray="2 6" />
                    <line
                      x1="78"
                      y1="50"
                      x2="78"
                      y2="220"
                      strokeWidth="1.5"
                      strokeDasharray="8 4"
                    />
                    <line x1="105" y1="45" x2="105" y2="225" strokeWidth="1.2" />
                    <line
                      x1="132"
                      y1="55"
                      x2="132"
                      y2="215"
                      strokeWidth="1.5"
                      strokeDasharray="6 5"
                    />
                    <rect x="65" y="95" width="78" height="78" fill="none" strokeWidth="1.5" />
                    <rect x="82" y="112" width="44" height="44" fill={accent} fillOpacity="0.22" />
                  </g>
                )}

                {book.pattern === 'horizon' && (
                  <g stroke={accent} fill="none" opacity="0.78">
                    <circle
                      cx="105"
                      cy="120"
                      r="35"
                      fill={accent}
                      fillOpacity="0.32"
                      strokeWidth="1.5"
                    />
                    <line x1="28" y1="160" x2="182" y2="160" strokeWidth="1.5" />
                    <line x1="42" y1="172" x2="168" y2="172" strokeWidth="1" opacity="0.7" />
                    <line x1="58" y1="184" x2="152" y2="184" strokeWidth="0.8" opacity="0.5" />
                  </g>
                )}

                {(!book.pattern || book.pattern === 'monolith') && (
                  <g stroke={accent} fill="none" opacity="0.78">
                    <rect
                      x="78"
                      y="68"
                      width="54"
                      height="122"
                      rx="3"
                      strokeWidth="1.5"
                      fill={accent}
                      fillOpacity="0.18"
                    />
                    <circle cx="105" cy="105" r="14" strokeWidth="1.2" />
                    <line x1="55" y1="190" x2="155" y2="190" strokeWidth="1.2" />
                  </g>
                )}
              </svg>

              <div className="relative z-10 h-full flex flex-col justify-between p-2.5 pl-4">
                <div className="flex items-center justify-between text-[9px] font-mono tracking-wider uppercase text-amber-100/75">
                  <span className="truncate">{book.genres?.[0] || 'EDITION'}</span>
                  <span>{book.publishedYear || ''}</span>
                </div>

                <div className="mt-auto pt-2 border-t border-white/15">
                  <p className="font-serif font-bold text-white leading-tight line-clamp-2 text-xs sm:text-sm drop-shadow">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-amber-100/80 truncate mt-0.5 font-medium">
                    {book.author}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

