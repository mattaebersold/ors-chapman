import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import { useGetLikeInfoQuery, useLikePostMutation, useUnlikePostMutation } from '../services/apiService';
import FAIcon from './FAIcon';

const Likes = ({ document_id, document_type = 'post' }) => {
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


  // Don't show if user not logged in or no data
  if (!userInfo || !document_id || isLoading || error) {
    return null;
  }

  const likes = likeInfo?.entries || [];
  const likeCount = likes.length;
  const userLike = likes.find(like => 
    like.users && like.users.includes(userInfo.user_id)
  );
  const isLiked = !!userLike;

  const handleLikeToggle = async () => {
    try {
      if (isLiked) {
        await unlikePost({ document_id, document_type });
      } else {
        await likePost({ document_id, document_type });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatLikeCount = (count) => {
    if (count === 0) return '';
    if (count > 100) return '100+';
    return count.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.likesContainer} 
      onPress={handleLikeToggle}
      activeOpacity={0.7}
    >
      <FAIcon 
        name={isLiked ? "heart" : "heart-o"} 
        size={16} 
        color={isLiked ? colors.ERROR : colors.TEXT_SECONDARY}
      />
      {likeCount > 0 && (
        <Text style={[
          styles.likeCount,
          isLiked && styles.likedCount
        ]}>
          {formatLikeCount(likeCount)}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    gap: 6,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  likedCount: {
    color: colors.ERROR,
  },
});

export default Likes;