
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
import { useDeletePostMutation, useGetUserDetailsQuery } from '../services/apiService';
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
  const [showActions, setShowActions] = useState(false);

  // Check if current user owns this post
  const isOwner = currentUser && post && (
    currentUser.user_id === post.user_id
  );

  // Debug ownership checking - let's see currentUser fields
  console.log('Card ownership debug - currentUser exists?:', !!currentUser);
  console.log('Card ownership debug - full currentUser:', currentUser);
  console.log('Card ownership debug - currentUser.user_id:', currentUser?.user_id);
  console.log('Card ownership debug - post.user_id:', post?.user_id);
  console.log('Card ownership debug - comparison result:', currentUser?.user_id === post?.user_id);
  console.log('Card ownership debug - isOwner:', isOwner);
  

  const handlePress = useCallback(() => {
    if (showPostModal) {
      showPostModal(post);
    } else if (onPress) {
      onPress(post);
    }
  }, [showPostModal, onPress, post]);

  const handleEdit = useCallback(() => {
    setShowActions(false);
    showEditPostModal(post);
  }, [showEditPostModal, post]);

  const handleDelete = useCallback(() => {
    setShowActions(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.internal_id || post._id).unwrap();
              Alert.alert('Success', 'Post deleted successfully');
            } catch (error) {
              console.error('Delete post error:', error);
              Alert.alert('Error', 'Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  }, [deletePost, post]);

  const toggleActions = useCallback(() => {
    setShowActions(!showActions);
  }, [showActions]);
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
            
            {/* Owner Actions - Only visible to post owner */}
            {isOwner && (
              <View style={styles.ownerActionsContainer}>
                <TouchableOpacity 
                  style={styles.ownerActionsButton}
                  onPress={toggleActions}
                >
                  <FAIcon name="ellipsis-v" size={16} color={colors.WHITE} />
                </TouchableOpacity>
                
                {showActions && (
                  <View style={styles.actionsMenu}>
                    <TouchableOpacity 
                      style={styles.actionItem}
                      onPress={handleEdit}
                    >
                      <FAIcon name="edit" size={14} color={colors.TEXT_PRIMARY} />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionItem, styles.deleteAction]}
                      onPress={handleDelete}
                    >
                      <FAIcon name="trash" size={14} color={colors.ERROR} />
                      <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.postContent}>
            <Text style={styles.itemTitle}>{post.title}</Text>
            
            {/* User and Car Info Badges */}
            <View style={styles.infoBadgesContainer}>
              {post.user_id && <UserBadge userId={post.user_id} />}
              {post.car_id && <CarBadge carId={post.car_id} />}
            </View>
            
            <View style={styles.cardFooter}>
              <Likes document_id={post.internal_id} document_type="post" />
              <Text style={styles.dateText}>
                {new Date(post.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 12,
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
  postContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  infoBadgesContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
  },
  
  // Owner Actions Styles
  ownerActionsContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  ownerActionsButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  deleteText: {
    color: colors.ERROR,
  },
});

export default Card;