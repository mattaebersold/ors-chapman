import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const GroupResourceCard = ({ item, onPress, userVote, netVotes = 0, onVote }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(item)} activeOpacity={0.7}>
      {/* Vote column */}
      <View style={styles.voteColumn}>
        <TouchableOpacity onPress={() => onVote?.(item, 'up')} style={styles.voteBtn}>
          <FAIcon name="arrow-up" size={14} color={userVote?.vote_type === 'up' ? colors.SUCCESS : colors.GRAY} />
        </TouchableOpacity>
        <Text style={[styles.voteCount, netVotes > 0 && styles.votePositive, netVotes < 0 && styles.voteNegative]}>
          {netVotes}
        </Text>
        <TouchableOpacity onPress={() => onVote?.(item, 'down')} style={styles.voteBtn}>
          <FAIcon name="arrow-down" size={14} color={userVote?.vote_type === 'down' ? colors.ERROR : colors.GRAY} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {item.category && (
          <Text style={styles.categoryBadge}>{item.category}</Text>
        )}
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.url && (
          <View style={styles.linkRow}>
            <FAIcon name="link" size={11} color={colors.BLUE} />
            <Text style={styles.linkText} numberOfLines={1}>External Link</Text>
          </View>
        )}
        <View style={styles.authorRow}>
          <Text style={styles.authorName}>{item.user?.username}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
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
  voteBtn: { padding: 4 },
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
    marginBottom: 6,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  linkText: {
    fontSize: 12,
    color: colors.BLUE,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

export default GroupResourceCard;
