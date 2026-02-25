import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';
import { useGetCarQuery } from '../services/apiService';

const CarRow = ({ carId, onPress }) => {
  const navigation = useNavigation();

  const { data: car, isLoading, error } = useGetCarQuery(carId, {
    skip: !carId
  });

  if (!carId || isLoading || error || !car) return null;

  const handleCarPress = () => {
    if (onPress) {
      onPress(car);
    } else {
      const actualCarId = car._id || car.id || carId;
      navigation.navigate('CarDetail', { carId: actualCarId });
    }
  };

  const getImageSource = () => {
    if (car?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${car.gallery[0].filename}` };
    }
    return null;
  };

  const getCarTitle = () => {
    const parts = [car.year, car.make, car.model].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (car.title) return car.title;
    return 'Car';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleCarPress}>
      <View style={styles.content}>
        {/* Car Picture */}
        <View style={styles.imageContainer}>
          {getImageSource() ? (
            <Image
              source={getImageSource()}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <FAIcon name="car" size={24} color={colors.WHITE} />
            </View>
          )}
        </View>

        {/* Car Info */}
        <View style={styles.carInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {getCarTitle()}
          </Text>
          {car.trim && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {car.trim}
            </Text>
          )}
          {car.color && (
            <Text style={styles.detail} numberOfLines={1}>
              {car.color}
            </Text>
          )}
        </View>

        {/* Arrow Icon */}
        <FAIcon name="chevron-right" size={16} color={colors.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
  },
  imagePlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 2,
  },
  detail: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
});

export default CarRow;
