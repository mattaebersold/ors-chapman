import React, { useCallback } from 'react';
import {
  View,
	Text,
  StyleSheet,
} from 'react-native';
import CardTitle from '../atoms/CardTitle';
import { useNavigation } from '@react-navigation/native';
import BaseRow from './BaseRow';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import CardStat from '../atoms/CardStat';
import BaseTag from '../atoms/BaseTag';
import BaseStats from '../atoms/BaseStats';
import { useGetCarsQuery } from '../../services/apiService';

// User card component - displays user profile with stats
const UserRow = ({ user, onPress, displayOptions = {}, owner = false, nostats = false}) => {
  const navigation = useNavigation();
	
  const isAdmin = user.accountType === 'admin';
  const isPro = user.accountType === 'pro';

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
      // Navigate to UserDetail screen
      navigation.navigate('UserDetail', { userId: user.user_id, user });
    }
  }, [navigation, onPress, user]);

  // Get image source from profile picture
  const getImageSource = () => {
    if (user.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}`;
    }
    return null;
  };

  // render user tags
  const renderUserTags = () => (
    <View style={styles.tags}>
      {isPro && <BaseTag key="pro-tag" label="PRO" color="pro" />}
      {isAdmin && <BaseTag key="admin-tag" label="FOUNDER" color="admin" />}
    </View>
  )

  // main user card content
  const renderMainContent = () => (

		<>
			{owner && (
				<Text numberOfLines={1} style={styles.owner}>OWNER</Text>
			)}
			<View style={styles.titleContainer}>
				<FAIcon
					size={12}
					name="user"
					color={colors.BLACK}
				/>
				<CardTitle row title={user.username || user.name} />
			</View>
		</>
    
  );

  // user stats
  const renderStats = () => (
    <BaseStats>
      <CardStat icon="car" count={garageCount} />
      <CardStat icon="users" count={followersCount} />
    </BaseStats>
  );

  return (
    <BaseRow
      imageSource={getImageSource()}
      onPress={handlePress}
      bottomRight={!nostats && renderStats()}
      bottomLeft={renderMainContent()}
      topLeft={renderUserTags()}
    />
  );
};

const styles = StyleSheet.create({
  tags: {
    flexDirection: 'row',
    gap: 4,
  },
	titleContainer: {
		flexDirection: 'row',
		gap: 4,
		alignItems: 'center'
	},
	owner: {
		color: colors.BLACK,
		fontWeight: '700',
		fontSize: 12,
		marginBottom: 6
	}
});

export default UserRow;