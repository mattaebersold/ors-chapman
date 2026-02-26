import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';
import Listing from './Listing';
import FeedItemCard from './cards/FeedItemCard';

const ORSMainFeed = ({ params }) => {
  const navigation = useNavigation();

  const handleCreatePost = () => {
    // Navigate to create post screen
    navigation.navigate('Create');
  };

  // Create post input header
  const CreatePostHeader = () => (
    <View>
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={handleCreatePost}
        activeOpacity={0.7}
      >
        <Text style={styles.createPostText}>What are you up to...</Text>
        <View style={styles.plusButton}>
          <FAIcon name="plus" size={16} color={colors.WHITE} />
        </View>
      </TouchableOpacity>
    </View>
  );

  // Memoize the listing config to prevent unnecessary re-renders
  const listingConfig = useMemo(() => ({
    type: 'posts',
    postsParams: params || {}
  }), [params]);

  return (
    <View style={styles.container}>
      <CreatePostHeader />
      <Listing
        config={listingConfig}
        numColumns={1}
        showFilters={false}
        CustomComponent={FeedItemCard}
        heading=""
        cardPadding={0}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  createPostButton: {
    backgroundColor: colors.WHITE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  createPostText: {
    fontSize: 15,
    color: colors.TEXT_SECONDARY,
    flex: 1,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ORSMainFeed;
