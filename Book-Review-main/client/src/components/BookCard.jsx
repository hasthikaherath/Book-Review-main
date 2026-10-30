import React from 'react';
import { Heart, ThumbsUp, ThumbsDown, Calendar, MessageSquare, Check } from 'lucide-react';
import BookCover from './BookCover';
import StarRating from './StarRating';

export default function BookCard({
  book,
  stats = { avgRating: 4.5, reviewCount: 0 },
  currentUser = null,
  isReadInDiary = false,
  enable3DBooks = true,
  onSelectBook,
  onReaction,
  onOpenDiary,
}) {
  const isFav = currentUser?.favorites?.includes(book.id || book._id);
  const isLiked = currentUser?.likedBooks?.includes(book.id || book._id);
  const isDisliked = currentUser?.dislikedBooks?.includes(book.id || book._id);

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#161324]/95 to-[#0E0C18]/95 border border-white/[0.09] hover:border-amber-400/40 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      <div>
        <div className="flex gap-5">
          <div
            onClick={() => onSelectBook && onSelectBook(book.id || book._id)}
            className="cursor-pointer shrink-0 pt-1 pl-1"
          >
            <BookCover book={book} size="md" is3D={enable3DBooks} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-400/20">
                  {book.genres?.[0] || 'Sci-Fi'}
                </span>
                {isReadInDiary && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                    <Check size={10} /> READ
                  </span>
                )}
              </div>

              <h3
                onClick={() => onSelectBook && onSelectBook(book.id || book._id)}
                className="text-base font-serif font-bold text-white group-hover:text-amber-200 transition-colors cursor-pointer mt-2 line-clamp-2"
              >
                {book.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">by {book.author}</p>

              <div className="flex items-center gap-2 mt-2.5">
                <StarRating value={stats.avgRating || 4.5} size={13} readOnly />
                <span className="text-xs font-bold text-amber-300">
                  {stats.avgRating || 4.5}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({stats.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
              <span>{book.publishedYear}</span>
              <span>•</span>
              <span>{book.pageCount} pages</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300/85 line-clamp-2 mt-4 leading-relaxed">
          {book.description}
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onReaction && onReaction(book.id || book._id, 'favorite')}
            title={isFav ? 'Remove from Favorites' : 'Add to Favorites'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-white/[0.04] text-slate-400 hover:text-rose-300 hover:bg-white/[0.08]'
            }`}
          >
            <Heart size={13} className={isFav ? 'fill-rose-400 text-rose-400' : ''} />
            <span>{book.favoritesCount || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => onReaction && onReaction(book.id || book._id, 'like')}
            title="Like this book"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isLiked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                : 'bg-white/[0.04] text-slate-400 hover:text-emerald-300 hover:bg-white/[0.08]'
            }`}
          >
            <ThumbsUp
              size={13}
              className={isLiked ? 'fill-emerald-400 text-emerald-400' : ''}
            />
            <span>{book.likesCount || 0}</span>
          </button>

          <button
            type="button"
            onClick={() => onReaction && onReaction(book.id || book._id, 'dislike')}
            title="Dislike this book"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isDisliked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                : 'bg-white/[0.04] text-slate-400 hover:text-amber-300 hover:bg-white/[0.08]'
            }`}
          >
            <ThumbsDown
              size={13}
              className={isDisliked ? 'fill-amber-400 text-amber-400' : ''}
            />
            <span>{book.dislikesCount || 0}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDiary && onOpenDiary(book.id || book._id)}
            title="Log to Reading Diary"
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 transition-colors"
          >
            <Calendar size={14} />
          </button>
          <button
            type="button"
            onClick={() => onSelectBook && onSelectBook(book.id || book._id)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-400/30 text-xs font-semibold transition-all"
          >
            <MessageSquare size={13} />
            <span>Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}

