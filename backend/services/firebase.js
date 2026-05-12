require('dotenv').config();
const admin = require('firebase-admin');
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT is not set in environment variables');
}


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (userId, title, body, data = {}) => {
  try {
    // Get user's FCM token from database
    const user = await User.findByPk(userId);
    if (!user || !user.fcmToken) {
      console.error('User or FCM token not found');
      return;
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      token: user.fcmToken
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const sendMulticastNotification = async (userIds, title, body, data = {}) => {
  try {
    const users = await User.findAll({
      where: {
        id: userIds,
        fcmToken: {
          [Sequelize.Op.not]: null
        }
      }
    });

    if (users.length === 0) {
      console.error('No users with FCM tokens found');
      return;
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens: users.map(user => user.fcmToken)
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Multicast notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};

module.exports = { sendNotification, sendMulticastNotification };