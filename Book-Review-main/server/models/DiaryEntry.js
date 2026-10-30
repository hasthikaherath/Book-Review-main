const mongoose = require('mongoose');

const DiaryEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    status: {
      type: String,
      enum: ['read', 'reading', 'want_to_read'],
      default: 'read',
    },
    readDate: {
      type: Date,
      default: Date.now,
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
    },
    diaryNotes: {
      type: String,
      trim: true,
      maxlength: 4000,
      default: '',
    },
    pagesRead: {
      type: Number,
      default: 0,
    },
    isReread: {
      type: Boolean,
      default: false,
    },
    liked: {
      type: Boolean,
      default: false,
    },
    addedToFavorites: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiaryEntry', DiaryEntrySchema);
