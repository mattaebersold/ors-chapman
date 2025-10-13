import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPostTypeColor, getCategoryColor, getContrastTextColor } from '../../constants/colors';

const Badge = ({ type, category, specificStyles }) => {
  const badges = [];

  // Add type badge if provided
  if (type) {
    const backgroundColor = getPostTypeColor(type);
    badges.push(
      <View 
        key="type"
        style={[
          styles.badge,
          { backgroundColor }
        ]}
      >
        <Text style={[
          styles.badgeText,
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
          { backgroundColor }
        ]}
      >
        <Text style={[
          styles.badgeText,
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
      styles.container,
      specificStyles
    ]}>
      {badges}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 0,
  },
  badge: {
    borderRadius: 30,
    elevation: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 9,
  },
});

export default Badge;