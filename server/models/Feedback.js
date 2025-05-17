const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['General', 'Course Content', 'Technical', 'Instructor', 'Other'],
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  response: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'inProgress', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback; 