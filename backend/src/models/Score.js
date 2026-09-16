const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    value: { type: Number, required: true, min: 1, max: 45 },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

scoreSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);
