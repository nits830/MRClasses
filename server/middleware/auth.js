const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Request headers:', req.headers);
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded token:', decoded);
    
    // Fetch user from the database
    const user = await User.findById(decoded.userId);
    console.log('Auth middleware - User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Add user data to request
    req.user = user;
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Token is invalid' });
  }
};

module.exports = auth; 