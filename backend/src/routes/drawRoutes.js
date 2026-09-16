const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requireActiveSub = require('../middleware/requireActiveSub');
const { simulate, publish, listDraws } = require('../controllers/drawController');

const router = express.Router();

router.get('/', auth, requireActiveSub, listDraws);
router.post('/simulate', auth, requireRole('admin'), simulate);
router.post('/publish', auth, requireRole('admin'), publish);

module.exports = router;
