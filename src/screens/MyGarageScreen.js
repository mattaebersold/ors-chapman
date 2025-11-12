import React, { useState } from 'react';
import {
  View,
  Text,
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
            style={styles.addButton}
            onPress={() => setCarFormVisible(true)}
          >
            <FAIcon name="plus" size={18} color={colors.WHITE} />
          </TouchableOpacity>

           <Text style={styles.headingText}>My Garage</Text>

          <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <FAIcon name="times" size={18} color={colors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Cars List with Add Button */}
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
  header: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  headingText: {
    color: colors.WHITE,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontSize: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: 0,
  },
  closeButton: {
    padding: 8,
    zIndex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    zIndex: 1,
  },
});

export default MyGarageScreen;