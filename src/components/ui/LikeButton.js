import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FAIcon from './FAIcon';
import { colors } from '../../constants/colors';
import {
  useGetLikeInfoQuery,
  useLikePostMutation,
  useUnlikePostMutation,
} from '../../services/apiService';
import { useSelector } from 'react-redux';

const LikeButton = ({
  entryId,
  entryType,
  variant = 'default',
  showCount = true,
  size = 'medium'
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  const { data: likeInfo, isLoading } = useGetLikeInfoQuery(entryId, {
    skip: !entryId,
  });

  const [likePost, { isLoading: likingPost }] = useLikePostMutation();
  const [unlikePost, { isLoading: unlikingPost }] = useUnlikePostMutation();

  const isLiked = likeInfo?.users?.includes(userInfo?.user_id) || false;
  const likeCount = likeInfo?.users?.length || 0;
  const isProcessing = likingPost || unlikingPost;

  const handleLike = async () => {
    if (!userInfo || isProcessing) return;

    try {
      if (isLiked) {
        await unlikePost({
          document_id: entryId,
          document_type: entryType,
        }).unwrap();
      } else {
        await likePost({
          document_id: entryId,
          document_type: entryType,
        }).unwrap();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  // Don't render if loading or no user
  if (isLoading || !userInfo) return null;

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
          iconSize: 14,
          fontSize: 12,
          padding: 6,
        };
      case 'large':
        return {
          iconSize: 20,
          fontSize: 16,
          padding: 12,
        };
      default: // medium
        return {
          iconSize: 16,
          fontSize: 14,
          padding: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        variantStyles.container,
        { padding: sizeStyles.padding },
        isProcessing && styles.disabled,
      ]}
      onPress={handleLike}
      disabled={isProcessing}
      activeOpacity={0.7}
    >
      <FAIcon
        name={isLiked ? 'heart' : ['far', 'heart']}
        size={sizeStyles.iconSize}
        color={isLiked ? colors.ERROR : colors.TEXT_SECONDARY}
      />
      {showCount && (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            { fontSize: sizeStyles.fontSize },
            isLiked && styles.likedText,
          ]}
        >
          {likeCount < 100 ? likeCount : '100+'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    minHeight: 32,
  },
  defaultContainer: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
  },
  minimalContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
  },
  outlinedContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingHorizontal: 12,
  },
  text: {
    marginLeft: 6,
    fontWeight: '500',
  },
  defaultText: {
    color: colors.TEXT_PRIMARY,
  },
  minimalText: {
    color: colors.TEXT_SECONDARY,
  },
  outlinedText: {
    color: colors.TEXT_PRIMARY,
  },
  likedText: {
    color: colors.ERROR,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default LikeButton;