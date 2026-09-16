const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tier: { type: Number, enum: [5, 4, 3], required: true },
    prizeAmount: { type: Number, required: true },
    proofImageUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winner', winnerSchema);
