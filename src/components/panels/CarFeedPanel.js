import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import Listing from '../Listing';
import PostRow from '../cards/PostRow';
import FAIcon from '../ui/FAIcon';

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

  if (!carData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No car data provided</Text>
      </View>
    );
  }

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
    </>
  );

  return (
    <View style={styles.container}>
      <Listing
        config={{
          type: 'posts',
          heading: '',
          params: {
            car_id: carData?.internal_id,
          }
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

  errorText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default CarFeedPanel;
