const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find({});
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new room
// @route   POST /api/rooms
// @access  Public (Should be admin in a real app)
const createRoom = async (req, res) => {
    try {
        const { roomNumber, type, pricePerNight, description } = req.body;

        const roomExists = await Room.findOne({ roomNumber });

        if (roomExists) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        const room = await Room.create({
            roomNumber,
            type,
            pricePerNight,
            description
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update room availability
// @route   PUT /api/rooms/:id/availability
// @access  Public (Will be called by Booking Service internally later)
const updateRoomAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const room = await Room.findById(req.params.id);

        if (room) {
            room.isAvailable = isAvailable;
            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRooms,
    getRoomById,
    createRoom,
    updateRoomAvailability,
    deleteRoom
};
