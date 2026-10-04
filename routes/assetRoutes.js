const express = require('express');
const { body } = require('express-validator');
const { createAsset, getAssets, getAssetsByUser } = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');
const { allowSelfOrAdmin } = require('../middleware/roleMiddleware');
const { validate, validateIdParam } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Things the user owns (cash, bank balance, property, etc.)
 */

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Add an asset
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, value]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 description: e.g. cash, bank, property, vehicle, investment, other
 *               value:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *             example:
 *               name: Savings Account
 *               type: bank
 *               value: 150000
 *               date: "2026-10-01"
 *     responses:
 *       201:
 *         description: Asset created successfully
 *       400:
 *         description: Invalid input
 *   get:
 *     summary: Get the logged-in user's assets
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assets
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('type').trim().notEmpty().withMessage('Type is required'),
    body('value').isFloat({ gt: 0 }).withMessage('Value must be a number greater than 0'),
    body('date').optional().isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD)'),
  ],
  validate,
  createAsset
);
router.get('/', getAssets);

/**
 * @swagger
 * /api/assets/user/{id}:
 *   get:
 *     summary: Get assets of a user by user id (own id, or any id for admin)
 *     tags: [Assets]
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
 *         description: List of assets
 *       400:
 *         description: Invalid id
 *       403:
 *         description: Trying to view another user's data
 */
router.get('/user/:id', validateIdParam, allowSelfOrAdmin, getAssetsByUser);

module.exports = router;
