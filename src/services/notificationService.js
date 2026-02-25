import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get the push token
 * @returns {Promise<string|null>} The push token or null if registration failed
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  return token;
}

/**
 * Schedule a local notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data to pass with notification
 */
export async function scheduleLocalNotification(title, body, data = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Show immediately
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get notification badge count
 */
export async function getBadgeCount() {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set notification badge count
 * @param {number} count - Badge count
 */
export async function setBadgeCount(count) {
  await Notifications.setBadgeCountAsync(count);
}

/**
 * Clear notification badge
 */
export async function clearBadge() {
  await Notifications.setBadgeCountAsync(0);
}

/**
 * Add listener for notifications received while app is foregrounded
 * @param {function} callback - Function to call when notification is received
 * @returns {object} Subscription object
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add listener for when user taps on a notification
 * @param {function} callback - Function to call when notification is tapped
 * @returns {object} Subscription object
 */
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification listeners
 * @param {object} subscription - Subscription to remove
 */
export function removeNotificationSubscription(subscription) {
  if (subscription) {
    subscription.remove();
  }
}
