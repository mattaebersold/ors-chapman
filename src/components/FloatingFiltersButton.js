import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { colors, getPostTypeColor, getCategoryColor } from '../constants/colors';
import FAIcon from './FAIcon';

const FloatingFiltersButton = ({
  showFilters = false,
  filterTypes = ['postType', 'category'],
  selectedPostType,
  setSelectedPostType,
  selectedCategory,
  setSelectedCategory,
  onClearFilters,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  if (!showFilters) return null;

  const postTypes = ['general', 'record', 'listing', 'want', 'spot'];
  const categories = ['show', 'misc', 'new', 'used', 'car', 'accessories', 'other', 'part', 'museum', 'wild', 'general', 'mod', 'restoration', 'maintenance', 'detailing'];

  // Count active filters
  const activeFilterCount = 
    (filterTypes.includes('postType') && selectedPostType ? 1 : 0) + 
    (filterTypes.includes('category') && selectedCategory ? 1 : 0);

  const handleButtonPress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setModalVisible(true);
  };

  const handleClearAll = () => {
    onClearFilters();
    setModalVisible(false);
  };

  const handleApplyFilters = () => {
    setModalVisible(false);
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
      {/* Floating Button */}
      <Animated.View 
        style={[
          styles.floatingButton, 
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.floatingButtonTouchable,
            activeFilterCount > 0 && styles.floatingButtonActive
          ]}
          onPress={handleButtonPress}
          activeOpacity={0.8}
        >
          <FAIcon 
            name="filter" 
            size={18} 
            color={activeFilterCount > 0 ? colors.WHITE : colors.BRG} 
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

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
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
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
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonTouchable: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.WHITE,
    borderWidth: 2,
    borderColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingButtonActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.ERROR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  filterBadgeText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '700',
  },

  // Modal
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

export default FloatingFiltersButton;