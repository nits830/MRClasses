const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed to the next middleware/route
  } else {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

module.exports = adminMiddleware; 