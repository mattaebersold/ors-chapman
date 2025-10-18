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

  // Get current user details (this has the correct user_id and username)
  const { data: currentUser } = useGetUserDetailsQuery();

  // Get the users that the current user is following
  const { data: followingData, isLoading: followingLoading } = useGetPaginatedFollowingQuery({
    index: 0,
    limit: 1,
  });
  
  const hasFollowing = followingData?.total > 0;
  const followingDataLoaded = !followingLoading && followingData !== undefined;

  const listingConfig = {
    type: 'posts',
    heading: '',
    postsParams: (followingDataLoaded && hasFollowing && currentUser) ? {
      filter: 'following',
      username: currentUser.username,
      omit: currentUser.user_id
    } : {
      omit: currentUser?.user_id
    }
  };

  return (
    <View style={styles.container}>
      <Listing
        key={`feed-${followingDataLoaded}-${hasFollowing}-${userInfo?.user_id}`}
        config={listingConfig}
        showFilters={true}
        filterTypes={['postType']}
        numColumns={2}
        heading="Recent Posts"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  followMessage: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.BRG,
  },
});

export default HomeScreen;