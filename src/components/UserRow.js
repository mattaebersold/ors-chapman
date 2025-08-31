import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';
import { useFollowUserMutation, useUnfollowUserMutation, useGetFollowStatusQuery } from '../services/apiService';
import { useSelector } from 'react-redux';

const UserRow = ({ user, onPress, displayOptions = {} }) => {
  const { userInfo } = useSelector(state => state.auth);
  const userId = user?._id || user?.id;
  
  // Don't show follow button for own profile
  const isOwnProfile = userId === userInfo?.id || userId === userInfo?._id;
  
  // Check if follow status is already included in user object (Murray approach)
  const userHasFollowStatus = user?.isFollowing !== undefined || user?.is_following !== undefined;
  
  // Fetch current follow status from API only if not already included - backend uses username
  const shouldSkipQuery = !user?.username || isOwnProfile || userHasFollowStatus;
  
  const { data: followStatus, isLoading: statusLoading, error: followStatusError } = useGetFollowStatusQuery(user?.username, {
    skip: shouldSkipQuery
  });
  
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();
  
  const followLoading = isFollowLoading || isUnfollowLoading;
  
  // Determine follow status from user object first, then API response
  const isFollowing = user?.isFollowing || user?.is_following || followStatus?.isFollowing || false;


  const handleFollowToggle = async () => {
    try {
      const username = user?.username;
      if (isFollowing) {
        await unfollowUser(username).unwrap();
      } else {
        await followUser(username).unwrap();
      }
      // The follow status will be updated automatically via RTK Query cache invalidation
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleUserPress = () => {
    if (onPress) {
      onPress(user);
    }
  };

  const getImageSource = () => {
    // First check for gallery[0] (like Murray does)
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` };
    }
    // Fallback to profile_image if available
    if (user?.profile_image) {
      return { uri: user.profile_image };
    }
    // Return null to show placeholder background color
    return null;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleUserPress}>
      <View style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.avatarContainer}>
          {getImageSource() ? (
            <Image
              source={getImageSource()}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <FAIcon name="user" size={24} color={colors.WHITE} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {user?.username || user?.name || 'Unknown User'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {user?.location || user?.bio || 'Member'}
          </Text>
          {user?.car_count && (
            <Text style={styles.carCount}>
              {user.car_count} car{user.car_count !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Follow Button - Hide for own profile */}
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
              <FAIcon name="spinner" size={14} color={colors.WHITE} />
            ) : (
              <>
                <FAIcon 
                  name={isFollowing ? "check" : "plus"} 
                  size={12} 
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  carCount: {
    fontSize: 12,
    color: colors.BRG,
    fontWeight: '500',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    justifyContent: 'center',
  },
  followingButton: {
    backgroundColor: colors.SUCCESS,
  },
  followButtonLoading: {
    opacity: 0.7,
  },
  followIcon: {
    marginRight: 4,
  },
  followButtonText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default UserRow;