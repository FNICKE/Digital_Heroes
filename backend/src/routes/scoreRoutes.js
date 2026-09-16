const express = require('express');
const auth = require('../middleware/auth');
const requireActiveSub = require('../middleware/requireActiveSub');
const {
  listScores,
  createScore,
  updateScore,
  deleteScore,
} = require('../controllers/scoreController');

const router = express.Router();

router.use(auth, requireActiveSub);

router.get('/', listScores);
router.post('/', createScore);
router.patch('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;
