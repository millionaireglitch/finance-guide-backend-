const express = require('express');
const { body } = require('express-validator');
const { getAlerts, checkAlerts } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Alerts
 *   description: Overspending alerts (budget limit vs actual spending)
 */

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: Get the logged-in user's alerts
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alerts, newest first
 */
router.get('/', getAlerts);

/**
 * @swagger
 * /api/alerts/check:
 *   post:
 *     summary: Check budgets for overspending and create alerts
 *     description: |
 *       Compares each budget limit with actual spending for the month.
 *       If spent > limit, an alert is created, a Socket.io "overspendingAlert" event is emitted
 *       and a Firebase notification is sent (if Firebase is configured).
 *       If month is not given, the current month is used.
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 description: Format YYYY-MM (optional)
 *             example:
 *               month: "2026-10"
 *     responses:
 *       200:
 *         description: List of new alerts created
 *       400:
 *         description: Invalid month
 */
router.post(
  '/check',
  [
    body('month')
      .optional()
      .matches(/^\d{4}-(0[1-9]|1[0-2])$/)
      .withMessage('Month must be in YYYY-MM format, e.g. 2026-10'),
  ],
  validate,
  checkAlerts
);

module.exports = router;
