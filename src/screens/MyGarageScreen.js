import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import CarCard from '../components/CarCard';

const MyGarageScreen = () => {
  const { userInfo } = useSelector(state => state.auth);

  // Configuration for displaying user's cars - matches the ProfileScreen garage tab exactly
  const config = {
    type: 'userEntries',
    apiUrl: '/api/protected/garage/0/none/10',
  };

  const displayOptions = {
    hideUserBadge: true, // Don't show user badge since these are all the user's cars
  };

  return (
    <View style={styles.container}>
      <Listing 
        config={config} 
        displayOptions={displayOptions}
        CustomComponent={CarCard}
        showFilters={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
});

export default MyGarageScreen;