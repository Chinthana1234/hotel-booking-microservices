const express = require('express');
const router = express.Router();
const { 
    getRooms, 
    getRoomById, 
    createRoom, 
    updateRoomAvailability 
} = require('../controllers/roomController');

router.route('/').get(getRooms).post(createRoom);
router.route('/:id').get(getRoomById);
router.route('/:id/availability').put(updateRoomAvailability);

module.exports = router;
