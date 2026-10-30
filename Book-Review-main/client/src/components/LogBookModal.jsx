import React, { useState, useEffect } from 'react';
import { Calendar, Edit3, X, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';

export default function LogBookModal({
  isOpen,
  onClose,
  onSave,
  books = [],
  initialBookId = '',
  entryToEdit = null,
}) {
  const isEditing = Boolean(entryToEdit);

  const [bookId, setBookId] = useState('');
  const [status, setStatus] = useState('read');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [isReread, setIsReread] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entryToEdit) {
      setBookId(entryToEdit.bookId || entryToEdit.book?._id || entryToEdit.book || '');
      setStatus(entryToEdit.status || 'read');
      const d = entryToEdit.readDate ? new Date(entryToEdit.readDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      setDate(d);
      setRating(entryToEdit.rating || 5);
      setNotes(entryToEdit.diaryNotes || '');
      setIsReread(Boolean(entryToEdit.isReread));
      setError('');
    } else {
      setBookId(initialBookId || books[0]?.id || books[0]?._id || '');
      setStatus('read');
      setDate(new Date().toISOString().slice(0, 10));
      setRating(5);
      setNotes('');
      setIsReread(false);
      setError('');
    }
  }, [entryToEdit, initialBookId, books, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!bookId) {
      setError('Please select a book to log.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          bookId,
          status,
          readDate: date,
          dateRead: date,
          rating,
          diaryNotes: notes.trim(),
          notes: notes.trim(),
          isReread,
          reread: isReread,
        },
        entryToEdit
      );
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to save diary entry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-[#120E1E] border border-amber-400/30 p-6 space-y-5 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Edit3 size={18} className="text-amber-300" />
            ) : (
              <Calendar size={18} className="text-amber-300" />
            )}
            <h3 className="text-base font-bold text-white">
              {isEditing ? 'Edit Reading Diary Entry' : 'Log Book to Reading Diary'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Select Book from Connected Catalog
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              disabled={isEditing}
              className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 disabled:opacity-60"
            >
              {books.map((b) => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.title} — {b.author} ({b.publishedYear})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Reading Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="read">Finished Reading (Read)</option>
                <option value="reading">Currently Reading</option>
                <option value="want_to_read">Want to Read</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Diary Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <span className="text-xs font-mono text-slate-300">
              Rating out of 5 Stars:
            </span>
            <StarRating value={rating} onChange={setRating} size={20} />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Diary Reflections &amp; Thoughts
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record where you read this book, key takeaways, or notes for your followers..."
              className="w-full rounded-xl bg-slate-950 border border-white/15 p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={isReread}
              onChange={(e) => setIsReread(e.target.checked)}
              className="rounded border-white/20 bg-slate-900"
            />
            <span>This was a re-read of a previous favorite</span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/5 text-xs text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              {isSubmitting
                ? 'Saving...'
                : isEditing
                ? 'Update Diary Entry'
                : 'Save to Reading Diary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

