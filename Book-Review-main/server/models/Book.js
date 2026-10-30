const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    externalId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isbn: {
      type: String,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    coverUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    genres: [{ type: String }],
    publishedYear: {
      type: Number,
    },
    pageCount: {
      type: Number,
      default: 320,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    favoritesCount: {
      type: Number,
      default: 0,
    },
    ratingSum: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

BookSchema.virtual('averageRating').get(function () {
  if (!this.ratingCount) return 0;
  return Number((this.ratingSum / this.ratingCount).toFixed(2));
});

BookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', BookSchema);
