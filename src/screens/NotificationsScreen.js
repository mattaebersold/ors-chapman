import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useArchiveNotificationMutation,
  useArchiveAllNotificationsMutation,
  useDeleteNotificationMutation,
} from '../services/apiService';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({
    limit: 50,
    offset: 0,
    unread_only: showUnreadOnly,
    include_archived: showArchived,
  });

  const { data: unreadCountData } = useGetUnreadCountQuery();

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [archiveNotification] = useArchiveNotificationMutation();
  const [archiveAll] = useArchiveAllNotificationsMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || 0;

  const handleNotificationPress = async (notification) => {
    // Mark as read if unread
    if (!notification.read_status) {
      try {
        await markAsRead(notification.internal_id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on content type
    const { content_type, content_id } = notification;

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
        // Do nothing for unknown content types
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      refetch();
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleArchiveAll = async () => {
    Alert.alert(
      'Archive All',
      'Are you sure you want to archive all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive All',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveAll().unwrap();
              refetch();
            } catch (error) {
              console.error('Error archiving all:', error);
              Alert.alert('Error', 'Failed to archive all notifications');
            }
          },
        },
      ]
    );
  };

  const handleArchive = async (notificationId) => {
    try {
      await archiveNotification(notificationId).unwrap();
      refetch();
    } catch (error) {
      console.error('Error archiving notification:', error);
      Alert.alert('Error', 'Failed to archive notification');
    }
  };

  const handleDelete = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNotification(notificationId).unwrap();
              refetch();
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const seconds = Math.floor((now - notificationDate) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }) => {
    const isUnread = !item.read_status;

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isUnread && styles.notificationItemUnread,
          item.archived && styles.notificationItemArchived,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.notificationContent}>
          {/* Unread indicator */}
          {isUnread && <View style={styles.unreadDot} />}

          {/* Message */}
          <View style={styles.notificationTextContainer}>
            <Text
              style={[
                styles.notificationMessage,
                isUnread && styles.notificationMessageUnread,
              ]}
            >
              {item.message}
            </Text>
            <Text style={styles.notificationTime}>{getTimeAgo(item.createdAt)}</Text>
            {item.archived && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>Archived</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.notificationActions}>
            {!item.archived && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleArchive(item.internal_id);
                }}
              >
                <FAIcon name="archive" size={16} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDelete(item.internal_id);
              }}
            >
              <FAIcon name="trash" size={16} color={colors.ERROR} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <Text
            style={[
              styles.filterButtonText,
              showUnreadOnly && styles.filterButtonTextActive,
            ]}
          >
            Unread Only
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, showArchived && styles.filterButtonActive]}
          onPress={() => setShowArchived(!showArchived)}
        >
          <Text
            style={[
              styles.filterButtonText,
              showArchived && styles.filterButtonTextActive,
            ]}
          >
            Show Archived
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {notifications.length > 0 && (
        <View style={styles.bulkActionsContainer}>
          <TouchableOpacity style={styles.bulkActionButton} onPress={handleMarkAllAsRead}>
            <FAIcon name="check" size={14} color={colors.BRG} />
            <Text style={styles.bulkActionText}>Mark All Read</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkActionButton} onPress={handleArchiveAll}>
            <FAIcon name="archive" size={14} color={colors.BRG} />
            <Text style={styles.bulkActionText}>Archive All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <LoadingIndicator text="Loading notifications..." />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FAIcon name="bell-slash" size={48} color={colors.TEXT_SECONDARY} />
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.internal_id}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.WHITE,
  },
  unreadBadge: {
    backgroundColor: colors.ERROR,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
  },
  unreadBadgeText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  filterButtonActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.WHITE,
  },
  bulkActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulkActionText: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 16,
  },
  notificationItem: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  notificationItemUnread: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 3,
    borderLeftColor: colors.BRG,
  },
  notificationItemArchived: {
    opacity: 0.6,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.BRG,
    marginRight: 12,
    marginTop: 6,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    lineHeight: 20,
  },
  notificationMessageUnread: {
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  archivedBadge: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  archivedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.ERROR,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 16,
  },
});

export default NotificationsScreen;
