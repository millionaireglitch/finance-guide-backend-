const User = require('../models/User');
const generateToken = require('../utils/token');

// Note: input is validated in routes/authRoutes.js (express-validator).
// Any unexpected error is sent to middleware/errorMiddleware.js automatically (Express 5).

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check whether the email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // Password is hashed automatically in the User model (pre-save hook)
  const user = await User.create({ name, email, password });

  res.status(201).json({
    message: 'User registered successfully',
    data: {
      token: generateToken(user),
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Password has select: false, so we ask for it explicitly here
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.status(200).json({
    message: 'Login successful',
    data: {
      token: generateToken(user),
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// GET /api/auth/me  (protected - used to test the JWT middleware)
const getMe = async (req, res) => {
  res.status(200).json({
    message: 'Logged-in user fetched successfully',
    data: req.user,
  });
};

module.exports = { registerUser, loginUser, getMe };
