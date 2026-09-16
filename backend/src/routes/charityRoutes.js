const express = require('express');
const auth = require('../middleware/auth');
const {
  listCharities,
  getCharity,
  createDonation,
} = require('../controllers/charityController');

const router = express.Router();

router.get('/', listCharities);
router.get('/:id', getCharity);
router.post('/donations', auth, createDonation);

module.exports = router;
