const express = require('express');
const Review = require('../models/Review');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/reviews - Get recent community reviews across all books
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username displayName avatarColor')
      .populate('book', 'title author coverUrl publishedYear genres')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/reviews/book/:bookId
router.get('/book/:bookId', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'username displayName avatarColor')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews - Create a review with thoughts
router.post('/', auth, async (req, res) => {
  try {
    const { bookId, rating, thoughts, text, moodTags, containsSpoilers } = req.body;
    const reviewContent = (thoughts !== undefined ? thoughts : text || '').trim();
    if (!bookId) {
      return res.status(400).json({ message: 'bookId is required.' });
    }
    if (rating === undefined || rating === null) {
      return res.status(400).json({ message: 'Rating is required.' });
    }
    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 0.5 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a valid number between 0.5 and 5.' });
    }
    if (!reviewContent) {
      return res.status(400).json({ message: 'Review text/thoughts cannot be empty.' });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = await Review.create({
      book: bookId,
      user: req.user.id || req.user._id,
      rating: numRating,
      thoughts: reviewContent,
      moodTags: Array.isArray(moodTags) ? moodTags : [],
      containsSpoilers: Boolean(containsSpoilers),
    });

    // Recalculate book rating statistics accurately
    const allReviews = await Review.find({ book: book._id });
    book.ratingCount = allReviews.length;
    book.ratingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    await book.save();

    const populated = await Review.findById(review._id)
      .populate('user', 'username displayName avatarColor')
      .populate('book', 'title author coverUrl publishedYear genres');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/reviews/:id - Update review (protected by auth, verifies ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    if (review.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to edit this review' });
    }

    const { rating, thoughts, text, moodTags, containsSpoilers } = req.body;

    if (rating !== undefined) {
      const numRating = Number(rating);
      if (isNaN(numRating) || numRating < 0.5 || numRating > 5) {
        return res.status(400).json({ message: 'Rating must be a valid number between 0.5 and 5' });
      }
      review.rating = numRating;
    }

    const reviewContent = text !== undefined ? text : thoughts;
    if (reviewContent !== undefined) {
      if (!reviewContent || !reviewContent.toString().trim()) {
        return res.status(400).json({ message: 'Review text/thoughts cannot be empty' });
      }
      review.thoughts = reviewContent.toString().trim();
    }

    if (moodTags !== undefined) {
      review.moodTags = Array.isArray(moodTags) ? moodTags : [];
    }
    if (containsSpoilers !== undefined) {
      review.containsSpoilers = Boolean(containsSpoilers);
    }

    await review.save();

    // Recalculate parent Book's avgRating & ratingCount
    const book = await Book.findById(review.book);
    if (book) {
      const allReviews = await Review.find({ book: book._id });
      book.ratingCount = allReviews.length;
      book.ratingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
      await book.save();
    }

    const populated = await Review.findById(review._id)
      .populate('user', 'username displayName avatarColor')
      .populate('book', 'title author coverUrl publishedYear genres');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reviews/:id - Delete review (protected by auth, verifies ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const currentUserId = (req.user.id || req.user._id).toString();
    if (review.user.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const bookId = review.book;
    await Review.findByIdAndDelete(review._id);

    // Recalculate parent Book's rating statistics
    const book = await Book.findById(bookId);
    if (book) {
      const allReviews = await Review.find({ book: book._id });
      book.ratingCount = allReviews.length;
      book.ratingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
      await book.save();
    }

    res.json({ message: 'Review deleted successfully', id: review._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews/:id/react - Toggle like on a review
router.post('/:id/react', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const userIdStr = String(req.user.id);
    const existingIdx = review.likes.findIndex((id) => String(id) === userIdStr);
    if (existingIdx >= 0) {
      review.likes.splice(existingIdx, 1);
    } else {
      review.likes.push(req.user.id);
    }
    await review.save();
    res.json({ likes: review.likes, likesCount: review.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
