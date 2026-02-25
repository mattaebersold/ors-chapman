import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../constants/colors';
import Listing from '../Listing';
import PostRow from '../cards/PostRow';
import FAIcon from '../ui/FAIcon';
import { categories } from '../../types/postTypes';

/**
 * Reusable panel component that displays posts filtered by a specific car
 *
 * @param {Object} carData - The car object containing internal_id and car details
 * @param {Function} onClose - Callback function when close button is pressed
 * @param {Function} onPostPress - Callback function when a post is pressed (optional)
 * @param {Object} displayOptions - Display options to pass to Listing (optional)
 * @param {Function} HeaderComponent - Optional custom header component (will be shown above the feed header)
 * @param {boolean} showFilters - Whether to show filter options (default: false)
 * @param {string} title - Optional custom title (defaults to "Posts featuring this car")
 */
const CarFeedPanel = ({
  carData,
  onClose,
  onPostPress,
  displayOptions = {
    badgeProfile: true,
    badgeCar: false,
  },
  HeaderComponent = null,
  showFilters = false,
  title = "Posts featuring this car"
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!carData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No car data provided</Text>
      </View>
    );
  }

  // Get car_record categories for filtering
  const carRecordCategories = categories.find(cat => cat.type === 'record')?.items || [];

  // Memoize params to ensure they update when category changes
  const feedParams = useMemo(() => {
    const params = {
      car_id: carData?.internal_id,
    };

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    return params;
  }, [carData?.internal_id, selectedCategory]);

  const FeedHeader = () => (
    <>
      {HeaderComponent && <HeaderComponent />}
      <View style={styles.feedTabHeader}>
        <Text style={styles.feedTabTitle}>{title}</Text>
        {onClose && (
          <TouchableOpacity
            style={styles.closeFeedButton}
            onPress={onClose}
          >
            <FAIcon name="times" size={14} color={colors.WHITE} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedCategory === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[
            styles.filterButtonText,
            selectedCategory === 'all' && styles.filterButtonTextActive
          ]}>
            All
          </Text>
        </TouchableOpacity>

        {carRecordCategories.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.filterButton,
              selectedCategory === category.key && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text style={[
              styles.filterButtonText,
              selectedCategory === category.key && styles.filterButtonTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

  return (
    <View style={styles.container}>
      <Listing
        key={`car-feed-${carData?.internal_id}-${selectedCategory}`}
        config={{
          type: 'posts',
          heading: '',
          params: feedParams
        }}
        displayOptions={displayOptions}
        CustomComponent={PostRow}
        showFilters={false}
        customHeaderSection={FeedHeader}
        onItemPress={onPostPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_LIGHT,
  },
  feedTabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: colors.BACKGROUND_LIGHT,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  feedTabTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
    flex: 1,
  },
  closeFeedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.TEXT_SECONDARY,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterScrollView: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  filterContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.LIGHT_GRAY,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: colors.BRG,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  filterButtonTextActive: {
    color: colors.WHITE,
  },
  errorText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CarFeedPanel;
