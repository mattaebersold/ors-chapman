import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import EditButton from '../atoms/EditButton';
import CardTitle from '../atoms/CardTitle';
import CardStat from '../atoms/CardStat';
import { useNavigation } from '@react-navigation/native';
import { useGetPostCountsQuery, useGetLikeInfoQuery, useGetCommentsQuery } from '../../services/apiService';
import BaseCard from './BaseCard';
import Tags from '../overlays/Tags';
import UserBadge from '../overlays/UserBadge';
import CarBadge from '../overlays/CarBadge';
import Likes from '../Likes';

// Article item component - uses BaseCard composition
const ArticleCard = ({ post, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();

  let small = displayOptions.numColumns === 2 ? true : false;

  if(displayOptions.small) { small = true}

  // Get likes and comments counts
  const documentId = post.internal_id || post._id || post.id;

  // Try the combined endpoint first, fallback to individual endpoints
  const { data: countsData, error: countsError } = useGetPostCountsQuery(documentId, {
    skip: !documentId
  });

  // Fallback to existing endpoints
  const { data: likeInfo } = useGetLikeInfoQuery(documentId, {
    skip: !documentId || !!countsData
  });

  const { data: commentsData } = useGetCommentsQuery({
    document_id: documentId,
    document_type: 'article',
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
      // Navigate to ArticleDetail screen
      navigation.navigate('ArticleDetail', {
        article: post,
        articleId: post.internal_id || post._id
      });
    }
  }, [navigation, onPress, post]);


  // Get image source from gallery or banners
  const getImageSource = () => {
    // Try gallery first (like posts)
    if (post.gallery && post.gallery.length > 0) {
      const image = post.gallery[0];
      const filename = image.filename || image;
      return `https://d2481n2uw7a0p.cloudfront.net/${filename}`;
    }
    // Fallback to banners if no gallery
    if (post.banners && post.banners.length > 0) {
      const banner = post.banners[0];
      const filename = banner.filename || banner;
      return `https://d2481n2uw7a0p.cloudfront.net/${filename}`;
    }
    return null;
  };

  // tags
  const renderTags = () => (
    <Tags
      entryType="article"
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

  // main article card content
  const renderMainContent = () => (
    <>
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
          document_type="article"
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
    <BaseCard
      imageSource={getImageSource()}
      onPress={handlePress}
      topLeft={renderTags()}
      topRight={small ? renderSmallTopRight() : renderUserActions()}
      bottomLeft={renderMainContent()}
      bottomRight={renderStats()}
      small={small}
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
    gap: 8,
    alignSelf: 'flex-end'
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  }
});

export default ArticleCard;
