const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing User ID from User Service
        required: [true, 'Please add a user ID']
    },
    roomId: {
        type: String, // Storing Room ID from Room Service
        required: [true, 'Please add a room ID']
    },
    checkInDate: {
        type: Date,
        required: [true, 'Please add a check-in date']
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Please add a check-out date']
    },
    totalPrice: {
        type: Number,
        required: [true, 'Please add total price']
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Confirmed'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
