const express = require('express');
const { body, query } = require('express-validator');
const { createBudget, getBudgets, getBudgetsByUser } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');
const { allowSelfOrAdmin } = require('../middleware/roleMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

const MONTH_FORMAT = /^\d{4}-(0[1-9]|1[0-2])$/; // YYYY-MM

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Monthly category budgets and a simple income/expense summary
 */

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a monthly budget for a category
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, limit, month]
 *             properties:
 *               category:
 *                 type: string
 *               limit:
 *                 type: number
 *               month:
 *                 type: string
 *                 description: Format YYYY-MM
 *             example:
 *               category: Entertainment
 *               limit: 5000
 *               month: "2026-10"
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Invalid input or budget already exists
 *   get:
 *     summary: Get budgets with summary (total income, total expenses, remaining)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: string
 *           example: "2026-10"
 *         description: Optional month filter (YYYY-MM). Leave empty for all-time.
 *     responses:
 *       200:
 *         description: Summary and list of budgets with spent and remaining
 */
router.post(
  '/',
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('limit').isFloat({ gt: 0 }).withMessage('Limit must be a number greater than 0'),
    body('month').matches(MONTH_FORMAT).withMessage('Month must be in YYYY-MM format, e.g. 2026-10'),
  ],
  validate,
  createBudget
);
router.get(
  '/',
  [query('month').optional().matches(MONTH_FORMAT).withMessage('Month must be in YYYY-MM format')],
  validate,
  getBudgets
);

/**
 * @swagger
 * /api/budgets/user/{id}:
 *   get:
 *     summary: Get budgets of a user by user id (own id, or any id for admin)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       200:
 *         description: Summary and list of budgets
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Trying to view another user's data
 */
router.get('/user/:id', validateIdParam, allowSelfOrAdmin, getBudgetsByUser);

module.exports = router;
