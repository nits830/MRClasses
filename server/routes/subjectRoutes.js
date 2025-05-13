const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const Subject = require('../models/Subject'); // Adjust the path as necessary

// Static subjects array
const subjects = [
    { _id: '1', subject: 'Physics' },
    { _id: '2', subject: 'Maths' },
    { _id: '3', subject: 'Chemistry' },
    { _id: '4', subject: 'Biology' },
    { _id: '5', subject: 'English' },
    { _id: '6', subject: 'Hindi' },
    { _id: '7', subject: 'Social Science' },
    { _id: '8', subject: 'Computer Science' },
    
];

// Get all subjects (accessible to all users)
router.get('/subjects', auth, adminMiddleware, async (req, res) => {
    try {
        // Instead of fetching from the database, return the static subjects
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching subjects' });
    }
});




// Create a new subject (restricted to admins)
router.post('/subjects', auth, adminMiddleware, async (req, res) => {
    const { name, description } = req.body;

    try {
        const subject = new Subject({ name, description });
        await subject.save();
        res.status(201).json({ message: 'Subject created successfully', subject });
    } catch (error) {
        res.status(500).json({ message: 'Error creating subject' });
    }
});

// Update a subject (restricted to admins)
router.put('/subjects/:id', auth, adminMiddleware, async (req, res) => {
    const { name, description } = req.body;

    try {
        const subject = await Subject.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject updated successfully', subject });
    } catch (error) {
        res.status(500).json({ message: 'Error updating subject' });
    }
});

// Delete a subject (restricted to admins)
router.delete('/subjects/:id', auth, adminMiddleware, async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject' });
    }
});

module.exports = router;
