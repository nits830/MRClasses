const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Create new feedback
router.post('/', auth, async (req, res) => {
  try {
    const feedback = new Feedback({
      user: req.user._id,
      category: req.body.category,
      content: req.body.content
    });
    await feedback.save();
    
    // Populate user data before sending response
    await feedback.populate('user', 'name email');
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(400).json({ error: 'Error creating feedback' });
  }
});

// Get user's feedback
router.get('/my-feedback', auth, async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ error: 'Error getting feedback' });
  }
});

// Admin routes
// Get all feedback
router.get('/all', auth, adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ error: 'Error getting feedback' });
  }
});

// Update feedback status
router.patch('/:id/status', auth, adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    feedback.status = req.body.status;
    await feedback.save();
    
    // Populate user data before sending response
    await feedback.populate('user', 'name email');
    res.json(feedback);
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(400).json({ error: 'Error updating feedback status' });
  }
});

// Add/Update response to feedback
router.post('/:id/respond', auth, adminMiddleware, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    feedback.response = req.body.response;
    if (!feedback.status || feedback.status === 'pending') {
      feedback.status = 'inProgress';
    }
    await feedback.save();
    
    // Populate user data before sending response
    await feedback.populate('user', 'name email');
    res.json(feedback);
  } catch (error) {
    console.error('Add response error:', error);
    res.status(400).json({ error: 'Error adding response' });
  }
});

module.exports = router; 