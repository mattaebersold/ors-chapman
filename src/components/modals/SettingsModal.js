import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import {
  useUpdateUserBioMutation,
  useUpdateUserNameMutation,
  useUpdateUserUsernameMutation,
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
  useGetCacheStatsQuery,
  useGetCacheCollectionsQuery,
  useClearCollectionCacheMutation,
  useFlushAllCacheMutation
} from '../../services/apiService';
import { colors } from '../../constants/colors';
import { useDispatch } from 'react-redux';
import { deleteAccount, logout } from '../../store/authSlice';
import { useNavigation } from '@react-navigation/native';

const SettingsModal = ({ visible, onClose, userInfo }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [updateBio, { isLoading: bioLoading }] = useUpdateUserBioMutation();
  const [updateName, { isLoading: nameLoading }] = useUpdateUserNameMutation();
  const [updateUsername, { isLoading: usernameLoading }] = useUpdateUserUsernameMutation();
  const [updateEmail, { isLoading: emailLoading }] = useUpdateUserEmailMutation();
  const [updatePassword, { isLoading: passwordLoading }] = useUpdateUserPasswordMutation();

  // Cache management hooks (admin only)
  const { data: cacheStats, refetch: refetchStats } = useGetCacheStatsQuery(undefined, {
    skip: userInfo?.accountType !== 'admin',
  });
  const { data: cacheCollections } = useGetCacheCollectionsQuery(undefined, {
    skip: userInfo?.accountType !== 'admin',
  });
  const [clearCollection, { isLoading: clearingCollection }] = useClearCollectionCacheMutation();
  const [flushCache, { isLoading: flushingCache }] = useFlushAllCacheMutation();

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const profileLoading = bioLoading || nameLoading || usernameLoading || emailLoading;
  const isAdmin = userInfo?.accountType === 'admin';

  const [profileData, setProfileData] = useState({
    username: userInfo?.username || '',
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    bio: userInfo?.bio || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileUpdate = async () => {
    try {
      const userid = userInfo?.user_id;
      if (!userid) {
        throw new Error('User ID not found');
      }

      // Update each field individually
      const updatePromises = [];
      
      if (profileData.bio !== userInfo.bio) {
        updatePromises.push(updateBio({ bio: profileData.bio, userid }).unwrap());
      }
      if (profileData.name !== userInfo.name) {
        updatePromises.push(updateName({ name: profileData.name, userid }).unwrap());
      }
      if (profileData.username !== userInfo.username) {
        updatePromises.push(updateUsername({ username: profileData.username, userid }).unwrap());
      }
      if (profileData.email !== userInfo.email) {
        updatePromises.push(updateEmail({ email: profileData.email, userid }).unwrap());
      }

      if (updatePromises.length === 0) {
        Alert.alert('Info', 'No changes to save');
        return;
      }

      await Promise.all(updatePromises);
      Alert.alert('Success', 'Profile updated successfully!');
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      const errorMessage = error.data?.message || error.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();
      Alert.alert('Success', 'Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (error) {
      Alert.alert('Error', error.data?.message || 'Failed to update password');
    }
  };

  const handleClearCache = async (collectionKey) => {
    try {
      await clearCollection(collectionKey).unwrap();
      await refetchStats();
      Alert.alert('Success', `Cache cleared for ${collectionKey}`);
    } catch (error) {
      Alert.alert('Error', error.data?.error || 'Failed to clear cache');
    }
  };

  const handleFlushAll = async () => {
    Alert.alert(
      'Flush All Cache',
      'Are you sure you want to clear ALL cache? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flush All',
          style: 'destructive',
          onPress: async () => {
            try {
              await flushCache().unwrap();
              await refetchStats();
              Alert.alert('Success', 'All cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', error.data?.error || 'Failed to flush cache');
            }
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This will permanently delete your account and all associated data including:\n\n• Your profile and settings\n• All cars in your garage\n• All posts, comments, and interactions\n• All projects, events, and groups you\'ve created\n• All marketplace listings\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: async () => {
            setIsDeletingAccount(true);
            try {
              await dispatch(deleteAccount()).unwrap();
              // Close modal and logout
              onClose();
              dispatch(logout());
              // The LoginScreen will automatically show after logout
            } catch (error) {
              setIsDeletingAccount(false);
              Alert.alert('Error', error || 'Failed to delete account');
            }
          }
        },
      ]
    );
  };

  const renderCacheTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Cache Management</Text>

      {/* Cache Stats */}
      {cacheStats?.stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Cache Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Keys</Text>
              <Text style={styles.statValue}>{cacheStats.stats.keys}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Hit Rate</Text>
              <Text style={styles.statValue}>
                {cacheStats.stats.hits + cacheStats.stats.misses > 0
                  ? `${Math.round((cacheStats.stats.hits / (cacheStats.stats.hits + cacheStats.stats.misses)) * 100)}%`
                  : 'N/A'
                }
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cache Hits</Text>
              <Text style={styles.statValue}>{cacheStats.stats.hits}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Cache Misses</Text>
              <Text style={styles.statValue}>{cacheStats.stats.misses}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={refetchStats}
          >
            <Text style={styles.secondaryButtonText}>Refresh Stats</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Collections */}
      <Text style={styles.subsectionTitle}>Clear Cache by Collection</Text>
      {cacheCollections?.collections?.map((collection) => (
        <View key={collection.key} style={styles.collectionItem}>
          <View style={styles.collectionInfo}>
            <Text style={styles.collectionLabel}>{collection.label}</Text>
            <Text style={styles.collectionDescription}>{collection.description}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, styles.destructiveButton, styles.smallButton]}
            onPress={() => handleClearCache(collection.key)}
            disabled={clearingCollection}
          >
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Flush All */}
      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.dangerDescription}>
          Clear all cached data across all collections. This will force fresh data fetches.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.destructiveButton]}
          onPress={handleFlushAll}
          disabled={flushingCache}
        >
          {flushingCache ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Flush All Cache</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Username</Text>
        <TextInput
          style={styles.input}
          value={profileData.username}
          onChangeText={(text) => setProfileData({ ...profileData, username: text })}
          placeholder="Enter username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={profileData.name}
          onChangeText={(text) => setProfileData({ ...profileData, name: text })}
          placeholder="Enter full name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={profileData.email}
          onChangeText={(text) => setProfileData({ ...profileData, email: text })}
          placeholder="Enter email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profileData.bio}
          onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleProfileUpdate}
        disabled={profileLoading}
      >
        {profileLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPasswordTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Change Password</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.input}
          value={passwordData.currentPassword}
          onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
          placeholder="Enter current password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>New Password</Text>
        <TextInput
          style={styles.input}
          value={passwordData.newPassword}
          onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
          placeholder="Enter new password"
          secureTextEntry
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          value={passwordData.confirmPassword}
          onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
          placeholder="Confirm new password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handlePasswordUpdate}
        disabled={passwordLoading}
      >
        {passwordLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Account Management</Text>

      <View style={styles.dangerZone}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.dangerDescription}>
          Deleting your account is permanent and cannot be undone. This will remove all of your data including your profile, garage cars, posts, projects, events, and marketplace listings.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.destructiveButton]}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
        >
          {isDeletingAccount ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior='height'
        keyboardVerticalOffset={20}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'password' && styles.activeTab]}
            onPress={() => setActiveTab('password')}
          >
            <Text style={[styles.tabText, activeTab === 'password' && styles.activeTabText]}>
              Password
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'account' && styles.activeTab]}
            onPress={() => setActiveTab('account')}
          >
            <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
              Account
            </Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.tab, activeTab === 'cache' && styles.activeTab]}
              onPress={() => setActiveTab('cache')}
            >
              <Text style={[styles.tabText, activeTab === 'cache' && styles.activeTabText]}>
                Cache
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'password' && renderPasswordTab()}
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'cache' && isAdmin && renderCacheTab()}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.GRAY,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.BRG,
  },
  tabText: {
    fontSize: 16,
    color: colors.GRAY,
  },
  activeTabText: {
    color: colors.BRG,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.GRAY,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.WHITE,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: colors.BRG,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  secondaryButtonText: {
    color: colors.BRG,
    fontSize: 16,
    fontWeight: '600',
  },
  destructiveButton: {
    backgroundColor: '#dc2626',
  },
  smallButton: {
    padding: 8,
    marginTop: 0,
  },
  statsContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  statItem: {
    width: '50%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.GRAY,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 12,
    marginTop: 8,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  collectionInfo: {
    flex: 1,
    marginRight: 12,
  },
  collectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 12,
    color: colors.GRAY,
  },
  dangerZone: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: colors.GRAY,
    marginBottom: 12,
  },
});

export default SettingsModal;