import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import CarCard from '../components/CarCard';
import FAIcon from '../components/FAIcon';
import CarFormModal from '../components/CarFormModal';

const MyGarageScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [carFormVisible, setCarFormVisible] = useState(false);

  // Configuration for displaying user's cars - matches the ProfileScreen garage tab exactly
  const config = {
    type: 'userEntries',
    apiUrl: '/api/protected/garage/0/none/10',
  };

  const displayOptions = {
    hideUserBadge: true, // Don't show user badge since these are all the user's cars
  };

  const handleCarFormSuccess = () => {
    // The mutation will invalidate the cache, so the listing will refresh automatically
    setCarFormVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Add Car Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setCarFormVisible(true)}
        >
          <FAIcon name="plus" size={16} color={colors.WHITE} />
          <Text style={styles.addButtonText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* Cars List */}
      <Listing 
        config={config} 
        displayOptions={displayOptions}
        CustomComponent={CarCard}
        showFilters={false}
      />

      {/* Car Form Modal */}
      <CarFormModal
        visible={carFormVisible}
        onClose={() => setCarFormVisible(false)}
        onSuccess={handleCarFormSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  headerContainer: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  addButton: {
    backgroundColor: colors.BRG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyGarageScreen;