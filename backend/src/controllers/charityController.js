const Charity = require('../models/Charity');
const Donation = require('../models/Donation');

const listCharities = async (req, res, next) => {
  try {
    const charities = await Charity.find().sort({ isFeatured: -1, name: 1 });
    res.json({ charities });
  } catch (err) {
    next(err);
  }
};

const getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    next(err);
  }
};

const createDonation = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    const { charityId } = req.body;
    if (!charityId || !(amount > 0)) {
      return res.status(400).json({ message: 'charityId and positive amount required' });
    }
    const charity = await Charity.findById(charityId);
    if (!charity) return res.status(404).json({ message: 'Charity not found' });

    const donation = await Donation.create({
      userId: req.user._id,
      charityId,
      amount,
      type: 'independent',
      date: new Date(),
    });
    res.status(201).json({ donation });
  } catch (err) {
    next(err);
  }
};

module.exports = { listCharities, getCharity, createDonation };
