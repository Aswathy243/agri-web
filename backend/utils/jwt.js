const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = process.env;

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Ensure the decoded object has the expected structure
    if (!decoded.id) {
      throw new Error('Invalid token payload');
    }
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

module.exports = { generateToken, verifyToken };