const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  listUsers,
  updateUser,
  getUserScores,
  updateUserScore,
  createUserScore,
  deleteUserScore,
  listSubscriptions,
  updateSubscription,
  adminListCharities,
  createCharity,
  updateCharity,
  deleteCharity,
  reports,
} = require('../controllers/adminController');

const router = express.Router();

router.use(auth, requireRole('admin'));

router.get('/users', listUsers);
router.patch('/users/:id', updateUser);

router.get('/subscriptions', listSubscriptions);
router.patch('/subscriptions/:id', updateSubscription);

router.get('/scores/:userId', getUserScores);
router.post('/scores/:userId', createUserScore);
router.patch('/scores/:userId/:scoreId', updateUserScore);
router.delete('/scores/:userId/:scoreId', deleteUserScore);

router.get('/charities', adminListCharities);
router.post('/charities', createCharity);
router.patch('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);

router.get('/reports', reports);

module.exports = router;
