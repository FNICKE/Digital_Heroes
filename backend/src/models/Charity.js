const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    events: [
      {
        title: String,
        date: Date,
        location: String,
        details: String,
      },
    ],
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Charity', charitySchema);
