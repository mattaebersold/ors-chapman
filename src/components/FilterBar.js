import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';

const FilterBar = ({
  showFilters = false,
  filterTypes = ['postType', 'category'],
  selectedPostType,
  selectedCategory,
  onRemoveFilter,
}) => {
  if (!showFilters) return null;

  // Format display names
  const getDisplayName = (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Get active filters
  const activeFilters = [];
  if (filterTypes.includes('postType') && selectedPostType) {
    activeFilters.push({ type: 'postType', value: selectedPostType, label: getDisplayName(selectedPostType) });
  }
  if (filterTypes.includes('category') && selectedCategory) {
    activeFilters.push({ type: 'category', value: selectedCategory, label: getDisplayName(selectedCategory) });
  }

  return (
    <View style={styles.filterBar}>
      <View style={styles.activeFiltersContainer}>
        {activeFilters.map((filter, index) => (
          <View key={index} style={styles.activeFilterChip}>
            <Text style={styles.activeFilterText}>{filter.label}</Text>
            <TouchableOpacity
              onPress={() => onRemoveFilter(filter.type)}
              style={styles.removeFilterButton}
            >
              <FAIcon name="times" size={10} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 6,
  },
  activeFiltersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.GRAY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  removeFilterButton: {
    marginLeft: 4,
    padding: 2,
  },
});

export default FilterBar;