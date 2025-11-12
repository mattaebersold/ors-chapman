import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import EditButton from '../atoms/EditButton';
import CardTitle from '../atoms/CardTitle';
import CardStat from '../atoms/CardStat';
import Price from '../atoms/Price';
import { useNavigation } from '@react-navigation/native';
import { useGetPostCountsQuery, useGetLikeInfoQuery, useGetCommentsQuery } from '../../services/apiService';
import BaseRow from './BaseRow';
import Tags from '../overlays/Tags';
import UserBadge from '../overlays/UserBadge';
import CarBadge from '../overlays/CarBadge';
import Likes from '../Likes';

// Post item component - now using BaseRow composition
const Row = ({ post, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();

  let small = displayOptions.numColumns === 2 ? true : false; 

  if(displayOptions.small) { small = true}

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
    limit: 0
  }, {
    skip: !documentId || !!countsData
  });

  // Extract counts - use new endpoint if available, otherwise use fallback
  const likesCount = countsData?.likes ?? likeInfo?.total ?? 0;
  const commentsCount = countsData?.comments ?? commentsData?.total ?? 0;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(post);
    } else {
      // Navigate to PostDetail screen instead of using modal
      navigation.navigate('PostDetail', { post });
    }
  }, [navigation, onPress, post]);


  // Get image source from gallery
  const getImageSource = () => {
    if (post.gallery && post.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    return null;
  };

  // tags
  const renderTags = () => (
    <Tags 
      entryType={post.entry_type}
      type={post.type} 
      category={post.category}
      small={small}
    />
  )

  const UserAndCarBadges = () => (
    <>
      {post.user_id && <UserBadge userId={post.user_id} small={small} />}
      {post.car_id && <CarBadge carId={post.car_id} small={small} />}
    </>
  )

  const renderSmallTopRight = () => (
    <View style={styles.badgesSmall}>
      <UserAndCarBadges />
    </View>
  )

  // main post card content
  const renderMainContent = () => (
    <>
      {post.type === 'listing' && post.price && (
        <Price post={post} />
      )}
      <CardTitle title={post.title} small={small} />

      {!small && (
        <View style={styles.badges}>
          <UserAndCarBadges />
        </View>
      )}
    </>
  )
  
  // user actions
  const renderUserActions = () => (
    <View style={styles.userActions}>
      {!small && ( 
        <Likes 
          document_id={documentId} 
          document_type="post"
        />
      )}
      <EditButton post={post} />
    </View>
  )

  const renderStats = () => (
    <View style={styles.stats}>
      <CardStat icon="heart-o" count={likesCount} />
      {!small && ( <CardStat icon="comment-outline" count={commentsCount} /> )}
    </View>
  )

  return (
    <BaseRow
      imageSource={getImageSource()}
      onPress={handlePress}
      topLeft={renderTags()}
      topRight={small ? renderSmallTopRight() : renderUserActions()}
      bottomLeft={renderMainContent()}
      bottomRight={renderStats()}
      small={small}
      layout="standard"
    />
  );
};

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
  },
  badgesSmall: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-end'
  },
  userActions: {
    flexDirection: 'row',
    gap: 6
  },

  stats: {
    flexDirection: 'row',
  },
  
});

export default Row;