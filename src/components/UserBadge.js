import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';
import { useGetUserQuery } from '../services/apiService';
import FAIcon from './FAIcon';

const UserBadge = ({ userId, style = {} }) => {
  const { data: user, isLoading, error } = useGetUserQuery(userId, {
    skip: !userId
  });

  
  if (!userId || isLoading || error || !user) return null;

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

  return (
    <View style={[styles.badge, style]}>
      <View style={styles.imageContainer}>
        {getProfileImageSource() ? (
          <Image
            source={getProfileImageSource()}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <FAIcon name="user" size={8} color={colors.WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.text}>
        {getDisplayName()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.DARK_GRAY,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 'inherit',
    elevation: 2,
  },
  imageContainer: {
    marginRight: 6,
  },
  image: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  placeholder: {
    backgroundColor: colors.DARK_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default UserBadge;