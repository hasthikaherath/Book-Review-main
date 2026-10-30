import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import HumanAvatar from './HumanAvatar';

export default function AuthModal({
  isOpen,
  onClose,
  authMode = 'login',
  setAuthMode,
  onLogin,
  onRegister,
  users = [],
  onSelectDemoUser,
}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError('');
  }, [authMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authMode === 'login') {
      if (!identifier.trim()) {
        setError('Please enter your email or username.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      try {
        setIsSubmitting(true);
        await onLogin({ emailOrUsername: identifier.trim(), password });
        setIsSubmitting(false);
        onClose();
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } else {
      // Register validation
      if (!username.trim()) {
        setError('Username is required.');
        return;
      }
      if (username.trim().length < 3) {
        setError('Username must be at least 3 characters long.');
        return;
      }
      if (!email.trim()) {
        setError('Email address is required.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      try {
        setIsSubmitting(true);
        await onRegister({
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          email: email.trim(),
          password,
          bio: bio.trim() || 'Explorer of literary worlds.',
        });
        setIsSubmitting(false);
        onClose();
      } catch (err) {
        setIsSubmitting(false);
        setError(err.message || 'Registration failed.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-[#120E1E] border border-amber-400/30 p-6 space-y-5 shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-mono text-amber-300 uppercase">
              MERN JWT AUTHENTICATION
            </span>
            <h3 className="text-base font-bold text-white">
              {authMode === 'login' ? 'Log In to Aether Reads' : 'Create Reader Account'}
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

        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-950 border border-white/10">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`py-1.5 rounded-lg text-xs font-semibold ${
              authMode === 'login' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`py-1.5 rounded-lg text-xs font-semibold ${
              authMode === 'register' ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
            }`}
          >
            Sign Up (New User)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'login' ? (
            <>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="aria@aether.io or aria_vance"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="nova_reader"
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nova Sterling"
                    className="w-full rounded-xl bg-slate-950 border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nova@aether.io"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Password * (min 6 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password (6+ chars)"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Reader Bio
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Sci-fi & philosophy enthusiast"
                  className="w-full rounded-xl bg-slate-950 border border-white/15 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            {isSubmitting
              ? 'Processing...'
              : authMode === 'login'
              ? 'Authenticate with Email / Username'
              : 'Register & Sign In'}
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 space-y-2">
          <p className="text-[11px] font-mono text-slate-400">
            QUICK DEMO READER SWITCHER (ONE-CLICK):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id || u._id}
                type="button"
                onClick={() => {
                  onSelectDemoUser && onSelectDemoUser(u.id || u._id);
                  onClose();
                }}
                className="flex items-center gap-2 p-2 rounded-xl border text-left text-xs bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.07] transition-all"
              >
                <HumanAvatar user={u} size="xs" />
                <span className="truncate">@{u.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

