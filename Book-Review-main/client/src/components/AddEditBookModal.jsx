import React, { useState, useEffect } from 'react';
import { Plus, Edit3, X, AlertCircle, BookOpen } from 'lucide-react';

const PRESET_GENRES = [
  'Sci-Fi',
  'Fantasy',
  'Speculative',
  'Cyberpunk',
  'Philosophy',
  'Dystopian',
  'Mystery',
  'Literary',
  'Thriller',
  'Non-Fiction',
];

export default function AddEditBookModal({
  isOpen,
  onClose,
  onSave,
  bookToEdit = null,
}) {
  const isEditing = Boolean(bookToEdit);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genresInput, setGenresInput] = useState('Sci-Fi, Speculative');
  const [year, setYear] = useState(new Date().getFullYear());
  const [pages, setPages] = useState(320);
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title || '');
      setAuthor(bookToEdit.author || '');
      setGenresInput(
        Array.isArray(bookToEdit.genres) && bookToEdit.genres.length > 0
          ? bookToEdit.genres.join(', ')
          : 'Sci-Fi'
      );
      setYear(bookToEdit.publishedYear || new Date().getFullYear());
      setPages(bookToEdit.pageCount || 320);
      setCoverUrl(bookToEdit.coverUrl || '');
      setDescription(bookToEdit.description || '');
      setError('');
    } else {
      setTitle('');
      setAuthor('');
      setGenresInput('Sci-Fi, Speculative');
      setYear(new Date().getFullYear());
      setPages(320);
      setCoverUrl('');
      setDescription('');
      setError('');
    }
  }, [bookToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleGenreTag = (tag) => {
    const current = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    if (current.includes(tag)) {
      setGenresInput(current.filter((g) => g !== tag).join(', '));
    } else {
      setGenresInput([...current, tag].join(', '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!title.trim()) {
      setError('Book title is required.');
      return;
    }
    if (!author.trim()) {
      setError('Author name is required.');
      return;
    }

    const numYear = Number(year);
    if (year !== '' && (isNaN(numYear) || numYear <= 0 || numYear > 2100)) {
      setError('Please provide a valid publication year (between 1 and 2100).');
      return;
    }

    const numPages = Number(pages);
    if (pages !== '' && (isNaN(numPages) || numPages <= 0)) {
      setError('Page count must be a valid positive number.');
      return;
    }

    const parsedGenres = genresInput
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
    if (parsedGenres.length === 0) {
      parsedGenres.push('Literature');
    }

    try {
      setIsSubmitting(true);
      await onSave(
        {
          title: title.trim(),
          author: author.trim(),
          genres: parsedGenres,
          year: numYear || new Date().getFullYear(),
          publishedYear: numYear || new Date().getFullYear(),
          publicationYear: numYear || new Date().getFullYear(),
          pages: numPages || 320,
          pageCount: numPages || 320,
          cover: coverUrl.trim(),
          coverImage: coverUrl.trim(),
          coverUrl: coverUrl.trim(),
          synopsis: description.trim(),
          description: description.trim(),
        },
        bookToEdit
      );
      setIsSubmitting(false);
      setTitle('');
      setAuthor('');
      setGenresInput('Sci-Fi, Speculative');
      setYear(new Date().getFullYear());
      setPages(320);
      setCoverUrl('');
      setDescription('');
      setError('');
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to save book');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-[#120E1E] border border-amber-400/30 p-6 space-y-4 shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <Edit3 size={18} className="text-amber-300" />
            ) : (
              <Plus size={18} className="text-amber-300" />
            )}
            <span>
              {isEditing ? 'Edit Book Dossier' : 'Add Custom Book Manually'}
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
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Book Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Project Hail Mary"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
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
                placeholder="e.g. Andy Weir"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Genres (text + clickable tags) */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Genres (comma-separated or select tags below)
            </label>
            <input
              type="text"
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="e.g. Sci-Fi, Space Opera, Adventure"
              className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_GENRES.map((tag) => {
                const isSelected = genresInput
                  .split(',')
                  .map((g) => g.trim().toLowerCase())
                  .includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleGenreTag(tag)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                        : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    +{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publication Year & Page Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Publication Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2024"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Page Count
              </label>
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g. 384"
                className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Cover Image URL (optional)
            </label>
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.example.com/cover.jpg"
              className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Synopsis / Description */}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Synopsis / Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief synopsis, overview, or thematic highlights of this edition..."
              className="w-full rounded-xl bg-slate-950 border border-white/15 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Action Buttons */}
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
                : '+ Add Custom Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
