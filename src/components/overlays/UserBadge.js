import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetUserQuery } from '../../services/apiService';
import BaseBadge from './BaseBadge';

const UserBadge = ({ userId, style = {} }) => {
  // Safely get navigation - might not be available in modals
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    // Navigation not available (e.g., in modal context)
    navigation = null;
  }
  const { data: user, isLoading, error: userError } = useGetUserQuery(userId, {
    skip: !userId
  });

  if (!userId || isLoading || userError || !user) return null;

  const getProfileImageSource = () => {
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` };
    }
    return null;
  };

  const getDisplayName = () => {
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return 'User';
  };

  const handlePress = () => {
    if (navigation && userId) {
      try {
        navigation.navigate('UserDetail', { 
          userId: userId,
          user: user // Pass the user data to avoid re-fetching
        });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
    // If navigation is not available (e.g., in modal), do nothing
  };

  return (
    <BaseBadge
      imageSource={getProfileImageSource()}
      displayName={getDisplayName()}
      iconName="user"
      onPress={handlePress}
      style={style}
      disabled={!navigation}
    />
  );
};

export default UserBadge;