const express = require('express');
const auth = require('../middleware/auth');
const {
  createSubscription,
  cancel,
  status,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.post('/', auth, createSubscription);
router.patch('/cancel', auth, cancel);
router.get('/status', auth, status);

module.exports = router;
