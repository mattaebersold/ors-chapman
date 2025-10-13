import React, { useState, useCallback } from 'react';
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
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import EmptyState from '../components/ui/EmptyState';
import {
  useGetMessagesQuery,
  useMarkMessageAsReadMutation,
  useDeleteMessageMutation,
} from '../services/apiService';

const MessagesScreen = ({ navigation }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    data: messagesData,
    isLoading,
    error,
    refetch,
  } = useGetMessagesQuery({
    page: 0,
    limit: 50,
    unread_only: showUnreadOnly,
  });

  const [markAsRead] = useMarkMessageAsReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const messages = messagesData?.entries || [];

  const handleMessagePress = useCallback(async (message) => {
    // Mark as read if user is recipient and message is unread
    if (!message.read && message.recipient_id === userInfo?.user_id) {
      try {
        await markAsRead(message.internal_id).unwrap();
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }

    // Navigate to thread view
    navigation.navigate('MessageThread', {
      threadId: message.thread_id,
      subject: message.subject,
    });
  }, [markAsRead, navigation, userInfo]);

  const handleDeleteMessage = useCallback((messageId) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessage(messageId).unwrap();
            } catch (error) {
              console.error('Error deleting message:', error);
              Alert.alert('Error', 'Failed to delete message');
            }
          },
        },
      ]
    );
  }, [deleteMessage]);

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getOtherParticipant = (message) => {
    return message.sender_id === userInfo?.user_id
      ? { id: message.recipient_id, type: 'recipient' }
      : { id: message.sender_id, type: 'sender' };
  };

  const renderMessage = ({ item: message }) => {
    const otherParticipant = getOtherParticipant(message);
    const isUnread = !message.read && message.recipient_id === userInfo?.user_id;
    const isSent = message.sender_id === userInfo?.user_id;

    return (
      <TouchableOpacity
        style={[
          styles.messageItem,
          isUnread && styles.unreadMessage,
        ]}
        onPress={() => handleMessagePress(message)}
        activeOpacity={0.7}
      >
        <View style={styles.messageHeader}>
          <View style={styles.participantInfo}>
            <FAIcon
              name={isSent ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isSent ? colors.BRG : colors.TEXT_SECONDARY}
            />
            <Text style={[
              styles.participantText,
              isUnread && styles.boldText,
            ]}>
              {isSent ? 'To: ' : 'From: '}{otherParticipant.id}
            </Text>
          </View>

          <View style={styles.messageActions}>
            <Text style={styles.messageDate}>
              {formatMessageDate(message.created_at)}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteMessage(message.internal_id)}
            >
              <FAIcon name="trash" size={14} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[
          styles.messageSubject,
          isUnread && styles.boldText,
        ]} numberOfLines={1}>
          {message.subject || 'No Subject'}
        </Text>

        <Text style={styles.messagePreview} numberOfLines={2}>
          {message.body || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => navigation.navigate('ComposeMessage')}
        >
          <FAIcon name="plus" size={16} color={colors.WHITE} />
          <Text style={styles.composeButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            !showUnreadOnly && styles.activeFilter,
          ]}
          onPress={() => setShowUnreadOnly(false)}
        >
          <Text style={[
            styles.filterButtonText,
            !showUnreadOnly && styles.activeFilterText,
          ]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showUnreadOnly && styles.activeFilter,
          ]}
          onPress={() => setShowUnreadOnly(true)}
        >
          <Text style={[
            styles.filterButtonText,
            showUnreadOnly && styles.activeFilterText,
          ]}>
            Unread
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="envelope"
      title={showUnreadOnly ? "No Unread Messages" : "No Messages"}
      message={showUnreadOnly
        ? "You don't have any unread messages."
        : "You don't have any messages yet. Start a conversation!"
      }
      actionText="Send Message"
      onActionPress={() => navigation.navigate('ComposeMessage')}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingIndicator text="Loading messages..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <FAIcon name="exclamation-triangle" size={48} color={colors.ERROR} />
          <Text style={styles.errorText}>Failed to load messages</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.internal_id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        contentContainerStyle={messages.length === 0 ? styles.emptyContainer : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
  },
  composeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  composeButtonText: {
    color: colors.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: colors.WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  activeFilterText: {
    color: colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  messageItem: {
    backgroundColor: colors.WHITE,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.BRG,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  participantText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageDate: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.BRG,
  },
  deleteButton: {
    padding: 4,
  },
  messageSubject: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '600',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.WHITE,
    fontWeight: '600',
  },
});

export default MessagesScreen;