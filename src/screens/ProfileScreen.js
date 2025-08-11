import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { 
  useGetUserDetailsQuery,
  useGetUserPostsQuery,
  useGetUserProjectsQuery,
  useGetUserEventsQuery,
  useGetUserGarageQuery,
} from '../services/apiService';
import { colors } from '../constants/colors';
import SettingsModal from '../components/SettingsModal';
import Listing from '../components/Listing';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const { 
    data: userDetails, 
    isLoading: userLoading 
  } = useGetUserDetailsQuery();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        },
      ]
    );
  };

  const tabs = [
    { key: 'posts', label: 'Posts', type: 'userEntries', apiUrl: '/api/protected/post/type/records/0/none/10' },
    { key: 'garage', label: 'Cars', type: 'userEntries', apiUrl: '/api/protected/garage/0/none/10' },
    { key: 'projects', label: 'Projects', type: 'userEntries', apiUrl: '/api/protected/projects/0/none/10' },
    { key: 'events', label: 'Events', type: 'userEntries', apiUrl: '/api/protected/events/0/none/10' },
  ];

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    return {
      type: tab.type,
      apiUrl: tab.apiUrl,
      heading: `Your ${tab.label}`,
    };
  };

  const renderTabContent = () => {
    const config = getTabConfig(activeTab);
    return (
      <Listing 
        config={config}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    );
  };

  const user = userDetails || userInfo;
  const profileImageUrl = user?.gallery?.[0]?.filename 
    ? `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${user.gallery[0].filename}`
    : null;

  // Header animation values
  const HEADER_MAX_HEIGHT = 200;
  const HEADER_MIN_HEIGHT = 80;
  const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [100, 40],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [1, 0.7, 0.3],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const compactTitleOpacity = scrollY.interpolate({
    inputRange: [SCROLL_DISTANCE / 2, SCROLL_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Fixed Animated Header */}
      <Animated.View style={[styles.fixedHeader, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          {/* Profile Image */}
          <Animated.View style={[styles.imageContainer, { opacity: imageOpacity }]}>
            {profileImageUrl ? (
              <Animated.Image 
                source={{ uri: profileImageUrl }} 
                style={[
                  styles.profileImage,
                  {
                    width: imageSize,
                    height: imageSize,
                    borderRadius: Animated.divide(imageSize, 2)
                  }
                ]}
                resizeMode="cover"
              />
            ) : (
              <Animated.View 
                style={[
                  styles.placeholderImage,
                  {
                    width: imageSize,
                    height: imageSize,
                    borderRadius: Animated.divide(imageSize, 2)
                  }
                ]}
              >
                <Text style={styles.placeholderText}>No Photo</Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Expanded Header Content */}
          <Animated.View style={[styles.expandedContent, { opacity: titleOpacity }]}>
            <Text style={styles.username}>{user?.username || 'Loading...'}</Text>
            {user?.email && (
              <Text style={styles.email}>{user.email}</Text>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.settingsButton} 
                onPress={() => setSettingsVisible(true)}
              >
                <Text style={styles.settingsText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Compact Header Content */}
          <Animated.View style={[styles.compactContent, { opacity: compactTitleOpacity }]}>
            <Text style={styles.compactUsername}>{user?.username || 'Loading...'}</Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        userInfo={user}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  fixedHeader: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    zIndex: 1000,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 20,
    alignItems: 'center',
  },
  profileImage: {
    // Dynamic size handled by animation
  },
  placeholderImage: {
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedContent: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  compactContent: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  compactUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  placeholderText: {
    color: colors.GRAY,
    fontSize: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.GRAY,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  settingsButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.4,
    alignItems: 'center',
  },
  settingsText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.ERROR,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 0.4,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.BRG,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.GRAY,
  },
  activeTabText: {
    color: colors.BRG,
    fontWeight: '600',
  },
});

export default ProfileScreen;