const express = require('express');
const { body } = require('express-validator');
const { createExpense, getExpenses, getExpensesByUser } = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');
const { allowSelfOrAdmin } = require('../middleware/roleMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: User expense records (adding an expense also checks budgets for overspending)
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Add an expense (automatically checks the budget for that month)
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, amount]
 *             properties:
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *             example:
 *               category: Entertainment
 *               amount: 7500
 *               description: Movies and concerts
 *               date: "2026-10-03"
 *     responses:
 *       201:
 *         description: Expense created (response also lists any new overspending alerts)
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get the logged-in user's expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.post(
  '/',
  [
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  ],
  validate,
  createExpense
);
router.get('/', getExpenses);

/**
 * @swagger
 * /api/expenses/user/{id}:
 *   get:
 *     summary: Get expenses of a user by user id (own id, or any id for admin)
 *     tags: [Expenses]
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
 *         description: List of expenses
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Trying to view another user's data
 */
router.get('/user/:id', validateIdParam, allowSelfOrAdmin, getExpensesByUser);

module.exports = router;
