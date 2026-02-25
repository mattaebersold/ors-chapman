import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import UsernameSearch from '../components/UsernameSearch';
import {
  useCreateMessageMutation,
} from '../services/apiService';

const ComposeMessageScreen = ({ navigation, route }) => {
  const { recipientId, recipientUsername, replyToMessageId, defaultSubject } = route.params || {};

  const [recipient, setRecipient] = useState(
    recipientId ? { user_id: recipientId, username: recipientUsername } : null
  );
  const [subject, setSubject] = useState(defaultSubject || '');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(!recipientId);

  const [createMessage] = useCreateMessageMutation();

  const handleUserSelect = (user) => {
    // Use the same ID mapping as SocietyScreen
    // Backend expects user_id field, so prioritize user.user_id over user._id
    setRecipient({
      user_id: user.user_id || user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName
    });
    setShowUserSearch(false);
  };

  const handleRemoveRecipient = () => {
    setRecipient(null);
    setShowUserSearch(true);
  };

  const handleSendMessage = async () => {
    if (!recipient) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsSending(true);
    try {
      await createMessage({
        recipient_id: recipient.user_id,
        subject: subject.trim(),
        body: message.trim(),
        parent_message_id: replyToMessageId,
      }).unwrap();

      Alert.alert(
        'Success',
        'Message sent successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>New Message</Text>
      <TouchableOpacity
        style={[
          styles.sendButton,
          (!recipient || !subject.trim() || !message.trim() || isSending) &&
            styles.sendButtonDisabled,
        ]}
        onPress={handleSendMessage}
        disabled={!recipient || !subject.trim() || !message.trim() || isSending}
      >
        {isSending ? (
          <LoadingIndicator size="small" color={colors.WHITE} />
        ) : (
          <Text style={styles.sendButtonText}>Send</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior='height'
      >
        {renderHeader()}

        <View style={styles.content}>
          {/* Recipient Section */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>To:</Text>
            {recipient ? (
              <View style={styles.selectedRecipient}>
                <View style={styles.recipientChip}>
                  <Text style={styles.recipientText}>@{recipient.username}</Text>
                  <TouchableOpacity
                    style={styles.removeRecipientButton}
                    onPress={handleRemoveRecipient}
                  >
                    <FAIcon name="times" size={12} color={colors.WHITE} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <UsernameSearch
                onUserSelect={handleUserSelect}
                style={styles.usernameSearch}
              />
            )}
          </View>

          {/* Subject Field */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Subject:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter subject"
              placeholderTextColor={colors.TEXT_SECONDARY}
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
          </View>

          {/* Message Field */}
          <View style={[styles.field, styles.messageField]}>
            <Text style={styles.fieldLabel}>Message:</Text>
            <TextInput
              style={[styles.textInput, styles.messageInput]}
              placeholder="Type your message..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={2000}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>
              {message.length}/2000
            </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.BRG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  sendButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.TEXT_SECONDARY,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  messageField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  selectedRecipient: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  recipientText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  removeRecipientButton: {
    padding: 2,
  },
  usernameSearch: {
    marginTop: 0,
    marginBottom: 0,
  },
  textInput: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default ComposeMessageScreen;