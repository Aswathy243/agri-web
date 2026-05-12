const jwt = require('jsonwebtoken');
const { Farmer, Expert } = require('../models');

// Middleware to verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  let token;

  // Step 1: Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to access this route'
    });
  }

  try {
    // Step 2: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: First try to find an expert
    const expert = await Expert.findByPk(decoded.id, {
      attributes: [
        'id', 'name', 'email', 'phone', 'designation',
        'department', 'region', 'role', 'is_verified', 'created_at'
      ]
    });

    if (expert) {
      req.user = expert;
      req.userType = 'expert';
      return next(); // ✅ Expert found
    }

    // Step 4: Otherwise, try to find a farmer
    const farmer = await Farmer.findByPk(decoded.id, {
      attributes: [
        'id', 'name', 'phone', 'village',
        'panchayat', 'block', 'created_at'
      ]
    });

    if (farmer) {
      req.user = farmer;
      req.userType = 'farmer';
      return next(); // ✅ Farmer found
    }

    return res.status(401).json({
      success: false,
      message: 'User not found'
    });

  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired, please log in again'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token, please log in again'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (req.userType === 'expert' && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(', ')}`
      });
    }

    if (req.userType === 'farmer' && !roles.includes('farmer')) {
      return res.status(403).json({
        success: false,
        message: `Farmers can't access this route`
      });
    }

    next();
  };
};

// Middleware to allow only experts
exports.isExpert = (req, res, next) => {
  if (req.userType !== 'expert') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Expert only.'
    });
  }

  if (req.user.role !== 'expert' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Requires expert or admin role.'
    });
  }

  next();
};

// Middleware to allow only farmers
exports.isFarmer = (req, res, next) => {
  if (req.userType !== 'farmer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Farmer only.'
    });
  }

  next();
};
