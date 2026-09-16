const Winner = require('../models/Winner');

const uploadProof = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });

    if (
      String(winner.userId) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not your prize' });
    }

    if (req.file) {
      winner.proofImageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.proofImageUrl) {
      winner.proofImageUrl = req.body.proofImageUrl;
    } else {
      return res.status(400).json({ message: 'Provide a file or proofImageUrl' });
    }

    await winner.save();
    res.json({ winner });
  } catch (err) {
    next(err);
  }
};

const review = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });

    const decision = req.body.status;
    if (!['pending', 'rejected', 'paid'].includes(decision) && decision !== 'approved') {
      return res.status(400).json({
        message: 'status must be approved (→ pending with review) or rejected',
      });
    }

    if (decision === 'rejected') {
      winner.status = 'rejected';
    } else if (decision === 'approved') {
      // keep pending until pay, but mark reviewed
      winner.status = 'pending';
    } else {
      winner.status = decision;
    }

    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();
    await winner.save();
    res.json({ winner });
  } catch (err) {
    next(err);
  }
};

const markPaid = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) return res.status(404).json({ message: 'Winner not found' });
    winner.status = 'paid';
    winner.reviewedBy = req.user._id;
    winner.reviewedAt = new Date();
    await winner.save();
    res.json({ winner });
  } catch (err) {
    next(err);
  }
};

const listMine = async (req, res, next) => {
  try {
    const winners = await Winner.find({ userId: req.user._id })
      .populate('drawId')
      .sort({ createdAt: -1 });
    res.json({ winners });
  } catch (err) {
    next(err);
  }
};

const listAll = async (req, res, next) => {
  try {
    const winners = await Winner.find()
      .populate('userId', 'name email')
      .populate('drawId')
      .sort({ createdAt: -1 });
    res.json({ winners });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadProof, review, markPaid, listMine, listAll };
