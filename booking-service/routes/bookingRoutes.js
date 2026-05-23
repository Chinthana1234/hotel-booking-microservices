const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getUserBookings, 
    cancelBooking 
} = require('../controllers/bookingController');

router.route('/').post(createBooking);
router.route('/user/:userId').get(getUserBookings);
router.route('/:id').delete(cancelBooking);

module.exports = router;
