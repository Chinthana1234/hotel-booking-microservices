const Payment = require('../models/Payment');
const axios = require('axios');

// @desc    Process a new payment
// @route   POST /api/payments
// @access  Public
const processPayment = async (req, res) => {
    try {
        const { bookingId, userId, amount, paymentMethod } = req.body;

        // In a real production application, you would integrate Stripe or PayPal here.
        // For this microservices architecture example, we will simulate a successful payment.

        // Create the payment record in the local database
        const payment = await Payment.create({
            bookingId,
            userId,
            amount,
            paymentMethod,
            status: 'Completed' // Simulating a successful transaction
        });

        // Optional: In a more advanced setup, the Payment Service could notify 
        // the Booking Service that the payment was successful via a webhook or message broker.

        res.status(201).json({
            message: 'Payment processed successfully',
            payment
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Payment processing failed', 
            error: error.message 
        });
    }
};

// @desc    Get payment details by Booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Public
const getPaymentByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ bookingId: req.params.bookingId });
        
        if (payment) {
            res.json(payment);
        } else {
            res.status(404).json({ message: 'No payment found for this booking' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    processPayment,
    getPaymentByBooking
};
