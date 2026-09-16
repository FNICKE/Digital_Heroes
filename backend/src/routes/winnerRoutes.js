const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requireActiveSub = require('../middleware/requireActiveSub');
const {
  uploadProof,
  review,
  markPaid,
  listMine,
  listAll,
} = require('../controllers/winnerController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Images only'));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.get('/mine', auth, requireActiveSub, listMine);
router.get('/', auth, requireRole('admin'), listAll);
router.post('/:id/proof', auth, requireActiveSub, upload.single('proof'), uploadProof);
router.patch('/:id/review', auth, requireRole('admin'), review);
router.patch('/:id/pay', auth, requireRole('admin'), markPaid);

module.exports = router;
