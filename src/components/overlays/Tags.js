import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getPostTypeColor, getCategoryColor } from '../../constants/colors';
import { postCategories, postTypes, carTypes, carCategories } from '../../constants/categories';
import BaseTag from '../atoms/BaseTag';

const Tags = ({ entryType, type, category, specificStyles, small = false }) => {

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


  const tags = [];

  // Add type tag if provided
  if (type && type !== 'listing' && type !== 'want') {
    const backgroundColor = getPostTypeColor(type);
    const typeLabel = types.find(pt => pt.key === type)?.label || type;
    
    tags.push(
      <BaseTag color={backgroundColor} key={1} label={typeLabel} />
    );
  }

  // Add category tag if provided
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
    
    tags.push(
      <BaseTag color={backgroundColor} key={2} label={categoryLabel} />
    );
  }

  if (tags.length === 0) return null;

  return (
    <View style={[
      styles.container,
      specificStyles
    ]}>
      {tags}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 0,
  },
});

export default Tags;