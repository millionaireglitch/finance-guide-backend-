const express = require('express');
const { body } = require('express-validator');
const {
  createTransaction,
  getTransactions,
  getTransactionById,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

// All transaction routes need login
router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Combined list of income and expense transactions
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, category, amount]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
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
 *               type: expense
 *               category: Food
 *               amount: 1200
 *               description: Groceries
 *               date: "2026-10-02"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not logged in
 *   get:
 *     summary: Get all transactions of the logged-in user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *       401:
 *         description: Not logged in
 */
router.post(
  '/',
  [
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  ],
  validate,
  createTransaction
);
router.get('/', getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Get one transaction by id
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction id
 *     responses:
 *       200:
 *         description: Transaction details
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', validateIdParam, getTransactionById);

module.exports = router;
