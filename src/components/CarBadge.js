import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useGetCarQuery } from '../services/apiService';
import FAIcon from './FAIcon';

const CarBadge = ({ carId, style = {} }) => {
  // Safely get navigation - might not be available in modals
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    // Navigation not available (e.g., in modal context)
    navigation = null;
  }
  const { data: car, isLoading, error } = useGetCarQuery(carId, {
    skip: !carId
  });


  if (!carId || isLoading || error || !car) return null;

  const getCarImageSource = () => {
    if (car?.gallery?.[0]?.filename) {
      return { uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${car.gallery[0].filename}` };
    }
    return null;
  };

  const getDisplayName = () => {
    const parts = [car.year, car.make, car.model].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (car.title) return car.title;
    return 'Car';
  };

  const handlePress = () => {
    if (navigation && carId) {
      const actualCarId = car._id || car.id || carId;
      navigation.navigate('CarDetail', { carId: actualCarId });
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
        {getCarImageSource() ? (
          <Image
            source={getCarImageSource()}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <FAIcon name="car" size={8} color={colors.WHITE} />
          </View>
        )}
      </View>
      <Text style={styles.text} numberOfLines={1}>
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

export default CarBadge;