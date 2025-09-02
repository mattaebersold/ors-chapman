import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useGetUserQuery } from '../services/apiService';
import FAIcon from './FAIcon';

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
    <TouchableOpacity 
      style={[styles.badge, style]} 
      onPress={handlePress}
      activeOpacity={navigation ? 0.7 : 1}
      disabled={!navigation}
    >
      <View style={styles.imageContainer}>
        {getProfileImageSource() ? (
          <Image
            source={getProfileImageSource()}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <FAIcon name="user" size={12} color={colors.WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.text}>
        {getDisplayName()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.DARK_GRAY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: 'inherit',
    elevation: 2,
  },
  imageContainer: {
    marginRight: 8,
  },
  image: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholder: {
    backgroundColor: colors.DARK_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserBadge;