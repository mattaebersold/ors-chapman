import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';
import BaseCard from './BaseCard';
import UserBadge from '../overlays/UserBadge';
import CarBadge from '../overlays/CarBadge';
import Tags from '../overlays/Tags';

const SimpleCard = ({ post, onPress, displayOptions = {} }) => {
  if (!post) return null;

  const getImageSource = () => {
    if (post?.gallery?.[0]?.filename) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    return null;
  };

  const getFormattedDate = () => {
    if (post.created_at) {
      return new Date(post.created_at).toLocaleDateString();
    }
    return '';
  };

  const renderOverlay = () => (
    <View style={styles.overlayContainer}>
      {/* Type/Category Tags */}
      <Tags type={post.type} category={post.category} style="overlay" />
      
      {/* Bottom badges */}
      <View style={styles.badgeOverlay}>
        {post.user_id && displayOptions.badgeProfile !== false && (
          <UserBadge userId={post.user_id} />
        )}
        {post.car_id && displayOptions.badgeCar !== false && (
          <CarBadge carId={post.car_id} />
        )}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{getFormattedDate()}</Text>
      </View>
    </View>
  );

  return (
    <BaseCard
      imageSource={getImageSource()}
      imageHeight={200}
      placeholderIcon="camera"
      placeholderText=""
      title={post.title}
      description={post.body}
      onPress={onPress}
      overlayComponent={renderOverlay()}
      footerComponent={renderFooter()}
    />
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    gap: 8,
  },
  footer: {
    marginTop: 8,
  },
  dateContainer: {
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
});

export default SimpleCard;