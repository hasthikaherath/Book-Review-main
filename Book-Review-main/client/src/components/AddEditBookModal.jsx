import React, { useState, useEffect } from 'react';
import { Database, Edit3, X, AlertCircle } from 'lucide-react';

export default function AddEditBookModal({
  isOpen,
  onClose,
  onSave,
  bookToEdit = null,
}) {
  const isEditing = Boolean(bookToEdit);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [genre, setGenre] = useState('Sci-Fi');
  const [pages, setPages] = useState(320);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setAuthor(bookToEdit.author || '');
      setIsbn(bookToEdit.isbn || '');
      setYear(bookToEdit.publishedYear || new Date().getFullYear());
      setGenre(bookToEdit.genres?.[0] || 'Sci-Fi');
      setPages(bookToEdit.pageCount || 320);
      setCoverUrl(bookToEdit.coverUrl || '');
      setDescription(bookToEdit.description || '');
      setError('');
    } else {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setYear(new Date().getFullYear());
      setGenre('Sci-Fi');
      setPages(320);
      setCoverUrl('');
      setDescription('');
      setError('');
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!title.trim()) {
      setError('Book title is required.');
      return;
    }
    if (!author.trim()) {
      setError('Author name is required.');
      return;
    }
    const numYear = Number(year);
    if (isNaN(numYear) || numYear < 100 || numYear > 2100) {
      setError('Please provide a valid publication year (between 100 and 2100).');
      return;
    }
    const numPages = Number(pages);
    if (isNaN(numPages) || numPages <= 0) {
      setError('Page count must be a positive number.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          title: title.trim(),
          author: author.trim(),
          isbn: isbn.trim(),
          year: numYear,
          publishedYear: numYear,
          genre,
          genres: [genre],
          pages: numPages,
          pageCount: numPages,
          cover: coverUrl.trim(),
          coverUrl: coverUrl.trim(),
          synopsis: description.trim(),
          description: description.trim(),
        },
        bookToEdit
      );
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to save book');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-[#120E1E] border border-amber-400/30 p-6 space-y-4 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <Edit3 size={16} className="text-amber-300" />
            ) : (
              <Database size={16} className="text-amber-300" />
            )}
            <span>
              {isEditing ? 'Edit Book Dossier' : 'Index Book into Connected Database'}
            </span>
          </h3>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solaris"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Author *
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Stanislaw Lem"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                ISBN-13
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-..."
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Year *
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Pages *
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Speculative">Speculative</option>
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Astrophysics">Astrophysics</option>
                <option value="Literary">Literary</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Fiction">Fiction</option>
                <option value="Dystopian">Dystopian</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Cover Image URL (optional)
              </label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Synopsis / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief synopsis of the book"
              className="w-full rounded-xl bg-slate-950 border border-white/15 p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

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
                ? 'Update Book Dossier'
                : 'Sync Book to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

