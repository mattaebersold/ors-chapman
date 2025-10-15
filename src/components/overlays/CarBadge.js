import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetCarQuery } from '../../services/apiService';
import BaseBadge from './BaseBadge';

const CarBadge = ({ carId, style = {}, name = true}) => {
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
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${car.gallery[0].filename}` };
    }
    return null;
  };

  const getDisplayName = () => {
    if(!name) { return ''; }
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
    <BaseBadge
      imageSource={getCarImageSource()}
      displayName={getDisplayName()}
      iconName="car"
      onPress={handlePress}
      style={style}
      disabled={!navigation}
    />
  );
};

export default CarBadge;