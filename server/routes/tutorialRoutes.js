const express = require('express');
const router = express.Router();
const Tutorial = require('../models/Tutorial');
const Subject = require('../models/Subject');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin.js'); // Import admin middleware
const mongoose = require('mongoose'); // Import mongoose for ObjectId validation

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`Request Type: ${req.method}, Request URL: ${req.url}`);
  next();
});

// Get all subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ _id: 1 });
    console.log("Subjects",subjects);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new subject
router.post('/subjects', auth, async (req, res) => {
  try {
    const rawSubject = req.body.subject;
    
    if (!rawSubject || !rawSubject.trim()) {
      return res.status(400).json({ message: 'Subject name is required and cannot be empty' });
    }

    const subjectName = rawSubject.trim();
    
    const subject = new Subject({ name: subjectName });
    
    const newSubject = await subject.save();
    
    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A subject with this name already exists. Please choose a different name.' });
    }
    res.status(400).json({ message: error.message });
  }
});


// Get all tutorials
router.get('/', async (req, res) => {
  try {
    const tutorials = await Tutorial.find().populate('subjectId');
    
    res.json(tutorials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific tutorial by ID
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id).populate('subjectId');
    
    if (!tutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }

    res.json(tutorial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new tutorial
router.post('/', auth, adminMiddleware, async (req, res) => {
  try {
    const { title, description, subjectId } = req.body;

    // Validate subjectId
    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(400).json({ message: 'Invalid subject ID.' });
    }

    const newTutorial = new Tutorial({
      title,
      description,
      subjectId
    });

    const savedTutorial = await newTutorial.save();
    const populatedTutorial = await Tutorial.findById(savedTutorial._id)
      .populate('subjectId');

    res.status(201).json(populatedTutorial);
  } catch (error) {
    console.error('Error creating tutorial:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating tutorial' });
  }
});

// PUT to update a tutorial
router.put('/:id', auth, adminMiddleware, async (req, res) => {
  try {
    const { title, description, subjectId } = req.body;

    // Validate subjectId if provided
    if (subjectId) {
      const subjectExists = await Subject.findById(subjectId);
      if (!subjectExists) {
        return res.status(400).json({ message: 'Invalid subject ID.' });
      }
    }

    const updatedTutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { title, description, subjectId },
      { new: true, runValidators: true }
    ).populate('subjectId');

    if (!updatedTutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }

    res.json(updatedTutorial);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error updating tutorial' });
  }
});

// DELETE a tutorial
router.delete('/:id', auth, adminMiddleware, async (req, res) => {
  try {
    const deletedTutorial = await Tutorial.findByIdAndDelete(req.params.id);
    if (!deletedTutorial) {
      return res.status(404).json({ message: 'Tutorial not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tutorial' });
  }
});

module.exports = router;
