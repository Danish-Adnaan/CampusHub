const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/signin', adminController.signin);
router.get('/profile', authenticateToken, isAdmin, adminController.getProfile);
router.get('/events', authenticateToken, isAdmin, adminController.getEvents);
router.post('/create-event', authenticateToken, isAdmin, adminController.createEvent);
router.put('/edit-event/:id', authenticateToken, isAdmin, adminController.updateEvent);
router.delete('/delete-event/:id', authenticateToken, adminController.deleteEvent);
router.get('/event/:eventId/registrations', authenticateToken, isAdmin, adminController.getEventRegistrations);

module.exports = router;