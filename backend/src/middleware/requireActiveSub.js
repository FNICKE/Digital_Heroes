const Subscription = require('../models/Subscription');

/**
 * Live subscription check — never trust JWT alone for access.
 * Admins bypass the subscriber gate.
 */
const requireActiveSub = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const sub = await Subscription.findOne({ userId: req.user._id }).sort({
      updatedAt: -1,
    });

    if (!sub || sub.status !== 'active') {
      return res.status(403).json({
        message: 'Active subscription required',
        subscriptionStatus: sub?.status || 'none',
      });
    }

    if (sub.renewalDate && new Date(sub.renewalDate) < new Date()) {
      sub.status = 'lapsed';
      await sub.save();
      return res.status(403).json({
        message: 'Subscription lapsed',
        subscriptionStatus: 'lapsed',
      });
    }

    req.subscription = sub;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = requireActiveSub;
