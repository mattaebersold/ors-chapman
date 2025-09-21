import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useGetPaginatedFollowingQuery, useGetUserDetailsQuery } from '../services/apiService';
import Listing from '../components/Listing';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';

const HomeScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [showFollowMessage, setShowFollowMessage] = useState(false);

  // Get current user details (this has the correct user_id and username)
  const { data: currentUser } = useGetUserDetailsQuery();

  // Get the users that the current user is following
  const { data: followingData, isLoading: followingLoading } = useGetPaginatedFollowingQuery({
    index: 0,
    limit: 1 // We just need to know if they're following anyone
  });
  
  const hasFollowing = followingData?.total > 0;
  const followingDataLoaded = !followingLoading && followingData !== undefined;

  useEffect(() => {
    if (followingDataLoaded && !hasFollowing) {
      setShowFollowMessage(true);
    } else {
      setShowFollowMessage(false);
    }
  }, [followingDataLoaded, hasFollowing]);

  // config for the listing - conditional logic based on following status
  const listingConfig = {
    type: 'posts',
    heading: '',
    // Add special parameters for posts query
    postsParams: (followingDataLoaded && hasFollowing && currentUser) ? {
      // If user is following people, show only their posts
      filter: 'following',
      username: currentUser.username,
      omit: currentUser.user_id // Always exclude current user's posts
    } : {
      // If user is not following anyone OR data still loading, show all posts except their own
      omit: currentUser?.user_id // Exclude current user's posts
    }
  };

  // Debug logging - let's see what's actually in userInfo vs currentUser
  console.log('🏠 HomeScreen - Full userInfo object:', userInfo);
  console.log('🏠 HomeScreen - Full currentUser object:', currentUser);
  console.log('🏠 HomeScreen - Feed Configuration:', {
    hasFollowing,
    followingDataLoaded,
    followingTotal: followingData?.total,
    followingLoading,
    userInfo_username: userInfo?.username,
    userInfo_user_id: userInfo?.user_id,
    currentUser_username: currentUser?.username,
    currentUser_user_id: currentUser?.user_id,
    postsParams: listingConfig.postsParams,
    willShowFollowingOnly: followingDataLoaded && hasFollowing && currentUser,
    timestamp: new Date().toISOString()
  });

  // display options for the listing
  const displayOptions = {
    badgeProfile: false,
    badgeCar: false,
  };

  // Custom header component for showing the follow message
  const HeaderComponent = () => {
    if (!showFollowMessage) return null;
    
    return (
      <View style={styles.followMessageContainer}>
        <View style={styles.followMessage}>
          <FAIcon name="users" size={24} color={colors.BRG} />
          <Text style={styles.followTitle}>Follow for more posts</Text>
          <Text style={styles.followSubtitle}>
            Follow other users to see their posts in your feed. Use the search or explore sections to find users to follow.
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Listing
        key={`feed-${followingDataLoaded}-${hasFollowing}-${userInfo?.user_id}-${JSON.stringify(listingConfig.postsParams)}`} // Force re-render when config changes
        config={listingConfig}
        displayOptions={displayOptions}
        HeaderComponent={HeaderComponent}
        showFilters={true}
        filterTypes={['postType']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  followMessageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  followMessage: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.BRG,
  },
  followTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginTop: 12,
    marginBottom: 8,
  },
  followSubtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;