const Stripe = require('stripe');

let stripe = null;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
};

module.exports = { getStripe };
