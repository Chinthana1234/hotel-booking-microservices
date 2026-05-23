const express = require('express');
const router = express.Router();
const { getRoomReviews, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:roomId').get(getRoomReviews);
router.route('/').post(protect, addReview);

module.exports = router;
