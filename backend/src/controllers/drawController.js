const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const { runDraw } = require('../utils/drawEngine');

const getJackpotRollover = async () => {
  const last = await Draw.findOne({ status: 'published' }).sort({
    year: -1,
    month: -1,
  });
  if (!last) return 0;
  const jackpot = last.tiers?.find((t) => t.tier === 5);
  return jackpot?.rollover || 0;
};

const simulate = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.body.month) || now.getMonth() + 1;
    const year = Number(req.body.year) || now.getFullYear();
    const type = req.body.type === 'algorithmic' ? 'algorithmic' : 'random';

    const jackpotRollover = await getJackpotRollover();
    const result = await runDraw({ type, month, year, jackpotRollover });

    let draw = await Draw.findOne({ month, year, status: { $ne: 'published' } });
    if (!draw) {
      draw = new Draw({ month, year, type });
    }
    draw.type = type;
    draw.status = 'simulated';
    draw.winningValues = result.winningValues;
    draw.totalPool = result.totalPool;
    draw.tiers = result.tiers.map((t) => ({
      tier: t.tier,
      poolShare: t.poolShare,
      winners: t.winners,
      rollover: t.rollover,
    }));
    await draw.save();

    res.json({ draw, preview: result });
  } catch (err) {
    next(err);
  }
};

const publish = async (req, res, next) => {
  try {
    const { drawId } = req.body;
    let draw;
    if (drawId) {
      draw = await Draw.findById(drawId);
    } else {
      draw = await Draw.findOne({ status: 'simulated' }).sort({ updatedAt: -1 });
    }
    if (!draw || draw.status !== 'simulated') {
      return res.status(400).json({ message: 'Simulate a draw before publishing' });
    }

    await Winner.deleteMany({ drawId: draw._id });

    for (const tier of draw.tiers) {
      if (!tier.winners?.length) continue;
      const amount = Math.round(
        ((draw.totalPool * tier.poolShare) / tier.winners.length) * 100
      ) / 100;
      for (const userId of tier.winners) {
        await Winner.create({
          drawId: draw._id,
          userId,
          tier: tier.tier,
          prizeAmount: amount,
          status: 'pending',
        });
      }
    }

    draw.status = 'published';
    draw.publishedAt = new Date();
    await draw.save();

    const winners = await Winner.find({ drawId: draw._id }).populate(
      'userId',
      'name email'
    );
    res.json({ draw, winners });
  } catch (err) {
    next(err);
  }
};

const listDraws = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const draws = await Draw.find().sort({ year: -1, month: -1 });
      return res.json({ draws });
    }

    const wins = await Winner.find({ userId: req.user._id }).populate('drawId');
    const drawIds = [...new Set(wins.map((w) => String(w.drawId?._id || w.drawId)))];
    const draws = await Draw.find({
      $or: [{ _id: { $in: drawIds } }, { status: 'published' }],
    })
      .sort({ year: -1, month: -1 })
      .limit(24);

    res.json({
      draws,
      myWins: wins,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { simulate, publish, listDraws };
