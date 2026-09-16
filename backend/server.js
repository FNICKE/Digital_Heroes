const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const { getStripe } = require('./src/config/stripe');
const { handleStripeWebhook } = require('./src/services/stripeService');

const authRoutes = require('./src/routes/authRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const scoreRoutes = require('./src/routes/scoreRoutes');
const charityRoutes = require('./src/routes/charityRoutes');
const drawRoutes = require('./src/routes/drawRoutes');
const winnerRoutes = require('./src/routes/winnerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));

// Stripe webhook needs raw body
app.post(
  '/api/subscriptions/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const stripe = getStripe();
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(503).send('Stripe webhook not configured');
    }
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      await handleStripeWebhook(event);
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'digital-heroes-api' });
});

app.use('/api/auth', authRoutes);
app.patch(
  '/api/users/me/charity',
  require('./src/middleware/auth'),
  require('./src/controllers/authController').updateMyCharity
);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);

// Convenience: POST /api/donations → charity routes donations
app.post('/api/donations', require('./src/middleware/auth'), require('./src/controllers/charityController').createDonation);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Digital Heroes API on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
