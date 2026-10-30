import React, { useState, useEffect } from 'react';
import { User, X, AlertCircle, Check } from 'lucide-react';
import HumanAvatar from './HumanAvatar';

const AVATAR_COLORS = [
  '#38BDF8', // Sky Blue
  '#F59E0B', // Amber
  '#EC4899', // Rose Pink
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#E11D48', // Crimson
];

export default function EditProfileModal({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarColor, setAvatarColor] = useState('#38BDF8');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.username || '');
      setBio(currentUser.bio || '');
      setAvatarColor(currentUser.avatarColor || '#38BDF8');
      setError('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (bio.length > 280) {
      setError('Bio cannot exceed 280 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        displayName: displayName.trim() || currentUser.username,
        bio: bio.trim(),
        avatar: avatarColor,
        avatarColor,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to update profile');
    }
  };

  const previewUser = {
    ...currentUser,
    displayName: displayName || currentUser.username,
    avatarColor,
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-[#120E1E] border border-amber-400/30 p-6 space-y-5 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <User size={18} className="text-amber-300" />
            <h3 className="text-base font-bold text-white">Edit Reader Profile</h3>
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
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
            <HumanAvatar user={previewUser} size="lg" />
            <div>
              <p className="text-sm font-bold text-white">
                {displayName || currentUser.username}
              </p>
              <p className="text-xs text-amber-300/80 font-mono">
                @{currentUser.username}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Live Avatar Preview</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Nova Sterling"
              className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-mono text-slate-400">
                Reader Bio
              </label>
              <span className={`text-[10px] font-mono ${bio.length > 280 ? 'text-rose-400' : 'text-slate-400'}`}>
                {bio.length}/280
              </span>
            </div>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a few words about your literary tastes..."
              className="w-full rounded-xl bg-slate-950 border border-white/15 p-3 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">
              Avatar Aura &amp; Accent Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {AVATAR_COLORS.map((c) => {
                const isSelected = avatarColor.toLowerCase() === c.toLowerCase();
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarColor(c)}
                    className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: isSelected ? '#FFFFFF' : 'transparent',
                      transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: isSelected ? `0 0 12px ${c}` : 'none',
                    }}
                  >
                    {isSelected && <Check size={14} className="text-slate-950" />}
                  </button>
                );
              })}
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

