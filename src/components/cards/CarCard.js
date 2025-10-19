import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import EditButton from '../atoms/EditButton';
import CardTitle from '../atoms/CardTitle';
import { useNavigation } from '@react-navigation/native';
import BaseCard from './BaseCard';
import Tags from '../overlays/Tags';
import UserBadge from '../overlays/UserBadge';
import Likes from '../Likes';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

// Post item component - now using BaseCard composition
const Card = ({ post, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();

  // Get likes and comments counts using existing endpoints
  const documentId = post.internal_id || post._id || post.id;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(post);
    } else {
      // Navigate to CarDetail screen with modal presentation
      navigation.navigate('CarDetail', { carId: post._id || post.id });
    }
  }, [navigation, onPress, post]);


  // Get image source from gallery
  const getImageSource = () => {
    if (post.gallery && post.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    return null;
  };

  // main post card content
  const renderMainContent = () => (
    <>
      <FAIcon
        size="24"
        name="car"
        color={colors.WHITE}
      />
      <CardTitle title={post.title} />
       <Tags 
        entryType={post.entry_type}
        type={post.type} 
        category={post.category}
      />
    </>
  )
  
  // user actions
  const renderUserActions = () => (
    <View style={styles.userActions}>
      <Likes 
        document_id={documentId} 
        document_type="post"
      />
    </View>
  )

  const renderUserBadge = () => (
    <View style={styles.badges}>
      {post.user_id && <UserBadge name={false} userId={post.user_id} />}
    </View>
  )

  const renderEditButton = () => (
    <EditButton post={post} />
  )

  const renderCarType = () => (
    <Text style={styles.carTypeStyles} numberOfLines={1}>
      {post.year} {post.make} {post.model} {post.trim}
    </Text>
  )

  return (
    <BaseCard
      imageSource={getImageSource()}
      onPress={handlePress}
      topRight={renderEditButton()}
      bottomCenter={renderMainContent()}
      bottomRight={renderUserActions()}
      bottomLeft={renderUserBadge()}
      topCenter={renderCarType()}
    />
  );
};

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
  },
  userActions: {
    flexDirection: 'row',
    gap: 6
  },

  stats: {
    flexDirection: 'row',
  },

  carTypeStyles: {
    color: colors.WHITE,
    opacity: 0.9,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,                       
  }
  
});

export default Card;