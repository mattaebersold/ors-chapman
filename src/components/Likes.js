import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import { useGetLikeInfoQuery, useLikePostMutation, useUnlikePostMutation } from '../services/apiService';
import FAIcon from './ui/FAIcon';

const Likes = ({
  document_id,
  document_type = 'post',
  variant = 'default',
  showCount = true,
  size = 'medium'
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
        <FAIcon name="heart-o" size={16} color={colors.TEXT_SECONDARY} />
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

  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: styles.minimalContainer,
          text: styles.minimalText,
        };
      case 'outlined':
        return {
          container: styles.outlinedContainer,
          text: styles.outlinedText,
        };
      case 'pill':
        return {
          container: styles.pillContainer,
          text: styles.pillText,
        };
      default:
        return {
          container: styles.defaultContainer,
          text: styles.defaultText,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 12,
          fontSize: 12,
          padding: 4,
        };
      case 'large':
        return {
          iconSize: 20,
          fontSize: 16,
          padding: 8,
        };
      default: // medium
        return {
          iconSize: 16,
          fontSize: 14,
          padding: 6,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.likesContainer,
        variantStyles.container,
        { padding: sizeStyles.padding },
        !userInfo && styles.disabledContainer,
        { backgroundColor: 'rgba(255, 0, 0, 0.2)', borderWidth: 2, borderColor: 'red' } // Temporary debug styling
      ]}
      onPress={handleLikeToggle}
      activeOpacity={0.7}
      disabled={false} // Temporarily enable for all for testing
    >
      <FAIcon
        name={isLiked ? "heart" : "heart-o"}
        size={sizeStyles.iconSize}
        color={isLiked ? colors.ERROR : colors.TEXT_SECONDARY}
      />
      {showCount && (
        <Text style={[
          styles.likeCount,
          variantStyles.text,
          { fontSize: sizeStyles.fontSize },
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
    gap: 6,
    borderRadius: 20,
    minHeight: 32,
  },
  defaultContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  minimalContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingHorizontal: 8,
  },
  pillContainer: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  likeCount: {
    fontWeight: '500',
  },
  defaultText: {
    color: colors.TEXT_SECONDARY,
  },
  minimalText: {
    color: colors.TEXT_SECONDARY,
  },
  outlinedText: {
    color: colors.TEXT_PRIMARY,
  },
  pillText: {
    color: colors.TEXT_PRIMARY,
  },
  likedCount: {
    color: colors.ERROR,
    fontWeight: '600',
  },
  disabledContainer: {
    opacity: 0.6,
  },
});

export default Likes;