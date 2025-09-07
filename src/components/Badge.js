import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPostTypeColor, getCategoryColor, getContrastTextColor } from '../constants/colors';

const Badge = ({ type, category, style = 'overlay' }) => {
  const badges = [];

  // Add type badge if provided
  if (type) {
    const backgroundColor = getPostTypeColor(type);
    badges.push(
      <View 
        key="type"
        style={[
          styles.badge,
          style === 'inline' ? styles.inlineBadge : styles.overlayBadge,
          { backgroundColor }
        ]}
      >
        <Text style={[
          styles.badgeText,
          style === 'inline' ? styles.inlineText : styles.overlayText,
          { color: getContrastTextColor(backgroundColor) }
        ]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
      </View>
    );
  }

  // Add category badge if provided
  if (category) {
    const backgroundColor = getCategoryColor(category);
    badges.push(
      <View 
        key="category"
        style={[
          styles.badge,
          style === 'inline' ? styles.inlineBadge : styles.overlayBadge,
          { backgroundColor }
        ]}
      >
        <Text style={[
          styles.badgeText,
          style === 'inline' ? styles.inlineText : styles.overlayText,
          { color: getContrastTextColor(backgroundColor) }
        ]}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
      </View>
    );
  }

  if (badges.length === 0) return null;

  return (
    <View style={[
      styles.badgeContainer,
      style === 'inline' ? styles.inlineContainer : styles.overlayContainer
    ]}>
      {badges}
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  overlayContainer: {
    position: 'absolute',
    top: 6,
    left: 6,
  },
  inlineContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    elevation: 5,
  },
  overlayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 10,
  },
  overlayText: {
    fontSize: 10,
  },
  inlineText: {
    fontSize: 10,
  },
});

export default Badge;