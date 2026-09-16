const TIER_SHARES = { 5: 0.4, 4: 0.35, 3: 0.25 };

/**
 * Calculate prize pool from active subscriptions and optional jackpot rollover.
 */
const calculatePrizePool = (activeSubscriptions, prizePoolPercent, jackpotRollover = 0) => {
  const percent = Number(prizePoolPercent ?? process.env.PRIZE_POOL_PERCENT ?? 20);
  const fromSubs = activeSubscriptions.reduce((sum, s) => {
    // Normalize yearly to monthly-equivalent contribution for the current month's pool
    const monthlyEquiv =
      s.plan === 'yearly' ? Number(s.amount) / 12 : Number(s.amount);
    return sum + monthlyEquiv * (percent / 100);
  }, 0);

  const totalPool = Math.round((fromSubs + Number(jackpotRollover || 0)) * 100) / 100;

  const tiers = [5, 4, 3].map((tier) => ({
    tier,
    poolShare: TIER_SHARES[tier],
    amount: Math.round(totalPool * TIER_SHARES[tier] * 100) / 100,
    winners: [],
    rollover: 0,
  }));

  return { totalPool, tiers, percent, fromSubs, jackpotRollover: Number(jackpotRollover || 0) };
};

module.exports = { calculatePrizePool, TIER_SHARES };
