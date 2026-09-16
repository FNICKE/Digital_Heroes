const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: { type: String, enum: ['monthly', 'yearly'], required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'lapsed'],
      default: 'inactive',
    },
    startDate: { type: Date },
    renewalDate: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
