import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import BrandsScreen from './BrandsScreen';

const CarsScreen = ({ navigation }) => {
  const { userInfo } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('member-cars');

  const tabs = [
    { key: 'member-cars', label: 'Member Cars', type: 'cars', heading: 'Community Cars' },
    // { key: 'records', label: 'Car Records', type: 'posts', apiUrl: '/api/post?type=record', heading: 'Car Records' },
    { key: 'spots', label: 'Spotted', type: 'posts', apiUrl: '/api/post?type=spot', heading: 'Spotted Cars' },
    { key: 'brands', label: 'Brands', type: 'brands', heading: 'Car Brands' },
    // { key: 'models', label: 'Models', type: 'userEntries', apiUrl: '/api/cars/models', heading: 'Car Models' },
  ];

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    return {
      type: tab.type,
      apiUrl: tab.apiUrl,
      heading: tab.heading,
    };
  };

  const displayOptions = {
    badgeProfile: false,
    badgeCar: false,
  };

  const renderTabContent = () => {
    if (activeTab === 'brands') {
      return <BrandsScreen navigation={navigation} />;
    }
    
    const config = getTabConfig(activeTab);
    return <Listing config={config} displayOptions={displayOptions} />;
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.activeTabText
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.BRG,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.SPEED,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.WHITE,
    textAlign: 'center',
  },
  activeTabText: {
    color: colors.SPEED,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});

export default CarsScreen;