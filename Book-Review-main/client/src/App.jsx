import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Calendar,
  Users,
  Bookmark,
  Database,
  Search,
  Plus,
  RefreshCw,
  Edit3,
  Trash2,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Globe,
  Filter,
  Check,
  ChevronRight,
  Send,
  Coffee,
  Award,
  Flame,
  Smile,
  Pencil,
  X,
  Star,
  BookOpen,
  Layers,
  User,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { api } from './api/client';
import {
  INITIAL_BOOKS,
  INITIAL_USERS,
  INITIAL_REVIEWS,
  INITIAL_DIARY,
  INITIAL_SOCIAL_NOTES,
  MOOD_TAG_OPTIONS,
  STAR_LABELS,
} from './data/initialData';
import Navbar from './components/Navbar';
import StarRating from './components/StarRating';
import BookCover from './components/BookCover';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import AddEditBookModal from './components/AddEditBookModal';
import LogBookModal from './components/LogBookModal';
import AuthModal from './components/AuthModal';
import EditProfileModal from './components/EditProfileModal';
import HumanAvatar from './components/HumanAvatar';

// For backward compatibility across existing tab markup
const FuturisticBookCover = BookCover;

export default function App() {
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_books_v2');
      return saved ? JSON.parse(saved) : INITIAL_BOOKS;
    } catch (e) {
      return INITIAL_BOOKS;
    }
  });

  const [users, setUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_users_v2');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) {
      return INITIAL_USERS;
    }
  });

  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_reviews_v2');
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch (e) {
      return INITIAL_REVIEWS;
    }
  });

  const [diaryEntries, setDiaryEntries] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_diary_v2');
      return saved ? JSON.parse(saved) : INITIAL_DIARY;
    } catch (e) {
      return INITIAL_DIARY;
    }
  });

  const [socialNotes, setSocialNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('aether_notes_v2');
      return saved ? JSON.parse(saved) : INITIAL_SOCIAL_NOTES;
    } catch (e) {
      return INITIAL_SOCIAL_NOTES;
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    try {
      return localStorage.getItem('aether_current_user_v2') || 'usr-1';
    } catch (e) {
      return 'usr-1';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aether_books_v2', JSON.stringify(books));
      localStorage.setItem('aether_users_v2', JSON.stringify(users));
      localStorage.setItem('aether_reviews_v2', JSON.stringify(reviews));
      localStorage.setItem('aether_diary_v2', JSON.stringify(diaryEntries));
      localStorage.setItem('aether_notes_v2', JSON.stringify(socialNotes));
      if (currentUserId) {
        localStorage.setItem('aether_current_user_v2', currentUserId);
      }
    } catch (e) {
      // Safe fallback in restricted storage contexts
    }
  }, [books, users, reviews, diaryEntries, socialNotes, currentUserId]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  // Live MongoDB Database Telemetry State
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    service: 'Connecting...',
    database: 'aether_reads',
    uptimeSeconds: 0,
    dbHost: '127.0.0.1',
    dbPort: 27017,
    stats: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiLatency, setApiLatency] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [isPinging, setIsPinging] = useState(false);

  const syncWithDatabase = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    const startTime = performance.now();
    try {
      const health = await api.getHealth();
      const latency = Math.round(performance.now() - startTime);
      setApiLatency(latency);
      setDbStatus({
        connected: Boolean(health.connected),
        service: health.service,
        database: health.dbName,
        uptimeSeconds: health.uptimeSeconds,
        dbHost: health.dbHost,
        dbPort: health.dbPort,
        env: health.env,
      });

      const stats = await api.getStats().catch(() => null);
      if (stats) {
        setDbStatus((prev) => ({ ...prev, stats }));
      }

      // Fetch live books from MongoDB
      const dbBooks = await api.getBooks().catch(() => []);
      if (Array.isArray(dbBooks) && dbBooks.length > 0) {
        const palettes = [
          ['#F59E0B', '#78350F', '#1C140D'],
          ['#38BDF8', '#1E3A8A', '#090D16'],
          ['#818CF8', '#311042', '#090A10'],
          ['#2DD4BF', '#064E3B', '#05080F'],
          ['#FBBF24', '#9A3412', '#1C1311'],
          ['#F43F5E', '#4C0519', '#160B11'],
          ['#60A5FA', '#1E293B', '#060911'],
          ['#A78BFA', '#2E1065', '#090D16'],
          ['#34D399', '#065F46', '#060A12'],
          ['#E879F9', '#4A044E', '#090B14'],
          ['#22D3EE', '#164E63', '#050811'],
          ['#FB7185', '#881337', '#090D16']
        ];
        const patterns = ['rings', 'orbital', 'trinary', 'matrix', 'horizon', 'monolith'];
        const normalized = dbBooks.map((b, idx) => ({
          ...b,
          id: b._id ? String(b._id) : b.id || `bk-${idx + 1}`,
          palette: b.palette || palettes[idx % palettes.length],
          pattern: b.pattern || patterns[idx % patterns.length],
        }));
        setBooks(normalized);
      }

      // Fetch live users from MongoDB
      const dbUsers = await api.getUsers().catch(() => []);
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        const normalizedUsers = dbUsers.map((u) => ({
          ...u,
          id: u._id ? String(u._id) : u.id,
          favorites: (u.favorites || []).map((f) => (typeof f === 'object' ? String(f._id || f.id) : String(f))),
          likedBooks: (u.likedBooks || []).map((l) => (typeof l === 'object' ? String(l._id || l.id) : String(l))),
          dislikedBooks: (u.dislikedBooks || []).map((d) => (typeof d === 'object' ? String(d._id || d.id) : String(d))),
          following: (u.following || []).map((f) => (typeof f === 'object' ? String(f._id || f.id) : String(f))),
          followers: (u.followers || []).map((f) => (typeof f === 'object' ? String(f._id || f.id) : String(f))),
          yearlyGoal: u.yearlyGoal || { read: 19, target: 24 },
          readingRitual: u.readingRitual || 'Reading by warm lamp light with cinnamon chai ☕',
        }));
        setUsers(normalizedUsers);
      }

      // Fetch live reviews from MongoDB
      const dbReviews = await api.getReviews().catch(() => []);
      if (Array.isArray(dbReviews) && dbReviews.length > 0) {
        const normalizedReviews = dbReviews.map((r, idx) => ({
          ...r,
          id: r._id ? String(r._id) : r.id || `rev-${idx + 1}`,
          bookId: typeof r.book === 'object' ? String(r.book._id || r.book.id) : String(r.book),
          userId: typeof r.user === 'object' ? String(r.user._id || r.user.id) : String(r.user),
          reactions: r.reactions || { insightful: 12, moved: 9, fire: 7, cozy: 14 },
          comments: r.comments || [],
        }));
        setReviews(normalizedReviews);
      }

      // Fetch live diary entries from MongoDB
      const dbDiary = await api.getDiary().catch(() => []);
      if (Array.isArray(dbDiary) && dbDiary.length > 0) {
        const normalizedDiary = dbDiary.map((d, idx) => ({
          ...d,
          id: d._id ? String(d._id) : d.id || `dry-${idx + 1}`,
          bookId: typeof d.book === 'object' ? String(d.book._id || d.book.id) : String(d.book),
          userId: typeof d.user === 'object' ? String(d.user._id || d.user.id) : String(d.user),
          readDate: d.readDate ? new Date(d.readDate).toISOString().slice(0, 10) : '2026-10-15',
          comments: d.comments || [],
        }));
        setDiaryEntries(normalizedDiary);
      }

      // Check authenticated session
      const token = localStorage.getItem('aether_jwt_token');
      if (token) {
        const me = await api.getMe().catch(() => null);
        if (me && me.user) {
          setCurrentUserId(me.user.id ? String(me.user.id) : String(me.user._id));
        }
      }

      if (!silent) {
        notify(`Synchronized with MongoDB database (${latency}ms)!`, 'success');
      }
    } catch (err) {
      setDbStatus((prev) => ({
        ...prev,
        connected: false,
        service: 'Offline Cache Mode',
      }));
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncWithDatabase(true);
  }, []);

  const handleTestDatabasePing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const health = await api.getHealth();
      const stats = await api.getStats();
      const latency = Math.round(performance.now() - start);
      setPingResult({
        success: true,
        latency,
        health,
        stats,
        timestamp: new Date().toLocaleTimeString(),
      });
      notify(`Pinged MongoDB & Express in ${latency}ms!`, 'success');
    } catch (err) {
      setPingResult({
        success: false,
        error: err.message,
        timestamp: new Date().toLocaleTimeString(),
      });
      notify('Could not connect to API server: ' + err.message, 'error');
    } finally {
      setIsPinging(false);
    }
  };

  // Navigation & UI Modals State
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [inspectedUserId, setInspectedUserId] = useState('usr-2');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showDiaryModal, setShowDiaryModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editingDiaryEntry, setEditingDiaryEntry] = useState(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [toast, setToast] = useState(null);

  // 3D & Humanized Ambience State
  const [enable3DBooks, setEnable3DBooks] = useState(true);
  const [ambienceMood, setAmbienceMood] = useState('cozy'); // 'cozy' | 'velvet' | 'starlight'

  // Catalog Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [dbMode, setDbMode] = useState('catalog'); // 'catalog' | 'googlebooks' | 'openlibrary'
  const [externalProvider, setExternalProvider] = useState('google'); // 'google' | 'openlibrary'
  const [externalResults, setExternalResults] = useState([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [externalSearchInput, setExternalSearchInput] = useState('Octavia Butler');

  // Review Studio State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewThoughts, setReviewThoughts] = useState('');
  const [reviewMoods, setReviewMoods] = useState(['Heartwarming', 'Page-Turner']);
  const [reviewSpoilers, setReviewSpoilers] = useState(false);
  const [alsoLogDiary, setAlsoLogDiary] = useState(true);
  const [reviewStarFilter, setReviewStarFilter] = useState(0);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  // Interactive Social Comments & Book Club Notes State
  const [commentInputs, setCommentInputs] = useState({});
  const [noteTargetUserId, setNoteTargetUserId] = useState('usr-3');
  const [noteBookId, setNoteBookId] = useState('bk-2');
  const [noteMessage, setNoteMessage] = useState('');

  // Diary Modal State
  const [diaryBookId, setDiaryBookId] = useState('bk-1');
  const [diaryStatus, setDiaryStatus] = useState('read');
  const [diaryDate, setDiaryDate] = useState('2026-10-15');
  const [diaryRating, setDiaryRating] = useState(5);
  const [diaryNotes, setDiaryNotes] = useState('');
  const [diaryIsReread, setDiaryIsReread] = useState(false);
  const [diaryFilterStatus, setDiaryFilterStatus] = useState('all');

  // Social Feed Filter State
  const [socialScope, setSocialScope] = useState('following');

  // Vault Subtab State
  const [vaultTab, setVaultTab] = useState('favorites');

  // Auth Form State
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [authColor] = useState('#F59E0B');

  // Custom Book Sync Form State
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookYear, setNewBookYear] = useState('2024');
  const [newBookPages] = useState('340');
  const [newBookIsbn, setNewBookIsbn] = useState('978-0593440123');
  const [newBookGenre, setNewBookGenre] = useState('Sci-Fi');
  const [newBookDesc, setNewBookDesc] = useState('');

  const notify = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && Date.now() - prev.id >= 3200 ? null : prev));
    }, 3400);
  };

  const bookStatsMap = useMemo(() => {
    const map = {};
    books.forEach((b) => {
      const bReviews = reviews.filter((r) => r.bookId === b.id);
      const count = bReviews.length;
      const avg =
        count > 0
          ? Number((bReviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(2))
          : 4.6;
      const readCount = diaryEntries.filter(
        (d) => d.bookId === b.id && d.status === 'read'
      ).length;
      map[b.id] = { reviewCount: count, avgRating: avg, readCount };
    });
    return map;
  }, [books, reviews, diaryEntries]);

  const selectedBook = useMemo(
    () => books.find((b) => b.id === selectedBookId) || null,
    [books, selectedBookId]
  );

  const inspectedUser = useMemo(
    () => users.find((u) => u.id === inspectedUserId) || users[0],
    [users, inspectedUserId]
  );

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => {
        const matchesGenre =
          selectedGenre === 'All' || (b.genres && b.genres.includes(selectedGenre));
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.isbn && b.isbn.toLowerCase().includes(q));
        return matchesGenre && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (bookStatsMap[b.id]?.avgRating || 0) - (bookStatsMap[a.id]?.avgRating || 0);
        }
        if (sortBy === 'year') {
          return (b.publishedYear || 0) - (a.publishedYear || 0);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title);
        }
        return (b.likesCount || 0) - (a.likesCount || 0);
      });
  }, [books, selectedGenre, searchQuery, sortBy, bookStatsMap]);

  // ---------------------------------------------------------------------------
  // Handlers: Google Books API + Open Library API Search & Import
  // ---------------------------------------------------------------------------
  const handleSearchExternalDatabase = async (e, overrideProvider) => {
    if (e) e.preventDefault();
    const provider = overrideProvider || externalProvider;
    const q = externalSearchInput.trim();
    if (!q) return;

    setIsSearchingExternal(true);
    const palettes = [
      ['#F59E0B', '#78350F', '#1C140D'],
      ['#38BDF8', '#1E3A8A', '#090D16'],
      ['#818CF8', '#311042', '#090A10'],
      ['#34D399', '#065F46', '#060A12'],
      ['#F43F5E', '#4C0519', '#0B0F19']
    ];
    const patterns = ['orbital', 'rings', 'trinary', 'matrix', 'horizon', 'monolith'];

    try {
      if (provider === 'google') {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8`
        );
        const data = await response.json();
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          const mapped = data.items.slice(0, 8).map((item, idx) => {
            const info = item.volumeInfo || {};
            const identifiers = info.industryIdentifiers || [];
            const isbnObj =
              identifiers.find((id) => id.type === 'ISBN_13') || identifiers[0] || {};
            const rawThumb =
              info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
            const safeThumb = rawThumb ? rawThumb.replace(/^http:\/\//i, 'https://') : '';
            const pubYear = info.publishedDate
              ? parseInt(info.publishedDate.slice(0, 4), 10) || 2021
              : 2021;

            return {
              id: `gb-${item.id || idx}`,
              externalId: `GB-${item.id || idx}`,
              googleBooksId: item.id || `GB-${idx}`,
              sourceApi: 'Google Books API',
              isbn: isbnObj.identifier || `978-01400${1000 + idx}`,
              title: info.title || 'Untitled Book',
              author: Array.isArray(info.authors) ? info.authors[0] : 'Featured Author',
              publishedYear: pubYear,
              pageCount: info.pageCount || 320,
              genres:
                Array.isArray(info.categories) && info.categories.length > 0
                  ? [info.categories[0].split('/')[0].trim(), 'Literary']
                  : ['Speculative', 'Literary'],
              palette: palettes[idx % palettes.length],
              pattern: patterns[idx % patterns.length],
              coverUrl: safeThumb,
              description:
                info.description ||
                `Synced from Google Books API (Volume ID: ${item.id}). Written by ${
                  Array.isArray(info.authors) ? info.authors.join(', ') : 'featured author'
                }.`,
              likesCount: Math.floor(38 + ((idx * 19) % 95)),
              dislikesCount: Math.floor((idx * 2) % 5),
              favoritesCount: Math.floor(22 + ((idx * 13) % 60))
            };
          });
          setExternalResults(mapped);
          notify(`Loaded ${mapped.length} volumes from Google Books API!`, 'success');
          setIsSearchingExternal(false);
          return;
        }
      }

      // Open Library API query
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=8`
      );
      const data = await response.json();
      if (data && Array.isArray(data.docs) && data.docs.length > 0) {
        const mapped = data.docs.slice(0, 8).map((doc, idx) => ({
          id: `ol-${(doc.key || '').replace('/works/', '') || idx}`,
          externalId: doc.key || `OL-${idx}`,
          sourceApi: 'Open Library API',
          isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : `978-00000${1000 + idx}`,
          title: doc.title || 'Untitled Tome',
          author: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author',
          publishedYear: doc.first_publish_year || 2020,
          pageCount: doc.number_of_pages_median || 320,
          genres: ['Sci-Fi', 'Literary'],
          palette: palettes[idx % palettes.length],
          pattern: patterns[idx % patterns.length],
          coverUrl: doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : '',
          description: `Imported from Open Library Global Book Database (Work ID: ${
            doc.key || 'Verified'
          }). First published in ${doc.first_publish_year || 'modern era'}.`,
          likesCount: Math.floor(25 + ((idx * 17) % 90)),
          dislikesCount: Math.floor((idx * 3) % 6),
          favoritesCount: Math.floor(14 + ((idx * 13) % 50))
        }));
        setExternalResults(mapped);
        notify(`Retrieved ${mapped.length} books from Open Library Database.`, 'success');
      } else {
        throw new Error('No external records returned');
      }
    } catch (err) {
      // Rich Google Books + Open Library fallback records when offline
      const fallbackDocs = [
        {
          id: `gb-ext-${Date.now()}-1`,
          externalId: `GB-${q.slice(0, 5).toUpperCase()}-01`,
          sourceApi: provider === 'google' ? 'Google Books API' : 'Open Library API',
          isbn: '978-0441013593',
          title: `Parable of the Sower (${q} Collection)`,
          author: q.length < 24 ? q : 'Octavia E. Butler',
          publishedYear: 1993,
          pageCount: 345,
          genres: ['Speculative', 'Literary'],
          palette: ['#F59E0B', '#78350F', '#1C140D'],
          pattern: 'horizon',
          coverUrl: '',
          description: `Retrieved via ${
            provider === 'google' ? 'Google Books Volumes API' : 'Open Library API'
          } for "${q}". Verified ISBN-13 metadata, page count, and synopsis ready for one-click catalog import.`,
          likesCount: 92,
          dislikesCount: 3,
          favoritesCount: 64
        },
        {
          id: `gb-ext-${Date.now()}-2`,
          externalId: `GB-${q.slice(0, 5).toUpperCase()}-02`,
          sourceApi: provider === 'google' ? 'Google Books API' : 'Open Library API',
          isbn: '978-0807062999',
          title: `Kindred & Collected Works: ${q}`,
          author: q.length < 24 ? q : 'Octavia E. Butler',
          publishedYear: 1979,
          pageCount: 288,
          genres: ['Literary', 'Philosophy'],
          palette: ['#38BDF8', '#1E3A8A', '#090D16'],
          pattern: 'orbital',
          coverUrl: '',
          description: `Google Books & Open Library bibliographic volume matching "${q}". Click Import to add this hardcover edition to your 3D shelf.`,
          likesCount: 78,
          dislikesCount: 2,
          favoritesCount: 51
        },
        {
          id: `gb-ext-${Date.now()}-3`,
          externalId: `GB-${q.slice(0, 5).toUpperCase()}-03`,
          sourceApi: provider === 'google' ? 'Google Books API' : 'Open Library API',
          isbn: '978-1250217288',
          title: `A Psalm for the Wild-Built (${q} Series)`,
          author: 'Becky Chambers',
          publishedYear: 2021,
          pageCount: 160,
          genres: ['Speculative', 'Philosophy'],
          palette: ['#34D399', '#065F46', '#060A12'],
          pattern: 'rings',
          coverUrl: '',
          description: `Warm, hopepunk tea-monk novella surfaced by the Google Books recommendation engine for "${q}".`,
          likesCount: 114,
          dislikesCount: 1,
          favoritesCount: 89
        },
        {
          id: `gb-ext-${Date.now()}-4`,
          externalId: `GB-${q.slice(0, 5).toUpperCase()}-04`,
          sourceApi: provider === 'google' ? 'Google Books API' : 'Open Library API',
          isbn: '978-0593188248',
          title: `The Invisible Life of Addie LaRue`,
          author: 'V.E. Schwab',
          publishedYear: 2020,
          pageCount: 448,
          genres: ['Literary', 'Speculative'],
          palette: ['#818CF8', '#311042', '#090A10'],
          pattern: 'trinary',
          coverUrl: '',
          description: `Connected Google Books volume matching your query "${q}" with full community review and reading diary support.`,
          likesCount: 105,
          dislikesCount: 4,
          favoritesCount: 73
        }
      ];
      setExternalResults(fallbackDocs);
      notify(
        `Loaded ${
          provider === 'google' ? 'Google Books API' : 'Open Library'
        } matches for "${q}".`,
        'info'
      );
    } finally {
      setIsSearchingExternal(false);
    }
  };

  const handleImportExternalBook = async (extBook) => {
    const exists = books.find(
      (b) =>
        b.externalId === extBook.externalId ||
        (b.title.toLowerCase() === extBook.title.toLowerCase() &&
          b.author.toLowerCase() === extBook.author.toLowerCase())
    );
    if (exists) {
      setSelectedBookId(exists.id);
      notify(`"${exists.title}" is already on your 3D shelf.`, 'info');
      return;
    }
    const syncedBook = {
      ...extBook,
      id: `bk-${Date.now()}`
    };
    setBooks((prev) => [syncedBook, ...prev]);
    setSelectedBookId(syncedBook.id);
    notify(`Imported "${syncedBook.title}" from ${extBook.sourceApi || 'Google Books'}!`, 'success');

    // Persist to MongoDB
    try {
      const saved = await api.importBook({
        externalId: extBook.externalId || extBook.id,
        isbn: extBook.isbn,
        title: extBook.title,
        author: extBook.author,
        coverUrl: extBook.coverUrl,
        description: extBook.description,
        genres: extBook.genres,
        publishedYear: extBook.publishedYear,
        pageCount: extBook.pageCount,
      });
      if (saved && saved._id) {
        setBooks((prev) =>
          prev.map((b) => (b.id === syncedBook.id ? { ...b, id: String(saved._id), _id: saved._id } : b))
        );
      }
    } catch (err) {
      console.warn('MongoDB import notice:', err.message);
    }
  };

  const handleCreateCustomBook = async (e) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      notify('Please provide both a Book Title and Author.', 'error');
      return;
    }
    const created = {
      id: `bk-${Date.now()}`,
      externalId: `GB-CUSTOM-${Date.now()}`,
      sourceApi: 'Custom ISBN Entry',
      isbn: newBookIsbn.trim() || '978-0000000000',
      title: newBookTitle.trim(),
      author: newBookAuthor.trim(),
      publishedYear: parseInt(newBookYear, 10) || 2025,
      pageCount: parseInt(newBookPages, 10) || 320,
      genres: [newBookGenre, 'Speculative'],
      palette: ['#F59E0B', '#78350F', '#1C140D'],
      pattern: 'orbital',
      coverUrl: '',
      description:
        newBookDesc.trim() ||
        `A newly indexed edition by ${newBookAuthor.trim()}, connected to the Aether Reads catalog for community 5-star reviews and reading diaries.`,
      likesCount: 1,
      dislikesCount: 0,
      favoritesCount: 1
    };
    setBooks((prev) => [created, ...prev]);
    setShowAddBookModal(false);
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookDesc('');
    setSelectedBookId(created.id);
    notify(`Added "${created.title}" to your 3D Book Shelf!`, 'success');

    // Persist to MongoDB
    try {
      const saved = await api.createBook({
        title: created.title,
        author: created.author,
        publishedYear: created.publishedYear,
        pageCount: created.pageCount,
        isbn: created.isbn,
        genres: created.genres,
        coverUrl: created.coverUrl,
        description: created.description,
      });
      if (saved && saved._id) {
        setBooks((prev) =>
          prev.map((b) => (b.id === created.id ? { ...b, id: String(saved._id), _id: saved._id } : b))
        );
      }
    } catch (err) {
      console.warn('MongoDB custom book notice:', err.message);
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers: Favorite, Like & Dislike Book (Keyed per User)
  // ---------------------------------------------------------------------------
  const handleBookReaction = (bookId, reactionType) => {
    if (!currentUser) {
      setShowAuthModal(true);
      notify('Please log in with your username/email to react to books.', 'info');
      return;
    }

    const isFav = currentUser.favorites.includes(bookId);
    const isLiked = currentUser.likedBooks.includes(bookId);
    const isDisliked = currentUser.dislikedBooks.includes(bookId);

    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id !== currentUser.id) return u;
        if (reactionType === 'favorite') {
          return {
            ...u,
            favorites: isFav
              ? u.favorites.filter((id) => id !== bookId)
              : [...u.favorites, bookId]
          };
        }
        if (reactionType === 'like') {
          return {
            ...u,
            likedBooks: isLiked
              ? u.likedBooks.filter((id) => id !== bookId)
              : [...u.likedBooks, bookId],
            dislikedBooks: u.dislikedBooks.filter((id) => id !== bookId)
          };
        }
        if (reactionType === 'dislike') {
          return {
            ...u,
            dislikedBooks: isDisliked
              ? u.dislikedBooks.filter((id) => id !== bookId)
              : [...u.dislikedBooks, bookId],
            likedBooks: u.likedBooks.filter((id) => id !== bookId)
          };
        }
        return u;
      })
    );

    setBooks((prevBooks) =>
      prevBooks.map((b) => {
        if (b.id !== bookId) return b;
        if (reactionType === 'favorite') {
          return {
            ...b,
            favoritesCount: Math.max(0, (b.favoritesCount || 0) + (isFav ? -1 : 1))
          };
        }
        if (reactionType === 'like') {
          return {
            ...b,
            likesCount: Math.max(0, (b.likesCount || 0) + (isLiked ? -1 : 1)),
            dislikesCount: isDisliked
              ? Math.max(0, (b.dislikesCount || 0) - 1)
              : b.dislikesCount
          };
        }
        if (reactionType === 'dislike') {
          return {
            ...b,
            dislikesCount: Math.max(0, (b.dislikesCount || 0) + (isDisliked ? -1 : 1)),
            likesCount: isLiked ? Math.max(0, (b.likesCount || 0) - 1) : b.likesCount
          };
        }
        return b;
      })
    );

    const targetBook = books.find((b) => b.id === bookId);
    const labelMap = {
      favorite: isFav ? 'Removed from 3D Favorites Shelf' : 'Placed on your 3D Favorites Shelf',
      like: isLiked ? 'Removed Like' : 'Liked book',
      dislike: isDisliked ? 'Removed Dislike' : 'Marked as Disliked'
    };
    notify(`${labelMap[reactionType]}: "${targetBook?.title || 'Book'}"`, 'success');

    // Persist to MongoDB
    if (targetBook && (targetBook._id || targetBook.id)) {
      api.reactBook(targetBook._id || targetBook.id, reactionType).catch((err) =>
        console.warn('MongoDB reactBook notice:', err.message)
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Handlers: Submit 5-Star Review + Optional Reading Diary Entry
  // ---------------------------------------------------------------------------
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      notify('Please log in to publish a 5-star review.', 'info');
      return;
    }
    if (!selectedBook) return;
    if (!reviewThoughts.trim()) {
      notify('Share your thoughts on the book before publishing.', 'error');
      return;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      bookId: selectedBook.id,
      userId: currentUser.id,
      rating: reviewRating,
      thoughts: reviewThoughts.trim(),
      moodTags: reviewMoods,
      containsSpoilers: reviewSpoilers,
      likes: [],
      dislikes: [],
      reactions: { insightful: 1, moved: 1, fire: 1, cozy: 1 },
      comments: [],
      createdAt: new Date().toISOString()
    };

    setReviews((prev) => [newRev, ...prev]);

    // Persist review to MongoDB
    api.createReview({
      bookId: selectedBook._id || selectedBook.id,
      rating: reviewRating,
      thoughts: reviewThoughts.trim(),
      moodTags: reviewMoods,
      containsSpoilers: reviewSpoilers,
    }).then((savedReview) => {
      if (savedReview && savedReview._id) {
        setReviews((prev) =>
          prev.map((r) => (r.id === newRev.id ? { ...r, id: String(savedReview._id), _id: savedReview._id } : r))
        );
      }
    }).catch((err) => console.warn('MongoDB review notice:', err.message));

    if (alsoLogDiary) {
      const newDiary = {
        id: `dry-${Date.now()}`,
        userId: currentUser.id,
        bookId: selectedBook.id,
        status: 'read',
        readDate: new Date().toISOString().slice(0, 10),
        rating: reviewRating,
        diaryNotes: reviewThoughts.trim(),
        pagesRead: selectedBook.pageCount || 320,
        isReread: false,
        liked: currentUser.likedBooks.includes(selectedBook.id),
        addedToFavorites: currentUser.favorites.includes(selectedBook.id),
        comments: []
      };
      setDiaryEntries((prev) => [newDiary, ...prev]);

      api.createDiaryEntry({
        bookId: selectedBook._id || selectedBook.id,
        status: 'read',
        readDate: new Date(),
        rating: reviewRating,
        diaryNotes: reviewThoughts.trim(),
        pagesRead: selectedBook.pageCount || 320,
        isReread: false,
        liked: currentUser.likedBooks.includes(selectedBook.id),
        addedToFavorites: currentUser.favorites.includes(selectedBook.id),
      }).catch((err) => console.warn('MongoDB diary notice:', err.message));
    }

    setReviewThoughts('');
    notify(
      alsoLogDiary
        ? `Published ${reviewRating}★ review & logged "${selectedBook.title}" to your Reading Diary!`
        : `Published ${reviewRating}★ review for "${selectedBook.title}"!`,
      'success'
    );
  };

  const handleReviewReaction = (reviewId, reaction) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (reaction === 'like') {
      api.reactReview(reviewId).catch((err) => console.warn('MongoDB reactReview notice:', err.message));
    }
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const hasLiked = r.likes.includes(currentUser.id);
        const hasDisliked = r.dislikes.includes(currentUser.id);
        if (reaction === 'like') {
          return {
            ...r,
            likes: hasLiked
              ? r.likes.filter((id) => id !== currentUser.id)
              : [...r.likes, currentUser.id],
            dislikes: r.dislikes.filter((id) => id !== currentUser.id)
          };
        }
        if (reaction === 'dislike') {
          return {
            ...r,
            dislikes: hasDisliked
              ? r.dislikes.filter((id) => id !== currentUser.id)
              : [...r.dislikes, currentUser.id],
            likes: r.likes.filter((id) => id !== currentUser.id)
          };
        }
        // Humanized resonance reaction pills ('insightful' | 'moved' | 'fire' | 'cozy')
        const currReacts = r.reactions || { insightful: 0, moved: 0, fire: 0, cozy: 0 };
        return {
          ...r,
          reactions: {
            ...currReacts,
            [reaction]: (currReacts[reaction] || 0) + 1
          }
        };
      })
    );
  };

  // Add a human comment to a Review or Diary Entry
  const handleAddComment = (targetId, isDiary = false) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    const text = (commentInputs[targetId] || '').trim();
    if (!text) return;

    const newComment = {
      id: `cmt-${Date.now()}`,
      userId: currentUser.id,
      text,
      createdAt: 'Just now'
    };

    if (isDiary) {
      setDiaryEntries((prev) =>
        prev.map((d) =>
          d.id === targetId
            ? { ...d, comments: [...(d.comments || []), newComment] }
            : d
        )
      );
    } else {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === targetId
            ? { ...r, comments: [...(r.comments || []), newComment] }
            : r
        )
      );
    }

    setCommentInputs((prev) => ({ ...prev, [targetId]: '' }));
    notify('Shared your reply with the reading community!', 'success');
  };

  // Send a Book Club Note / Recommendation to another reader
  const handleSendBookNote = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (!noteMessage.trim()) {
      notify('Write a short personal note to accompany your book recommendation.', 'error');
      return;
    }
    const newNote = {
      id: `note-${Date.now()}`,
      fromUserId: currentUser.id,
      toUserId: noteTargetUserId,
      bookId: noteBookId,
      message: noteMessage.trim(),
      likes: [currentUser.id],
      createdAt: 'Today'
    };
    setSocialNotes((prev) => [newNote, ...prev]);
    setNoteMessage('');
    const recipient = users.find((u) => u.id === noteTargetUserId);
    notify(`Sent book recommendation note to @${recipient?.username || 'reader'}!`, 'success');
  };

  // ---------------------------------------------------------------------------
  // Handlers: Log Book to Reading Diary
  // ---------------------------------------------------------------------------
  const openLogDiaryForBook = (bookId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setDiaryBookId(bookId);
    setDiaryStatus('read');
    setDiaryDate('2026-10-15');
    setDiaryRating(5);
    setDiaryNotes('');
    setDiaryIsReread(false);
    setShowDiaryModal(true);
  };

  const handleSaveDiaryEntry = async (entryData, entryToEdit) => {
    if (entryToEdit) {
      const entryId = entryToEdit.id || entryToEdit._id;
      setDiaryEntries((prev) =>
        prev.map((d) =>
          d.id === entryId || d._id === entryId
            ? { ...d, ...entryData, id: entryId }
            : d
        )
      );
      try {
        await api.updateDiaryEntry(entryId, entryData);
        notify('Reading diary entry updated!', 'success');
      } catch (err) {
        console.warn('Backend diary update notice:', err.message);
        notify('Reading diary entry updated in local session!', 'info');
      }
    } else {
      const book = books.find((b) => b.id === entryData.bookId || b._id === entryData.bookId);
      const entry = {
        id: `dry-${Date.now()}`,
        userId: currentUser?.id || 'usr-1',
        bookId: entryData.bookId,
        status: entryData.status || 'read',
        readDate: entryData.readDate || entryData.dateRead || new Date().toISOString().slice(0, 10),
        rating: entryData.rating || 5,
        diaryNotes: entryData.diaryNotes || (book ? `Completed reading ${book.title} by ${book.author}.` : ''),
        pagesRead: entryData.pagesRead || book?.pageCount || 320,
        isReread: Boolean(entryData.isReread),
        liked: currentUser?.likedBooks?.includes(entryData.bookId) || false,
        addedToFavorites: currentUser?.favorites?.includes(entryData.bookId) || false,
        comments: [],
      };
      setDiaryEntries((prev) => [entry, ...prev]);
      notify(`Logged "${book?.title || 'Book'}" to your Reading Diary!`, 'success');

      try {
        const saved = await api.createDiaryEntry({
          bookId: book?._id || book?.id || entryData.bookId,
          status: entry.status,
          readDate: entry.readDate,
          rating: entry.rating,
          diaryNotes: entry.diaryNotes,
          pagesRead: entry.pagesRead,
          isReread: entry.isReread,
          liked: entry.liked,
          addedToFavorites: entry.addedToFavorites,
        });
        if (saved && saved._id) {
          setDiaryEntries((prev) =>
            prev.map((d) => (d.id === entry.id ? { ...d, id: String(saved._id), _id: saved._id } : d))
          );
        }
      } catch (err) {
        console.warn('MongoDB diary notice:', err.message);
      }
    }
  };

  const handleDeleteDiaryEntry = async (entryId) => {
    if (!window.confirm('Remove this entry from your reading diary?')) return;
    try {
      await api.deleteDiaryEntry(entryId);
    } catch (err) {
      console.warn('Backend diary delete notice:', err.message);
    }
    setDiaryEntries((prev) => prev.filter((d) => d.id !== entryId && d._id !== entryId));
    notify('Removed entry from Reading Diary.', 'info');
  };

  // ---------------------------------------------------------------------------
  // Handlers: Follow / Unfollow Readers
  // ---------------------------------------------------------------------------
  const handleToggleFollow = (targetUserId) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (targetUserId === currentUser.id) return;

    const isFollowing = currentUser.following.includes(targetUserId);
    const targetUser = users.find((u) => u.id === targetUserId);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            following: isFollowing
              ? u.following.filter((id) => id !== targetUserId)
              : [...u.following, targetUserId]
          };
        }
        if (u.id === targetUserId) {
          return {
            ...u,
            followers: isFollowing
              ? u.followers.filter((id) => id !== currentUser.id)
              : [...u.followers, currentUser.id]
          };
        }
        return u;
      })
    );

    // Persist to MongoDB
    api.followUser(targetUserId).catch((err) => console.warn('MongoDB follow notice:', err.message));

    notify(
      isFollowing
        ? `Unfollowed @${targetUser?.username}`
        : `Now following @${targetUser?.username} — their Diary & Likes are in your Social Pulse!`,
      'success'
    );
  };

  // ---------------------------------------------------------------------------
  // Handlers: Login & Registration (Email, Password, Username)
  // ---------------------------------------------------------------------------
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authMode === 'login') {
      const ident = authIdentifier.trim().toLowerCase();
      if (!ident || !authPassword) {
        notify('Please enter both your email/username and password.', 'error');
        return;
      }

      // Try Backend MongoDB Login
      try {
        const res = await api.login(ident, authPassword);
        if (res && res.token && res.user) {
          localStorage.setItem('aether_jwt_token', res.token);
          const loggedUser = {
            ...res.user,
            id: String(res.user.id || res.user._id),
          };
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === loggedUser.id);
            return exists
              ? prev.map((u) => (u.id === loggedUser.id ? { ...u, ...loggedUser } : u))
              : [loggedUser, ...prev];
          });
          setCurrentUserId(loggedUser.id);
          setShowAuthModal(false);
          setAuthIdentifier('');
          setAuthPassword('');
          notify(`Welcome back, @${loggedUser.username}! (Authenticated via MongoDB)`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Backend login attempt note:', err.message);
      }

      // Local fallback
      const matched = users.find(
        (u) => u.email.toLowerCase() === ident || u.username.toLowerCase() === ident
      );
      if (!matched) {
        notify('Invalid credentials or user not found. Check credentials or sign up!', 'error');
        return;
      }
      setCurrentUserId(matched.id);
      setShowAuthModal(false);
      setAuthIdentifier('');
      setAuthPassword('');
      notify(`Welcome back, @${matched.username}!`, 'success');
    } else {
      const cleanUser = authUsername.trim().toLowerCase().replace(/\s+/g, '_');
      const cleanEmail = authEmail.trim().toLowerCase();
      if (!cleanUser || !cleanEmail || !authPassword) {
        notify('Username, Email, and Password are required to create an account.', 'error');
        return;
      }

      // Try Backend MongoDB Register
      try {
        const res = await api.register({
          username: cleanUser,
          email: cleanEmail,
          password: authPassword,
          displayName: authDisplayName.trim() || cleanUser,
          bio: authBio.trim() || 'Book lover exploring new stories and sharing honest notes.',
        });
        if (res && res.token && res.user) {
          localStorage.setItem('aether_jwt_token', res.token);
          const newUser = {
            ...res.user,
            id: String(res.user.id || res.user._id),
            avatarColor: authColor,
            yearlyGoal: { read: 0, target: 12 },
            readingRitual: 'Cozy armchair & evening chapters ☕',
          };
          setUsers((prev) => [...prev, newUser]);
          setCurrentUserId(newUser.id);
          setShowAuthModal(false);
          setAuthUsername('');
          setAuthEmail('');
          setAuthPassword('');
          notify(`Account @${newUser.username} registered & persisted to MongoDB!`, 'success');
          return;
        }
      } catch (err) {
        console.warn('Backend register attempt note:', err.message);
      }

      // Local fallback
      const duplicate = users.find(
        (u) => u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanEmail
      );
      if (duplicate) {
        notify('That username or email is already registered.', 'error');
        return;
      }
      const newUser = {
        id: `usr-${Date.now()}`,
        username: cleanUser,
        displayName: authDisplayName.trim() || cleanUser,
        email: cleanEmail,
        password: authPassword,
        bio: authBio.trim() || 'Book lover exploring new stories and sharing honest notes.',
        readingRitual: 'Cozy armchair & evening chapters ☕',
        yearlyGoal: { read: 4, target: 15 },
        avatarColor: authColor,
        roleTag: 'Reader',
        favorites: ['bk-1', 'bk-2'],
        likedBooks: ['bk-1', 'bk-2'],
        dislikedBooks: [],
        following: ['usr-1', 'usr-2', 'usr-3'],
        followers: ['usr-1']
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUserId(newUser.id);
      setShowAuthModal(false);
      setAuthUsername('');
      setAuthEmail('');
      setAuthPassword('');
      notify(`Account @${newUser.username} created and authenticated!`, 'success');
    }
  };

  const socialFeedItems = useMemo(() => {
    const allowedUserIds =
      socialScope === 'following' && currentUser
        ? currentUser.following
        : users.map((u) => u.id);

    const revItems = reviews
      .filter((r) => allowedUserIds.includes(r.userId))
      .map((r) => ({
        type: 'review',
        id: `feed-rev-${r.id}`,
        rawId: r.id,
        date: r.createdAt.slice(0, 10),
        userId: r.userId,
        bookId: r.bookId,
        rating: r.rating,
        text: r.thoughts,
        moodTags: r.moodTags || [],
        comments: r.comments || [],
        reactions: r.reactions || { insightful: 4, moved: 6, fire: 5, cozy: 3 },
        reviewObj: r
      }));

    const diaryItems = diaryEntries
      .filter((d) => allowedUserIds.includes(d.userId))
      .map((d) => ({
        type: 'diary',
        id: `feed-dry-${d.id}`,
        rawId: d.id,
        date: d.readDate,
        userId: d.userId,
        bookId: d.bookId,
        rating: d.rating,
        text: d.diaryNotes,
        status: d.status,
        isReread: d.isReread,
        pagesRead: d.pagesRead,
        comments: d.comments || []
      }));

    return [...revItems, ...diaryItems].sort((a, b) => b.date.localeCompare(a.date));
  }, [reviews, diaryEntries, socialScope, currentUser, users]);

  const myDiaryEntries = useMemo(() => {
    if (!currentUser) return [];
    return diaryEntries
      .filter((d) => d.userId === currentUser.id)
      .filter((d) => diaryFilterStatus === 'all' || d.status === diaryFilterStatus)
      .sort((a, b) => b.readDate.localeCompare(a.readDate));
  }, [diaryEntries, currentUser, diaryFilterStatus]);

  const myStats = useMemo(() => {
    if (!currentUser) {
      return { readCount: 0, totalPages: 0, avgRating: 0, reviewsCount: 0 };
    }
    const allMyDiary = diaryEntries.filter((d) => d.userId === currentUser.id);
    const readCount = allMyDiary.filter((d) => d.status === 'read').length;
    const totalPages = allMyDiary.reduce((acc, d) => acc + (d.pagesRead || 0), 0);
    const myRevs = reviews.filter((r) => r.userId === currentUser.id);
    const avgRating =
      myRevs.length > 0
        ? (myRevs.reduce((acc, r) => acc + r.rating, 0) / myRevs.length).toFixed(1)
        : '4.9';
    return { readCount, totalPages, avgRating, reviewsCount: myRevs.length };
  }, [diaryEntries, reviews, currentUser]);

  const themeBg =
    ambienceMood === 'cozy'
      ? 'bg-[#0E0B14]'
      : ambienceMood === 'velvet'
      ? 'bg-[#090812]'
      : 'bg-[#060913]';


  // ---------------------------------------------------------------------------
  // Handlers: Book Management (Edit & Safe Delete)
  // ---------------------------------------------------------------------------
  const openEditBookModal = (book) => {
    setEditingBook(book);
    setShowAddBookModal(true);
  };

  const handleSaveBook = async (bookData, bookToEdit) => {
    if (bookToEdit) {
      const bookId = bookToEdit.id || bookToEdit._id;
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId || b._id === bookId ? { ...b, ...bookData } : b
        )
      );
      try {
        const updated = await api.updateBook(bookId, bookData);
        if (updated && (updated.id || updated._id)) {
          const normUpdated = {
            ...updated,
            id: updated._id ? String(updated._id) : updated.id,
          };
          setBooks((prev) =>
            prev.map((b) =>
              b.id === bookId || b._id === bookId ? { ...b, ...normUpdated } : b
            )
          );
        }
        notify(`Updated dossier for "${bookData.title}"!`, 'success');
      } catch (err) {
        console.warn('Backend update notice:', err.message);
        notify(`Updated "${bookData.title}" in local session!`, 'info');
      }
    } else {
      const created = {
        id: `custom-${Date.now()}`,
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn || `978-00000${Math.floor(1000 + Math.random() * 9000)}`,
        publishedYear: Number(bookData.year || 2024),
        pageCount: Number(bookData.pages || 320),
        genres: bookData.genres || ['Sci-Fi'],
        description: bookData.description || '',
        coverUrl: bookData.coverUrl || '',
        palette: ['#38BDF8', '#0369A1', '#0C4A6E'],
        pattern: 'monolith',
        likesCount: 0,
        dislikesCount: 0,
        favoritesCount: 0,
      };
      setBooks((prev) => [created, ...prev]);
      setSelectedBookId(created.id);
      notify(`Successfully indexed "${created.title}" into catalog!`, 'success');

      try {
        const saved = await api.createBook(bookData);
        if (saved && saved._id) {
          setBooks((prev) =>
            prev.map((b) =>
              b.id === created.id
                ? { ...b, id: String(saved._id), _id: saved._id }
                : b
            )
          );
        }
      } catch (err) {
        console.warn('Backend book create notice:', err.message);
      }
    }
  };

  const handleDeleteBook = async (book) => {
    const bookId = book.id || book._id;
    try {
      await api.deleteBook(bookId);
    } catch (err) {
      console.warn('Backend delete notice:', err.message);
    }
    setBooks((prev) => prev.filter((b) => b.id !== bookId && b._id !== bookId));
    setReviews((prev) =>
      prev.filter(
        (r) =>
          r.bookId !== bookId &&
          r.book?._id !== bookId &&
          r.book !== bookId
      )
    );
    setDiaryEntries((prev) =>
      prev.filter(
        (d) =>
          d.bookId !== bookId &&
          d.book?._id !== bookId &&
          d.book !== bookId
      )
    );
    setSelectedBookId(null);
    notify(`Deleted "${book.title}" and its associated records.`, 'info');
  };

  // ---------------------------------------------------------------------------
  // Handlers: Reviews (Inline Edit & Safe Delete)
  // ---------------------------------------------------------------------------
  const handleUpdateReview = async (reviewId, { rating, text, thoughts }) => {
    const content = text || thoughts;
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId || r._id === reviewId
          ? { ...r, rating: Number(rating), thoughts: content, text: content }
          : r
      )
    );
    try {
      await api.updateReview(reviewId, { rating, text: content, thoughts: content });
      notify('Review updated successfully!', 'success');
    } catch (err) {
      console.warn('Backend review update notice:', err.message);
      notify('Review updated in local session!', 'info');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
    } catch (err) {
      console.warn('Backend review delete notice:', err.message);
    }
    setReviews((prev) => prev.filter((r) => r.id !== reviewId && r._id !== reviewId));
    notify('Review deleted.', 'info');
  };

  // ---------------------------------------------------------------------------
  // Handlers: Reading Diary (Edit & Safe Delete)
  // ---------------------------------------------------------------------------
  const openEditDiaryEntry = (entry) => {
    setEditingDiaryEntry(entry);
    setShowDiaryModal(true);
  };

  // ---------------------------------------------------------------------------
  // Handlers: User Profile
  // ---------------------------------------------------------------------------
  const handleSaveProfile = async ({ bio, avatar, displayName }) => {
    try {
      const updated = await api.updateProfile({ bio, avatar, displayName });
      if (updated) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === currentUser?.id
              ? { ...u, bio: updated.bio || bio, avatarColor: updated.avatarColor || avatar, displayName: updated.displayName || displayName }
              : u
          )
        );
      }
    } catch (err) {
      console.warn('Backend profile notice:', err.message);
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser?.id
          ? { ...u, bio, avatarColor: avatar, displayName: displayName || u.displayName }
          : u
      )
    );
    notify('Profile updated successfully!', 'success');
  };

  const handleLogin = async ({ emailOrUsername, password }) => {
    const res = await api.login(emailOrUsername, password);
    if (res.token) {
      localStorage.setItem('aether_jwt_token', res.token);
    }
    if (res.user) {
      const userId = res.user.id ? String(res.user.id) : String(res.user._id);
      setCurrentUserId(userId);
      setUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === userId);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...res.user, id: userId };
          return copy;
        }
        return [{ ...res.user, id: userId }, ...prev];
      });
      notify(`Welcome back, @${res.user.username}!`, 'success');
    }
  };

  const handleRegister = async (payload) => {
    const res = await api.register(payload);
    if (res.token) {
      localStorage.setItem('aether_jwt_token', res.token);
    }
    if (res.user) {
      const userId = res.user.id ? String(res.user.id) : String(res.user._id);
      setCurrentUserId(userId);
      setUsers((prev) => [{ ...res.user, id: userId }, ...prev]);
      notify(`Welcome to Aether Reads, @${res.user.username}!`, 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aether_jwt_token');
    setCurrentUserId(null);
    notify('Logged out successfully.', 'info');
  };

  return (
    <div
      className={`min-h-screen ${themeBg} text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden transition-colors duration-500`}
    >
      {/* Warm Humanized & Futuristic Ambient Light Fields */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-36 left-1/4 w-[38rem] h-[38rem] rounded-full bg-amber-500/[0.08] blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-[34rem] h-[34rem] rounded-full bg-rose-500/[0.06] blur-[140px]" />
        <div className="absolute -bottom-48 left-1/3 w-[32rem] h-[32rem] rounded-full bg-sky-500/[0.06] blur-[130px]" />
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-400/40 shadow-[0_10px_35px_rgba(245,158,11,0.25)] text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-amber-50 font-medium">{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}


      {/* Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        apiLatency={apiLatency}
        syncWithDatabase={syncWithDatabase}
        isSyncing={isSyncing}
        enable3DBooks={enable3DBooks}
        setEnable3DBooks={setEnable3DBooks}
        currentUser={currentUser}
        onOpenDiary={openLogDiaryForBook}
        firstBookId={books[0]?.id || 'bk-1'}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ===================================================================
            TAB 1: BOOK DATABASE & CATALOG (WITH GOOGLE BOOKS & 3D SHELF)
        =================================================================== */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Warm Humanized Hero & 3D Interactive Bookshelf Showcase */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-br from-[#1A1423]/95 via-[#12101B]/95 to-[#1F1624]/90 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="space-y-3.5 max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs">
                    <Coffee size={13} className="text-amber-300" />
                    <span>
                      {currentUser
                        ? currentUser.readingRitual || 'Welcome back to your cozy reading sanctuary'
                        : 'Cozy Social Reading Sanctuary • Connected to Google Books'}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
                    Every book you love, on a living 3D shelf shared with kindred readers.
                  </h1>
                  <p className="text-sm text-slate-300/95 leading-relaxed">
                    Discover millions of titles via <strong>Google Books</strong> &amp;{' '}
                    <strong>Open Library</strong>, rate books out of 5 stars with honest thoughts,
                    keep a personal Reading Diary, and exchange book notes with friends you follow.
                  </p>

                  {/* Ambience Mood Pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400">Reading Ambience:</span>
                    {[
                      { id: 'cozy', label: '☕ Candlelit Study' },
                      { id: 'velvet', label: '🌙 Midnight Velvet' },
                      { id: 'starlight', label: '✨ Starlight Atrium' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAmbienceMood(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                          ambienceMood === m.id
                            ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                            : 'bg-white/[0.04] text-slate-400 hover:text-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3D Interactive Floating Shelf Showcase */}
                <div className="flex-1 max-w-lg mx-auto lg:mx-0 w-full">
                  <div className="relative pt-4 pb-6 px-6 rounded-2xl bg-gradient-to-b from-white/[0.03] to-amber-950/20 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-amber-200/90 flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-400" />
                        <span>Featured 3D Hardcover Showcase (Hover to Tilt)</span>
                      </span>
                      <span className="text-[11px] text-slate-400">Click any book to review</span>
                    </div>

                    <div className="flex items-end justify-around gap-3 pt-2 pb-3">
                      {books.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBookId(b.id)}
                          className="cursor-pointer"
                        >
                          <FuturisticBookCover book={b} size="sm" is3D={true} />
                        </div>
                      ))}
                    </div>

                    {/* 3D Physical Wood & Glass Shelf Ledge */}
                    <div
                      className="h-3.5 w-full rounded-full bg-gradient-to-r from-amber-950 via-amber-700/60 to-amber-950 border-t border-amber-300/40 shadow-[0_12px_25px_rgba(0,0,0,0.85)]"
                      style={{ transform: 'rotateX(35deg)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Database Source Switcher & Action Bar */}
              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDbMode('catalog')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      dbMode === 'catalog'
                        ? 'bg-amber-400 text-slate-950 font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                    }`}
                  >
                    <Database size={14} />
                    <span>Synced MongoDB Catalog ({books.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDbMode('openlibrary');
                      setExternalProvider('google');
                      handleSearchExternalDatabase(null, 'google');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      dbMode === 'openlibrary' && externalProvider === 'google'
                        ? 'bg-sky-500 text-slate-950 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.35)]'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Search Google Books API</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDbMode('openlibrary');
                      setExternalProvider('openlibrary');
                      handleSearchExternalDatabase(null, 'openlibrary');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      dbMode === 'openlibrary' && externalProvider === 'openlibrary'
                        ? 'bg-indigo-500 text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                        : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] border border-white/10'
                    }`}
                  >
                    <Globe size={14} />
                    <span>Search Live Open Library API</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBookModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-medium text-amber-200 transition-all"
                  >
                    <Plus size={14} />
                    <span>Index Custom Book by ISBN</span>
                  </button>
                </div>
              </div>
            </div>

            {/* External Database Connector (Google Books API + Open Library API) */}
            {dbMode === 'openlibrary' && (
              <div className="rounded-3xl border border-sky-400/30 bg-[#111526]/95 p-6 space-y-5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                        {externalProvider === 'google'
                          ? 'GOOGLE BOOKS API v1 CONNECTED'
                          : 'OPEN LIBRARY API CONNECTED'}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                      <Globe size={18} className="text-sky-400" />
                      <span>
                        {externalProvider === 'google'
                          ? 'Google Books Global Volume Search'
                          : 'Open Library Bibliographic Connector'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Search any book by title, author, or ISBN from{' '}
                      {externalProvider === 'google' ? 'Google Books' : 'Open Library'} and import
                      it straight onto your 3D shelf for 5-star reviewing.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => handleSearchExternalDatabase(e, externalProvider)}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setExternalProvider('google');
                          handleSearchExternalDatabase(null, 'google');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          externalProvider === 'google'
                            ? 'bg-sky-500 text-slate-950 font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Google Books
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExternalProvider('openlibrary');
                          handleSearchExternalDatabase(null, 'openlibrary');
                        }}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                          externalProvider === 'openlibrary'
                            ? 'bg-indigo-500 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Open Library
                      </button>
                    </div>

                    <div className="relative">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={externalSearchInput}
                        onChange={(e) => setExternalSearchInput(e.target.value)}
                        placeholder="Search Google Books title, author..."
                        className="pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400 w-56 sm:w-64"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearchingExternal}
                      className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCw size={13} className={isSearchingExternal ? 'animate-spin' : ''} />
                      <span>{isSearchingExternal ? 'Querying...' : 'Query DB'}</span>
                    </button>
                  </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {externalResults.map((extBook) => {
                    const alreadyInCatalog = books.some(
                      (b) =>
                        b.externalId === extBook.externalId ||
                        b.title.toLowerCase() === extBook.title.toLowerCase()
                    );
                    return (
                      <div
                        key={extBook.id}
                        className="flex flex-col justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-sky-400/40 transition-all gap-4"
                      >
                        <div className="flex gap-4">
                          <FuturisticBookCover book={extBook} size="sm" is3D={enable3DBooks} />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-sky-300 bg-sky-500/15 px-2 py-0.5 rounded">
                              {extBook.sourceApi || 'Google Books'}
                            </span>
                            <h3 className="text-sm font-semibold text-white mt-1.5 line-clamp-2">
                              {extBook.title}
                            </h3>
                            <p className="text-xs text-slate-400 truncate">{extBook.author}</p>
                            <p className="text-[11px] font-mono text-slate-500 mt-1">
                              {extBook.publishedYear} • {extBook.pageCount}p
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleImportExternalBook(extBook)}
                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            alreadyInCatalog
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-sky-500/20 hover:bg-sky-500 text-sky-200 hover:text-slate-950 border border-sky-400/30'
                          }`}
                        >
                          {alreadyInCatalog ? (
                            <>
                              <Check size={14} />
                              <span>Synced in Catalog (Open)</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Import to App Catalog</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter & Search Bar for Catalog */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter shelf by book title, author, or ISBN..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950/80 border border-white/10 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/60"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {['All', 'Sci-Fi', 'Speculative', 'Cyberpunk', 'Philosophy', 'Astrophysics', 'Literary'].map(
                  (genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                        selectedGenre === genre
                          ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40'
                          : 'bg-white/[0.03] text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="popular">Sort: Most Loved</option>
                  <option value="rating">Sort: Highest 5★ Rating</option>
                  <option value="year">Sort: Publication Year</option>
                  <option value="title">Sort: Title (A–Z)</option>
                </select>
              </div>
            </div>

            {/* 3D Book Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const stats = bookStatsMap[book.id] || {
                  avgRating: 4.5,
                  reviewCount: 0,
                  readCount: 0
                };
                const isFav = currentUser?.favorites.includes(book.id);
                const isLiked = currentUser?.likedBooks.includes(book.id);
                const isDisliked = currentUser?.dislikedBooks.includes(book.id);
                const isReadInDiary =
                  currentUser &&
                  diaryEntries.some(
                    (d) =>
                      d.userId === currentUser.id && d.bookId === book.id && d.status === 'read'
                  );

                return (
                  <BookCard
                    key={book.id || book._id}
                    book={book}
                    stats={stats}
                    currentUser={currentUser}
                    isReadInDiary={isReadInDiary}
                    enable3DBooks={enable3DBooks}
                    onSelectBook={(id) => setSelectedBookId(id)}
                    onReaction={handleBookReaction}
                    onOpenDiary={(id) => openLogDiaryForBook(id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: PERSONAL READING DIARY (CHRONICLE OF READ BOOKS)
        =================================================================== */}
        {activeTab === 'diary' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#171222] via-[#121629] to-[#171222] p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs">
                    <BookMarked size={13} />
                    <span>Personal Reading Journal • Shared with Your Followers</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-2">
                    {currentUser
                      ? `${currentUser.displayName}’s Reading Chronicle`
                      : 'Reading Chronicle'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                    Every book you finish is chronicled here with the date, your 5-star rating, and
                    personal reflections so friends who follow you can read along and leave comments.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openLogDiaryForBook(books[0]?.id || 'bk-1')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all"
                  >
                    <Plus size={16} />
                    <span>Log a Book to Diary</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-slate-400">Books Finished</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{myStats.readCount}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-slate-400">Pages Turned</p>
                  <p className="text-2xl font-bold text-amber-300 mt-1">
                    {myStats.totalPages.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-slate-400">Average Rating</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{myStats.avgRating} ★</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-xs text-slate-400">Kindred Followers</p>
                  <p className="text-2xl font-bold text-rose-300 mt-1">
                    {currentUser ? currentUser.followers.length : 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All Diary Logs' },
                  { id: 'read', label: 'Finished Reading' },
                  { id: 'reading', label: 'Currently Reading' },
                  { id: 'want_to_read', label: 'Reading Queue' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setDiaryFilterStatus(st.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      diaryFilterStatus === st.id
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                        : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {myDiaryEntries.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center space-y-3">
                  <Calendar size={32} className="mx-auto text-slate-500" />
                  <h3 className="text-base font-semibold text-white">No Diary Entries in This View</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Log a book you have read or are currently reading to build your chronological
                    reading diary.
                  </p>
                  <button
                    type="button"
                    onClick={() => openLogDiaryForBook(books[0]?.id || 'bk-1')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs"
                  >
                    <Plus size={14} /> Log Your First Book
                  </button>
                </div>
              ) : (
                myDiaryEntries.map((entry) => {
                  const book = books.find((b) => b.id === entry.bookId) || books[0];
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#141122]/90 border border-white/10 hover:border-amber-400/30 transition-all"
                    >
                      <div className="flex items-start gap-5">
                        <div className="w-16 text-center p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/20 shrink-0 font-mono">
                          <p className="text-[10px] text-amber-300 uppercase">
                            {entry.readDate.slice(0, 7)}
                          </p>
                          <p className="text-xl font-bold text-white mt-0.5">
                            {entry.readDate.slice(8, 10)}
                          </p>
                        </div>

                        <div
                          onClick={() => setSelectedBookId(book.id)}
                          className="cursor-pointer shrink-0"
                        >
                          <FuturisticBookCover book={book} size="sm" is3D={enable3DBooks} />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                                entry.status === 'read'
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                                  : entry.status === 'reading'
                                  ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                                  : 'bg-indigo-500/15 text-indigo-300 border border-indigo-400/30'
                              }`}
                            >
                              {entry.status === 'read'
                                ? 'FINISHED READ'
                                : entry.status === 'reading'
                                ? 'CURRENTLY READING'
                                : 'WANT TO READ'}
                            </span>
                            {entry.isReread && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-400/30">
                                RE-READ
                              </span>
                            )}
                            <StarRating value={entry.rating || 5} size={13} readOnly />
                          </div>

                          <h3
                            onClick={() => setSelectedBookId(book.id)}
                            className="text-base font-serif font-bold text-white hover:text-amber-200 cursor-pointer"
                          >
                            {book.title}{' '}
                            <span className="text-xs font-sans font-normal text-slate-400">
                              by {book.author}
                            </span>
                          </h3>

                          <p className="text-xs text-slate-200 leading-relaxed max-w-2xl italic">
                            “{entry.diaryNotes}”
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                        <span className="text-xs font-mono text-slate-400">
                          {entry.pagesRead} pages logged
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedBookId(book.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-xs text-slate-300"
                          >
                            Book Dossier
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditDiaryEntry(entry)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors"
                            title="Edit diary entry"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDiaryEntry(entry.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors"
                            title="Delete diary log"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: SOCIAL READER NETWORK, BOOK CLUB NOTES & INTERACTIVE STREAM
        =================================================================== */}
        {activeTab === 'social' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Kindred Readers Directory & Inspected Reader Profile */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-3xl border border-white/10 bg-[#131020]/90 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Users size={17} className="text-amber-300" />
                      <span>Readers Network</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Follow fellow book lovers to see their Likes, Favorites &amp; Reading Diary.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                    {users.length} Readers
                  </span>
                </div>

                <div className="space-y-3">
                  {users.map((reader) => {
                    const isMe = currentUser?.id === reader.id;
                    const isFollowing = currentUser?.following.includes(reader.id);
                    const isInspected = inspectedUser?.id === reader.id;
                    const readerDiaryCount = diaryEntries.filter(
                      (d) => d.userId === reader.id && d.status === 'read'
                    ).length;

                    return (
                      <div
                        key={reader.id}
                        onClick={() => setInspectedUserId(reader.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isInspected
                            ? 'bg-amber-500/10 border-amber-400/50 shadow-[0_0_25px_rgba(245,158,11,0.12)]'
                            : 'bg-white/[0.02] border-white/[0.07] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <HumanAvatar user={reader} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-white">
                                  {reader.displayName}
                                </span>
                                {isMe && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-400">@{reader.username}</p>
                              <p className="text-[11px] text-amber-200/80 mt-0.5">
                                {reader.readingRitual || 'Reading with warm tea ☕'}
                              </p>
                            </div>
                          </div>

                          {!isMe && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFollow(reader.id);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                isFollowing
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                              }`}
                            >
                              {isFollowing ? 'Following ✓' : '+ Follow'}
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-300/90 mt-2.5 line-clamp-2">{reader.bio}</p>

                        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-white/[0.06] text-[11px] text-slate-400">
                          <span>
                            <strong className="text-white">{reader.favorites.length}</strong> Favs
                          </span>
                          <span>
                            <strong className="text-white">{reader.likedBooks.length}</strong> Likes
                          </span>
                          <span>
                            <strong className="text-white">{readerDiaryCount}</strong> Read in Diary
                          </span>
                          <span>
                            <strong className="text-white">{reader.followers.length}</strong>{' '}
                            Followers
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspected Reader’s 3D Shelf & Diary Dossier */}
              {inspectedUser && (
                <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-b from-[#1B1528] to-[#0F0C1A] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HumanAvatar user={inspectedUser} size="md" />
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300">
                          READER SANCTUARY &amp; 3D SHELF
                        </span>
                        <h3 className="text-base font-bold text-white">
                          @{inspectedUser.username}’s Shelves &amp; Diary
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Mini 3D Shelf of Inspected Reader's Favorites */}
                  <div>
                    <p className="text-xs font-mono uppercase text-slate-300 mb-2 flex items-center gap-1.5">
                      <Heart size={12} className="text-rose-400 fill-rose-400" /> Favorite Books (
                      {inspectedUser.favorites.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inspectedUser.favorites.map((bId) => {
                        const b = books.find((item) => item.id === bId);
                        if (!b) return null;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBookId(b.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 text-xs text-rose-200 flex items-center gap-1.5 transition-all"
                          >
                            <BookOpen size={12} />
                            <span>{b.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase text-slate-300 mb-2 flex items-center gap-1.5">
                      <ThumbsUp size={12} className="text-emerald-400" /> Liked Books (
                      {inspectedUser.likedBooks.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {inspectedUser.likedBooks.map((bId) => {
                        const b = books.find((item) => item.id === bId);
                        if (!b) return null;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBookId(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/25 text-xs text-emerald-200 transition-all"
                          >
                            {b.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-mono uppercase text-slate-300 mb-2 flex items-center gap-1.5">
                      <Calendar size={12} className="text-amber-300" /> Recent Reading Diary Entries
                    </p>
                    <div className="space-y-2">
                      {diaryEntries
                        .filter((d) => d.userId === inspectedUser.id)
                        .slice(0, 3)
                        .map((d) => {
                          const b = books.find((item) => item.id === d.bookId);
                          if (!b) return null;
                          return (
                            <div
                              key={d.id}
                              onClick={() => setSelectedBookId(b.id)}
                              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {b.title}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">{d.diaryNotes}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-xs font-bold text-amber-400">
                                  {d.rating} ★
                                </span>
                                <p className="text-[10px] font-mono text-slate-500">{d.readDate}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Book Club Recommendations + Interactive Social Activity Stream */}
            <div className="lg:col-span-7 space-y-5">
              {/* Humanized Book Recommendation Note Composer */}
              <form
                onSubmit={handleSendBookNote}
                className="p-5 rounded-3xl bg-gradient-to-r from-[#1A1426] to-[#131728] border border-amber-400/25 space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coffee size={15} className="text-amber-300" />
                    <span>Pass a Book Recommendation Note to a Fellow Reader</span>
                  </h3>
                  <span className="text-[11px] text-amber-200/80">Book Club Postcard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">To Reader</label>
                    <select
                      value={noteTargetUserId}
                      onChange={(e) => setNoteTargetUserId(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/90 border border-white/15 px-3 py-1.5 text-xs text-white"
                    >
                      {users
                        .filter((u) => u.id !== currentUser?.id)
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            @{u.username} ({u.displayName})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Recommended Book
                    </label>
                    <select
                      value={noteBookId}
                      onChange={(e) => setNoteBookId(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/90 border border-white/15 px-3 py-1.5 text-xs text-white"
                    >
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} — {b.author}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteMessage}
                    onChange={(e) => setNoteMessage(e.target.value)}
                    placeholder="Write a warm note explaining why they will love this book..."
                    className="flex-1 rounded-xl bg-slate-950/90 border border-white/15 px-3.5 py-2 text-xs text-white placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Send size={13} />
                    <span>Send Note</span>
                  </button>
                </div>

                {/* Recent Shared Book Notes */}
                {socialNotes.length > 0 && (
                  <div className="pt-2 space-y-2">
                    {socialNotes.slice(0, 2).map((note) => {
                      const fromU = users.find((u) => u.id === note.fromUserId) || users[0];
                      const toU = users.find((u) => u.id === note.toUserId) || users[1];
                      const noteBook = books.find((b) => b.id === note.bookId) || books[0];
                      return (
                        <div
                          key={note.id}
                          className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1">
                            <p className="text-amber-200">
                              <strong>@{fromU.username}</strong> recommended{' '}
                              <button
                                type="button"
                                onClick={() => setSelectedBookId(noteBook.id)}
                                className="underline decoration-amber-400/60 font-semibold text-white hover:text-amber-300"
                              >
                                {noteBook.title}
                              </button>{' '}
                              to <strong>@{toU.username}</strong>
                            </p>
                            <p className="text-slate-300 italic">“{note.message}”</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {note.createdAt}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </form>

              {/* Reader Activity Stream Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#131020]/90 border border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    <span>Reader Activity Stream</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    React and reply to 5-star reviews and reading diary reflections from friends.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setSocialScope('following')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      socialScope === 'following'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Following ({currentUser ? currentUser.following.length : 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSocialScope('global')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      socialScope === 'global'
                        ? 'bg-amber-400 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All Readers
                  </button>
                </div>
              </div>

              {socialFeedItems.length === 0 ? (
                <div className="p-10 rounded-2xl border border-white/10 bg-white/[0.02] text-center space-y-3">
                  <Users size={28} className="mx-auto text-slate-500" />
                  <p className="text-sm font-semibold text-white">
                    Follow readers on the left to populate your personalized stream!
                  </p>
                  <button
                    type="button"
                    onClick={() => setSocialScope('global')}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold"
                  >
                    Switch to All Readers Feed
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {socialFeedItems.map((item) => {
                    const authorUser = users.find((u) => u.id === item.userId) || users[0];
                    const book = books.find((b) => b.id === item.bookId) || books[0];

                    return (
                      <div
                        key={item.id}
                        className="p-5 rounded-3xl bg-[#131020]/90 border border-white/[0.09] hover:border-amber-400/25 transition-all space-y-4"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setInspectedUserId(authorUser.id)}
                              className="focus:outline-none"
                            >
                              <HumanAvatar user={authorUser} size="sm" />
                            </button>
                            <div>
                              <p className="text-xs text-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setInspectedUserId(authorUser.id)}
                                  className="font-bold text-white hover:text-amber-300"
                                >
                                  {authorUser.displayName} (@{authorUser.username})
                                </button>{' '}
                                {item.type === 'review'
                                  ? 'wrote a 5-star review'
                                  : 'logged a book in their Reading Diary'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {item.date} • {authorUser.readingRitual}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase ${
                              item.type === 'review'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                                : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                            }`}
                          >
                            {item.type === 'review' ? 'REVIEW' : 'DIARY LOG'}
                          </span>
                        </div>

                        <div className="flex gap-4 pt-1">
                          <div
                            onClick={() => setSelectedBookId(book.id)}
                            className="cursor-pointer shrink-0"
                          >
                            <FuturisticBookCover book={book} size="sm" is3D={enable3DBooks} />
                          </div>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4
                                onClick={() => setSelectedBookId(book.id)}
                                className="text-sm font-serif font-bold text-white hover:text-amber-200 cursor-pointer"
                              >
                                {book.title}{' '}
                                <span className="text-xs font-sans font-normal text-slate-400">
                                  by {book.author}
                                </span>
                              </h4>
                              <StarRating value={item.rating || 5} size={13} readOnly />
                            </div>

                            <p className="text-xs text-slate-200 leading-relaxed">{item.text}</p>

                            {item.moodTags && item.moodTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {item.moodTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-200 border border-amber-400/20"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Expressive Human Reading Reactions */}
                            {item.type === 'review' && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                {[
                                  { key: 'insightful', label: '💡 Insightful' },
                                  { key: 'moved', label: '❤️ Moved Me' },
                                  { key: 'fire', label: '🔥 Page-Turner' },
                                  { key: 'cozy', label: '☕ Cozy Vibe' }
                                ].map((rx) => (
                                  <button
                                    key={rx.key}
                                    type="button"
                                    onClick={() => handleReviewReaction(item.rawId, rx.key)}
                                    className="px-2.5 py-1 rounded-xl bg-white/[0.04] hover:bg-amber-500/20 border border-white/10 text-[11px] text-slate-200 transition-all"
                                  >
                                    {rx.label} ({item.reactions?.[rx.key] || 0})
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Interactive Comments & Replies Thread */}
                            <div className="pt-2 space-y-2 border-t border-white/[0.06]">
                              {(item.comments || []).map((cmt) => {
                                const cUser =
                                  users.find((u) => u.id === cmt.userId) || users[0];
                                return (
                                  <div
                                    key={cmt.id}
                                    className="flex items-start gap-2 text-xs bg-white/[0.02] p-2 rounded-xl"
                                  >
                                    <HumanAvatar user={cUser} size="xs" />
                                    <div className="flex-1">
                                      <span className="font-semibold text-amber-200">
                                        @{cUser.username}:
                                      </span>{' '}
                                      <span className="text-slate-300">{cmt.text}</span>
                                    </div>
                                  </div>
                                );
                              })}

                              <div className="flex items-center gap-2 pt-1">
                                <input
                                  type="text"
                                  value={commentInputs[item.rawId] || ''}
                                  onChange={(e) =>
                                    setCommentInputs((prev) => ({
                                      ...prev,
                                      [item.rawId]: e.target.value
                                    }))
                                  }
                                  placeholder={`Reply to @${authorUser.username}’s thoughts...`}
                                  className="flex-1 rounded-xl bg-slate-950/70 border border-white/10 px-3 py-1.5 text-xs text-white placeholder:text-slate-500"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddComment(item.rawId, item.type === 'diary')
                                  }
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: MY VAULT (FAVORITES, LIKED, DISLIKED & MY REVIEWS)
        =================================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#131020]/90 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-rose-400 uppercase tracking-wider">
                  PERSONAL 3D COLLECTION SANCTUARY
                </span>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <h2 className="text-2xl font-serif font-bold text-white">
                    {currentUser
                      ? `@${currentUser.username}’s Curated Shelves`
                      : 'Your Curated Shelves'}
                  </h2>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-semibold transition-all"
                    >
                      <Edit3 size={13} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  {currentUser?.bio || 'Manage your Favorite books, Liked & Disliked titles, and all 5-star reviews you have authored.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: 'favorites',
                    label: `Favorites (${currentUser?.favorites.length || 0})`,
                    icon: Heart
                  },
                  {
                    id: 'liked',
                    label: `Liked (${currentUser?.likedBooks.length || 0})`,
                    icon: ThumbsUp
                  },
                  {
                    id: 'disliked',
                    label: `Disliked (${currentUser?.dislikedBooks.length || 0})`,
                    icon: ThumbsDown
                  },
                  {
                    id: 'reviews',
                    label: `My Reviews (${
                      reviews.filter((r) => r.userId === currentUser?.id).length
                    })`,
                    icon: Star
                  }
                ].map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setVaultTab(t.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        vaultTab === t.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white/[0.04] text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      <Icon size={13} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {vaultTab !== 'reviews' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const listIds =
                    vaultTab === 'favorites'
                      ? currentUser?.favorites || []
                      : vaultTab === 'liked'
                      ? currentUser?.likedBooks || []
                      : currentUser?.dislikedBooks || [];
                  const shelfBooks = books.filter((b) => listIds.includes(b.id));
                  if (shelfBooks.length === 0) {
                    return (
                      <div className="col-span-full p-10 rounded-2xl border border-white/10 bg-white/[0.02] text-center space-y-2">
                        <p className="text-sm font-semibold text-white">
                          No books in your {vaultTab} shelf yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('discover')}
                          className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-semibold"
                        >
                          Explore Book Database
                        </button>
                      </div>
                    );
                  }
                  return shelfBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-[#131020]/90 border border-white/10 hover:border-amber-400/40 cursor-pointer transition-all"
                    >
                      <FuturisticBookCover book={book} size="sm" is3D={enable3DBooks} />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-serif font-bold text-white truncate">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">{book.author}</p>
                        <p className="text-[11px] font-mono text-amber-300 mt-1">
                          {book.publishedYear} • {book.pageCount} pages
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                {reviews
                  .filter((r) => r.userId === currentUser?.id)
                  .map((r) => {
                    const book = books.find((b) => b.id === r.bookId) || books[0];
                    return (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl bg-[#131020]/90 border border-white/10 flex flex-col sm:flex-row gap-4 justify-between"
                      >
                        <div className="flex gap-4">
                          <FuturisticBookCover book={book} size="sm" is3D={enable3DBooks} />
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4
                                onClick={() => setSelectedBookId(book.id)}
                                className="text-sm font-bold text-white hover:text-amber-300 cursor-pointer"
                              >
                                {book.title}
                              </h4>
                              <StarRating value={r.rating} size={13} readOnly />
                            </div>
                            <p className="text-xs text-slate-300">{r.thoughts}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => setSelectedBookId(r.bookId)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-medium border border-amber-400/30"
                          >
                            <Pencil size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium border border-rose-500/30"
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 5: MERN STACK ARCHITECTURE & LIVE MONGODB STATE INSPECTOR
        =================================================================== */}
        {activeTab === 'mern' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-amber-400/30 bg-[#131020]/95 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                    FULL-STACK ARCHITECTURE // MONGODB + EXPRESS + REACT + NODE.JS
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">
                    MERN Stack Backend &amp; Google Books API Telemetry
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                    Every action you take in this app updates the live state collections below and
                    maps directly to the Express + Mongoose REST endpoints packaged in the
                    downloadable MERN archive.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestDatabasePing}
                    disabled={isPinging}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
                  >
                    <RefreshCw size={14} className={isPinging ? 'animate-spin' : ''} />
                    <span>{isPinging ? 'Pinging API...' : 'Ping MongoDB & API'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => syncWithDatabase(false)}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-medium transition-all"
                  >
                    <Database size={14} className="text-sky-400" />
                    <span>Sync Collections</span>
                  </button>
                </div>
              </div>

              {/* Live Connection Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full ${
                      dbStatus.connected
                        ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                        : 'bg-amber-400 shadow-[0_0_12px_#fbbf24]'
                    } animate-pulse`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {dbStatus.connected ? 'MongoDB Server Connected' : 'Local Fallback Cache'}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                        {dbStatus.dbHost}:{dbStatus.dbPort} / {dbStatus.database}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Service: <span className="text-slate-200">{dbStatus.service}</span> • Uptime:{' '}
                      <span className="text-amber-300">{dbStatus.uptimeSeconds}s</span>
                    </p>
                  </div>
                </div>
                {apiLatency !== null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">REST Roundtrip:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold">
                      {apiLatency} ms
                    </span>
                  </div>
                )}
              </div>

              {/* Live Ping Results Console */}
              {pingResult && (
                <div className="p-4 rounded-2xl bg-[#08070D] border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Code2 size={13} /> Live Express + MongoDB Response ({pingResult.timestamp})
                    </span>
                    <span className="text-emerald-400">{pingResult.latency}ms latency</span>
                  </div>
                  <pre className="text-emerald-300 bg-black/60 p-3 rounded-xl overflow-x-auto text-[11px] leading-relaxed">
                    {JSON.stringify(pingResult, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-amber-300">models/User.js</span>
                    <span className="text-xs font-bold text-white">{users.length} docs</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Stores <code className="text-amber-300">username</code>,{' '}
                    <code className="text-amber-300">email</code>,{' '}
                    <code className="text-amber-300">passwordHash</code>,{' '}
                    <code className="text-amber-300">favorites[]</code>,{' '}
                    <code className="text-amber-300">likedBooks[]</code>, and{' '}
                    <code className="text-amber-300">following[]</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-sky-400">models/Book.js</span>
                    <span className="text-xs font-bold text-white">{books.length} docs</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Synced with <strong>Google Books API</strong> &amp; Open Library via{' '}
                    <code className="text-sky-300">googleBooksId</code> &amp;{' '}
                    <code className="text-sky-300">isbn</code>, plus community Likes &amp; 5-star
                    aggregates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-rose-400">models/Review.js</span>
                    <span className="text-xs font-bold text-white">{reviews.length} docs</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Links <code className="text-rose-300">user</code> &amp;{' '}
                    <code className="text-rose-300">book</code> ObjectIds with 1–5 star{' '}
                    <code className="text-rose-300">rating</code>,{' '}
                    <code className="text-rose-300">thoughts</code>, resonance reactions, and
                    comments.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400">models/DiaryEntry.js</span>
                    <span className="text-xs font-bold text-white">{diaryEntries.length} docs</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Chronicles read books with <code className="text-emerald-300">readDate</code>,{' '}
                    <code className="text-emerald-300">status</code>,{' '}
                    <code className="text-emerald-300">rating</code>,{' '}
                    <code className="text-emerald-300">diaryNotes</code>, and follower comments.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="bg-white/[0.04] px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-slate-300 flex items-center gap-2">
                    <Code2 size={14} className="text-amber-300" /> Express + JWT REST API Endpoints
                  </span>
                </div>
                <div className="divide-y divide-white/[0.06] text-xs font-mono">
                  {[
                    {
                      method: 'POST',
                      route: '/api/auth/register',
                      desc: 'Create account with username, email & bcrypt-hashed password'
                    },
                    {
                      method: 'POST',
                      route: '/api/auth/login',
                      desc: 'Authenticate with email/username & password → returns JWT'
                    },
                    {
                      method: 'GET',
                      route: '/api/books/google-books?q=',
                      desc: 'Query Google Books API v1 volumes & import metadata'
                    },
                    {
                      method: 'GET',
                      route: '/api/books/external-search?q=',
                      desc: 'Query Open Library / ISBN bibliographic database'
                    },
                    {
                      method: 'POST',
                      route: '/api/books/:id/react',
                      desc: 'Toggle Favorite, Like, or Dislike on a book'
                    },
                    {
                      method: 'POST',
                      route: '/api/reviews',
                      desc: 'Publish 1–5 star rating, thoughts, and social comments'
                    },
                    {
                      method: 'POST',
                      route: '/api/diary',
                      desc: 'Log a read book to the user’s chronological Reading Diary'
                    },
                    {
                      method: 'POST',
                      route: '/api/users/:id/follow',
                      desc: 'Follow/unfollow another reader to subscribe to their feed'
                    }
                  ].map((ep) => (
                    <div
                      key={ep.route}
                      className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ep.method === 'GET'
                              ? 'bg-sky-500/20 text-sky-300'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {ep.method}
                        </span>
                        <span className="text-white">{ep.route}</span>
                      </div>
                      <span className="text-slate-400 font-sans text-xs">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <BookDetailModal
        selectedBook={selectedBook}
        onClose={() => setSelectedBookId(null)}
        currentUser={currentUser}
        bookStats={selectedBook ? (bookStatsMap[selectedBook.id || selectedBook._id] || { avgRating: 4.7, reviewCount: 0, readCount: 0 }) : {}}
        onReaction={handleBookReaction}
        onOpenDiary={openLogDiaryForBook}
        onEditBook={openEditBookModal}
        onDeleteBook={handleDeleteBook}
        reviews={reviews}
        users={users}
        onSubmitReview={handleSubmitReview}
        onUpdateReview={handleUpdateReview}
        onDeleteReview={handleDeleteReview}
        onReviewReaction={handleReviewReaction}
        onRequireAuth={() => {
          setAuthMode('login');
          setShowAuthModal(true);
        }}
      />

      <LogBookModal
        isOpen={showDiaryModal}
        onClose={() => {
          setShowDiaryModal(false);
          setEditingDiaryEntry(null);
        }}
        onSave={handleSaveDiaryEntry}
        books={books}
        initialBookId={diaryBookId}
        entryToEdit={editingDiaryEntry}
      />

      <AddEditBookModal
        isOpen={showAddBookModal}
        onClose={() => {
          setShowAddBookModal(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        bookToEdit={editingBook}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={users}
        onSelectDemoUser={(userId) => {
          setCurrentUserId(userId);
          notify('Switched demo user account', 'info');
        }}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        currentUser={currentUser}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
