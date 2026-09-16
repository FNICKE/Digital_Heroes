const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, charityId, charityPercentage } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const pct = charityPercentage != null ? Number(charityPercentage) : 10;
    if (pct < 10 || pct > 100) {
      return res.status(400).json({ message: 'charityPercentage must be 10–100' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: 'subscriber',
      charityId: charityId || null,
      charityPercentage: pct,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        charityId: user.charityId,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    // PRD §04: live subscription status on authenticated requests (not JWT-cached)
    const Subscription = require('../models/Subscription');
    let subscription = await Subscription.findOne({ userId: req.user._id }).sort({
      updatedAt: -1,
    });
    if (
      subscription?.status === 'active' &&
      subscription.renewalDate &&
      new Date(subscription.renewalDate) < new Date()
    ) {
      subscription.status = 'lapsed';
      await subscription.save();
    }
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        charityId: req.user.charityId,
        charityPercentage: req.user.charityPercentage,
        createdAt: req.user.createdAt,
      },
      subscription: subscription
        ? {
            status: subscription.status,
            plan: subscription.plan,
            renewalDate: subscription.renewalDate,
            isActive: subscription.status === 'active',
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

const updateMyCharity = async (req, res, next) => {
  try {
    const { charityId, charityPercentage } = req.body;
    if (charityPercentage != null) {
      const pct = Number(charityPercentage);
      if (pct < 10 || pct > 100) {
        return res.status(400).json({ message: 'charityPercentage must be 10–100' });
      }
      req.user.charityPercentage = pct;
    }
    if (charityId !== undefined) {
      req.user.charityId = charityId || null;
    }
    await req.user.save();
    res.json({
      charityId: req.user.charityId,
      charityPercentage: req.user.charityPercentage,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, me, updateMyCharity };
