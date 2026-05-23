const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'Please add a room number'],
        unique: true
    },
    type: {
        type: String,
        required: [true, 'Please add a room type (e.g., Single, Double, Suite)']
    },
    pricePerNight: {
        type: Number,
        required: [true, 'Please add a price per night']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
