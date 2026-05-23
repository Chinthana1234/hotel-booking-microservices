const Booking = require('../models/Booking');
const axios = require('axios');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Should be protected in real app)
const createBooking = async (req, res) => {
    try {
        const { userId, roomId, checkInDate, checkOutDate, totalPrice } = req.body;

        // 1. Communicate with Room Service to check if room is available
        const roomResponse = await axios.get(`${process.env.ROOM_SERVICE_URL}/api/rooms/${roomId}`);
        const room = roomResponse.data;

        if (!room.isAvailable) {
            return res.status(400).json({ message: 'Room is currently not available' });
        }

        // 2. Create the booking in the database
        const booking = await Booking.create({
            userId,
            roomId,
            checkInDate,
            checkOutDate,
            totalPrice
        });

        // 3. Communicate with Room Service to update availability to false (booked)
        await axios.put(`${process.env.ROOM_SERVICE_URL}/api/rooms/${roomId}/availability`, {
            isAvailable: false
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating booking', 
            error: error.message 
        });
    }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings/user/:userId
// @access  Public
const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a booking
// @route   DELETE /api/bookings/:id
// @access  Public
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // 1. Update Room Service to make room available again
        await axios.put(`${process.env.ROOM_SERVICE_URL}/api/rooms/${booking.roomId}/availability`, {
            isAvailable: true
        });

        // 2. Change booking status to Cancelled (instead of deleting from DB to keep history)
        booking.status = 'Cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    cancelBooking
};
