
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useModal } from '../contexts/ModalContext';
import { useDeletePostMutation, useGetUserDetailsQuery, useGetPostCountsQuery, useGetLikeInfoQuery, useGetCommentsQuery } from '../services/apiService';
import Badge from './Badge';
import UserBadge from './UserBadge';
import CarBadge from './CarBadge';
import FAIcon from './FAIcon';
import { colors } from '../constants/colors';
import Likes from './Likes';

// Post item component  
const Card = ({ post, onPress, displayOptions = {} }) => {
  const { showPostModal, showEditPostModal } = useModal();
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
    if (showPostModal) {
      showPostModal(post);
    } else if (onPress) {
      onPress(post);
    }
  }, [showPostModal, onPress, post]);

  const handleEdit = useCallback(() => {
    showEditPostModal(post);
  }, [showEditPostModal, post]);
  let imageUrl = null;

  if (post.gallery && post.gallery.length > 0) {
    imageUrl = `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
  }
  
  return (
    <>
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.itemCard}>
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.postImage}
                resizeMode="cover"
                onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <FAIcon name="plus" size={40} color={colors.GRAY} />
                <Text style={styles.placeholderText}>No Image</Text>
              </View>
            )}
            
            {/* Badge Overlays */}
            <Badge type={post.type} category={post.category} style="overlay" />
            
            {/* Price Overlay - Top Right */}
            {(post.type === 'listing' || post.type === 'want') && post.price && (
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
            )}
            
            {/* User and Car Badges - Bottom Left Overlay */}
            <View style={styles.badgeOverlay}>
              {post.user_id && <UserBadge userId={post.user_id} />}
              {post.car_id && <CarBadge carId={post.car_id} />}
            </View>
          </View>
          
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
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#202020',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#202020',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  placeholderContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.GRAY,
    marginTop: 8,
    fontWeight: '500',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 8,
  },
  priceOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(57, 142, 51, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  titleCell: {
    flex: 1,
    paddingRight: 8,
  },
  likesCell: {
    alignItems: 'flex-end',
  },
  badgeCell: {
    paddingRight: 8,
  },
  fillCell: {
    flex: 1,
  },
  simpleDateCell: {
    flex: 1,
    paddingRight: 8,
  },
  statsCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 11,
    color: colors.WHITE,
    marginLeft: 4,
    fontWeight: '800',
  },
  editCell: {
    alignItems: 'flex-end',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f0f0f0',
  },
  dateText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#aaa',
  },
  conditionText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#bbb',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'end',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#505050',
  },
  editText: {
    fontSize: 11,
    color: colors.WHITE,
    marginLeft: 4,
    fontWeight: '700',
  },
});

export default Card;