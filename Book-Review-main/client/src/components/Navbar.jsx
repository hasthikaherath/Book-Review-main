import React from 'react';
import {
  BookOpen,
  Compass,
  Calendar,
  Users,
  Bookmark,
  Layers,
  Plus,
  User,
  LogOut,
} from 'lucide-react';
import HumanAvatar from './HumanAvatar';

export default function Navbar({
  activeTab,
  setActiveTab,
  dbStatus = { connected: false },
  apiLatency = null,
  syncWithDatabase,
  isSyncing = false,
  enable3DBooks = true,
  setEnable3DBooks,
  ambienceMood = 'cozy',
  setAmbienceMood,
  currentUser = null,
  onOpenDiary,
  firstBookId,
  onOpenAuth,
  onLogout,
}) {
  const navBg =
    ambienceMood === 'cozy'
      ? 'bg-[#1F140C]/90 border-amber-900/30'
      : ambienceMood === 'velvet'
      ? 'bg-[#180D2C]/90 border-purple-900/30'
      : 'bg-[#0A1C36]/90 border-sky-900/30';

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/25 via-rose-500/20 to-slate-900 border border-amber-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.22)] group-hover:border-amber-300 transition-colors">
              <BookOpen size={18} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold tracking-wide text-sm sm:text-base bg-gradient-to-r from-amber-100 via-white to-rose-200 bg-clip-text text-transparent">
                  AETHER
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-400/30">
                  READS 3D
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Warm Social Book Sanctuary &amp; Google Books Archive
              </p>
            </div>
          </button>
        </div>

        {/* Center Navigation Pills */}
        <nav className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] p-1 rounded-xl overflow-x-auto">
          {[
            { id: 'discover', label: 'Book Database', icon: Compass },
            { id: 'diary', label: 'Reading Diary', icon: Calendar },
            { id: 'social', label: 'Readers & Feed', icon: Users },
            { id: 'vault', label: 'My Vault', icon: Bookmark },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.18)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-amber-300' : 'text-slate-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Auth, 3D Toggle & Quick Diary Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnable3DBooks && setEnable3DBooks((prev) => !prev)}
            className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              enable3DBooks
                ? 'bg-amber-500/15 text-amber-200 border-amber-400/40'
                : 'bg-white/[0.04] text-slate-400 border-white/10'
            }`}
            title="Toggle tactile 3D hardcover perspective"
          >
            <Layers size={13} />
            <span>3D Covers</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenDiary && onOpenDiary(firstBookId)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-semibold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
          >
            <Plus size={14} />
            <span>Log Read Book</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth('login')}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
                title="Switch user account or manage session"
              >
                <HumanAvatar user={currentUser} size="xs" />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-medium text-white leading-none">
                    @{currentUser.username}
                  </p>
                  <p className="text-[10px] text-amber-300/80 leading-none mt-0.5">
                    {currentUser.following?.length || 0} following
                  </p>
                </div>
              </button>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-colors"
                  title="Log out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-all"
            >
              <User size={14} />
              <span>Log In / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
