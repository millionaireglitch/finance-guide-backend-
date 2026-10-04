const express = require('express');
const { body } = require('express-validator');
const { sendNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Firebase push notifications
 */

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send a Firebase push notification
 *     description: |
 *       If deviceToken (FCM registration token) is given, the notification goes to that device.
 *       Otherwise it is sent to the topic "user_<yourUserId>".
 *       If Firebase is not configured in .env, the response says the notification was not sent.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *                 description: Optional FCM device token
 *             example:
 *               title: Budget Reminder
 *               body: You have used 80% of your Food budget this month.
 *     responses:
 *       200:
 *         description: Result of sending (sent true/false)
 *       400:
 *         description: Invalid input
 */
router.post(
  '/send',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('body').trim().notEmpty().withMessage('Body is required'),
    body('deviceToken').optional().isString().withMessage('Device token must be a string'),
  ],
  validate,
  sendNotification
);

module.exports = router;
