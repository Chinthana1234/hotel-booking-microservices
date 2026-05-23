const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: [true, 'Please add a booking ID']
    },
    userId: {
        type: String,
        required: [true, 'Please add a user ID']
    },
    amount: {
        type: Number,
        required: [true, 'Please add the payment amount']
    },
    paymentMethod: {
        type: String,
        required: [true, 'Please add a payment method (e.g., Credit Card, PayPal)']
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Completed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
