const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get assignments for the logged-in user
router.get('/my-assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Error getting assignments' });
  }
});

// Get all assignments for a specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Check if the requesting user is either an admin or the user themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const assignments = await Assignment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Error getting assignments' });
  }
});

// Create a new assignment for a user (admin only)
router.post('/:userId', auth, adminMiddleware, async (req, res) => {
  try {
    const { title, description, dueDate, questions } = req.body;
    const assignment = new Assignment({
      title,
      description,
      userId: req.params.userId,
      dueDate,
      questions: questions.map(q => ({
        question: q.question,
        maxScore: q.maxScore
      }))
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Error creating assignment' });
  }
});

// Get a specific assignment
router.get('/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if the requesting user is either an admin or the assignment owner
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Error getting assignment' });
  }
});

// Submit assignment answers (student only)
router.put('/:assignmentId/submit', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify this is the assigned user
    if (assignment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update answers
    assignment.questions = assignment.questions.map((q, i) => ({
      ...q.toObject(),
      answer: req.body.answers[i]
    }));
    assignment.status = 'submitted';

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Error submitting assignment' });
  }
});

// Grade assignment (admin only)
router.put('/:assignmentId/grade', auth, adminMiddleware, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update scores and feedback
    assignment.questions = assignment.questions.map((q, i) => ({
      ...q.toObject(),
      feedback: req.body.feedback[i]
    }));
    assignment.status = 'graded';
    assignment.score = req.body.totalScore;
    assignment.feedback = req.body.generalFeedback;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Error grading assignment' });
  }
});

module.exports = router; 