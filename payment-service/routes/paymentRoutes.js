const express = require('express');
const router = express.Router();
const { 
    processPayment, 
    getPaymentByBooking 
} = require('../controllers/paymentController');

router.route('/').post(processPayment);
router.route('/booking/:bookingId').get(getPaymentByBooking);

module.exports = router;
