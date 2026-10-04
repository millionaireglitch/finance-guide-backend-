const express = require('express');
const { body } = require('express-validator');
const { createTip, getTips } = require('../controllers/tipController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Tips
 *   description: Financial tips, hacks and myths
 */

/**
 * @swagger
 * /api/tips/ai-generate:
 *   get:
 *     summary: AI-powered saving tips API
 *     description: Analyzes user spending (mocked) to return a personalized saving tip.
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns an AI-generated tip
 */
router.get('/ai-generate', async (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Tip generated successfully",
        data: {
            title: "AI Spending Insight",
            category: "AI Suggestion",
            content: "Based on your recent transaction velocity, our AI algorithm recommends setting aside an extra ₹2000 this month into your emergency fund."
        }
    });
});

/**
 * @swagger
 * /api/tips:
 *   get:
 *     summary: Get all tips
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tips
 */
router.get('/', getTips);

/**
 * @swagger
 * /api/tips:
 *   post:
 *     summary: Create a new tip (Admin only)
 *     tags: [Tips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, content]
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tip created
 *       403:
 *         description: Not authorized as admin
 */
router.post(
  '/',
  admin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
  ],
  validate,
  createTip
);

module.exports = router;
