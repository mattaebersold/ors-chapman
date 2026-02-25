import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import CarCard from '../components/cards/CarCard';
import PostCard from '../components/cards/PostCard';
import UserCard from '../components/cards/UserCard';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import PaneModal from '../components/modals/PaneModal';
import {
  useGetUserQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
  useGetPostsQuery,
  useGetCarsQuery,
  useToggleUserFeaturedMutation,
  useGetUserDetailsQuery,
  useGetUsersQuery
} from '../services/apiService';

const { width } = Dimensions.get('window');

const UserDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, user: passedUser } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);

  // Fetch detailed user data
  const { data: userDetails, isLoading: userLoading } = useGetUserQuery(userId, {
    skip: !userId || !!passedUser
  });

  const user = passedUser || userDetails;
  const isOwnProfile = user?._id === userInfo?.id || user?.id === userInfo?.id;
  const actualUserId = user?.user_id || user?._id || user?.id || userId;

  // Follow functionality
  const { data: followStatus, isLoading: statusLoading } = useGetFollowStatusQuery(user?.username, {
    skip: !user || isOwnProfile || !user?.username
  });
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();
  const [toggleUserFeatured] = useToggleUserFeaturedMutation();

  const followLoading = isFollowLoading || isUnfollowLoading;
  const isFollowing = user?.isFollowing || user?.is_following || followStatus?.isFollowing || false;

  // Get current user details to check if admin
  const { data: currentUser } = useGetUserDetailsQuery();
  const isAdmin = currentUser && currentUser.accountType === 'admin';

  // Modal state for followers/following panes
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followingModalVisible, setFollowingModalVisible] = useState(false);

  // Fetch followers list when modal is open
  const { data: followersList, isLoading: followersLoading } = useGetUsersQuery({
    page: 1,
    limit: 50,
    filter: 'followers',
    username: user?.username,
  }, {
    skip: !followersModalVisible || !user?.username
  });

  // Fetch following list when modal is open
  const { data: followingList, isLoading: followingLoading } = useGetUsersQuery({
    page: 1,
    limit: 50,
    filter: 'following',
    username: user?.username,
  }, {
    skip: !followingModalVisible || !user?.username
  });

  // Fetch user's content sections
  const { data: userPosts } = useGetPostsQuery({
    page: 1,
    limit: 6,
    user_id: actualUserId
  }, { skip: !actualUserId });

  const { data: userCars } = useGetCarsQuery({
    page: 1,
    limit: 12,
    user_id: actualUserId
  }, { skip: !actualUserId });

  const { data: taggedPosts } = useGetPostsQuery({
    page: 1,
    limit: 6,
    tagged_user_id: actualUserId
  }, { skip: !actualUserId });

  const { data: userListings } = useGetPostsQuery({
    page: 1,
    limit: 6,
    type: 'listing',
    user_id: actualUserId
  }, { skip: !actualUserId });

  const { data: userWantAds } = useGetPostsQuery({
    page: 1,
    limit: 6,
    type: 'want',
    user_id: actualUserId
  }, { skip: !actualUserId });

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

  const handleToggleFeatured = async () => {
    try {
      const newFeaturedStatus = !user.featured;
      await toggleUserFeatured({
        user_id: actualUserId,
        featured: newFeaturedStatus
      }).unwrap();
      Alert.alert('Success', `User ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully.`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      Alert.alert('Error', 'Failed to update featured status. Please try again.');
    }
  };

  const getProfileImageSource = () => {
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` };
    }
    if (user?.profile_image) {
      return { uri: user.profile_image };
    }
    return null;
  };

  const getBannerImageSource = () => {
    if (user?.banners?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.banners[0].filename}` };
    }
    if (user?.banners?.[0]) {
      // If banners[0] is a string (just filename)
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.banners[0]}` };
    }
    if (user?.banner_image) {
      return { uri: user.banner_image };
    }
    return null;
  };

  // Strip HTML tags from bio text
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  };

  if (!user && userLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingIndicator text="Loading user profile..." />
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

  const renderSectionHeader = (title, count, onViewAll) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {count > 0 && onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All ({count})</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Banner Section */}
      <View style={styles.bannerContainer}>
        {getBannerImageSource() ? (
          <Image
            source={getBannerImageSource()}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.bannerPlaceholder}>
            <FAIcon name="image" size={48} color={colors.TEXT_SECONDARY} />
          </View>
        )}
      </View>

      {/* Profile Section */}
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
          {user.memberNumber && (
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>#{user.memberNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.userInfoSection}>
          <Text style={styles.username}>{user.username || user.name || 'Unknown User'}</Text>
          {user.location && (
            <View style={styles.locationRow}>
              <FAIcon name="map-marker" size={12} color={colors.TEXT_SECONDARY} />
              <Text style={styles.location}>{user.location}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
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

            {isAdmin && (
              <TouchableOpacity
                style={[styles.featuredButton, user?.featured && styles.featuredButtonActive]}
                onPress={handleToggleFeatured}
              >
                <FAIcon name="star" size={16} color={user?.featured ? colors.GOLD : colors.TEXT_SECONDARY} />
                <Text style={[styles.featuredButtonText, user?.featured && styles.featuredButtonTextActive]}>
                  {user?.featured ? 'Featured' : 'Feature'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setFollowersModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>
            {user?.followersCount || user?.follower_count || user?.followers?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => setFollowingModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.statNumber}>
            {user?.followingCount || user?.following_count || user?.following?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Bio Section */}
      {user.bio && (
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{stripHtml(user.bio)}</Text>
        </View>
      )}

      {/* Garage Section */}
      {userCars?.entries && userCars.entries.length > 0 && (
        <View style={styles.contentSection}>
          {renderSectionHeader('Garage', userCars.total, null)}
          <View style={styles.garageList}>
            {userCars.entries.slice(0, 12).map((car, index) => (
              <View key={car._id || index} style={styles.carCardWrapper}>
                <CarCard post={car} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Recent Posts Section */}
      {userPosts?.entries && userPosts.entries.length > 0 && (
        <View style={styles.contentSection}>
          {renderSectionHeader('Recent Posts', userPosts.total, null)}
          <View style={styles.postsContainer}>
            {userPosts.entries.slice(0, 6).map((post, index) => (
              <View key={post._id || index} style={styles.postCardWrapper}>
                <PostCard post={post} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tagged Posts Section */}
      {taggedPosts?.entries && taggedPosts.entries.length > 0 && (
        <View style={styles.contentSection}>
          {renderSectionHeader('Tagged Posts', taggedPosts.total, null)}
          <View style={styles.postsContainer}>
            {taggedPosts.entries.slice(0, 6).map((post, index) => (
              <View key={post._id || index} style={styles.postCardWrapper}>
                <PostCard post={post} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Listings Section */}
      {userListings?.entries && userListings.entries.length > 0 && (
        <View style={styles.contentSection}>
          {renderSectionHeader('Listings For Sale', userListings.total, null)}
          <View style={styles.postsContainer}>
            {userListings.entries.slice(0, 6).map((post, index) => (
              <View key={post._id || index} style={styles.postCardWrapper}>
                <PostCard post={post} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Want-Ads Section */}
      {userWantAds?.entries && userWantAds.entries.length > 0 && (
        <View style={styles.contentSection}>
          {renderSectionHeader('Want-Ads', userWantAds.total, null)}
          <View style={styles.postsContainer}>
            {userWantAds.entries.slice(0, 6).map((post, index) => (
              <View key={post._id || index} style={styles.postCardWrapper}>
                <PostCard post={post} displayOptions={{ small: false }} />
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Empty State */}
      {!userCars?.entries?.length &&
       !userPosts?.entries?.length &&
       !taggedPosts?.entries?.length &&
       !userListings?.entries?.length &&
       !userWantAds?.entries?.length && (
        <View style={styles.emptyState}>
          <FAIcon name="user" size={64} color={colors.TEXT_SECONDARY} />
          <Text style={styles.emptyStateText}>No content yet</Text>
        </View>
      )}

      {/* Followers Modal */}
      <PaneModal
        visible={followersModalVisible}
        onClose={() => setFollowersModalVisible(false)}
        title="Followers"
      >
        {followersLoading ? (
          <View style={{ padding: 20 }}>
            <LoadingIndicator text="Loading followers..." />
          </View>
        ) : (
          <FlatList
            data={followersList?.entries || []}
            renderItem={({ item }) => (
              <View style={{ padding: 12 }}>
                <UserCard user={item} displayOptions={{}} />
              </View>
            )}
            keyExtractor={(item) => item._id || item.user_id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FAIcon name="users" size={48} color={colors.TEXT_SECONDARY} />
                <Text style={styles.emptyStateText}>No followers yet</Text>
              </View>
            }
          />
        )}
      </PaneModal>

      {/* Following Modal */}
      <PaneModal
        visible={followingModalVisible}
        onClose={() => setFollowingModalVisible(false)}
        title="Following"
      >
        {followingLoading ? (
          <View style={{ padding: 20 }}>
            <LoadingIndicator text="Loading following..." />
          </View>
        ) : (
          <FlatList
            data={followingList?.entries || []}
            renderItem={({ item }) => (
              <View style={{ padding: 12 }}>
                <UserCard user={item} displayOptions={{}} />
              </View>
            )}
            keyExtractor={(item) => item._id || item.user_id}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <FAIcon name="users" size={48} color={colors.TEXT_SECONDARY} />
                <Text style={styles.emptyStateText}>Not following anyone yet</Text>
              </View>
            }
          />
        )}
      </PaneModal>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: colors.ERROR,
    textAlign: 'center',
  },
  bannerContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.LIGHT_GRAY,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    opacity: 0.3,
  },
  profileSection: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    marginTop: -50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.LIGHT_GRAY,
    borderWidth: 4,
    borderColor: colors.WHITE,
  },
  avatarPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberBadge: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  memberBadgeText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  userInfoSection: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
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
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.BORDER,
    minWidth: 100,
    justifyContent: 'center',
  },
  featuredButtonActive: {
    backgroundColor: '#FFF8DC',
    borderColor: colors.GOLD,
  },
  featuredButtonText: {
    color: colors.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  featuredButtonTextActive: {
    color: colors.GOLD,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.BORDER,
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  bioSection: {
    backgroundColor: colors.WHITE,
    padding: 20,
    marginTop: 8,
  },
  bioText: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    lineHeight: 24,
    textAlign: 'center',
  },
  contentSection: {
    backgroundColor: colors.WHITE,
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '600',
  },
  garageList: {
    gap: 12,
  },
  carCardWrapper: {
    marginBottom: 12,
  },
  postsContainer: {
    gap: 12,
  },
  postCardWrapper: {
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

export default UserDetailScreen;
