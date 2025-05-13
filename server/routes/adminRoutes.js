const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/admin');
const auth = require('../middleware/auth');
const User = require('../models/User');

// User Management Routes
router.get('/users', auth, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.get('/users/:id', auth, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

router.put('/users/:id', auth, adminMiddleware, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, role },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

router.delete('/users/:id', auth, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Tutorial Management Routes;
router.get('/tutorials', auth, (req, res) => {
    // Logic to retrieve all tutorials
});

router.post('/tutorials', auth, adminMiddleware, (req, res) => {
    // Logic to create a new tutorial
});

router.put('/tutorials/:id', auth, adminMiddleware, (req, res) => {
    // Logic to update a specific tutorial by ID
});

router.delete('/tutorials/:id', auth, adminMiddleware, (req, res) => {
    // Logic to delete a specific tutorial by ID
});

// Category Management Routes
router.get('/categories', auth, (req, res) => {
    // Logic to retrieve all categories
});

router.post('/categories', auth, adminMiddleware, (req, res) => {
    // Logic to create a new category
});

router.put('/categories/:id', auth, adminMiddleware, (req, res) => {
    // Logic to update a specific category by ID
});

router.delete('/categories/:id', auth, adminMiddleware, (req, res) => {
    // Logic to delete a specific category by ID
});

module.exports = router;
