const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');
const DiaryEntry = require('../models/DiaryEntry');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Discover readers
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('favorites', 'title author coverUrl')
      .populate('likedBooks', 'title author coverUrl')
      .limit(30);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/follow - Follow or unfollow another reader
router.post('/:id/follow', auth, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }
    const currentUser = await User.findById(req.user.id);
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found.' });

    const isFollowing = currentUser.following.some((id) => String(id) === String(targetUser._id));
    if (isFollowing) {
      currentUser.following = currentUser.following.filter((id) => String(id) !== String(targetUser._id));
      targetUser.followers = targetUser.followers.filter((id) => String(id) !== String(currentUser._id));
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
    }

    await Promise.all([currentUser.save(), targetUser.save()]);
    res.json({ following: currentUser.following, followersCount: targetUser.followers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/feed/following - Activity stream from followed readers
router.get('/feed/following', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const followedIds = currentUser.following;

    const [recentReviews, recentDiary] = await Promise.all([
      Review.find({ user: { $in: followedIds } })
        .populate('user', 'username displayName avatarColor')
        .populate('book', 'title author coverUrl publishedYear')
        .sort({ createdAt: -1 })
        .limit(25),
      DiaryEntry.find({ user: { $in: followedIds } })
        .populate('user', 'username displayName avatarColor')
        .populate('book', 'title author coverUrl publishedYear')
        .sort({ readDate: -1 })
        .limit(25),
    ]);

    res.json({ reviews: recentReviews, diaryEntries: recentDiary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile - Update user profile bio, avatar, and displayName
router.put('/profile', auth, async (req, res) => {
  try {
    const { bio, avatar, avatarColor, displayName } = req.body;
    const currentUserId = req.user.id || req.user._id;
    const user = await User.findById(currentUserId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (bio !== undefined) {
      if (typeof bio === 'string' && bio.length > 280) {
        return res.status(400).json({ message: 'Bio cannot exceed 280 characters' });
      }
      user.bio = bio;
    }

    if (avatar !== undefined || avatarColor !== undefined) {
      user.avatarColor = avatar || avatarColor;
    }

    if (displayName !== undefined && displayName.trim()) {
      user.displayName = displayName.trim();
    }

    await user.save();
    const updated = await User.findById(user._id).select('-passwordHash')
      .populate('favorites', 'title author coverUrl')
      .populate('likedBooks', 'title author coverUrl');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:identifier - Get single user profile by ID or username
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let user = null;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select('-passwordHash')
        .populate('favorites', 'title author coverUrl')
        .populate('likedBooks', 'title author coverUrl');
    }
    if (!user) {
      user = await User.findOne({ username: identifier.toLowerCase() }).select('-passwordHash')
        .populate('favorites', 'title author coverUrl')
        .populate('likedBooks', 'title author coverUrl');
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
