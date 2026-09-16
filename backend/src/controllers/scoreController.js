const Score = require('../models/Score');

const startOfDay = (d) => {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const listScores = async (req, res, next) => {
  try {
    const scores = await Score.find({ userId: req.user._id }).sort({ date: -1 });
    res.json({ scores });
  } catch (err) {
    next(err);
  }
};

const createScore = async (req, res, next) => {
  try {
    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 1 || value > 45) {
      return res.status(400).json({ message: 'value must be an integer 1–45' });
    }
    if (!req.body.date) {
      return res.status(400).json({ message: 'date is required' });
    }

    const date = startOfDay(req.body.date);
    const dup = await Score.findOne({ userId: req.user._id, date });
    if (dup) {
      return res.status(409).json({ message: 'A score already exists for this date' });
    }

    const count = await Score.countDocuments({ userId: req.user._id });
    if (count >= 5) {
      const oldest = await Score.findOne({ userId: req.user._id }).sort({ date: 1 });
      if (oldest) await oldest.deleteOne();
    }

    const score = await Score.create({
      userId: req.user._id,
      value,
      date,
    });
    res.status(201).json({ score });
  } catch (err) {
    next(err);
  }
};

const updateScore = async (req, res, next) => {
  try {
    const score = await Score.findOne({ _id: req.params.id, userId: req.user._id });
    if (!score) return res.status(404).json({ message: 'Score not found' });

    if (req.body.value != null) {
      const value = Number(req.body.value);
      if (!Number.isInteger(value) || value < 1 || value > 45) {
        return res.status(400).json({ message: 'value must be an integer 1–45' });
      }
      score.value = value;
    }

    if (req.body.date) {
      const date = startOfDay(req.body.date);
      const dup = await Score.findOne({
        userId: req.user._id,
        date,
        _id: { $ne: score._id },
      });
      if (dup) {
        return res.status(409).json({ message: 'A score already exists for this date' });
      }
      score.date = date;
    }

    await score.save();
    res.json({ score });
  } catch (err) {
    next(err);
  }
};

const deleteScore = async (req, res, next) => {
  try {
    const score = await Score.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!score) return res.status(404).json({ message: 'Score not found' });
    res.json({ message: 'Deleted', score });
  } catch (err) {
    next(err);
  }
};

module.exports = { listScores, createScore, updateScore, deleteScore };
