const express = require('express');
const { getNetWorth, getNetWorthHistory } = require('../controllers/netWorthController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Net Worth
 *   description: NET WORTH = TOTAL ASSETS - TOTAL DEBTS
 */

/**
 * @swagger
 * /api/net-worth:
 *   get:
 *     summary: Calculate current net worth (also saves today's value to history)
 *     description: Total assets minus total active debts. Paid debts are not counted.
 *     tags: [Net Worth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current net worth
 *         content:
 *           application/json:
 *             example:
 *               message: Net worth calculated successfully
 *               data:
 *                 totalAssets: 150000
 *                 totalDebts: 50000
 *                 netWorth: 100000
 *                 recordDate: "2026-10-04"
 */
router.get('/', getNetWorth);

/**
 * @swagger
 * /api/net-worth/history:
 *   get:
 *     summary: Get previous net worth values (one record per day)
 *     tags: [Net Worth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Net worth history, newest first
 */
router.get('/history', getNetWorthHistory);

module.exports = router;
