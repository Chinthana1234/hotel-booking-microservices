const express = require('express');
const router = express.Router();
const {
    processPayment,
    getPaymentByBooking,
    getAllPayments
} = require('../controllers/paymentController');

router.route('/').post(processPayment);
router.route('/admin/all').get(getAllPayments);
router.route('/booking/:bookingId').get(getPaymentByBooking);

module.exports = router;
