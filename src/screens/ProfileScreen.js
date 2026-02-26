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
  useCreatePostMutation,
  useCreateProjectMutation,
  useCreateEventMutation,
  useGetUnreadMessageCountQuery,
  useGetUsersQuery,
  useGetCarsQuery,
} from '../services/apiService';
import { colors } from '../constants/colors';
import { createFormData } from '../utils/formUtils';
import SettingsModal from '../components/modals/SettingsModal';
import Listing from '../components/Listing';
import CarCard from '../components/cards/CarCard';
import UserCard from '../components/cards/UserCard';
import PostCreationModal from '../components/modals/PostCreationModal';
import CarFormModal from '../components/modals/CarFormModal';
import ProjectFormModal from '../components/modals/ProjectFormModal';
import EventFormModal from '../components/modals/EventFormModal';
import FAIcon from '../components/ui/FAIcon';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.auth);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  const {
    data: userDetails,
    isLoading: userLoading
  } = useGetUserDetailsQuery();

  const { data: unreadCount } = useGetUnreadMessageCountQuery();
  
  const [createPost] = useCreatePostMutation();
  const [createProject] = useCreateProjectMutation();
  const [createEvent] = useCreateEventMutation();

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

  const handleViewPublicProfile = () => {
    const currentUser = userDetails || userInfo;
    if (navigation && currentUser) {
      navigation.navigate('UserDetail', {
        user: currentUser,
        userId: currentUser.user_id || currentUser._id
      });
    }
  };

  const tabs = [
    {
      key: 'posts',
      label: 'Posts',
      type: 'posts',
      params: {
        type: 'all',
        filter: 'user',
        user_id: userDetails?.user_id,
        omit: 'none'
        // Removed draft filter - will show all posts including drafts
      }
    },
    {
      key: 'garage',
      label: 'Cars',
      type: 'userEntries',
      apiUrl: '/api/protected/garage/0/none/10'
    },
    {
      key: 'projects',
      label: 'Projects',
      type: 'projects',
      projectParams: {
        user_id: userDetails?.user_id,
      }
    },
    {
      key: 'events',
      label: 'Events',
      type: 'events',
      eventParams: {
        user_id: userDetails?.user_id,
      }
    },
    {
      key: 'followers',
      label: 'Followers',
      type: 'users',
      params: {
        filter: 'followers',
        username: userDetails?.username,
      }
    },
    {
      key: 'following',
      label: 'Following',
      type: 'following', // Special type for combined users + cars
      params: {
        filter: 'following',
        username: userDetails?.username,
      }
    },
  ];

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    return {
      type: tab.type,
      apiUrl: tab.apiUrl,
      params: tab.params,
      projectParams: tab.projectParams,
      eventParams: tab.eventParams,
      heading: `Your ${tab.label}`,
    };
  };

  const getNewButtonConfig = () => {
    switch (activeTab) {
      case 'posts':
        return {
          title: 'New Post',
          onPress: () => setPostModalVisible(true),
          icon: 'plus'
        };
      case 'garage':
        return {
          title: 'Add Car',
          onPress: () => setCarModalVisible(true),
          icon: 'car'
        };
      case 'projects':
        return {
          title: 'New Project',
          onPress: () => setProjectModalVisible(true),
          icon: 'wrench'
        };
      case 'events':
        return {
          title: 'New Event',
          onPress: () => setEventModalVisible(true),
          icon: 'calendar'
        };
      case 'followers':
      case 'following':
        return null; // No create button for followers/following
      default:
        return null;
    }
  };

  const renderFeedHeader = () => {
    const buttonConfig = getNewButtonConfig();
    if (!buttonConfig) return null;

    return (
      <View style={styles.feedHeader}>
        <Text style={styles.feedTitle}>{getTabConfig(activeTab).heading}</Text>
        <TouchableOpacity 
          style={styles.feedNewButton} 
          onPress={buttonConfig.onPress}
        >
          <FAIcon name={buttonConfig.icon} size={16} color={colors.WHITE} />
          <Text style={styles.feedNewButtonText}>{buttonConfig.title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Fetch following data for the special following tab
  const { data: followingUsers } = useGetUsersQuery({
    page: 1,
    limit: 50,
    filter: 'following',
    username: userDetails?.username,
  }, {
    skip: activeTab !== 'following' || !userDetails?.username
  });

  const { data: followingCars } = useGetCarsQuery({
    page: 1,
    limit: 50,
    filter: 'following',
    username: userDetails?.username,
  }, {
    skip: activeTab !== 'following' || !userDetails?.username
  });

  const renderFollowingTab = () => {
    const users = followingUsers?.entries || [];
    const cars = followingCars?.entries || [];

    return (
      <ScrollView style={styles.followingContainer}>
        {users.length > 0 && (
          <View style={styles.followingSection}>
            <Text style={styles.followingSectionTitle}>Following Users ({users.length})</Text>
            {users.map((user, index) => (
              <View key={user._id || index} style={styles.followingItem}>
                <UserCard user={user} displayOptions={{}} />
              </View>
            ))}
          </View>
        )}

        {cars.length > 0 && (
          <View style={styles.followingSection}>
            <Text style={styles.followingSectionTitle}>Following Cars ({cars.length})</Text>
            {cars.map((car, index) => (
              <View key={car._id || index} style={styles.followingItem}>
                <CarCard post={car} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        )}

        {users.length === 0 && cars.length === 0 && (
          <View style={styles.emptyState}>
            <FAIcon name="users" size={48} color={colors.TEXT_SECONDARY} />
            <Text style={styles.emptyStateText}>Not following anyone yet</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderTabContent = () => {
    const config = getTabConfig(activeTab);

    // Special handling for following tab
    if (activeTab === 'following') {
      return (
        <View style={styles.tabContent}>
          {renderFeedHeader()}
          {renderFollowingTab()}
        </View>
      );
    }

    // Display options - hide user badge since this is the user's own profile
    const displayOptions = {
      badgeProfile: false, // Hide user badge - this is the user's own profile
      badgeCar: true, // Keep car badge for posts
    };

    return (
      <View style={styles.tabContent}>
        {renderFeedHeader()}
        <Listing
          config={config}
          displayOptions={displayOptions}
          CustomComponent={activeTab === 'garage' ? CarCard : undefined}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      </View>
    );
  };


  const handlePostSubmit = async (formData) => {
    try {
      const apiFormData = createFormData(formData);
      return await createPost(apiFormData).unwrap();
      setPostModalVisible(false);
      // Optionally refresh data or show success message
    } catch (error) {
      console.error('Error creating post:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleProjectSubmit = async (formData) => {
    try {
      const apiFormData = createFormData(formData);
      await createProject(apiFormData).unwrap();
      setProjectModalVisible(false);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const handleEventSubmit = async (formData) => {
    try {
      const apiFormData = createFormData(formData);
      await createEvent(apiFormData).unwrap();
      setEventModalVisible(false);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const user = userDetails || userInfo;
  const profileImageUrl = user?.gallery?.[0]?.filename 
    ? `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}`
    : null;

  // Header animation values - improved layout
  const HEADER_MAX_HEIGHT = 180;
  const HEADER_MIN_HEIGHT = 80;
  const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageSize = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [80, 40],
    extrapolate: 'clamp',
  });

  const imageTranslateX = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -80], // Move image to left in compact mode
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

  const compactTitleTranslateX = scrollY.interpolate({
    inputRange: [0, SCROLL_DISTANCE],
    outputRange: [0, -40], // Move text left to align with logo
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Fixed Animated Header */}
      <Animated.View style={[styles.fixedHeader, { height: headerHeight }]}>
        <View style={styles.headerContent}>
          {/* Expanded Header Layout */}
          <Animated.View style={[styles.expandedHeader, { opacity: titleOpacity }]}>
            <View style={styles.expandedLayout}>
              {/* Profile Image - Left Side */}
              <View style={styles.expandedImageContainer}>
                {profileImageUrl ? (
                  <Image 
                    source={{ uri: profileImageUrl }} 
                    style={styles.expandedProfileImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.expandedPlaceholderImage}>
                    <FAIcon name="user" size={30} color={colors.GRAY} />
                  </View>
                )}
              </View>
              
              {/* User Info - Right Side */}
              <View style={styles.expandedUserInfo}>
                <Text style={styles.username}>{user?.username || 'Loading...'}</Text>
                {user?.email && (
                  <Text style={styles.email}>{user.email}</Text>
                )}
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.messagesButton}
                    onPress={() => navigation.navigate('Messages')}
                  >
                    <View style={styles.messagesIconContainer}>
                      <FAIcon name="envelope" size={16} color={colors.WHITE} />
                      {unreadCount > 0 && (
                        <View style={styles.messageBadge}>
                          <Text style={styles.messageBadgeText}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.messagesText}>Messages</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.publicProfileButton}
                    onPress={handleViewPublicProfile}
                  >
                    <FAIcon name="eye" size={16} color={colors.WHITE} />
                    <Text style={styles.publicProfileText}>Public Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => setSettingsVisible(true)}
                  >
                    <FAIcon name="cog" size={16} color={colors.WHITE} />
                    <Text style={styles.settingsText}>Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <FAIcon name="sign-out" size={16} color={colors.WHITE} />
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Compact Header Layout */}
          <Animated.View style={[
            styles.compactHeader, 
            { 
              opacity: compactTitleOpacity,
              transform: [{ translateX: compactTitleTranslateX }]
            }
          ]}>
            <View style={styles.compactLayout}>
              {/* Compact Profile Image */}
              <Animated.View style={[
                styles.compactImageContainer,
                { 
                  transform: [{ translateX: imageTranslateX }]
                }
              ]}>
                {profileImageUrl ? (
                  <Animated.Image 
                    source={{ uri: profileImageUrl }} 
                    style={[
                      styles.compactProfileImage,
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
                      styles.compactPlaceholderImage,
                      {
                        width: imageSize,
                        height: imageSize,
                        borderRadius: Animated.divide(imageSize, 2)
                      }
                    ]}
                  >
                    <FAIcon name="user" size={20} color={colors.GRAY} />
                  </Animated.View>
                )}
              </Animated.View>
              
              {/* Compact Username */}
              <Text style={styles.compactUsername}>{user?.username || 'Loading...'}</Text>
            </View>
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
      
      <PostCreationModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        onSubmit={handlePostSubmit}
      />
      
      <CarFormModal
        visible={carModalVisible}
        onClose={() => setCarModalVisible(false)}
        onSuccess={() => {
          setCarModalVisible(false);
        }}
      />
      
      <ProjectFormModal
        visible={projectModalVisible}
        onClose={() => setProjectModalVisible(false)}
        onSubmit={handleProjectSubmit}
      />
      
      <EventFormModal
        visible={eventModalVisible}
        onClose={() => setEventModalVisible(false)}
        onSubmit={handleEventSubmit}
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
    position: 'relative',
    paddingHorizontal: 20,
  },
  
  // Expanded Header Styles
  expandedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  expandedLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  expandedImageContainer: {
    marginRight: 20,
  },
  expandedProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  expandedPlaceholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedUserInfo: {
    flex: 1,
  },
  
  // Compact Header Styles
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  compactLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  compactImageContainer: {
    marginRight: 12,
  },
  compactProfileImage: {
    // Dynamic size handled by animation
  },
  compactPlaceholderImage: {
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactUsername: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  
  // Content Styles
  contentContainer: {
    flex: 1,
  },
  username: {
    fontSize: 22,
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
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 6,
  },
  messagesButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  messagesIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.ERROR,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.WHITE,
  },
  messageBadgeText: {
    color: colors.WHITE,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messagesText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '500',
  },
  publicProfileButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  publicProfileText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '500',
  },
  settingsButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  settingsText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: colors.ERROR,
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  logoutText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '500',
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
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
  // Feed Content Styles
  tabContent: {
    flex: 1,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  feedNewButton: {
    backgroundColor: colors.BRG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  feedNewButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Following Tab Styles
  followingContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  followingSection: {
    marginTop: 8,
    backgroundColor: colors.WHITE,
    padding: 16,
  },
  followingSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  followingItem: {
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 16,
  },
});

export default ProfileScreen;