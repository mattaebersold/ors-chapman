import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../constants/colors';

const GroupNewsCard = ({ item, onPress }) => {
  const imageSource = item.gallery?.[0]?.filename
    ? { uri: `https://d2481n2uw7a0p.cloudfront.net/${item.gallery[0].filename}` }
    : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(item)} activeOpacity={0.7}>
      {imageSource && (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.author}>{item.user?.username}</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  author: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
  date: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
});

export default GroupNewsCard;
