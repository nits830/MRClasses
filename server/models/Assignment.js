const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending'
  },
  score: {
    type: Number
  },
  feedback: {
    type: String
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String
    },
    maxScore: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    feedback: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema); 