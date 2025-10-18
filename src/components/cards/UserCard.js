import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import CardTitle from '../atoms/CardTitle';
import { useNavigation } from '@react-navigation/native';
import BaseCard from './BaseCard';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import CardStat from '../atoms/CardStat';
import { useGetCarsQuery } from '../../services/apiService';

// User card component - displays user profile with stats
const UserCard = ({ user, onPress, displayOptions = {} }) => {
  const navigation = useNavigation();

  // Fetch garage cars count for this user
  const { data: garageData } = useGetCarsQuery(
    { user_id: user.user_id, limit: 1, page: 1 },
    { skip: !user.user_id }
  );

  // Extract counts from data
  const garageCount = garageData?.total || 0;
  const followersCount = user.followers_count || 0;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(user);
    } else {
      // Navigate to User profile screen
      navigation.navigate('Profile', { userId: user.user_id });
    }
  }, [navigation, onPress, user]);

  // Get image source from profile picture
  const getImageSource = () => {
    if (user.profile_pic) {
      return `https://d2481n2uw7a0p.cloudfront.net/${user.profile_pic}`;
    }
    return null;
  };

  // main user card content
  const renderMainContent = () => (
    <>
      <FAIcon
        size={24}
        name="user"
        color={colors.WHITE}
      />
      <CardTitle title={user.username || user.name} />
    </>
  );

  // user stats
  const renderStats = () => (
    <View style={styles.stats}>
      <CardStat icon="car" count={garageCount} />
      <CardStat icon="users" count={followersCount} />
    </View>
  );

  return (
    <BaseCard
      imageSource={getImageSource()}
      onPress={handlePress}
      bottomRight={renderStats()}
      bottomLeft={renderMainContent()}
    />
  );
};

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default UserCard;