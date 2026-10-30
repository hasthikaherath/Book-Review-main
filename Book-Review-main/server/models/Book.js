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

// Key aliases for seamless client-server schema alignment
BookSchema.virtual('cover')
  .get(function () {
    return this.coverUrl;
  })
  .set(function (val) {
    this.coverUrl = val;
  });

BookSchema.virtual('coverImage')
  .get(function () {
    return this.coverUrl;
  })
  .set(function (val) {
    this.coverUrl = val;
  });

BookSchema.virtual('synopsis')
  .get(function () {
    return this.description;
  })
  .set(function (val) {
    this.description = val;
  });

BookSchema.virtual('year')
  .get(function () {
    return this.publishedYear;
  })
  .set(function (val) {
    this.publishedYear = val;
  });

BookSchema.virtual('publicationYear')
  .get(function () {
    return this.publishedYear;
  })
  .set(function (val) {
    this.publishedYear = val;
  });

BookSchema.virtual('pages')
  .get(function () {
    return this.pageCount;
  })
  .set(function (val) {
    this.pageCount = val;
  });

BookSchema.set('toJSON', { virtuals: true });
BookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', BookSchema);
