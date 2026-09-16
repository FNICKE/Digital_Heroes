const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charity',
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ['subscription-linked', 'independent'],
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
