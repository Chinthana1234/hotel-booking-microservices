const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please add a user ID']
    },
    roomId: {
        type: String,
        required: [true, 'Please add a room ID']
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
