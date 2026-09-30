const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { Event, Registration, Admin } = require('../db/db');
const { authSchema, eventSchema } = require('../config/validation');
const emailService = require('../services/emailService');

const adminController = {
    async signin(req, res) {
        try {
            const { email, password } = authSchema.parse(req.body);
            const admin = await Admin.findOne({ email });
            if (!admin || !(await bcrypt.compare(password, admin.password))) return res.status(400).json({ success: false, msg: 'Invalid credentials' });

            const token = jwt.sign({ id: admin._id, email }, process.env.JWT_SECRET);
            res.json({ success: true, msg: 'Admin logged in successfully', token, admin: { id: admin._id, username: admin.username, email } });
        } catch (error) {
            if (error instanceof z.ZodError) return res.status(400).json({ success: false, msg: 'Invalid input', errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) });
            throw error;
        }
    },

    async getProfile(req, res) {
        const admin = await Admin.findById(req.user.id).select("-password");
        if (!admin) return res.status(404).json({ success: false, msg: "Admin not found" });
        res.json({ success: true, admin });
    },

    async getEvents(req, res) {
        const events = await Event.find();
        const registrations = await Registration.find();
        registrations.map(registration => {
            const event = events.find(event => event._id.toString() === registration.event.toString());
            if (event) event.attendees.push(registration.user);
        });
        res.json({ success: true, events });
    },

    async createEvent(req, res) {
        try {
            const eventData = eventSchema.parse(req.body);
            const newEvent = await Event.create({ ...eventData, organizer: req.user.id, attendees: [] });
            await emailService.sendEventNotification(newEvent);
            res.status(201).json({ success: true, msg: 'Event created successfully', event: newEvent });
        } catch (error) {
            if (error instanceof z.ZodError) return res.status(400).json({ success: false, msg: 'Invalid input', errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) });
            throw error;
        }
    },

    async updateEvent(req, res) {
        try {
            const eventData = eventSchema.parse(req.body);
            const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true });
            if (!updatedEvent) return res.status(404).json({ success: false, msg: "Event not found" });
            await emailService.sendEventNotification(updatedEvent);
            res.json({ success: true, msg: "Event updated successfully", event: updatedEvent });
        } catch (error) {
            if (error instanceof z.ZodError) return res.status(400).json({ success: false, msg: 'Invalid input', errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) });
            throw error;
        }
    },

    async deleteEvent(req, res) {
        await Event.findByIdAndDelete(req.params.id);
        await Registration.deleteMany({ event: req.params.id });
        res.json({ success: true, msg: 'Event deleted successfully' });
    },

    async getEventRegistrations(req, res) {
        const registrations = await Registration.find({ event: req.params.eventId }).populate('user', 'username email');
        res.json({ success: true, registrations });
    }
};

module.exports = adminController;