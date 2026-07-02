const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getAllUsers, promoteUserToAdmin } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/', getAllUsers);
router.put('/:id/promote', promoteUserToAdmin);

module.exports = router;
