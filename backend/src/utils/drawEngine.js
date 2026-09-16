const Score = require('../models/Score');
const Subscription = require('../models/Subscription');
const { calculatePrizePool, TIER_SHARES } = require('./prizePoolCalculator');

const SCORE_MIN = 1;
const SCORE_MAX = 45;
const DRAW_SIZE = 5;

const buildFrequencyMap = async (activeUserIds) => {
  const scores = await Score.find({ userId: { $in: activeUserIds } });
  const freq = {};
  for (let i = SCORE_MIN; i <= SCORE_MAX; i += 1) freq[i] = 1; // Laplace +1
  scores.forEach((s) => {
    freq[s.value] = (freq[s.value] || 1) + 1;
  });
  return { freq, scores };
};

const weightedSample = (freq) => {
  const entries = Object.entries(freq).map(([v, w]) => [Number(v), w]);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [value, weight] of entries) {
    r -= weight;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
};

const generateWinningValues = (type, freq) => {
  const values = [];
  for (let i = 0; i < DRAW_SIZE; i += 1) {
    if (type === 'algorithmic') {
      values.push(weightedSample(freq));
    } else {
      values.push(
        Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)) + SCORE_MIN
      );
    }
  }
  return values;
};

/** Count how many of the user's scores appear in the winning values multiset. */
const countMatches = (userScoreValues, winningValues) => {
  const pool = [...winningValues];
  let matches = 0;
  for (const v of userScoreValues) {
    const idx = pool.indexOf(v);
    if (idx !== -1) {
      matches += 1;
      pool.splice(idx, 1);
    }
  }
  return matches;
};

/**
 * Run a draw simulation (does not persist Winner docs — controller does on publish).
 */
const runDraw = async ({ type = 'random', month, year, jackpotRollover = 0 }) => {
  const activeSubs = await Subscription.find({ status: 'active' });
  const activeUserIds = activeSubs.map((s) => s.userId);

  const { freq, scores } = await buildFrequencyMap(activeUserIds);
  const winningValues = generateWinningValues(type, freq);

  const scoresByUser = {};
  scores.forEach((s) => {
    const key = String(s.userId);
    if (!scoresByUser[key]) scoresByUser[key] = [];
    scoresByUser[key].push(s.value);
  });

  const { totalPool, tiers } = calculatePrizePool(
    activeSubs,
    process.env.PRIZE_POOL_PERCENT,
    jackpotRollover
  );

  const winnersByTier = { 5: [], 4: [], 3: [] };

  for (const userId of activeUserIds) {
    const userScores = scoresByUser[String(userId)] || [];
    if (userScores.length === 0) continue;
    const matches = countMatches(userScores, winningValues);
    if (matches >= 3 && matches <= 5) {
      winnersByTier[matches].push(userId);
    }
  }

  const tierResults = tiers.map((t) => {
    const winners = winnersByTier[t.tier] || [];
    const rollover =
      t.tier === 5 && winners.length === 0 ? t.amount : 0;
    return {
      tier: t.tier,
      poolShare: TIER_SHARES[t.tier],
      amount: t.amount,
      winners,
      rollover,
      prizeEach:
        winners.length > 0
          ? Math.round((t.amount / winners.length) * 100) / 100
          : 0,
    };
  });

  return {
    month,
    year,
    type,
    winningValues,
    totalPool,
    tiers: tierResults,
    activeSubscriberCount: activeSubs.length,
  };
};

module.exports = {
  runDraw,
  countMatches,
  generateWinningValues,
  TIER_SHARES,
};
