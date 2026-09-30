const jwt = require('jsonwebtoken');
const { User, Admin } = require('../db/db');

const authenticateToken = (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ success: false, msg: "Access denied" });
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ success: false, msg: "Invalid token" });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.user.id);
        if (!admin || admin.role !== 'admin') return res.status(403).json({ success: false, msg: "Access denied" });
        next();
    } catch (error) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

const isStudent = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'student') return res.status(403).json({ success: false, msg: "Student access required" });
        req.userRecord = user;
        next();
    } catch (error) {
        res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports = { authenticateToken, isAdmin, isStudent };