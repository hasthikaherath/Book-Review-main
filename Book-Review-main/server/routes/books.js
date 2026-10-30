const express = require('express');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const DiaryEntry = require('../models/DiaryEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/books - list catalog books with optional search and genre filter
router.get('/', async (req, res) => {
  try {
    const { q, genre, sort = 'popular' } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { isbn: { $regex: q, $options: 'i' } },
      ];
    }
    if (genre && genre !== 'All') {
      filter.genres = genre;
    }
    let sortOption = { likesCount: -1, createdAt: -1 };
    if (sort === 'year') sortOption = { publishedYear: -1 };
    if (sort === 'title') sortOption = { title: 1 };

    const books = await Book.find(filter).sort(sortOption).limit(60);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/external-search?q=... - Search existing external book database (Open Library API)
router.get('/external-search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q is required' });

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=12`;
    const response = await fetch(url);
    const data = await response.json();

    const mapped = (data.docs || []).map((doc) => ({
      externalId: doc.key,
      title: doc.title,
      author: Array.isArray(doc.author_name) ? doc.author_name[0] : 'Unknown Author',
      publishedYear: doc.first_publish_year || 2020,
      isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : '',
      pageCount: doc.number_of_pages_median || 320,
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : '',
      genres: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : ['General'],
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'External book database search failed: ' + err.message });
  }
});

// POST /api/books/import - Upsert a book from external database into MongoDB
router.post('/import', auth, async (req, res) => {
  try {
    const { externalId, isbn, title, author, coverUrl, description, genres, publishedYear, pageCount } = req.body;
    let book = await Book.findOne({ $or: [{ externalId }, { title, author }] });
    if (!book) {
      book = await Book.create({
        externalId,
        isbn,
        title,
        author,
        coverUrl,
        description,
        genres: genres || ['Literature'],
        publishedYear,
        pageCount: pageCount || 300,
      });
    }
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/books/:id/react - Toggle favorite, like, or dislike on a book
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body; // 'favorite' | 'like' | 'dislike'
    const book = await Book.findById(req.params.id);
    const user = await User.findById(req.user.id);
    if (!book || !user) return res.status(404).json({ message: 'Book or user not found' });

    const bookIdStr = String(book._id);

    if (type === 'favorite') {
      const idx = user.favorites.findIndex((id) => String(id) === bookIdStr);
      if (idx >= 0) {
        user.favorites.splice(idx, 1);
        book.favoritesCount = Math.max(0, book.favoritesCount - 1);
      } else {
        user.favorites.push(book._id);
        book.favoritesCount += 1;
      }
    } else if (type === 'like') {
      const likeIdx = user.likedBooks.findIndex((id) => String(id) === bookIdStr);
      const dislikeIdx = user.dislikedBooks.findIndex((id) => String(id) === bookIdStr);
      if (likeIdx >= 0) {
        user.likedBooks.splice(likeIdx, 1);
        book.likesCount = Math.max(0, book.likesCount - 1);
      } else {
        user.likedBooks.push(book._id);
        book.likesCount += 1;
        if (dislikeIdx >= 0) {
          user.dislikedBooks.splice(dislikeIdx, 1);
          book.dislikesCount = Math.max(0, book.dislikesCount - 1);
        }
      }
    } else if (type === 'dislike') {
      const dislikeIdx = user.dislikedBooks.findIndex((id) => String(id) === bookIdStr);
      const likeIdx = user.likedBooks.findIndex((id) => String(id) === bookIdStr);
      if (dislikeIdx >= 0) {
        user.dislikedBooks.splice(dislikeIdx, 1);
        book.dislikesCount = Math.max(0, book.dislikesCount - 1);
      } else {
        user.dislikedBooks.push(book._id);
        book.dislikesCount += 1;
        if (likeIdx >= 0) {
          user.likedBooks.splice(likeIdx, 1);
          book.likesCount = Math.max(0, book.likesCount - 1);
        }
      }
    }

    await Promise.all([user.save(), book.save()]);
    res.json({ book, favorites: user.favorites, likedBooks: user.likedBooks, dislikedBooks: user.dislikedBooks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET /api/books/google-books?q=... - Search Google Books API v1
router.get('/google-books', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query parameter q is required' });
    const apiKeyParam = process.env.GOOGLE_BOOKS_API_KEY ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}` : '';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12${apiKeyParam}`;
    const response = await fetch(url);
    const data = await response.json();
    const mapped = (data.items || []).map((item) => {
      const info = item.volumeInfo || {};
      const identifiers = info.industryIdentifiers || [];
      const isbnObj = identifiers.find((i) => i.type === 'ISBN_13') || identifiers[0] || {};
      return {
        externalId: `GB-${item.id}`,
        googleBooksId: item.id,
        title: info.title || 'Untitled',
        author: Array.isArray(info.authors) ? info.authors[0] : 'Unknown Author',
        publishedYear: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : 2020,
        isbn: isbnObj.identifier || '',
        pageCount: info.pageCount || 320,
        coverUrl: (info.imageLinks?.thumbnail || '').replace(/^http:\/\//i, 'https://'),
        description: info.description || '',
        genres: info.categories || ['General'],
      };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Google Books API search failed: ' + err.message });
  }
});

// POST /api/books - Create a custom book in MongoDB
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, year, publishedYear, pages, pageCount, isbn, genres, cover, coverUrl, synopsis, description } = req.body;
    if (!title || !title.trim() || !author || !author.trim()) {
      return res.status(400).json({ message: 'Title and author are required and cannot be empty' });
    }

    const yearVal = year !== undefined ? Number(year) : (publishedYear !== undefined ? Number(publishedYear) : new Date().getFullYear());
    if (isNaN(yearVal) || yearVal <= 0) {
      return res.status(400).json({ message: 'Publication year must be a valid positive number' });
    }

    const pagesVal = pages !== undefined ? Number(pages) : (pageCount !== undefined ? Number(pageCount) : 300);
    if (isNaN(pagesVal) || pagesVal <= 0) {
      return res.status(400).json({ message: 'Page count must be a valid positive number' });
    }

    const book = await Book.create({
      externalId: `CUST-${Date.now()}`,
      isbn: isbn || `978-00000${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      author: author.trim(),
      publishedYear: yearVal,
      pageCount: pagesVal,
      genres: Array.isArray(genres) && genres.length > 0 ? genres : (genres ? [genres] : ['Literature']),
      coverUrl: cover || coverUrl || '',
      description: synopsis !== undefined ? synopsis : (description || ''),
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/books/:id - Update an existing book in MongoDB
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let book = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(id);
    }
    if (!book) {
      book = await Book.findOne({ externalId: id });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const { title, author, year, publishedYear, pages, pageCount, genres, synopsis, description, cover, coverUrl, isbn } = req.body;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      book.title = title.trim();
    }

    if (author !== undefined) {
      if (!author || !author.trim()) {
        return res.status(400).json({ message: 'Author cannot be empty' });
      }
      book.author = author.trim();
    }

    if (year !== undefined || publishedYear !== undefined) {
      const yearVal = Number(year !== undefined ? year : publishedYear);
      if (isNaN(yearVal) || yearVal <= 0) {
        return res.status(400).json({ message: 'Publication year must be a valid positive number' });
      }
      book.publishedYear = yearVal;
    }

    if (pages !== undefined || pageCount !== undefined) {
      const pagesVal = Number(pages !== undefined ? pages : pageCount);
      if (isNaN(pagesVal) || pagesVal <= 0) {
        return res.status(400).json({ message: 'Page count must be a valid positive number' });
      }
      book.pageCount = pagesVal;
    }

    if (genres !== undefined) {
      book.genres = Array.isArray(genres) ? genres : [genres];
    }

    if (synopsis !== undefined || description !== undefined) {
      book.description = synopsis !== undefined ? synopsis : description;
    }

    if (cover !== undefined || coverUrl !== undefined) {
      book.coverUrl = cover !== undefined ? cover : coverUrl;
    }

    if (isbn !== undefined) {
      book.isbn = isbn;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/books/:id - Delete book and cascade-delete reviews and diary entries
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let book = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(id);
    }
    if (!book) {
      book = await Book.findOne({ externalId: id });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const bookMongoId = book._id;
    await Book.findByIdAndDelete(bookMongoId);

    // Cascade delete associated reviews and diary entries so no orphan records remain
    await Promise.all([
      Review.deleteMany({ book: bookMongoId }),
      DiaryEntry.deleteMany({ book: bookMongoId }),
    ]);

    res.json({
      message: 'Book and associated reviews and diary entries deleted successfully',
      id: bookMongoId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/books/:id - Get single book by MongoDB ID or externalId
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let book = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      book = await Book.findById(id);
    }
    if (!book) {
      book = await Book.findOne({ externalId: id });
    }
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
