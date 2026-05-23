const express = require('express');
const router = express.Router();
const { 
    getRooms, 
    getRoomById, 
    createRoom, 
    updateRoomAvailability,
    deleteRoom
} = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getRooms)
    .post(protect, admin, createRoom);

router.route('/:id')
    .get(getRoomById)
    .delete(protect, admin, deleteRoom);

router.route('/:id/availability').put(updateRoomAvailability);

module.exports = router;
