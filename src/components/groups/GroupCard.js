import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BaseCard from '../cards/BaseCard';
import CardTitle from '../atoms/CardTitle';
import Tags from '../overlays/Tags';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const GroupCard = ({ post, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();
  const small = displayOptions.numColumns === 2 || displayOptions.small;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(post);
    } else {
      navigation.navigate('GroupDetail', { groupId: post._id || post.id || post.internal_id });
    }
  }, [navigation, onPress, post]);

  const getImageSource = () => {
    if (post.banners && post.banners.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.banners[0].filename}`;
    }
    if (post.gallery && post.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    return null;
  };

  const renderTags = () => (
    <Tags
      entryType="group"
      type={post.type}
      category={post.category}
      small={small}
    />
  );

  const renderMainContent = () => (
    <>
      <FAIcon size="20" name="users" color={colors.WHITE} />
      <CardTitle title={post.title} small={small} />
      {post.group_make && (
        <Text style={styles.makeModel} numberOfLines={1}>
          {post.group_make}{post.group_model ? ` ${post.group_model}` : ''}
        </Text>
      )}
    </>
  );

  const renderMemberCount = () => (
    <View style={styles.memberCount}>
      <FAIcon name="users" size={12} color={colors.WHITE} />
    </View>
  );

  return (
    <BaseCard
      imageSource={getImageSource()}
      onPress={handlePress}
      topLeft={renderTags()}
      bottomCenter={renderMainContent()}
      bottomRight={renderMemberCount()}
      small={small}
    />
  );
};

const styles = StyleSheet.create({
  makeModel: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default GroupCard;
