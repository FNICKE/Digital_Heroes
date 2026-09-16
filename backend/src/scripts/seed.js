const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Score = require('../models/Score');
const Charity = require('../models/Charity');
const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Donation = require('../models/Donation');

const daysAgo = (n) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
};

const seed = async () => {
  await connectDB();

  console.log('Clearing collections...');
  await Promise.all([
    User.deleteMany({}),
    Subscription.deleteMany({}),
    Score.deleteMany({}),
    Charity.deleteMany({}),
    Draw.deleteMany({}),
    Winner.deleteMany({}),
    Donation.deleteMany({}),
  ]);

  console.log('Seeding 15 charities...');
  const charities = await Charity.insertMany([
    {
      name: 'Harbour Light Youth',
      description:
        'After-school mentoring and safe spaces for young people in coastal towns. Your subscription sends hope where it matters.',
      images: [
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&q=80',
      ],
      events: [
        {
          title: 'Summer Mentorship Fair',
          date: daysAgo(-20),
          location: 'Brighton Pavilion',
          details: 'Meet mentors and partners.',
        },
      ],
      isFeatured: true,
    },
    {
      name: 'Green Canopy Trust',
      description:
        'Community tree-planting and urban cooling projects that restore shared green space in city centers.',
      images: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&q=80',
      ],
      events: [
        {
          title: 'Urban Tree Planting Day',
          date: daysAgo(-15),
          location: 'Manchester Community Park',
          details: 'Planting 200 saplings with local families.',
        },
      ],
      isFeatured: true,
    },
    {
      name: 'Kitchen Table Collective',
      description:
        'Meals, dignity, and neighbour support for families navigating hardship across Yorkshire.',
      images: [
        'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200&q=80',
      ],
      events: [
        {
          title: 'Community Supper',
          date: daysAgo(-5),
          location: 'Leeds Hall',
          details: 'Open doors, shared tables.',
        },
      ],
      isFeatured: false,
    },
    {
      name: 'Blue Wave Ocean Rescue',
      description:
        'Dedicated to coastal cleanup, marine wildlife rehabilitation, and eliminating ocean plastic pollution.',
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      ],
      events: [
        {
          title: 'Cornwall Beach Sweep',
          date: daysAgo(-30),
          location: 'Newquay Coast',
          details: 'Community beach cleanup and recycling challenge.',
        },
      ],
      isFeatured: true,
    },
    {
      name: 'Highland Wildlife Sanctuary',
      description:
        'Protecting endangered Scottish wildcats and red squirrels through habitat restoration.',
      images: [
        'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Veterans on the Green',
      description:
        'Golf therapy, peer camaraderie, and mental health rehabilitation programmes for armed forces veterans.',
      images: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1200&q=80',
      ],
      events: [
        {
          title: 'Annual Charity Pro-Am',
          date: daysAgo(-12),
          location: 'St Andrews Links',
          details: '18-hole scramble tournament supporting veteran transition services.',
        },
      ],
      isFeatured: true,
    },
    {
      name: 'Fairway to Future Academy',
      description:
        'Providing junior golf equipment, coaching, and life skills for underprivileged youth in inner cities.',
      images: [
        'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Shelter First Housing',
      description:
        'Rapid emergency shelter, warm beds, and long-term tenancy support for unhoused individuals.',
      images: [
        'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Mind & Meadow Wellbeing',
      description:
        'Therapeutic horticulture and outdoor mindfulness programs reducing loneliness in older adults.',
      images: [
        'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Reading Seeds Foundation',
      description:
        'Free book distribution and literacy workshops for primary school pupils in underserved areas.',
      images: [
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Clean Air Pathways',
      description:
        'Advocating for safe, low-emission school streets and green urban cycle corridors.',
      images: [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1200&q=80',
      ],
      events: [],
      isFeatured: true,
    },
    {
      name: 'Hope Bridge Hospice',
      description:
        'Compassionate palliative care and bereavement support services for families facing terminal illness.',
      images: [
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Rural Wheels Community Transport',
      description:
        'Volunteer drivers helping elderly and disabled rural residents attend hospital appointments.',
      images: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'Music Heals Children Trust',
      description:
        'Music therapy sessions in pediatric hospital wards to bring comfort and joy to sick children.',
      images: [
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
    {
      name: 'River Guardians Network',
      description:
        'Monitoring water quality, clearing riverbank pollution, and protecting native salmon and otters.',
      images: [
        'https://images.unsplash.com/photo-1437482078695-73f5ca6c96e2?w=1200&q=80',
      ],
      events: [],
      isFeatured: false,
    },
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);

  console.log('Seeding Admin and 15 Subscribers...');
  const admin = await User.create({
    name: 'Admin Hero',
    email: 'admin@digitalheroes.test',
    passwordHash,
    role: 'admin',
    charityId: charities[0]._id,
    charityPercentage: 15,
  });

  const subscriberSeedDefs = [
    { name: 'Alex Rivera', email: 'alex@digitalheroes.test', charityIdx: 0, pct: 12 },
    { name: 'Jordan Lee', email: 'jordan@digitalheroes.test', charityIdx: 1, pct: 20 },
    { name: 'Sam Okonkwo', email: 'sam@digitalheroes.test', charityIdx: 2, pct: 10 },
    { name: 'Maya Patel', email: 'maya@digitalheroes.test', charityIdx: 3, pct: 15 },
    { name: 'Liam Davies', email: 'liam@digitalheroes.test', charityIdx: 4, pct: 25 },
    { name: 'Elena Rostova', email: 'elena@digitalheroes.test', charityIdx: 5, pct: 18 },
    { name: 'Marcus Bell', email: 'marcus@digitalheroes.test', charityIdx: 6, pct: 10 },
    { name: 'Chloe Taylor', email: 'chloe@digitalheroes.test', charityIdx: 7, pct: 30 },
    { name: 'David Evans', email: 'david@digitalheroes.test', charityIdx: 8, pct: 14 },
    { name: 'Sophie Martin', email: 'sophie@digitalheroes.test', charityIdx: 9, pct: 12 },
    { name: 'Ryan O’Connor', email: 'ryan@digitalheroes.test', charityIdx: 10, pct: 22 },
    { name: 'Priya Sharma', email: 'priya@digitalheroes.test', charityIdx: 11, pct: 16 },
    { name: 'Daniel Hughes', email: 'daniel@digitalheroes.test', charityIdx: 12, pct: 10 },
    { name: 'Olivia Scott', email: 'olivia@digitalheroes.test', charityIdx: 13, pct: 25 },
    { name: 'Thomas Wright', email: 'thomas@digitalheroes.test', charityIdx: 14, pct: 15 },
  ];

  const subscribers = await User.insertMany(
    subscriberSeedDefs.map((s) => ({
      name: s.name,
      email: s.email,
      passwordHash,
      role: 'subscriber',
      charityId: charities[s.charityIdx]._id,
      charityPercentage: s.pct,
    }))
  );

  console.log('Seeding Subscriptions & linked Donations...');
  const subConfigs = [
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 45, renewIn: 15 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 35, renewIn: 25 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 50, renewIn: 10 },
    { plan: 'yearly',  status: 'active', amount: 99.90, daysBack: 60, renewIn: 305 },
    { plan: 'yearly',  status: 'active', amount: 99.90, daysBack: 90, renewIn: 275 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 20, renewIn: 10 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 15, renewIn: 15 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 10, renewIn: 20 },
    { plan: 'yearly',  status: 'active', amount: 99.90, daysBack: 30, renewIn: 335 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 25, renewIn: 5 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 5, renewIn: 25 },
    { plan: 'monthly', status: 'active', amount: 9.99, daysBack: 12, renewIn: 18 },
    { plan: 'monthly', status: 'cancelled', amount: 9.99, daysBack: 90, renewIn: -60 },
    { plan: 'monthly', status: 'lapsed', amount: 9.99, daysBack: 60, renewIn: -30 },
    { plan: 'monthly', status: 'inactive', amount: 9.99, daysBack: 1, renewIn: -1 },
  ];

  for (let i = 0; i < subscribers.length; i += 1) {
    const u = subscribers[i];
    const cfg = subConfigs[i] || subConfigs[0];
    const startDate = daysAgo(cfg.daysBack);
    const renewalDate = daysAgo(-cfg.renewIn);

    await Subscription.create({
      userId: u._id,
      plan: cfg.plan,
      status: cfg.status,
      startDate,
      renewalDate,
      amount: cfg.amount,
    });

    if (cfg.status === 'active') {
      await Donation.create({
        userId: u._id,
        charityId: u.charityId,
        amount: Math.round(cfg.amount * (u.charityPercentage / 100) * 100) / 100,
        type: 'subscription-linked',
        date: startDate,
      });
    }
  }

  // Also add several independent donations
  console.log('Seeding independent donations...');
  for (let i = 0; i < 8; i += 1) {
    await Donation.create({
      userId: subscribers[i]._id,
      charityId: charities[(i + 3) % charities.length]._id,
      amount: 15 + i * 5,
      type: 'independent',
      date: daysAgo(i * 4 + 2),
    });
  }

  console.log('Seeding Stableford scores for all active subscribers...');
  const baseScores = [
    [28, 31, 22, 35, 29],
    [31, 27, 35, 24, 30],
    [22, 35, 28, 19, 33],
    [34, 36, 29, 31, 27],
    [25, 28, 32, 30, 35],
    [30, 31, 33, 28, 29],
    [26, 29, 34, 31, 28],
    [33, 35, 30, 27, 32],
    [29, 32, 28, 34, 31],
    [27, 30, 31, 33, 29],
    [32, 34, 29, 28, 36],
    [35, 31, 26, 30, 33],
    [28, 30, 32, 29, 31],
    [31, 33, 28, 35, 27],
    [29, 31, 34, 30, 28],
  ];

  for (let i = 0; i < subscribers.length; i += 1) {
    const scores = baseScores[i] || [30, 31, 32, 33, 34];
    for (let j = 0; j < 5; j += 1) {
      await Score.create({
        userId: subscribers[i]._id,
        value: scores[j],
        date: daysAgo(j * 4 + 1),
      });
    }
  }

  console.log('Seeding 12 Monthly Draws (10+ past draws)...');
  const now = new Date();
  const createdDraws = [];

  for (let m = 1; m <= 12; m += 1) {
    // 12 months going back
    const drawDate = new Date(now.getFullYear(), now.getMonth() - (12 - m), 1);
    const month = drawDate.getMonth() + 1;
    const year = drawDate.getFullYear();
    const isLatest = m === 12;

    const winningVals = [
      Math.floor(Math.random() * 8) + 20,
      Math.floor(Math.random() * 8) + 25,
      Math.floor(Math.random() * 8) + 28,
      Math.floor(Math.random() * 8) + 31,
      Math.floor(Math.random() * 8) + 35,
    ];

    const pool = 24.0 + m * 2.5;

    const d = await Draw.create({
      month,
      year,
      type: m % 2 === 0 ? 'algorithmic' : 'random',
      status: isLatest ? 'simulated' : 'published',
      winningValues: winningVals,
      totalPool: pool,
      tiers: [
        {
          tier: 5,
          poolShare: 0.4,
          winners: m === 7 ? [subscribers[0]._id] : [],
          rollover: m === 7 ? 0 : Math.round(pool * 0.4 * 100) / 100,
        },
        {
          tier: 4,
          poolShare: 0.35,
          winners: [subscribers[(m * 2) % subscribers.length]._id, subscribers[(m * 2 + 1) % subscribers.length]._id],
          rollover: 0,
        },
        {
          tier: 3,
          poolShare: 0.25,
          winners: [subscribers[(m * 3) % subscribers.length]._id],
          rollover: 0,
        },
      ],
      publishedAt: isLatest ? null : daysAgo((12 - m) * 30 + 5),
    });
    createdDraws.push(d);
  }

  console.log('Seeding 15+ Winner records...');
  const winnerStatuses = ['paid', 'pending', 'paid', 'pending', 'rejected', 'paid'];
  const winnerDocs = [];

  for (let i = 0; i < 15; i += 1) {
    const draw = createdDraws[i % 11]; // use published draws
    const sub = subscribers[i % subscribers.length];
    const tier = (i % 3) === 0 ? 5 : (i % 3) === 1 ? 4 : 3;
    const prize = tier === 5 ? 12.5 : tier === 4 ? 4.2 : 2.1;
    const status = winnerStatuses[i % winnerStatuses.length];

    winnerDocs.push({
      drawId: draw._id,
      userId: sub._id,
      tier,
      prizeAmount: prize,
      status,
      proofImageUrl: status !== 'pending' || i % 2 === 0
        ? `https://placehold.co/600x400/png?text=Scorecard+Proof+Winner+${i + 1}`
        : '',
      reviewedBy: status !== 'pending' ? admin._id : null,
      reviewedAt: status !== 'pending' ? daysAgo(i * 3 + 2) : null,
    });
  }

  await Winner.insertMany(winnerDocs);

  console.log('----------------------------------------------------');
  console.log('Seed completed successfully!');
  console.log(`Charities seeded:    ${charities.length}`);
  console.log(`Users seeded:        ${subscribers.length + 1} (1 Admin, ${subscribers.length} Subscribers)`);
  console.log(`Subscriptions seeded:${subscribers.length}`);
  console.log(`Monthly Draws seeded:${createdDraws.length}`);
  console.log(`Winners seeded:      ${winnerDocs.length}`);
  console.log('----------------------------------------------------');
  console.log('Admin login:         admin@digitalheroes.test / password123');
  console.log('Subscriber login:    alex@digitalheroes.test / password123');
  console.log('                     (or jordan, sam, maya, liam... all: password123)');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
