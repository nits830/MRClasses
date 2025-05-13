const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all tests for a user
router.get('/user', auth, async (req, res) => {
  try {
    const tests = await Test.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific test
router.get('/:testId', auth, async (req, res) => {
  try {
    const test = await Test.findOne({
      _id: req.params.testId,
      userId: req.userId
    });
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a test
router.post('/:testId/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const test = await Test.findOne({
      _id: req.params.testId,
      userId: req.userId
    });
    
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }
    
    if (test.completed) {
      return res.status(400).json({ message: 'Test already completed' });
    }
    
    // Calculate score (implement your scoring logic here)
    const score = calculateScore(answers, test.questions);
    
    test.completed = true;
    test.score = score;
    test.submittedAnswers = answers;
    await test.save();
    
    res.json({ score });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate test score
function calculateScore(submittedAnswers, questions) {
  let correctAnswers = 0;
  questions.forEach((question, index) => {
    if (submittedAnswers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  return Math.round((correctAnswers / questions.length) * 100);
}

module.exports = router; 