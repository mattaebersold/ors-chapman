import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import { useGetLikeInfoQuery, useLikePostMutation, useUnlikePostMutation } from '../services/apiService';
import FAIcon from './ui/FAIcon';

const Likes = ({
  document_id,
  forceLikeNumber
}) => {
  const { userInfo } = useSelector(state => state.auth);
  
  const { 
    data: likeInfo, 
    isLoading, 
    error 
  } = useGetLikeInfoQuery(document_id, {
    skip: !document_id
  });

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();


  // Don't show if no document_id
  if (!document_id) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <TouchableOpacity style={[styles.likesContainer, styles.defaultContainer]}>
        <FAIcon name="heart-o" color={colors.WHITE} />
        <Text style={styles.likeCount}>...</Text>
      </TouchableOpacity>
    );
  }

  // Show error state but still allow interaction
  if (error) {
    console.warn('Likes component error:', error);
    console.warn('Error details:', JSON.stringify(error, null, 2));
  }

  const users = likeInfo?.users || [];
  const likeCount = users.length;
  const isLiked = userInfo?.user_id ? users.includes(userInfo.user_id) : false;

  const handleLikeToggle = async () => {

    // // Don't allow interaction if user not logged in
    // if (!userInfo) {
    //   console.log('No user logged in, ignoring like action');
    //   return;
    // }

    // try {
    //   console.log('Attempting to', isLiked ? 'unlike' : 'like', 'document');
    //   if (isLiked) {
    //     const result = await unlikePost({ document_id, document_type }).unwrap();
    //     console.log('Unlike result:', result);
    //   } else {
    //     const result = await likePost({ document_id, document_type }).unwrap();
    //     console.log('Like result:', result);
    //   }
    // } catch (error) {
    //   console.error('Error toggling like:', error);
    // }
  };

  const formatLikeCount = (count) => {
    if (count === 0) return '0';
    if (count > 100) return '100+';
    return count.toString();
  };

  return (
    <TouchableOpacity
      style={[
        styles.likesContainer,
      ]}
      onPress={handleLikeToggle}
      activeOpacity={0.7}
      disabled={false}
    >
      <FAIcon
        size="14"
        name={isLiked ? "heart" : "heart-o"}
        color={isLiked ? colors.ERROR : colors.WHITE}
      />

      <Text style={[
        styles.likeCount,
        isLiked
      ]}>
        {formatLikeCount(likeCount)}
      </Text>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    minHeight: 32,
    backgroundColor: 'rgba(0,0,0, 0.4)',
    paddingHorizontal: 12
  },
  likeCount: {
    fontWeight: '600',
    marginLeft: 4,
    color: colors.WHITE,
  },
});

export default Likes;