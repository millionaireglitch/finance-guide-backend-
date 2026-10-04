const express = require('express');
const { body } = require('express-validator');
const { createIncome, getIncome, getIncomeByUser } = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');
const { allowSelfOrAdmin } = require('../middleware/roleMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Income
 *   description: User income records
 */

/**
 * @swagger
 * /api/income:
 *   post:
 *     summary: Add income
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, source]
 *             properties:
 *               amount:
 *                 type: number
 *               source:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *             example:
 *               amount: 60000
 *               source: Salary
 *               date: "2026-10-01"
 *               description: October salary
 *     responses:
 *       201:
 *         description: Income created successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get the logged-in user's income
 *     tags: [Income]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of income records
 */
router.post(
  '/',
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),
    body('source').trim().notEmpty().withMessage('Source is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  ],
  validate,
  createIncome
);
router.get('/', getIncome);

/**
 * @swagger
 * /api/income/user/{id}:
 *   get:
 *     summary: Get income of a user by user id (own id, or any id for admin)
 *     tags: [Income]
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
 *         description: List of income records
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Trying to view another user's data
 */
router.get('/user/:id', validateIdParam, allowSelfOrAdmin, getIncomeByUser);

module.exports = router;
