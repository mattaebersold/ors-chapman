import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  useGetPostCountsQuery,
  useGetLikeInfoQuery,
  useGetCommentsQuery,
  useGetUserQuery,
  useGetLikeUsersQuery
} from '../../services/apiService';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import Tags from '../overlays/Tags';
import CarBadge from '../overlays/CarBadge';
import { formatDistanceToNow } from 'date-fns';
import Likes from '../Likes';

const FeedItemCard = ({ post, displayOptions = {} }) => {
  const navigation = useNavigation();
  const documentId = post.internal_id || post._id || post.id;

  // Get user info
  const { data: user, isLoading: userLoading } = useGetUserQuery(post.user_id, {
    skip: !post.user_id
  });

  // Get likes and comments counts
  const { data: countsData } = useGetPostCountsQuery(documentId, {
    skip: !documentId
  });

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

  // Get users who liked this post
  const { data: likeUsersData } = useGetLikeUsersQuery({
    document_id: documentId,
    document_type: 'post',
    limit: 10
  }, {
    skip: !documentId
  });

  const likesCount = countsData?.likes ?? likeInfo?.total ?? 0;
  const commentsCount = countsData?.comments ?? commentsData?.total ?? 0;
  const likeUsers = likeUsersData?.users || [];

  const handlePress = useCallback(() => {
    navigation.navigate('PostDetail', { post });
  }, [navigation, post]);

  const handleUserPress = useCallback(() => {
    if (user && post.user_id) {
      navigation.navigate('UserDetail', {
        userId: post.user_id,
        user: user
      });
    }
  }, [navigation, user, post.user_id]);

  const handleCommentsPress = useCallback(() => {
    navigation.navigate('PostDetail', { post });
  }, [navigation, post]);

  // Get image source
  const getImageSource = () => {
    if (post.gallery && post.gallery.length > 0) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}` };
    }
    return null;
  };

  // Get user profile image
  const getUserProfileImage = () => {
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` };
    }
    return null;
  };

  const imageSource = getImageSource();
  const userProfileImage = getUserProfileImage();

  // Format timestamp
  const formattedTime = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(post.updated_at || post.created_at), { addSuffix: true });
    } catch (error) {
      return '';
    }
  }, [post.updated_at, post.created_at]);

  return (
    <View style={styles.container}>
      {/* Top Bar - User Info */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={handleUserPress}
          disabled={userLoading || !user}
          activeOpacity={1}
        >
          {userProfileImage ? (
            <Image source={userProfileImage} style={styles.userAvatar} />
          ) : (
            <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
              <FAIcon name="user" size={16} color={colors.TEXT_SECONDARY} />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.username}>{user?.username || 'Loading...'}</Text>
            {formattedTime && (
              <Text style={styles.timestamp}>{formattedTime}</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Tagged car badge */}
        {post.car_id && (
          <View style={styles.taggedCar}>
            <Text style={styles.withText}>with</Text>
            <CarBadge carId={post.car_id} small={true} name={false} />
          </View>
        )}
      </View>

      {/* Title */}
      <TouchableOpacity onPress={handlePress} style={styles.titleContainer} activeOpacity={1}>
        <Text style={styles.title}>{post.title}</Text>
      </TouchableOpacity>

      {/* Image/Media */}
      {imageSource && (
        <TouchableOpacity onPress={handlePress} style={styles.mediaContainer} activeOpacity={1}>
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
          />
          {/* Tags overlay */}
          <View style={styles.tagsOverlay}>
            <Tags
              entryType={post.entry_type}
              type={post.type}
              category={post.category}
              small={false}
            />
          </View>
        </TouchableOpacity>
      )}

      {/* If no image, show tags below title */}
      {!imageSource && (
        <View style={styles.tagsContainer}>
          <Tags
            entryType={post.entry_type}
            type={post.type}
            category={post.category}
            small={false}
          />
        </View>
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        {/* Left side - Like button and liked user avatars */}
        <View style={styles.likesSection}>
          <Likes
            document_id={documentId}
            document_type="post"
          />

          {/* Liked user avatars */}
          {likeUsers.length > 0 && (
            <View style={styles.likedUsers}>
              {likeUsers.slice(0, 3).map((userId, index) => (
                <LikedUserAvatar key={userId} userId={userId} index={index} />
              ))}
              {likeUsers.length > 3 && (
                <Text style={styles.moreUsers}>+{likeUsers.length - 3}</Text>
              )}
            </View>
          )}
        </View>

        {/* Right side - Comments */}
        <TouchableOpacity
          style={styles.commentsSection}
          onPress={handleCommentsPress}
          activeOpacity={1}
        >
          <FAIcon name="comment-outline" size={16} color={colors.TEXT_SECONDARY} />
          <Text style={styles.commentsText}>
            {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Component to display a single liked user's avatar
const LikedUserAvatar = ({ userId, index }) => {
  const { data: user, isLoading } = useGetUserQuery(userId, {
    skip: !userId
  });

  if (isLoading) {
    return (
      <View style={[styles.likedUserAvatar, styles.likedUserAvatarPlaceholder, index > 0 && styles.likedUserAvatarOffset]} />
    );
  }

  if (!user) return null;

  const userProfileImage = user?.gallery?.[0]?.filename
    ? { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` }
    : null;

  return (
    <View style={[styles.likedUserAvatarContainer, index > 0 && styles.likedUserAvatarOffset]}>
      {userProfileImage ? (
        <Image source={userProfileImage} style={styles.likedUserAvatar} />
      ) : (
        <View style={[styles.likedUserAvatar, styles.likedUserAvatarPlaceholder]}>
          <FAIcon name="user" size={10} color={colors.TEXT_SECONDARY} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginVertical: 8,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
  },
  userAvatarPlaceholder: {
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  timestamp: {
    fontSize: 11,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginTop: 2,
  },
  taggedCar: {
    alignItems: 'flex-end',
  },
  withText: {
    fontSize: 10,
    color: colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  titleContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    lineHeight: 20,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.LIGHT_GRAY,
  },
  tagsOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  tagsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    gap: 4,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  likedUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  likedUserAvatarContainer: {
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  likedUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  likedUserAvatarOffset: {
    marginLeft: -10,
  },
  likedUserAvatarPlaceholder: {
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreUsers: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    marginLeft: 6,
  },
  commentsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentsText: {
    fontSize: 13,
    color: colors.TEXT_SECONDARY,
  },
});

export default FeedItemCard;
