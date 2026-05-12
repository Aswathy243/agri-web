const { User } = require('../models'); // Now importing from models/index.js
const { generateToken } = require('../utils/jwt');
const ErrorResponse = require('../utils/errorResponse');

exports.register = async (req, res, next) => {
  const { name, phone, password, role, location, crops } = req.body;

  try {
    const user = await User.create({
      name,
      phone,
      password,
      role,
      location,
      crops
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new ErrorResponse('Please provide phone and password', 400));
  }

  try {
    const user = await User.findOne({ 
      where: { phone },
      attributes: { include: ['password'] } // Include password for comparison
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};