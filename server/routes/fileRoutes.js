const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const adminMiddleware = require('../middleware/adminMiddleware');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload file
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify assignment exists and user has permission
    const assignment = await Assignment.findById(req.body.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user has permission to upload
    if (req.user.role !== 'admin' && assignment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to upload files for this assignment' });
    }

    const file = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      uploadedBy: req.user._id,
      assignmentId: req.body.assignmentId,
      isResponse: req.body.isResponse === 'true',
      description: req.body.description
    });

    await file.save();

    // If this is an assignment file (not a response), update the assignment status
    if (!file.isResponse && req.user.role === 'admin') {
      assignment.status = 'pending';
      await assignment.save();
    }

    res.status(201).json(file);
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Get user's files
router.get('/my-files', auth, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.user._id })
      .sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Error fetching files' });
  }
});

// Get files for a specific user (admin only)
router.get('/user/:userId', auth, adminMiddleware, async (req, res) => {
  try {
    const files = await File.find({ uploadedBy: req.params.userId })
      .sort({ uploadedAt: -1 });
    res.json(files);
  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({ error: 'Error fetching user files' });
  }
});

// Get files for a specific assignment
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if user has permission to view these files
    if (assignment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these files' });
    }

    const files = await File.find({ assignmentId: req.params.assignmentId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.json(files);
  } catch (error) {
    console.error('Get assignment files error:', error);
    res.status(500).json({ error: 'Error fetching assignment files' });
  }
});

// Download file
router.get('/download/:fileId', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if user has permission to download the file
    const assignment = await Assignment.findById(file.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Associated assignment not found' });
    }

    // Allow access if:
    // 1. User is an admin
    // 2. User is the owner of the assignment
    // 3. User is the one who uploaded the file
    const isAuthorized = 
      req.user.role === 'admin' || 
      assignment.userId.toString() === req.user._id.toString() ||
      file.uploadedBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to download this file' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    
    // Check if file exists in the filesystem
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Length', file.size);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle errors during streaming
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Download file error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error downloading file' });
    }
  }
});

// Delete file (admin only)
router.delete('/:fileId', auth, adminMiddleware, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete file from filesystem
    fs.unlinkSync(file.path);
    
    // Delete file record from database
    await file.deleteOne();
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router; 