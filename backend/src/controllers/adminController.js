const User = require('../models/User');
const Score = require('../models/Score');
const Charity = require('../models/Charity');
const Subscription = require('../models/Subscription');
const Donation = require('../models/Donation');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const { calculatePrizePool } = require('../utils/prizePoolCalculator');

const listUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('charityId', 'name')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, role, charityId, charityPercentage } = req.body;
    if (name != null) user.name = name;
    if (role && ['subscriber', 'admin'].includes(role)) user.role = role;
    if (charityId !== undefined) user.charityId = charityId;
    if (charityPercentage != null) {
      const pct = Number(charityPercentage);
      if (pct < 10 || pct > 100) {
        return res.status(400).json({ message: 'charityPercentage must be 10–100' });
      }
      user.charityPercentage = pct;
    }
    await user.save();
    res.json({ user: await User.findById(user._id).select('-passwordHash') });
  } catch (err) {
    next(err);
  }
};

const getUserScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json({ scores });
  } catch (err) {
    next(err);
  }
};

const updateUserScore = async (req, res, next) => {
  try {
    const score = await Score.findOne({
      _id: req.params.scoreId,
      userId: req.params.userId,
    });
    if (!score) return res.status(404).json({ message: 'Score not found' });
    if (req.body.value != null) score.value = Number(req.body.value);
    if (req.body.date) score.date = new Date(req.body.date);
    await score.save();
    res.json({ score });
  } catch (err) {
    next(err);
  }
};

const adminListCharities = async (req, res, next) => {
  try {
    const charities = await Charity.find().sort({ name: 1 });
    res.json({ charities });
  } catch (err) {
    next(err);
  }
};

const createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ charity });
  } catch (err) {
    next(err);
  }
};

const updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
};

const deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

const listSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
};

const updateSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const { status, plan, renewalDate, amount } = req.body;
    if (status && ['active', 'inactive', 'cancelled', 'lapsed'].includes(status)) {
      sub.status = status;
    }
    if (plan && ['monthly', 'yearly'].includes(plan)) sub.plan = plan;
    if (renewalDate) sub.renewalDate = new Date(renewalDate);
    if (amount != null) sub.amount = Number(amount);
    await sub.save();
    res.json({
      subscription: await Subscription.findById(sub._id).populate('userId', 'name email'),
    });
  } catch (err) {
    next(err);
  }
};

const createUserScore = async (req, res, next) => {
  try {
    const value = Number(req.body.value);
    const date = new Date(req.body.date);
    date.setUTCHours(0, 0, 0, 0);
    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: 'value must be 1–45' });
    }
    const count = await Score.countDocuments({ userId: req.params.userId });
    if (count >= 5) {
      const oldest = await Score.findOne({ userId: req.params.userId }).sort({ date: 1 });
      if (oldest) await oldest.deleteOne();
    }
    const score = await Score.create({
      userId: req.params.userId,
      value,
      date,
    });
    res.status(201).json({ score });
  } catch (err) {
    next(err);
  }
};

const deleteUserScore = async (req, res, next) => {
  try {
    const score = await Score.findOneAndDelete({
      _id: req.params.scoreId,
      userId: req.params.userId,
    });
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

const reports = async (req, res, next) => {
  try {
    const [userCount, activeSubs, donations, draws, winners, charityAgg] =
      await Promise.all([
        User.countDocuments({ role: 'subscriber' }),
        Subscription.find({ status: 'active' }),
        Donation.find(),
        Draw.find(),
        Winner.find(),
        Donation.aggregate([
          { $group: { _id: '$charityId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
      ]);

    const { totalPool } = calculatePrizePool(
      activeSubs,
      process.env.PRIZE_POOL_PERCENT,
      0
    );

    const charityTotal = donations.reduce((s, d) => s + d.amount, 0);

    res.json({
      users: { subscribers: userCount, total: await User.countDocuments() },
      subscriptions: {
        active: activeSubs.length,
        cancelled: await Subscription.countDocuments({ status: 'cancelled' }),
        lapsed: await Subscription.countDocuments({ status: 'lapsed' }),
      },
      prizePoolEstimate: totalPool,
      charity: {
        totalContributions: Math.round(charityTotal * 100) / 100,
        byCharity: charityAgg,
        donationCount: donations.length,
      },
      draws: {
        total: draws.length,
        published: draws.filter((d) => d.status === 'published').length,
        simulated: draws.filter((d) => d.status === 'simulated').length,
      },
      winners: {
        total: winners.length,
        pending: winners.filter((w) => w.status === 'pending').length,
        paid: winners.filter((w) => w.status === 'paid').length,
        rejected: winners.filter((w) => w.status === 'rejected').length,
        prizePaidTotal: winners
          .filter((w) => w.status === 'paid')
          .reduce((s, w) => s + w.prizeAmount, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  updateUser,
  getUserScores,
  updateUserScore,
  createUserScore,
  deleteUserScore,
  listSubscriptions,
  updateSubscription,
  adminListCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  reports,
};
