const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    displayName: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: 'Explorer of literary worlds.',
      maxlength: 280,
    },
    avatarColor: {
      type: String,
      default: '#38BDF8',
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    likedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    dislikedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
