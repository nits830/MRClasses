const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to sync isApproved and status
testimonialSchema.pre('save', function(next) {
  if (this.status === 'approved') {
    this.isApproved = true;
  } else {
    this.isApproved = false;
  }
  next();
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

module.exports = Testimonial; 