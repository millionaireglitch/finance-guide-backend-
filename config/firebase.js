const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

// Firebase is used ONLY for push notifications.
// Credentials come from the .env file (never hard-coded).
// If they are missing, the server still starts and notifications are skipped.

let messaging = null;

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
  try {
    initializeApp({
      credential: cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        // .env stores new lines as "\n", so convert them back to real new lines
        privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    messaging = getMessaging();
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error(`Firebase initialization failed: ${error.message}`);
  }
} else {
  console.log('Firebase not configured - push notifications are disabled');
}

module.exports = { messaging };
