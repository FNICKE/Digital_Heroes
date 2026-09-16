const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['subscriber', 'admin'],
      default: 'subscriber',
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
      default: null,
    },
    charityPercentage: {
      type: Number,
      min: 10,
      max: 100,
      default: 10,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('User', userSchema);
