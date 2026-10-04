const { messaging } = require('../config/firebase');

// Helper used by the alert system and by the /send endpoint.
// If a device token is given, send to that device.
// Otherwise send to the topic "user_<userId>" (the mobile app subscribes to this topic).
const sendPushNotification = async (userId, title, body, deviceToken) => {
  if (!messaging) {
    return { sent: false, reason: 'Firebase is not configured' };
  }

  const message = { notification: { title, body } };
  if (deviceToken) {
    message.token = deviceToken;
  } else {
    message.topic = `user_${userId}`;
  }

  try {
    const messageId = await messaging.send(message);
    return { sent: true, messageId };
  } catch (error) {
    return { sent: false, reason: error.message };
  }
};

// POST /api/notifications/send
const sendNotification = async (req, res) => {
  const { title, body, deviceToken } = req.body;

  const result = await sendPushNotification(req.user._id, title, body, deviceToken);

  res.status(200).json({
    message: result.sent ? 'Notification sent successfully' : 'Notification was not sent',
    data: result,
  });
};

module.exports = { sendPushNotification, sendNotification };
