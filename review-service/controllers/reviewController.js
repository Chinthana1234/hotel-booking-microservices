const Review = require('../models/Review');

// @desc    Get all reviews for a room
// @route   GET /api/reviews/:roomId
// @access  Public
const getRoomReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res) => {
    try {
        const { roomId, rating, comment } = req.body;
        const userId = req.user.id;

        // Check if user already reviewed this room
        const existingReview = await Review.findOne({ userId, roomId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this room' });
        }

        const review = await Review.create({
            userId,
            roomId,
            rating,
            comment
        });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoomReviews,
    addReview
};
