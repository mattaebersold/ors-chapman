import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import {
  useGetMessageThreadQuery,
  useCreateMessageMutation,
  useMarkMessageAsReadMutation,
} from '../services/apiService';

const MessageThreadScreen = ({ route, navigation }) => {
  const { threadId, subject } = route.params;
  const { userInfo } = useSelector((state) => state.auth);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef(null);

  const {
    data: threadData,
    isLoading,
    error,
    refetch,
  } = useGetMessageThreadQuery(threadId);

  const [createMessage] = useCreateMessageMutation();
  const [markAsRead] = useMarkMessageAsReadMutation();

  const messages = threadData?.entries || [];

  // Mark unread messages as read when viewing thread
  useEffect(() => {
    const markUnreadAsRead = async () => {
      const unreadMessages = messages.filter(
        msg => !msg.read && msg.recipient_id === userInfo?.user_id
      );

      for (const message of unreadMessages) {
        try {
          await markAsRead(message.internal_id);
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    };

    if (messages.length > 0) {
      markUnreadAsRead();
    }
  }, [messages, markAsRead, userInfo]);

  const handleSendReply = async () => {
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      // Get the first message to determine recipient
      const firstMessage = messages[0];
      const recipientId = firstMessage?.sender_id === userInfo?.user_id
        ? firstMessage.recipient_id
        : firstMessage.sender_id;

      await createMessage({
        recipient_id: recipientId,
        subject: subject,
        body: replyText.trim(),
        parent_message_id: firstMessage?.internal_id,
      }).unwrap();

      setReplyText('');
      refetch();

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const renderMessage = ({ item: message }) => {
    const isSent = message.sender_id === userInfo?.user_id;
    const isRead = message.read;

    return (
      <View style={[
        styles.messageContainer,
        isSent ? styles.sentMessage : styles.receivedMessage,
      ]}>
        <View style={[
          styles.messageBubble,
          isSent ? styles.sentBubble : styles.receivedBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isSent ? styles.sentText : styles.receivedText,
          ]}>
            {message.body}
          </Text>

          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isSent ? styles.sentTimeText : styles.receivedTimeText,
            ]}>
              {formatMessageTime(message.created_at)}
            </Text>
            {isSent && (
              <FAIcon
                name={isRead ? 'check-circle' : 'check'}
                size={12}
                color={isRead ? colors.BRG : colors.TEXT_SECONDARY}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <FAIcon name="chevron-left" size={20} color={colors.BRG} />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {subject || 'Message Thread'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingIndicator text="Loading conversation..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <FAIcon name="exclamation-triangle" size={48} color={colors.ERROR} />
          <Text style={styles.errorText}>Failed to load conversation</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.internal_id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.replyContainer}>
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Type your reply..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!replyText.trim() || isSending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendReply}
              disabled={!replyText.trim() || isSending}
            >
              {isSending ? (
                <LoadingIndicator size="small" color={colors.WHITE} />
              ) : (
                <FAIcon name="paper-plane" size={16} color={colors.WHITE} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  sentMessage: {
    alignItems: 'flex-end',
  },
  receivedMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sentBubble: {
    backgroundColor: colors.BRG,
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: colors.WHITE,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: colors.WHITE,
  },
  receivedText: {
    color: colors.TEXT_PRIMARY,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  sentTimeText: {
    color: colors.WHITE,
    opacity: 0.8,
  },
  receivedTimeText: {
    color: colors.TEXT_SECONDARY,
  },
  replyContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.BRG,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.TEXT_SECONDARY,
    opacity: 0.5,
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

export default MessageThreadScreen;