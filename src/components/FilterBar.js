import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, getPostTypeColor, getCategoryColor } from '../constants/colors';
import FAIcon from './FAIcon';

const FilterBar = ({
  showFilters = false,
  filterTypes = ['postType', 'category'],
  selectedPostType,
  setSelectedPostType,
  selectedCategory,
  setSelectedCategory,
  onClearFilters,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (!showFilters) return null;

  const postTypes = ['general', 'record', 'listing', 'want', 'spot'];
  const categories = ['show', 'misc', 'new', 'used', 'car', 'accessories', 'other', 'part', 'museum', 'wild', 'general', 'mod', 'restoration', 'maintenance', 'detailing'];

  // Format display names
  const getDisplayName = (value, type) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // Get active filters
  const activeFilters = [];
  if (filterTypes.includes('postType') && selectedPostType) {
    activeFilters.push({ type: 'postType', value: selectedPostType, label: getDisplayName(selectedPostType, 'postType') });
  }
  if (filterTypes.includes('category') && selectedCategory) {
    activeFilters.push({ type: 'category', value: selectedCategory, label: getDisplayName(selectedCategory, 'category') });
  }

  const handleClearAll = () => {
    onClearFilters();
    setModalVisible(false);
  };

  const handleRemoveFilter = (filterType) => {
    if (filterType === 'postType') {
      setSelectedPostType(null);
    } else if (filterType === 'category') {
      setSelectedCategory(null);
    }
  };

  const renderFilterChip = (label, value, selectedValue, onSelect, getColorFunc) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.filterChip,
        selectedValue === value && styles.filterChipActive,
        selectedValue === value && getColorFunc && { backgroundColor: getColorFunc(value) },
      ]}
      onPress={() => onSelect(selectedValue === value ? null : value)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedValue === value && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <View style={styles.activeFiltersContainer}>
          {activeFilters.map((filter, index) => (
            <View key={index} style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>{filter.label}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveFilter(filter.type)}
                style={styles.removeFilterButton}
              >
                <FAIcon name="times" size={10} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          ))}
          {activeFilters.length === 0 && (
            <Text style={styles.noFiltersText}>No filters applied</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <FAIcon name="filter" size={14} color={colors.TEXT_SECONDARY} />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={18} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter Posts</Text>
            <TouchableOpacity 
              onPress={handleClearAll}
              style={styles.modalClearButton}
            >
              <Text style={styles.modalClearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Post Type Filters */}
            {filterTypes.includes('postType') && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Post Type</Text>
                <View style={styles.filterGrid}>
                  {postTypes.map(type => 
                    renderFilterChip(
                      type.charAt(0).toUpperCase() + type.slice(1),
                      type,
                      selectedPostType,
                      setSelectedPostType,
                      getPostTypeColor
                    )
                  )}
                </View>
              </View>
            )}

            {/* Category Filters */}
            {filterTypes.includes('category') && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Category</Text>
                <View style={styles.filterGrid}>
                  {categories.map(category => 
                    renderFilterChip(
                      category.charAt(0).toUpperCase() + category.slice(1),
                      category,
                      selectedCategory,
                      setSelectedCategory,
                      getCategoryColor
                    )
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 6,
    justifyContent: 'space-between',
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
  noFiltersText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.GRAY,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    marginLeft: 6,
  },

  // Modal styles (reused from HeaderFilterButton)
  modalContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.LIGHT_GRAY,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  modalClearButton: {
    padding: 8,
  },
  modalClearText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: colors.WHITE,
    fontWeight: '600',
  },
  modalFooter: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  applyButton: {
    backgroundColor: colors.BRG,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default FilterBar;