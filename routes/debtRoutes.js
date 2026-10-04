const express = require('express');
const { body } = require('express-validator');
const { createDebt, getDebts, getDebtsByUser } = require('../controllers/debtController');
const { protect } = require('../middleware/authMiddleware');
const { allowSelfOrAdmin } = require('../middleware/roleMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Debts
 *   description: Loans and other debts
 */

/**
 * @swagger
 * /api/debts:
 *   post:
 *     summary: Add a debt
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, amount]
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               interestRate:
 *                 type: number
 *                 description: Yearly interest rate in %
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, paid]
 *             example:
 *               name: Education Loan
 *               amount: 50000
 *               interestRate: 9.5
 *               dueDate: "2027-06-30"
 *               status: active
 *     responses:
 *       201:
 *         description: Debt created successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get the logged-in user's debts
 *     tags: [Debts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of debts
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),
    body('interestRate').optional().isFloat({ min: 0 }).withMessage('Interest rate must be 0 or more'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date (YYYY-MM-DD)'),
    body('status').optional().isIn(['active', 'paid']).withMessage('Status must be active or paid'),
  ],
  validate,
  createDebt
);
router.get('/', getDebts);

/**
 * @swagger
 * /api/debts/user/{id}:
 *   get:
 *     summary: Get debts of a user by user id (own id, or any id for admin)
 *     tags: [Debts]
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
 *         description: List of debts
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Trying to view another user's data
 */
router.get('/user/:id', validateIdParam, allowSelfOrAdmin, getDebtsByUser);

module.exports = router;
