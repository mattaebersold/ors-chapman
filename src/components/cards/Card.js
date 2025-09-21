import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useModal } from '../../contexts/ModalContext';
import { useDeletePostMutation, useGetUserDetailsQuery, useGetPostCountsQuery, useGetLikeInfoQuery, useGetCommentsQuery } from '../../services/apiService';
import BaseCard from './BaseCard';
import Badge from '../overlays/Badge';
import UserBadge from '../overlays/UserBadge';
import CarBadge from '../overlays/CarBadge';
import FAIcon from '../ui/FAIcon';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';
import Likes from '../Likes';

// Post item component - now using BaseCard composition
const Card = ({ post, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();
  const { showEditPostModal } = useModal();
  const { userInfo } = useSelector(state => state.auth);
  const { data: currentUser } = useGetUserDetailsQuery();
  const [deletePost] = useDeletePostMutation();

  // Get likes and comments counts using existing endpoints
  const documentId = post.internal_id || post._id || post.id;

  // Try the new combined endpoint first, fallback to individual endpoints
  const { data: countsData, error: countsError } = useGetPostCountsQuery(documentId, {
    skip: !documentId
  });

  // Fallback to existing endpoints
  const { data: likeInfo } = useGetLikeInfoQuery(documentId, {
    skip: !documentId || !!countsData
  });

  const { data: commentsData } = useGetCommentsQuery({
    document_id: documentId,
    document_type: 'post',
    limit: 0 // Just get the total count
  }, {
    skip: !documentId || !!countsData
  });

  // Extract counts - use new endpoint if available, otherwise use fallback
  const likesCount = countsData?.likes ?? likeInfo?.total ?? 0;
  const commentsCount = countsData?.comments ?? commentsData?.total ?? 0;

  // Check if current user owns this post
  const isOwner = currentUser && post && (
    currentUser.user_id === post.user_id
  );

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(post);
    } else {
      // Navigate to PostDetail screen instead of using modal
      navigation.navigate('PostDetail', { post });
    }
  }, [navigation, onPress, post]);

  const handleEdit = useCallback(() => {
    showEditPostModal(post);
  }, [showEditPostModal, post]);

  // Get image source from gallery
  const getImageSource = () => {
    if (post.gallery && post.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    return null;
  };

  // Render price overlay for marketplace items
  const renderPriceOverlay = () => {
    if ((post.type === 'listing' || post.type === 'want') && post.price) {
      return (
        <View style={styles.priceOverlay}>
          {post.previous_price ? (
            <View style={styles.priceContainer}>
              <Text style={styles.previousPriceText}>
                {post.previous_price.startsWith('$') ? post.previous_price : `$${post.previous_price}`}
              </Text>
              <Text style={styles.currentPriceText}>
                {post.price.startsWith('$') ? post.price : `$${post.price}`}
              </Text>
            </View>
          ) : (
            <Text style={styles.priceText}>
              {post.price.startsWith('$') ? post.price : `$${post.price}`}
            </Text>
          )}
        </View>
      );
    }
    return null;
  };

  // Render overlay components (badges, price, etc.)
  const renderOverlay = () => (
    <View style={styles.overlayContainer}>
      {/* Type/Category Badge */}
      <Badge type={post.type} category={post.category} style="overlay" />

      {/* Price Overlay - Top Right */}
      {renderPriceOverlay()}

      {/* User and Car Badges - Bottom Left Overlay */}
      <View style={styles.badgeOverlay}>
        {post.user_id && <UserBadge userId={post.user_id} />}
        {post.car_id && <CarBadge carId={post.car_id} />}
      </View>
    </View>
  );

  // Render content below the image
  const renderContent = () => (
    <View style={styles.postContent}>
      {/* First Row: Title and Edit Button/Likes */}
      <View style={styles.tableRow}>
        <View style={styles.titleCell}>
          <Text style={styles.itemTitle} numberOfLines={2}>{post.title}</Text>
        </View>
        {isOwner ? (
          <View style={styles.editCell}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
            >
              <FAIcon name="edit" size={12} color={colors.LIGHT_GRAY} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.likesCell}>
            <Likes document_id={documentId} document_type="post" />
          </View>
        )}
      </View>

      {/* Second Row: Date and Stats */}
      <View style={styles.tableRow}>
        <View style={styles.simpleDateCell}>
          <Text style={styles.dateText}>
            {new Date(post.created_at).toLocaleDateString()}
          </Text>
          {/* Show condition for listing/want posts */}
          {(post.type === 'listing' || post.type === 'want') && post.condition && (
            <Text style={styles.conditionText}>
              Condition: {post.condition}
            </Text>
          )}
        </View>
        <View style={styles.statsCell}>
          <View style={styles.statItem}>
            <FAIcon name="heart" size={12} color={colors.TEXT_SECONDARY} />
            <Text style={styles.statText}>{likesCount}</Text>
          </View>
          <View style={styles.statItem}>
            <FAIcon name="comment" size={12} color={colors.TEXT_SECONDARY} />
            <Text style={styles.statText}>{commentsCount}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <BaseCard
      imageSource={getImageSource()}
      imageHeight={200}
      placeholderIcon="camera"
      placeholderText=""
      onPress={handlePress}
      cardStyle={styles.itemCard}
      overlayComponent={renderOverlay()}
      children={renderContent()}
    />
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: colors.CARD_DARK,
    borderRadius: 8,
    marginBottom: spacing.sm,
    elevation: 3,
    overflow: 'hidden',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.CARD_DARK,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  priceOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(57, 142, 51, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  previousPriceText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  currentPriceText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  postContent: {
    padding: 0,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  titleCell: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  likesCell: {
    alignItems: 'flex-end',
  },
  simpleDateCell: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  statsCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  statText: {
    fontSize: 11,
    color: colors.WHITE,
    marginLeft: spacing.xs,
    fontWeight: '800',
  },
  editCell: {
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_LIGHT,
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.TEXT_MUTED,
  },
  conditionText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.TEXT_SUBTLE,
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'end',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: colors.BUTTON_SECONDARY,
  },
  editText: {
    fontSize: 11,
    color: colors.WHITE,
    marginLeft: spacing.xs,
    fontWeight: '700',
  },
});

export default Card;