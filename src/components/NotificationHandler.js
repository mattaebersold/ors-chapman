import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
  setBadgeCount,
} from '../services/notificationService';
import { useGetUnreadCountQuery } from '../services/apiService';

/**
 * NotificationHandler component handles push notification setup and events
 * This component doesn't render anything - it just manages notification side effects
 */
const NotificationHandler = () => {
  const navigation = useNavigation();
  const { userInfo } = useSelector(state => state.auth);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Get unread count to update badge
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    skip: !userInfo, // Skip if user not logged in
  });

  // Update badge count when unread count changes
  useEffect(() => {
    if (unreadData?.count !== undefined) {
      setBadgeCount(unreadData.count);
    }
  }, [unreadData]);

  // Register for push notifications and set up listeners
  useEffect(() => {
    if (!userInfo) {
      // Don't register for notifications if user is not logged in
      return;
    }

    // Register for push notifications
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        // TODO: Send token to backend to store for the user
        // You could add an API endpoint like: sendPushToken(token)
      }
    });

    // Listener for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(notification => {
      // Notification will be shown automatically by the handler we set up
    });

    // Listener for when user taps on a notification
    responseListener.current = addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      handleNotificationTap(data);
    });

    // Cleanup listeners on unmount
    return () => {
      removeNotificationSubscription(notificationListener.current);
      removeNotificationSubscription(responseListener.current);
    };
  }, [userInfo]);

  /**
   * Handle navigation when user taps on a notification
   * @param {object} data - Notification data containing content_type and content_id
   */
  const handleNotificationTap = (data) => {
    if (!data) return;

    const { content_type, content_id } = data;

    // Navigate based on content type (matching NotificationsScreen logic)
    switch (content_type) {
      case 'post':
        navigation.navigate('PostDetail', { postId: content_id });
        break;
      case 'garagecar':
      case 'car':
        navigation.navigate('CarDetail', { carId: content_id });
        break;
      case 'user':
        navigation.navigate('UserDetail', { userId: content_id });
        break;
      case 'event':
        navigation.navigate('EventDetail', { eventId: content_id });
        break;
      case 'article':
        navigation.navigate('ArticleDetail', { articleId: content_id });
        break;
      default:
        // For unknown types, just open notifications screen
        navigation.navigate('Notifications');
        break;
    }
  };

  // This component doesn't render anything
  return null;
};

export default NotificationHandler;
