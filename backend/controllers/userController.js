const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { User, Event, Registration } = require('../db/db');
const { authSchema, studentAuthSchema } = require('../config/validation');
const emailService = require('../services/emailService');

const userController = {
    async signup(req, res) {
        try {
            const { email, password } = studentAuthSchema.parse(req.body);
            if (await User.findOne({ email })) return res.status(400).json({ success: false, msg: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const username = email.split("@")[0];
            const newUser = await User.create({ username, email, password: hashedPassword });
            const token = jwt.sign({ id: newUser._id, email }, process.env.JWT_SECRET);
            await emailService.sendWelcomeEmail(newUser);

            res.status(201).json({
                success: true,
                msg: 'User signed up successfully',
                token,
                user: { id: newUser._id, username, email }
            });
        } catch (error) {
            if (error instanceof z.ZodError) return res.status(400).json({ success: false, msg: 'Invalid input', errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) });
            throw error;
        }
    },

    async signin(req, res) {
        try {
            const { email, password } = authSchema.parse(req.body);
            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ success: false, msg: 'Invalid credentials' });

            const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET);
            res.json({ success: true, msg: 'User logged in successfully', token, user: { id: user._id, username: user.username, email } });
        } catch (error) {
            if (error instanceof z.ZodError) return res.status(400).json({ success: false, msg: 'Invalid input', errors: error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`) });
            throw error;
        }
    },

    async getProfile(req, res) {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, msg: "User not found" });
        res.json({ success: true, user });
    },

    async getEvents(req, res) {
        const events = await Event.find();
        res.json({ success: true, events });
    },

    async registerForEvent(req, res) {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, msg: 'Event not found' });

        const existingRegistration = await Registration.findOne({ user: req.user.id, event: event._id });
        if (existingRegistration) return res.status(400).json({ success: false, msg: 'Already registered' });

        await Registration.create({ user: req.user.id, event: event._id });
        await event.updateOne({ $push: { attendees: req.user.id } });
        await emailService.sendEventRegistrationEmail(event, req.user);
        res.json({ success: true, msg: 'Registered successfully!' });
    }
};

module.exports = userController;