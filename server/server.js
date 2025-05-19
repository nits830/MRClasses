require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const fileRoutes = require('./routes/fileRoutes');

const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Connect to MongoDB
connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://mrclasses.vercel.app'],  // Allow both local and production frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Increase payload limit for PDF uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/files', fileRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API 404 handler
app.use('/api/*', (req, res) => {
  console.log('404 - API Route not found:', req.method, req.url);
  res.status(404).json({ error: 'API Route not found' });
});

// Catch-all route for non-API requests
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 