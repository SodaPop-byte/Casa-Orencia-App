const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This is the "guard" that checks for a valid token
const auth = async (req, res, next) => {
  let token;

  // Check if the token is in the 'Authorization' header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (it looks like "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const secret = process.env.JWT_SECRET || "mysecretkey";
      const decoded = jwt.verify(token, secret);

      // Get the user from the token and attach it to the request
      // We attach the user *without* their password
      req.user = await User.findById(decoded.user.id).select('-password');
      
      next(); // Token is good, proceed to the next step (the route)
    } catch (error) {
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// This is a "stricter guard" that only allows admins
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is an admin, proceed
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

module.exports = { auth, adminOnly };