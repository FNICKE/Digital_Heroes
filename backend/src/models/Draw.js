const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema(
  {
    tier: { type: Number, enum: [5, 4, 3], required: true },
    poolShare: { type: Number, required: true },
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rollover: { type: Number, default: 0 },
  },
  { _id: false }
);

const drawSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    type: { type: String, enum: ['random', 'algorithmic'], required: true },
    status: {
      type: String,
      enum: ['draft', 'simulated', 'published'],
      default: 'draft',
    },
    winningValues: [{ type: Number, min: 1, max: 45 }],
    tiers: [tierSchema],
    totalPool: { type: Number, default: 0 },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

drawSchema.index({ month: 1, year: 1, status: 1 });

module.exports = mongoose.model('Draw', drawSchema);
