
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { useModal } from '../contexts/ModalContext';
import Badge from './Badge';
import UserBadge from './UserBadge';
import CarBadge from './CarBadge';
import FAIcon from './FAIcon';
import { colors } from '../constants/colors';
import Likes from './Likes';

// Post item component  
const Card = ({ post, onPress, displayOptions = {} }) => {
  const { showPostModal } = useModal();

  const handlePress = useCallback(() => {
    if (showPostModal) {
      showPostModal(post);
    } else if (onPress) {
      onPress(post);
    }
  }, [showPostModal, onPress, post]);
  let imageUrl = null;

  if (post.gallery && post.gallery.length > 0) {
    imageUrl = `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${post.gallery[0].filename}`;
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
});

export default Card;