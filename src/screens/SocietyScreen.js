import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import UserRow from '../components/UserRow';
import UsernameSearch from '../components/UsernameSearch';
import EventsList from '../components/EventsList';


const SocietyScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('members');

  const tabs = [
    { key: 'members', label: 'Members', type: 'users', heading: 'Recent Members' },
    { key: 'posts', label: 'Posts', type: 'posts', heading: 'Community Posts' },
    { key: 'events', label: 'Events', type: 'dedicated-events', heading: 'Events' },
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

  const handleUserSelect = (user) => {
    navigation.navigate('UserDetail', { user, userId: user._id || user.id });
  };

  const renderTabContent = () => {
    const config = getTabConfig(activeTab);
    
    // Use UserRow component for members tab with navigation
    if (activeTab === 'members') {
      return (
        <View style={styles.membersContent}>
          <UsernameSearch onUserSelect={handleUserSelect} />
          <Listing 
            config={config} 
            displayOptions={displayOptions} 
            CustomComponent={(props) => (
              <UserRow {...props} onPress={handleUserSelect} />
            )}
          />
        </View>
      );
    }
    
    // Use custom EventsList component for events tab
    if (activeTab === 'events') {
      return <EventsList />;
    }
    
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
    borderBottomWidth: 1,
    borderBottomColor: colors.SPEED,
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.WHITE,
  },
  activeTabText: {
    color: colors.SPEED,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  membersContent: {
    flex: 1,
  },
});

export default SocietyScreen;