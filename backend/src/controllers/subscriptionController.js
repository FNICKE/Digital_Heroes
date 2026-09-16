const Subscription = require('../models/Subscription');
const {
  activateLocalSubscription,
  createCheckoutSession,
  cancelSubscription,
} = require('../services/stripeService');

const createSubscription = async (req, res, next) => {
  try {
    const plan = req.body.plan === 'yearly' ? 'yearly' : 'monthly';
    const demo = process.env.DEMO_BYPASS_STRIPE === 'true';

    if (demo || !process.env.STRIPE_SECRET_KEY) {
      const sub = await activateLocalSubscription(req.user._id, plan);
      return res.status(201).json({
        mode: 'demo',
        subscription: sub,
        message: 'Subscription activated (demo bypass)',
      });
    }

    const session = await createCheckoutSession(req.user, plan);
    res.status(201).json({
      mode: 'stripe',
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const sub = await cancelSubscription(req.user._id);
    res.json({ subscription: sub });
  } catch (err) {
    next(err);
  }
};

const status = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user._id }).sort({
      updatedAt: -1,
    });

    if (sub?.status === 'active' && sub.renewalDate && new Date(sub.renewalDate) < new Date()) {
      sub.status = 'lapsed';
      await sub.save();
    }

    res.json({
      subscription: sub || null,
      isActive: sub?.status === 'active',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSubscription, cancel, status };
