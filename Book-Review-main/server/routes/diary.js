const express = require('express');
const DiaryEntry = require('../models/DiaryEntry');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/diary - Get recent public reading diary entries
router.get('/', async (req, res) => {
  try {
    const entries = await DiaryEntry.find()
      .populate('user', 'username displayName avatarColor')
      .populate('book', 'title author coverUrl publishedYear pageCount genres')
      .sort({ readDate: -1 })
      .limit(50);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/diary/user/:username - Get a reader's public reading diary
router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const entries = await DiaryEntry.find({ user: user._id })
      .populate('book', 'title author coverUrl publishedYear pageCount genres')
      .sort({ readDate: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/diary - Log a book to the authenticated user's reading diary
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, status, readDate, dateRead, rating, diaryNotes, notes, pagesRead, isReread, reread, liked, addedToFavorites } = req.body;
    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required to log a diary entry.' });
    }

    let numRating = undefined;
    if (rating !== undefined && rating !== null) {
      numRating = Number(rating);
      if (isNaN(numRating) || numRating < 0.5 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be a valid number between 0.5 and 5.' });
      }
    }

    const entry = await DiaryEntry.create({
      user: req.user.id || req.user._id,
      book: bookId,
      status: status || 'read',
      readDate: dateRead || readDate || new Date(),
      rating: numRating,
      diaryNotes: notes !== undefined ? notes : (diaryNotes || ''),
      pagesRead: pagesRead ? Number(pagesRead) : 0,
      isReread: Boolean(reread !== undefined ? reread : isReread),
      liked: Boolean(liked),
      addedToFavorites: Boolean(addedToFavorites),
    });
    const populated = await entry.populate('book', 'title author coverUrl publishedYear pageCount genres');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/diary/:id - Update reading diary entry (protected by auth, verifies ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    if (entry.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this diary entry' });
    }

    const { rating, dateRead, readDate, liked, reread, isReread, notes, diaryNotes, status, pagesRead, addedToFavorites } = req.body;

    if (rating !== undefined && rating !== null) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 0.5 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be a valid number between 0.5 and 5' });
      }
      entry.rating = numRating;
    }

    if (dateRead !== undefined || readDate !== undefined) {
      entry.readDate = dateRead || readDate;
    }

    if (liked !== undefined) {
      entry.liked = Boolean(liked);
    }

    if (reread !== undefined || isReread !== undefined) {
      entry.isReread = Boolean(reread !== undefined ? reread : isReread);
    }

    if (notes !== undefined || diaryNotes !== undefined) {
      entry.diaryNotes = notes !== undefined ? notes : diaryNotes;
    }

    if (status !== undefined) {
      entry.status = status;
    }

    if (pagesRead !== undefined) {
      const p = Number(pagesRead);
      if (!isNaN(p)) entry.pagesRead = p;
    }

    if (addedToFavorites !== undefined) {
      entry.addedToFavorites = Boolean(addedToFavorites);
    }

    await entry.save();
    const populated = await entry.populate('book', 'title author coverUrl publishedYear pageCount genres');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/diary/:id - Delete diary entry (protected by auth, verifies ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await DiaryEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Diary entry not found' });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    if (entry.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this diary entry' });
    }

    await DiaryEntry.findByIdAndDelete(entry._id);
    res.json({ message: 'Diary entry deleted successfully', id: entry._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
