const express = require('express');
const { body } = require('express-validator');
const { simulateInvestment, getInvestments } = require('../controllers/investmentController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Investments
 *   description: Simple investment growth simulator (mathematical estimate only, not a guarantee)
 */

/**
 * @swagger
 * /api/investments/simulate:
 *   post:
 *     summary: Simulate investment growth
 *     description: |
 *       Uses monthly compound interest.
 *       If annualReturn is not given, a default is used based on riskProfile:
 *       conservative = 6%, moderate = 10%, aggressive = 14%.
 *       This is only a mathematical simulation, not a guaranteed return.
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [initialAmount, years]
 *             properties:
 *               initialAmount:
 *                 type: number
 *               monthlyContribution:
 *                 type: number
 *               annualReturn:
 *                 type: number
 *                 description: Yearly return in % (optional)
 *               years:
 *                 type: integer
 *               riskProfile:
 *                 type: string
 *                 enum: [conservative, moderate, aggressive]
 *             example:
 *               initialAmount: 10000
 *               monthlyContribution: 5000
 *               annualReturn: 10
 *               years: 5
 *               riskProfile: moderate
 *     responses:
 *       201:
 *         description: Simulation result (projected value, total invested, estimated gain)
 *       400:
 *         description: Invalid input
 */
router.post(
  '/simulate',
  [
    body('initialAmount').isFloat({ min: 0 }).withMessage('Initial amount must be 0 or more'),
    body('monthlyContribution').optional().isFloat({ min: 0 }).withMessage('Monthly contribution must be 0 or more'),
    body('annualReturn').optional().isFloat({ min: 0, max: 100 }).withMessage('Annual return must be between 0 and 100'),
    body('years').isInt({ min: 1, max: 50 }).withMessage('Years must be a whole number between 1 and 50'),
    body('riskProfile')
      .optional()
      .toLowerCase()
      .isIn(['conservative', 'moderate', 'aggressive'])
      .withMessage('Risk profile must be conservative, moderate or aggressive'),
  ],
  validate,
  simulateInvestment
);

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get the logged-in user's past simulations
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of simulations
 */
router.get('/', getInvestments);

module.exports = router;
