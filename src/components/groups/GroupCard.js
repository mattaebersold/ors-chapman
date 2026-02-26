import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BaseCard from '../cards/BaseCard';
import CardTitle from '../atoms/CardTitle';
import Tags from '../overlays/Tags';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import { useJoinGroupMutation } from '../../services/apiService';

// membershipStatus: undefined/'active' = member, 'pending' = requested, null = not a member
const GroupCard = ({ post, onPress, membershipStatus }) => {
  const navigation = useNavigation();
  const [localPending, setLocalPending] = useState(false);
  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();

  const isMember = membershipStatus === undefined || membershipStatus === 'active';
  const isPending = membershipStatus === 'pending' || localPending;

  const memberCount = post.member_count ?? post.members_count ?? post.memberCount ?? null;

  const handlePress = useCallback(() => {
    if (!isMember) return;
    if (onPress) {
      onPress(post);
    } else {
      navigation.navigate('GroupDetail', {
        groupId: post.internal_id || String(post._id || post.id || ''),
      });
    }
  }, [navigation, onPress, post, isMember]);

  const handleJoin = useCallback(async () => {
    if (isJoining || isPending) return;
    try {
      const groupId = post.internal_id || String(post._id || post.id || '');
      await joinGroup(groupId).unwrap();
      setLocalPending(true);
    } catch (_) {}
  }, [isJoining, isPending, post, joinGroup]);

  const getImageSource = () => {
    if (post.gallery?.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.gallery[0].filename}`;
    }
    if (post.banners?.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${post.banners[0].filename}`;
    }
    return null;
  };

  const renderTags = () => (
    <Tags entryType="group" type={post.type} category={post.category} small />
  );

  // Bottom-center: title + icon, with join/pending button below when not a member
  const renderMainContent = () => (
    <>
      <FAIcon size={14} name="users" color={colors.WHITE} />
      <CardTitle title={post.title} small />
      {typeof post.group_make === 'string' && post.group_make ? (
        <Text style={styles.makeModel} numberOfLines={1}>
          {post.group_make}
          {typeof post.group_model === 'string' && post.group_model ? ` ${post.group_model}` : ''}
        </Text>
      ) : null}
      {!isMember && (
        <TouchableOpacity
          style={[styles.joinButton, isPending && styles.joinButtonPending]}
          onPress={handleJoin}
          disabled={isJoining || isPending}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={styles.joinButtonText}>
            {isPending ? 'Pending' : 'Request to Join'}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );

  // Bottom-right: member count for members, nothing for non-members
  const renderMemberCount = () => {
    if (!isMember) return null;
    return (
      <View style={styles.memberCount}>
        <FAIcon name="users" size={10} color={colors.WHITE} />
        {memberCount !== null && (
          <Text style={styles.memberCountText}>{memberCount}</Text>
        )}
      </View>
    );
  };

  return (
    <BaseCard
      imageSource={getImageSource()}
      onPress={isMember ? handlePress : undefined}
      topLeft={renderTags()}
      bottomCenter={renderMainContent()}
      bottomRight={renderMemberCount()}
      small
      aspectRatio={16 / 9}
    />
  );
};

const styles = StyleSheet.create({
  makeModel: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  joinButton: {
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'center',
  },
  joinButtonPending: {
    backgroundColor: 'rgba(200, 200, 200, 0.75)',
  },
  joinButtonText: {
    color: colors.BRG,
    fontSize: 11,
    fontWeight: '700',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  memberCountText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default GroupCard;
