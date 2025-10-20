import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import UsernameSearch from '../UsernameSearch';
import { useCreateTagMutation } from '../../services/apiService';

const UserSearchModal = ({ visible, onClose, postId }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [createTag, { isLoading }] = useCreateTagMutation();

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleTagUser = async () => {
    if (!selectedUser || !postId) {
      Alert.alert('Error', 'Please select a user to tag');
      return;
    }

    try {
      await createTag({
        post_id: postId,
        tag_entry_type: 'user',
        tag_internal_id: selectedUser.internal_id || selectedUser.user_id,
      }).unwrap();

      Alert.alert('Success', 'User tagged successfully');
      setSelectedUser(null);
      onClose();
    } catch (error) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', 'Failed to tag user. They may already be tagged.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Users</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Search for a user to tag on this post
          </Text>

          <UsernameSearch
            onSelectUser={handleSelectUser}
            placeholder="Search by username..."
          />

          {selectedUser && (
            <View style={styles.selectedUserCard}>
              <View style={styles.selectedUserInfo}>
                <FAIcon name="user" size={20} color={colors.BRG} />
                <Text style={styles.selectedUserText}>{selectedUser.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.tagButton}
                onPress={handleTagUser}
                disabled={isLoading}
              >
                <Text style={styles.tagButtonText}>
                  {isLoading ? 'Tagging...' : 'Tag User'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    backgroundColor: colors.BRG,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
  },
  selectedUserCard: {
    marginTop: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  selectedUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  selectedUserText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  tagButton: {
    backgroundColor: colors.BRG,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tagButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserSearchModal;
