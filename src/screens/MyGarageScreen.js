import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import CarCard from '../components/cards/CarCard';
import FAIcon from '../components/ui/FAIcon';
import CarFormModal from '../components/modals/CarFormModal';

const MyGarageScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useSelector(state => state.auth);
  const [carFormVisible, setCarFormVisible] = useState(false);

  const config = {
    type: 'userEntries',
    apiUrl: '/api/protected/garage/0/none/10',
  };

  const displayOptions = {
    hideUserBadge: true,
  };

  const handleCarFormSuccess = () => {
    setCarFormVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <FAIcon name="times" size={24} color={colors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Cars List with Add Button */}
      <Listing
        config={config}
        displayOptions={displayOptions}
        CustomComponent={CarCard}
        showFilters={false}
        heading="My Garage"
        customHeaderButtons={() => (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setCarFormVisible(true)}
          >
            <FAIcon name="plus" size={16} color={colors.BLACK} />
          </TouchableOpacity>
        )}
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
  header: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default MyGarageScreen;