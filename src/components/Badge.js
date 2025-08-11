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
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  overlayContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  inlineContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  overlayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
  },
  inlineBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  overlayText: {
    fontSize: 10,
  },
  inlineText: {
    fontSize: 11,
  },
});

export default Badge;