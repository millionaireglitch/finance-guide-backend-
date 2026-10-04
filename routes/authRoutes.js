const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and login
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: At least 6 characters
 *             example:
 *               name: Sneha
 *               email: sneha@example.com
 *               password: "123456"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or email already registered
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: sneha@example.com
 *               password: "123456"
 *     responses:
 *       200:
 *         description: Login successful (copy the token and click Authorize)
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid email or password
 */
router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email is required').toLowerCase(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  loginUser
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get the logged-in user (tests JWT authentication)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged-in user details
 *       401:
 *         description: Missing, invalid or expired token
 */
router.get('/me', protect, getMe);

module.exports = router;
