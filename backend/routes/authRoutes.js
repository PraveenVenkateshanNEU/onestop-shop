const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ username, email, password, role: 'user'});
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        console.log('Login attempt for:', email);
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user || !(await user.comparePassword(password))){
            console.log('Password match:', false);
            return res.status(400).json({ message: 'Invalid credentials' });
        }
            
        console.log('Password match:', true);
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role,
        };

        res.json({ token, message: 'Login successful', session: req.session.user });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: err.message });
    }
});

// Get Current Session
router.get('/session', (req, res) => {
    if (req.session.user) {
        res.json({ session: req.session.user });
    } else {
        res.status(401).json({ message: 'No active session' });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    if (!req.session) {
        return res.status(400).json({ message: "No active session found" });
    }

    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});


module.exports = router;
