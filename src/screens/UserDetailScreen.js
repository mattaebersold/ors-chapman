import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';
import Listing from '../components/Listing';
import { useGetUserDetailsQuery, useFollowUserMutation, useUnfollowUserMutation, useGetFollowStatusQuery, useGetPostsQuery, useGetCarsQuery } from '../services/apiService';
import EventCarousel from '../components/EventCarousel';

const { width } = Dimensions.get('window');

const UserDetailScreen = () => {
  const route = useRoute();
  const { userId, user: passedUser } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('posts');

  // Fetch detailed user data if not passed
  const { data: userDetails, isLoading: userLoading } = useGetUserDetailsQuery(userId, {
    skip: !userId || !!passedUser
  });

  const user = passedUser || userDetails;
  const isOwnProfile = user?._id === userInfo?.id || user?.id === userInfo?.id;

  // Determine the correct user ID to use (prioritize user_id field)
  const actualUserId = user?.user_id || user?._id || user?.id || userId;

  console.log('UserDetailScreen Debug:');
  console.log('- userId from route params:', userId);
  console.log('- passedUser:', passedUser);
  console.log('- user object:', user);
  console.log('- user.user_id:', user?.user_id);
  console.log('- user._id:', user?._id);
  console.log('- user.id:', user?.id);
  console.log('- actualUserId (final):', actualUserId);

  // Follow functionality - backend uses username
  const { data: followStatus, isLoading: statusLoading } = useGetFollowStatusQuery(user?.username, {
    skip: !user || isOwnProfile || !user?.username
  });
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();

  const followLoading = isFollowLoading || isUnfollowLoading;
  const isFollowing = user?.isFollowing || user?.is_following || followStatus?.isFollowing || false;

  const handleFollowToggle = async () => {
    try {
      const targetUsername = user?.username;
      if (isFollowing) {
        await unfollowUser(targetUsername).unwrap();
      } else {
        await followUser(targetUsername).unwrap();
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const getProfileImageSource = () => {
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${user.gallery[0].filename}` };
    }
    if (user?.profile_image) {
      return { uri: user.profile_image };
    }
    return null;
  };

  // Fetch user statistics for summary numbers
  const { data: userPostsStats } = useGetPostsQuery({ 
    page: 1, 
    limit: 1, 
    user_id: actualUserId 
  }, { 
    skip: !actualUserId 
  });
  
  const { data: userCarsStats } = useGetCarsQuery({ 
    page: 1, 
    limit: 1, 
    user_id: actualUserId 
  }, { 
    skip: !actualUserId 
  });

  // Fetch user events for carousel
  const { data: userEvents, isLoading: eventsLoading, error: eventsError } = useGetPostsQuery({ 
    page: 1, 
    limit: 10, // Get more events for carousel
    type: 'event',
    user_id: actualUserId 
  }, { 
    skip: !actualUserId 
  });

  console.log('Data fetching results:');
  console.log('- userPostsStats:', userPostsStats);
  console.log('- userCarsStats:', userCarsStats);
  console.log('- userEvents:', userEvents);
  console.log('- userEvents loading:', eventsLoading);
  console.log('- userEvents error:', eventsError);
  
  const tabs = [
    { key: 'posts', label: 'Posts', type: 'posts', apiUrl: `/api/post?user_id=${actualUserId}`, heading: 'User Posts' },
    { key: 'cars', label: 'Cars', type: 'cars', apiUrl: `/api/garage?user_id=${actualUserId}`, heading: 'User Cars' },
    { key: 'events', label: 'Events', type: 'events', apiUrl: `/api/post?type=event&user_id=${actualUserId}`, heading: 'User Events' },
  ];
  
  console.log('UserDetailScreen - tab URLs:', tabs.map(tab => ({ key: tab.key, url: tab.apiUrl })));

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    return {
      type: tab.type,
      apiUrl: tab.apiUrl,
      heading: tab.heading,
    };
  };

  if (!user && userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <FAIcon name="spinner" size={48} color={colors.BRG} />
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <FAIcon name="exclamation" size={48} color={colors.ERROR} />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {getProfileImageSource() ? (
              <Image
                source={getProfileImageSource()}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <FAIcon name="user" size={48} color={colors.WHITE} />
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username || user.name || 'Unknown User'}</Text>
            {user.location && (
              <View style={styles.locationRow}>
                <FAIcon name="map-marker" size={12} color={colors.TEXT_SECONDARY} />
                <Text style={styles.location}>{user.location}</Text>
              </View>
            )}
            {user.bio && (
              <Text style={styles.bio}>{user.bio}</Text>
            )}
          </View>

          {/* Follow Button */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
                (followLoading || statusLoading) && styles.followButtonLoading
              ]}
              onPress={handleFollowToggle}
              disabled={followLoading || statusLoading}
            >
              {(followLoading || statusLoading) ? (
                <FAIcon name="spinner" size={16} color={colors.WHITE} />
              ) : (
                <>
                  <FAIcon 
                    name={isFollowing ? "check" : "plus"} 
                    size={14} 
                    color={colors.WHITE} 
                    style={styles.followIcon}
                  />
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPostsStats?.total || 0}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userCarsStats?.total || 0}</Text>
            <Text style={styles.statLabel}>Cars</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.follower_count || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.following_count || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

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
    </View>
  );

  // Custom renderer for events tab
  const renderEventsTab = () => {
    if (eventsLoading) {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <View style={styles.loadingContainer}>
            <FAIcon name="spinner" size={48} color={colors.BRG} />
            <Text style={styles.loadingText}>Loading events...</Text>
          </View>
        </View>
      );
    }

    if (eventsError) {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <View style={styles.errorContainer}>
            <FAIcon name="exclamation" size={48} color={colors.ERROR} />
            <Text style={styles.errorText}>Error loading events</Text>
            <Text style={styles.errorDetails}>{eventsError?.message || 'Unknown error'}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        {renderHeader()}
        <EventCarousel 
          events={userEvents?.entries || []} 
          displayOptions={{ badgeProfile: false, badgeCar: false }}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Render events tab with custom carousel or default listing */}
      {activeTab === 'events' ? (
        renderEventsTab()
      ) : (
        <>
          <Listing 
            config={getTabConfig(activeTab)} 
            displayOptions={{ badgeProfile: false, badgeCar: false }}
            HeaderComponent={renderHeader}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.ERROR,
  },
  errorDetails: {
    marginTop: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.LIGHT_GRAY,
  },
  avatarPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 100,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.SUCCESS,
  },
  followButtonLoading: {
    opacity: 0.7,
  },
  followIcon: {
    marginRight: 6,
  },
  followButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
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
    color: colors.TEXT_SECONDARY,
  },
  activeTabText: {
    color: colors.BRG,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    minHeight: 400,
  },
});

export default UserDetailScreen;