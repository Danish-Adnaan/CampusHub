const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken, isStudent } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/profile', authenticateToken, isStudent, userController.getProfile);
router.get('/events', userController.getEvents);
router.post('/register-event/:id', authenticateToken, isStudent, userController.registerForEvent);

module.exports = router;