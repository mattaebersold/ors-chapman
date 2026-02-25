import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const GroupForumCard = ({ post, onPress, userVote, netVotes = 0, onVote }) => {
  const authorImage = post.user?.gallery?.[0]?.filename
    ? { uri: `https://d2481n2uw7a0p.cloudfront.net/${post.user.gallery[0].filename}` }
    : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(post)} activeOpacity={0.7}>
      {/* Vote column */}
      <View style={styles.voteColumn}>
        <TouchableOpacity
          onPress={() => onVote?.(post, 'up')}
          style={styles.voteBtn}
        >
          <FAIcon
            name="arrow-up"
            size={14}
            color={userVote?.vote_type === 'up' ? colors.SUCCESS : colors.GRAY}
          />
        </TouchableOpacity>
        <Text style={[
          styles.voteCount,
          netVotes > 0 && styles.votePositive,
          netVotes < 0 && styles.voteNegative,
        ]}>
          {netVotes}
        </Text>
        <TouchableOpacity
          onPress={() => onVote?.(post, 'down')}
          style={styles.voteBtn}
        >
          <FAIcon
            name="arrow-down"
            size={14}
            color={userVote?.vote_type === 'down' ? colors.ERROR : colors.GRAY}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {post.category && (
          <Text style={styles.categoryBadge}>{post.category}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{post.title}</Text>
        <View style={styles.authorRow}>
          {authorImage ? (
            <Image source={authorImage} style={styles.authorAvatar} />
          ) : (
            <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
              <FAIcon name="user" size={10} color={colors.WHITE} />
            </View>
          )}
          <Text style={styles.authorName}>{post.user?.username}</Text>
          <Text style={styles.date}>{formatDate(post.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 8,
    overflow: 'hidden',
  },
  voteColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: colors.LIGHT_GRAY,
  },
  voteBtn: {
    padding: 4,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.GRAY,
    marginVertical: 2,
  },
  votePositive: { color: colors.SUCCESS },
  voteNegative: { color: colors.ERROR },
  content: {
    flex: 1,
    padding: 12,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.BRG,
    backgroundColor: 'rgba(28,55,56,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  avatarPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  date: {
    fontSize: 11,
    color: colors.TEXT_SECONDARY,
  },
});

export default GroupForumCard;
