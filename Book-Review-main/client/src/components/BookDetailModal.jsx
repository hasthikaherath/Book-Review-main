import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Star,
  Send,
  Pencil,
  Trash2,
  Edit3,
  Check,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import BookCover from './BookCover';
import StarRating from './StarRating';
import HumanAvatar from './HumanAvatar';

const MOOD_TAG_OPTIONS = [
  'Mind-Bending',
  'Atmospheric',
  'Philosophical',
  'Emotional',
  'Dystopian',
  'Action-Packed',
  'Cosmic Dread',
  'Hopeful',
];

const STAR_LABELS = {
  1: 'Disappointing',
  2: 'Fair / Flawed',
  3: 'Worth While',
  4: 'Phenomenal',
  5: 'Masterpiece // Essential',
};

export default function BookDetailModal({
  selectedBook,
  onClose,
  currentUser,
  bookStats = { avgRating: 4.5, reviewCount: 0, readCount: 0 },
  onReaction,
  onOpenDiary,
  onEditBook,
  onDeleteBook,
  reviews = [],
  users = [],
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  onReviewReaction,
  onAddComment,
  onRequireAuth,
}) {
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewThoughts, setReviewThoughts] = useState('');
  const [reviewMoods, setReviewMoods] = useState(['Mind-Bending']);
  const [reviewSpoilers, setReviewSpoilers] = useState(false);
  const [reviewStarFilter, setReviewStarFilter] = useState(0);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const [reviewCommentInputs, setReviewCommentInputs] = useState({});

  // Inline Review Edit state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  if (!selectedBook) return null;

  const bookId = selectedBook.id || selectedBook._id;
  const isFav = currentUser?.favorites?.includes(bookId);
  const isLiked = currentUser?.likedBooks?.includes(bookId);
  const isDisliked = currentUser?.dislikedBooks?.includes(bookId);

  const bookReviews = reviews.filter(
    (r) => r.bookId === bookId || r.book?._id === bookId || r.book === bookId
  );

  const filteredReviews = bookReviews.filter(
    (r) => reviewStarFilter === 0 || r.rating === reviewStarFilter
  );

  const toggleMoodTag = (tag) => {
    setReviewMoods((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    setReviewError('');

    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (!reviewThoughts.trim()) {
      setReviewError('Please write your review thoughts before submitting.');
      return;
    }

    if (!reviewRating || reviewRating < 0.5 || reviewRating > 5) {
      setReviewError('Please select a star rating between 1 and 5.');
      return;
    }

    try {
      setIsSubmittingReview(true);
      await onSubmitReview({
        bookId,
        rating: reviewRating,
        thoughts: reviewThoughts.trim(),
        text: reviewThoughts.trim(),
        moodTags: reviewMoods,
        containsSpoilers: reviewSpoilers,
      });
      setReviewThoughts('');
      setReviewRating(5);
      setIsSubmittingReview(false);
    } catch (err) {
      setIsSubmittingReview(false);
      setReviewError(err.message || 'Failed to submit review');
    }
  };

  const handleReviewCommentSubmit = (revId) => {
    const text = (reviewCommentInputs[revId] || '').trim();
    if (!text) return;
    if (!currentUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (onAddComment) {
      onAddComment(revId, text);
      setReviewCommentInputs((prev) => ({ ...prev, [revId]: '' }));
    }
  };

  const startEditReview = (rev) => {
    setEditingReviewId(rev.id || rev._id);
    setEditRating(rev.rating || 5);
    setEditText(rev.thoughts || rev.text || '');
    setEditError('');
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditError('');
  };

  const handleSaveInlineReview = async (reviewId) => {
    setEditError('');
    if (!editText.trim()) {
      setEditError('Review text cannot be empty.');
      return;
    }
    if (!editRating || editRating < 0.5 || editRating > 5) {
      setEditError('Rating must be between 0.5 and 5.');
      return;
    }

    try {
      setIsSavingEdit(true);
      await onUpdateReview(reviewId, {
        rating: editRating,
        text: editText.trim(),
        thoughts: editText.trim(),
      });
      setIsSavingEdit(false);
      setEditingReviewId(null);
    } catch (err) {
      setIsSavingEdit(false);
      setEditError(err.message || 'Failed to update review');
    }
  };

  const handleDeleteBookClick = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this book and all its reviews?'
      )
    ) {
      onDeleteBook && onDeleteBook(selectedBook);
    }
  };

  const handleDeleteReviewClick = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      onDeleteReview && onDeleteReview(reviewId);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#110E1C] border border-amber-400/30 shadow-[0_0_60px_rgba(245,158,11,0.2)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
            <BookOpen size={14} />
            <span>
              3D HARDCOVER DOSSIER // {selectedBook.sourceApi || 'GOOGLE BOOKS'} • ISBN{' '}
              {selectedBook.isbn || 'VERIFIED'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="shrink-0 pt-2 pl-2">
              <BookCover book={selectedBook} size="lg" is3D={true} />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(selectedBook.genres || ['Sci-Fi']).map((g) => (
                    <span
                      key={g}
                      className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/30"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {selectedBook.title}
                </h2>
                <p className="text-sm text-slate-300 mt-0.5">
                  by <span className="font-semibold text-white">{selectedBook.author}</span> •{' '}
                  {selectedBook.publishedYear} • {selectedBook.pageCount} pages
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                <div className="flex items-center gap-2">
                  <StarRating
                    value={bookStats.avgRating || 4.7}
                    size={18}
                    readOnly
                  />
                  <span className="text-lg font-bold text-amber-400">
                    {bookStats.avgRating || 4.7}
                  </span>
                  <span className="text-xs text-slate-400">/ 5.0</span>
                </div>
                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                <div className="text-xs text-slate-300 font-mono">
                  {bookStats.reviewCount || 0} Reviews •{' '}
                  {bookStats.readCount || 0} Diary Reads
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {selectedBook.description}
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => onReaction && onReaction(bookId, 'favorite')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isFav
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                      : 'bg-white/[0.06] hover:bg-rose-500/20 text-slate-200 border border-white/15'
                  }`}
                >
                  <Heart
                    size={14}
                    className={isFav ? 'fill-white' : ''}
                  />
                  <span>
                    {isFav ? 'In Favorites Vault' : 'Add to Favorites'}{' '}
                    ({selectedBook.favoritesCount || 0})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onReaction && onReaction(bookId, 'like')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isLiked
                      ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-400/50'
                      : 'bg-white/[0.06] hover:bg-emerald-500/15 text-slate-200 border border-white/15'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span>Like ({selectedBook.likesCount || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onReaction && onReaction(bookId, 'dislike')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isDisliked
                      ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50'
                      : 'bg-white/[0.06] hover:bg-amber-500/15 text-slate-200 border border-white/15'
                  }`}
                >
                  <ThumbsDown size={14} />
                  <span>Dislike ({selectedBook.dislikesCount || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenDiary && onOpenDiary(bookId)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 text-xs font-semibold transition-all"
                >
                  <Calendar size={14} />
                  <span>+ Log to Reading Diary</span>
                </button>
              </div>
            </div>
          </div>

          {/* 5-Star Review & Thoughts Composer */}
          <form
            onSubmit={handleReviewSubmit}
            className="rounded-2xl bg-slate-950/90 border border-white/10 p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span>Write a 5-Star Review &amp; Share Your Thoughts</span>
              </h3>
              <div className="flex items-center gap-3">
                <StarRating value={reviewRating} onChange={setReviewRating} size={20} />
                <span className="text-xs font-mono text-amber-300">
                  {STAR_LABELS[reviewRating]}
                </span>
              </div>
            </div>

            {reviewError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <textarea
              rows={3}
              value={reviewThoughts}
              onChange={(e) => setReviewThoughts(e.target.value)}
              placeholder={`How did "${selectedBook.title}" make you feel? Share favorite quotes, characters, or thematic impressions...`}
              className="w-full rounded-xl bg-slate-900 border border-white/10 p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-mono text-slate-400 mr-1">
                  Mood Vibes:
                </span>
                {MOOD_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleMoodTag(tag)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                      reviewMoods.includes(tag)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewSpoilers}
                    onChange={(e) => setReviewSpoilers(e.target.checked)}
                    className="rounded border-white/20 bg-slate-800"
                  />
                  <span>Contains Spoilers</span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <Send size={13} />
                  <span>{isSubmittingReview ? 'Publishing...' : 'Publish Review'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Community Reviews List with Star Filter */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base font-bold text-white">
                Reader Community Reviews ({bookReviews.length})
              </h3>

              <div className="flex items-center gap-1">
                {[0, 5, 4, 3, 2, 1].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewStarFilter(star)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      reviewStarFilter === star
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {star === 0 ? 'All ★' : `${star}★`}
                  </button>
                ))}
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
                No reviews yet matching this filter. Be the first to publish a review!
              </div>
            ) : (
              filteredReviews.map((rev) => {
                const revId = rev.id || rev._id;
                const authorId = rev.userId || rev.user?._id || rev.user?.id || rev.user;
                const currentUserId = currentUser?.id || currentUser?._id;
                const isOwner = Boolean(
                  currentUserId &&
                    (String(authorId) === String(currentUserId) ||
                      (typeof rev.user === 'object' &&
                        rev.user?.username &&
                        rev.user.username.toLowerCase() ===
                          currentUser.username?.toLowerCase()))
                );

                const revAuthor =
                  (typeof rev.user === 'object' && rev.user?.username ? rev.user : null) ||
                  users.find((u) => u.id === authorId || u._id === authorId) || {
                    username: 'reader',
                    displayName: 'Aether Reader',
                    avatarColor: '#F59E0B',
                  };

                const isSpoilerHidden =
                  rev.containsSpoilers && !revealedSpoilers[revId];
                const isEditingThis = editingReviewId === revId;

                return (
                  <div
                    key={revId}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <HumanAvatar user={revAuthor} size="xs" />
                        <div>
                          <span className="text-xs font-bold text-white">
                            {revAuthor.displayName} (@{revAuthor.username})
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 ml-2">
                            {rev.createdAt ? String(rev.createdAt).slice(0, 10) : 'Recent'}
                          </span>
                        </div>
                      </div>

                      {/* Right rating & Owner action buttons */}
                      <div className="flex items-center gap-3">
                        <StarRating value={rev.rating} size={13} readOnly />

                        {/* Task 3.2: Inline Edit & Delete for Review Owner */}
                        {isOwner && (
                          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                            <button
                              type="button"
                              onClick={() => startEditReview(rev)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                              title="Edit your review"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReviewClick(revId)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                              title="Delete your review"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inline Editor or Review Display */}
                    {isEditingThis ? (
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-400/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-amber-300">
                            Edit Rating &amp; Thoughts:
                          </span>
                          <StarRating
                            value={editRating}
                            onChange={setEditRating}
                            size={18}
                          />
                        </div>

                        {editError && (
                          <div className="p-2 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                            {editError}
                          </div>
                        )}

                        <textarea
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full rounded-lg bg-slate-900 border border-white/15 p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditReview}
                            disabled={isSavingEdit}
                            className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-300 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveInlineReview(revId)}
                            disabled={isSavingEdit}
                            className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all"
                          >
                            <Check size={12} />
                            <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        </div>
                      </div>
                    ) : isSpoilerHidden ? (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-between">
                        <span className="text-xs text-rose-200 font-mono">
                          Spoiler warning flagged by reviewer.
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedSpoilers((prev) => ({
                              ...prev,
                              [revId]: true,
                            }))
                          }
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 text-xs font-semibold"
                        >
                          Reveal Thoughts
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {rev.thoughts || rev.text}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {(rev.moodTags || []).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-amber-300"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onReviewReaction && onReviewReaction(revId, 'like')}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-300 transition-colors"
                        >
                          <ThumbsUp size={12} />
                          <span>{rev.likes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onReviewReaction && onReviewReaction(revId, 'dislike')}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors"
                        >
                          <ThumbsDown size={12} />
                          <span>{rev.dislikes?.length || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [revId]: !prev[revId],
                            }))
                          }
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-300 transition-colors ml-1"
                          title="View comments or reply to reviewer"
                        >
                          <MessageSquare size={12} />
                          <span>{(rev.comments || []).length > 0 ? `${rev.comments.length}` : 'Reply'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Comments / Reply Thread */}
                    {expandedComments[revId] && (
                      <div className="pt-2.5 mt-2 border-t border-white/[0.08] space-y-2">
                        {(rev.comments || []).length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {(rev.comments || []).map((cmt) => {
                              const cUser =
                                (users || []).find(
                                  (u) =>
                                    u &&
                                    (u.id === cmt.userId ||
                                      u._id === cmt.userId ||
                                      String(u._id) === String(cmt.userId))
                                ) ||
                                (currentUser &&
                                (currentUser.id === cmt.userId ||
                                  currentUser._id === cmt.userId)
                                  ? currentUser
                                  : null) ||
                                (users && users[0]) || {
                                  username: 'reader',
                                  displayName: 'Reader',
                                };
                              return (
                                <div
                                  key={cmt.id}
                                  className="flex items-start gap-2 text-xs bg-white/[0.02] p-2 rounded-xl"
                                >
                                  <HumanAvatar user={cUser} size="xs" />
                                  <div className="flex-1 min-w-0">
                                    <span className="font-semibold text-amber-200">
                                      @{cUser?.username || 'reader'}:
                                    </span>{' '}
                                    <span className="text-slate-300 break-words">{cmt.text}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic">No replies yet. Share a comment or response!</p>
                        )}

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={reviewCommentInputs[revId] || ''}
                            onChange={(e) =>
                              setReviewCommentInputs((prev) => ({
                                ...prev,
                                [revId]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleReviewCommentSubmit(revId);
                              }
                            }}
                            placeholder={`Reply to @${revAuthor?.username || 'reader'}...`}
                            className="flex-1 rounded-xl bg-slate-900 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
                          />
                          <button
                            type="button"
                            onClick={() => handleReviewCommentSubmit(revId)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition-all"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

