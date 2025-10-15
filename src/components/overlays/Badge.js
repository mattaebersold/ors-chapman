import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getPostTypeColor, getCategoryColor, getContrastTextColor } from '../../constants/colors';
import { spacing } from '../../constants/layout';
import { postCategories, postTypes, carTypes, carCategories } from '../../constants/categories';

const Badge = ({ entryType, type, category, specificStyles, small = false }) => {

  let categories, types;

  switch(entryType) {
    case 'post': 
      categories = postCategories;
      types = postTypes;
      break;
    case 'garagecar': 
      categories = carCategories;
      types = carTypes;
      break;
    default:
      categories = null;
      types = null;
  }


  const badges = [];

  // Add type badge if provided
  if (type && type !== 'listing' && type !== 'want') {
    const backgroundColor = getPostTypeColor(type);
    const typeLabel = types.find(pt => pt.key === type)?.label || type;
    
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
          {typeLabel}
        </Text>
      </View>
    );
  }

  // Add category badge if provided
  if (category && entryType !== 'garagecar' && !small) {
    const backgroundColor = getCategoryColor(category);
    
    // Find the category label by searching through all postCategories
    let categoryLabel = category;
    for (const postCategory of categories) {
      const found = postCategory.items.find(item => item.key === category);
      if (found) {
        categoryLabel = found.label;
        break;
      }
    }
    
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
          {categoryLabel}
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
    paddingHorizontal: spacing.badgeX,
    paddingVertical: spacing.badgeY,
    marginBottom: 6,
    alignSelf: 'flex-start',
    opacity: .9
  },
  badgeText: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: .5,
    fontSize: 9,
  },
});

export default Badge;