import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';
import UserBadge from './UserBadge';

const CarCard = ({ user: car, displayOptions = {} }) => {
  const navigation = useNavigation();
  if (!car) return null;

  const handlePress = () => {
    const carId = car._id || car.id;
    navigation.navigate('CarDetail', { carId });
  };

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
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.carCard}>
        <View style={styles.imageContainer}>
          {getCarImageSource() ? (
            <Image 
              source={getCarImageSource()} 
              style={styles.carImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <FAIcon name="car" size={40} color={colors.GRAY} />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.carContent}>
          <Text style={styles.carTitle}>{getDisplayName()}</Text>
          
          {car.description && (
            <Text style={styles.carDescription} numberOfLines={2}>
              {car.description}
            </Text>
          )}
          
          {/* User Badge */}
          {car.user_id && !displayOptions.hideUserBadge && (
            <View style={styles.userBadgeContainer}>
              <UserBadge userId={car.user_id} />
            </View>
          )}
          
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  carCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  carImage: {
    width: '100%',
    height: 200,
  },
  placeholderContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.GRAY,
    marginTop: 8,
    fontWeight: '500',
  },
  carContent: {
    padding: 16,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  carDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  userBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
});

export default CarCard;