import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useGetPaginatedFollowingQuery } from '../services/apiService';
import Listing from '../components/Listing';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';

const HomeScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [showFollowMessage, setShowFollowMessage] = useState(false);
  
  // Get the users that the current user is following
  const { data: followingData, isLoading: followingLoading } = useGetPaginatedFollowingQuery({
    index: 0,
    limit: 1 // We just need to know if they're following anyone
  });
  
  const hasFollowing = followingData?.total > 0;

  useEffect(() => {
    if (!followingLoading && !hasFollowing) {
      setShowFollowMessage(true);
    } else {
      setShowFollowMessage(false);
    }
  }, [followingLoading, hasFollowing]);

  // config for the listing based on following status
  const listingConfig = {
    type: 'posts',
    heading: '',
    // Add special parameters for posts query
    postsParams: {
      filter: hasFollowing ? 'following' : null,
      username: hasFollowing ? userInfo?.username : null,
      omit: userInfo?.user_id // Always exclude current user's posts
    }
  };

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
            Follow other users to see their posts here. For now, here's what everyone's sharing:
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Listing 
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