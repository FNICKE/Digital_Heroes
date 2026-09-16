const { getStripe } = require('../config/stripe');
const Subscription = require('../models/Subscription');
const Donation = require('../models/Donation');
const User = require('../models/User');

const monthlyPrice = () => Number(process.env.MONTHLY_PRICE || 9.99);
const yearlyPrice = () => Number(process.env.YEARLY_PRICE || 99.9);

const planAmount = (plan) => (plan === 'yearly' ? yearlyPrice() : monthlyPrice());

const renewalFrom = (plan, from = new Date()) => {
  const d = new Date(from);
  if (plan === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d;
};

const recordSubscriptionDonation = async (user, amount) => {
  if (!user.charityId) return null;
  const charityAmount =
    Math.round(amount * (user.charityPercentage / 100) * 100) / 100;
  if (charityAmount <= 0) return null;
  return Donation.create({
    userId: user._id,
    charityId: user.charityId,
    amount: charityAmount,
    type: 'subscription-linked',
    date: new Date(),
  });
};

const activateLocalSubscription = async (userId, plan) => {
  const amount = planAmount(plan);
  const startDate = new Date();
  const renewalDate = renewalFrom(plan, startDate);

  let sub = await Subscription.findOne({ userId }).sort({ updatedAt: -1 });
  if (sub) {
    sub.plan = plan;
    sub.status = 'active';
    sub.startDate = startDate;
    sub.renewalDate = renewalDate;
    sub.amount = amount;
    await sub.save();
  } else {
    sub = await Subscription.create({
      userId,
      plan,
      status: 'active',
      startDate,
      renewalDate,
      amount,
    });
  }

  const user = await User.findById(userId);
  await recordSubscriptionDonation(user, amount);
  return sub;
};

const createCheckoutSession = async (user, plan) => {
  const stripe = getStripe();
  if (!stripe) {
    throw Object.assign(new Error('Stripe is not configured'), { statusCode: 503 });
  }

  const amount = planAmount(plan);
  let customerId = null;

  const existing = await Subscription.findOne({ userId: user._id }).sort({
    updatedAt: -1,
  });
  if (existing?.stripeCustomerId) {
    customerId = existing.stripeCustomerId;
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: String(user._id) },
    });
    customerId = customer.id;
  }

  const priceId =
    plan === 'yearly'
      ? process.env.STRIPE_PRICE_YEARLY
      : process.env.STRIPE_PRICE_MONTHLY;

  const lineItems = priceId
    ? [{ price: priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: 'gbp',
            product_data: { name: `Digital Heroes ${plan}` },
            unit_amount: Math.round(amount * 100),
            recurring: { interval: plan === 'yearly' ? 'year' : 'month' },
          },
          quantity: 1,
        },
      ];

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: lineItems,
    success_url: `${process.env.CLIENT_URL}/dashboard?subscribed=1`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard?subscribed=0`,
    metadata: { userId: String(user._id), plan },
  });

  if (!existing) {
    await Subscription.create({
      userId: user._id,
      plan,
      status: 'inactive',
      amount,
      stripeCustomerId: customerId,
    });
  } else {
    existing.plan = plan;
    existing.amount = amount;
    existing.stripeCustomerId = customerId;
    await existing.save();
  }

  return session;
};

const cancelSubscription = async (userId) => {
  const sub = await Subscription.findOne({ userId }).sort({ updatedAt: -1 });
  if (!sub) {
    throw Object.assign(new Error('No subscription found'), { statusCode: 404 });
  }

  const stripe = getStripe();
  if (stripe && sub.stripeSubscriptionId) {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  sub.status = 'cancelled';
  await sub.save();
  return sub;
};

const handleStripeWebhook = async (event) => {
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || 'monthly';
    if (!userId) return;

    const startDate = new Date();
    const renewalDate = renewalFrom(plan, startDate);
    const amount = planAmount(plan);

    let sub = await Subscription.findOne({ userId }).sort({ updatedAt: -1 });
    if (!sub) {
      sub = new Subscription({ userId, plan, amount });
    }
    sub.status = 'active';
    sub.plan = plan;
    sub.amount = amount;
    sub.startDate = startDate;
    sub.renewalDate = renewalDate;
    sub.stripeCustomerId = session.customer;
    sub.stripeSubscriptionId = session.subscription;
    await sub.save();

    const user = await User.findById(userId);
    if (user) await recordSubscriptionDonation(user, amount);
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object;
    const sub = await Subscription.findOne({
      stripeSubscriptionId: stripeSub.id,
    });
    if (sub) {
      sub.status = 'cancelled';
      await sub.save();
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const sub = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription,
    });
    if (sub) {
      sub.status = 'lapsed';
      await sub.save();
    }
  }
};

module.exports = {
  activateLocalSubscription,
  createCheckoutSession,
  cancelSubscription,
  handleStripeWebhook,
  planAmount,
  recordSubscriptionDonation,
};
