const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Create a new testimonial
router.post('/', auth, async (req, res) => {
  try {
    const testimonial = new Testimonial({
      user: req.user._id,
      content: req.body.content,
      rating: req.body.rating
    });
    await testimonial.save();
    
    // Populate user data before sending response
    await testimonial.populate('user', 'name email');
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(400).json({ error: 'Error creating testimonial' });
  }
});

// Get approved testimonials
router.get('/approved', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 3;
    const testimonials = await Testimonial.find({ status: 'approved' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(count);
    res.json(testimonials);
  } catch (error) {
    console.error('Get approved testimonials error:', error);
    res.status(500).json({ error: 'Error getting testimonials' });
  }
});

// Get user's testimonials
router.get('/my-testimonials', auth, async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error('Get my testimonials error:', error);
    res.status(500).json({ error: 'Error getting testimonials' });
  }
});

// Admin routes
// Get all testimonials
router.get('/all', auth, adminMiddleware, async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({ error: 'Error getting testimonials' });
  }
});

// Update testimonial status
router.patch('/:id/status', auth, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    testimonial.status = req.body.status;
    await testimonial.save();
    
    // Populate user data before sending response
    await testimonial.populate('user', 'name email');
    res.json(testimonial);
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(400).json({ error: 'Error updating testimonial' });
  }
});

// Delete testimonial
router.delete('/:id', auth, adminMiddleware, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(400).json({ error: 'Error deleting testimonial' });
  }
});

module.exports = router; 