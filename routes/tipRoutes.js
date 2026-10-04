const express = require('express');
const { body } = require('express-validator');
const { getTips, createTip } = require('../controllers/tipController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tips
 *   description: Financial tips (anyone logged in can read, only admin can create)
 */

/**
 * @swagger
 * /api/tips:
 *   get:
 *     summary: Get financial tips
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         required: false
 *         schema:
 *           type: string
 *           example: Savings
 *         description: Optional category filter
 *     responses:
 *       200:
 *         description: List of tips
 *   post:
 *     summary: Create a financial tip (ADMIN ONLY)
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content, category]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               category:
 *                 type: string
 *             example:
 *               title: Emergency Fund
 *               content: Maintain an emergency fund for unexpected expenses.
 *               category: Savings
 *     responses:
 *       201:
 *         description: Tip created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Forbidden - only admin can create tips
 */
router.get('/', getTips);
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  validate,
  createTip
);

module.exports = router;
