import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useGetPaginatedFollowingQuery, useGetUserDetailsQuery } from '../services/apiService';
import ORSMainFeed from '../components/ORSMainFeed';

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

  // Memoize params to prevent unnecessary re-renders
  const params = useMemo(() => {
    if (followingDataLoaded && hasFollowing && currentUser) {
      return {
        filter: 'following',
        username: currentUser.username,
        omit: currentUser.user_id,
        sort: 'created_at',
        order: 'desc'
      };
    }
    return {
      omit: currentUser?.user_id,
      sort: 'created_at',
      order: 'desc'
    };
  }, [followingDataLoaded, hasFollowing, currentUser]);

  return (
    <View style={styles.container}>
      <ORSMainFeed
        key={`feed-${followingDataLoaded}-${hasFollowing}-${userInfo?.user_id}`}
        params={params}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;