const Booking = require('../models/Booking');
const axios = require('axios');
const { publishEvent } = require('../utils/rabbitmq');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public (Should be protected in real app)
const createBooking = async (req, res) => {
    try {
        const { userId, roomId, checkInDate, checkOutDate, totalPrice } = req.body;

        // Convert dates
        const reqCheckIn = new Date(checkInDate);
        const reqCheckOut = new Date(checkOutDate);

        // 1. Communicate with Room Service to check if room exists
        const roomResponse = await axios.get(`${process.env.ROOM_SERVICE_URL}/api/rooms/${roomId}`);
        const room = roomResponse.data;

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // 1.5 Check for overlapping bookings for this specific room
        const overlappingBookings = await Booking.find({
            roomId: roomId,
            status: { $ne: 'Cancelled' },
            $and: [
                { checkInDate: { $lt: reqCheckOut } },
                { checkOutDate: { $gt: reqCheckIn } }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({ message: 'Room is not available for the selected dates' });
        }

        // 2. Create the booking in the database
        const booking = await Booking.create({
            userId,
            roomId,
            checkInDate: reqCheckIn,
            checkOutDate: reqCheckOut,
            totalPrice
        });

        // 3. Publish BookingConfirmed event to RabbitMQ
        await publishEvent('PaymentService.Events:BookingConfirmed', '', {
            eventType: 'BookingConfirmed',
            bookingId: booking._id,
            userId: booking.userId,
            roomId: booking.roomId,
            amount: booking.totalPrice,
            timestamp: new Date().toISOString()
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

        // 1. We no longer need to manually set the room to available
        // because we don't set it to unavailable anymore.

        // 2. Change booking status to Cancelled (instead of deleting from DB to keep history)
        booking.status = 'Cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available rooms for dates
// @route   GET /api/bookings/available-rooms
// @access  Public
const getAvailableRooms = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        // Fetch all rooms
        const roomsResponse = await axios.get(`${process.env.ROOM_SERVICE_URL}/api/rooms`);
        const allRooms = roomsResponse.data;

        if (!checkIn || !checkOut) {
            // If no dates provided, just return all rooms
            return res.json(allRooms);
        }

        const reqCheckIn = new Date(checkIn);
        const reqCheckOut = new Date(checkOut);

        // Find bookings that overlap with requested dates
        const overlappingBookings = await Booking.find({
            status: { $ne: 'Cancelled' },
            $and: [
                { checkInDate: { $lt: reqCheckOut } },
                { checkOutDate: { $gt: reqCheckIn } }
            ]
        });

        // Extract booked room IDs
        const bookedRoomIds = overlappingBookings.map(b => b.roomId.toString());

        // Filter out booked rooms
        const availableRooms = allRooms.filter(room => !bookedRoomIds.includes(room._id.toString()));

        res.json(availableRooms);
    } catch (error) {
        res.status(500).json({ message: 'Error checking availability', error: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    cancelBooking,
    getAvailableRooms,
    getAllBookings
};
