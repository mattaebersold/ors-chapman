import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BaseCard from './BaseCard';
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
      return `https://d2481n2uw7a0p.cloudfront.net/${car.gallery[0].filename}`;
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

  const renderFooter = () => {
    if (car.user_id && !displayOptions.hideUserBadge) {
      return (
        <View style={styles.userBadgeContainer}>
          <UserBadge userId={car.user_id} />
        </View>
      );
    }
    return null;
  };

  return (
    <BaseCard
      imageSource={getCarImageSource()}
      imageHeight={200}
      placeholderIcon="car"
      placeholderText="No Image"
      title={getDisplayName()}
      description={car.description}
      onPress={handlePress}
      cardStyle={styles.carCard}
      footerComponent={renderFooter()}
    />
  );
};

const styles = StyleSheet.create({
  carCard: {
    marginTop: 12,
  },
  userBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
});

export default CarCard;