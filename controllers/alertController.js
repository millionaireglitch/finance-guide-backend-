const Alert = require('../models/Alert');
const Budget = require('../models/Budget');
const { calculateSpent, getMonthString } = require('../utils/budgetCalculator');
const { sendPushNotification } = require('./notificationController');

/*
 * Compare each budget limit with actual spending for the month.
 *
 * Flow: overspending detected -> alert created -> Socket.io event + Firebase notification
 *
 * "app" is the Express app (used to get the Socket.io instance).
 * Returns the list of NEW alerts created.
 */
const checkOverspending = async (app, userId, month) => {
  const budgets = await Budget.find({ user: userId, month });
  const newAlerts = [];

  for (const budget of budgets) {
    // Update the "spent" value of the budget
    budget.spent = await calculateSpent(userId, budget.category, month);
    await budget.save();

    // Not overspent -> nothing to do
    if (budget.spent <= budget.limit) continue;

    // Only one alert per category per month (just update the spent amount)
    const existingAlert = await Alert.findOne({ user: userId, category: budget.category, month });
    if (existingAlert) {
      existingAlert.spent = budget.spent;
      existingAlert.budget = budget.limit;
      await existingAlert.save();
      continue;
    }

    const alert = await Alert.create({
      user: userId,
      type: 'overspending',
      category: budget.category,
      budget: budget.limit,
      spent: budget.spent,
      month,
      message: `${budget.category} spending has exceeded your monthly budget.`,
    });
    newAlerts.push(alert);

    // Real-time event to the user's connected Socket.io client (if online)
    const io = app.get('io');
    const socketId = app.get('onlineUsers')[userId.toString()];
    if (io && socketId) {
      io.to(socketId).emit('overspendingAlert', alert);
    }

    // Firebase push notification (skipped if Firebase is not configured)
    await sendPushNotification(userId, 'Overspending Alert', alert.message);
  }

  return newAlerts;
};

// GET /api/alerts
const getAlerts = async (req, res) => {
  const alerts = await Alert.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ message: 'Alerts fetched successfully', data: alerts });
};

// POST /api/alerts/check
const checkAlerts = async (req, res) => {
  const month = req.body.month || getMonthString(); // default: current month
  const newAlerts = await checkOverspending(req.app, req.user._id, month);

  res.status(200).json({
    message:
      newAlerts.length > 0
        ? `${newAlerts.length} new overspending alert(s) created`
        : 'No new overspending found',
    data: newAlerts,
  });
};

module.exports = { checkOverspending, getAlerts, checkAlerts };
