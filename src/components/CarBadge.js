import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';
import { useGetCarQuery } from '../services/apiService';
import FAIcon from './FAIcon';

const CarBadge = ({ carId, style = {} }) => {
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

  return (
    <View style={[styles.badge, style]}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BLACK,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
    fontSize: 10,
    fontWeight: '500',
    flex: 1,
  },
});

export default CarBadge;