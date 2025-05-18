const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');
const File = require('../models/File');

// Get user's assignments
router.get('/my-assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id })
      .select('title description dueDate status score feedback questions files')
      .sort({ dueDate: 1 });

    // Fetch files for each assignment
    const assignmentsWithFiles = await Promise.all(assignments.map(async (assignment) => {
      const files = await File.find({ assignmentId: assignment._id })
        .select('_id originalName isResponse uploadedBy uploadedAt')
        .populate('uploadedBy', 'name')
        .sort({ uploadedAt: -1 });
      
      const assignmentObj = assignment.toObject();
      return {
        ...assignmentObj,
        files
      };
    }));

    console.log('Sending assignments:', JSON.stringify(assignmentsWithFiles, null, 2));
    res.json(assignmentsWithFiles);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Error fetching assignments' });
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

// Get single assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .select('title description dueDate status score feedback questions files userId');
      
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user has permission to view this assignment
    if (!assignment.userId || assignment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this assignment' });
    }

    // Fetch files for the assignment
    const files = await File.find({ assignmentId: assignment._id })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    const assignmentObj = assignment.toObject();
    console.log('Sending assignment to client:', JSON.stringify({ ...assignmentObj, files }, null, 2));
    
    res.json({
      ...assignmentObj,
      files
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Error fetching assignment' });
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

    console.log('Grading request body:', req.body);

    // Update scores and feedback
    assignment.questions = assignment.questions.map((q, i) => ({
      ...q.toObject(),
      feedback: req.body.feedback[i] || '',
      score: req.body.scores[i] || 0
    }));
    assignment.status = 'graded';
    assignment.score = req.body.totalScore || 0;
    assignment.feedback = req.body.generalFeedback || '';

    console.log('Assignment before save:', assignment);

    const updatedAssignment = await assignment.save();
    
    // Fetch the updated assignment with all fields
    const populatedAssignment = await Assignment.findById(updatedAssignment._id)
      .select('title description dueDate status score feedback questions files userId');
    
    console.log('Graded assignment after save:', populatedAssignment);
    res.json(populatedAssignment);
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Error grading assignment' });
  }
});

// Update assignment status
router.put('/:assignmentId/status', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify this is the assigned user or an admin
    if (assignment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['pending', 'submitted', 'graded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    assignment.status = status;
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error('Update assignment status error:', error);
    res.status(500).json({ error: 'Error updating assignment status' });
  }
});

// Update assignment (PATCH)
router.patch('/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify this is the assigned user or an admin
    if (assignment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update only the fields that are provided
    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'userId') { // Prevent updating these fields
        assignment[key] = updates[key];
      }
    });

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Error updating assignment' });
  }
});

module.exports = router; 