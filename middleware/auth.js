const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const SuperAdmin = require('../models/SuperAdmin');

// Middleware to protect routes and identify the user
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'doctor') {
        req.user = await Doctor.findById(decoded.id);
    } else if (decoded.role === 'hospital') {
        req.user = await Hospital.findById(decoded.id);
    } else if (decoded.role === 'super-admin') {
        req.user = await SuperAdmin.findById(decoded.id);
    }

    if (!req.user) {
        return res.status(401).json({ success: false, error: 'User not found' });
    }

    req.user.role = decoded.role;

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Middleware to grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
          success: false, 
          error: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};