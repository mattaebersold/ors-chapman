import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import UserCard from '../components/cards/UserCard';
import UsernameSearch from '../components/UsernameSearch';
import EventsList from '../components/EventsList';
import FAIcon from '../components/ui/FAIcon';
import { useGetFeaturedUsersQuery } from '../services/apiService';


const SocietyScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('members');
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Fetch featured users
  const { data: featuredUsersData, isLoading: featuredLoading, error: featuredError } = useGetFeaturedUsersQuery({ limit: 10 });

  const tabs = [
    { key: 'members', label: 'Members', type: 'users', heading: 'Society Members' },
    { key: 'posts', label: 'Posts', type: 'posts', apiUrl: '/api/post?sort=-createdAt', heading: 'Community Posts' },
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

  const handleUserSelectAndClose = (user) => {
    handleUserSelect(user);
    setSearchModalVisible(false);
  };

  // Render search modal
  const renderSearchModal = () => {
    return (
      <Modal
        visible={searchModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSearchModalVisible(false)}
        >
          <View style={styles.searchModalContainer}>
            <View style={styles.searchModalHeader}>
              <Text style={styles.searchModalTitle}>Search Members</Text>
              <TouchableOpacity
                onPress={() => setSearchModalVisible(false)}
                style={styles.searchModalCloseButton}
              >
                <FAIcon name="times" size={18} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
            <UsernameSearch
              onUserSelect={handleUserSelectAndClose}
              style={styles.usernameSearchInModal}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Render featured users section
  const renderFeaturedUsers = () => {
    console.log('renderFeaturedUsers called');
    console.log('featuredUsersData:', featuredUsersData);
    console.log('featuredUsersData?.entries:', featuredUsersData?.entries);
    console.log('entries length:', featuredUsersData?.entries?.length);

    // Show loading state
    if (featuredLoading) {
      return (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Text style={styles.featuredTitle}>Featured Members</Text>
          </View>
          <Text style={styles.featuredLoadingText}>Loading...</Text>
        </View>
      );
    }

    // Show error state
    if (featuredError) {
      console.log('Featured users error:', featuredError);
      return null;
    }

    // No featured users
    if (!featuredUsersData?.entries || featuredUsersData.entries.length === 0) {
      console.log('No featured users found');
      return null;
    }

    console.log('Rendering featured users:', featuredUsersData.entries.length);
    return (
      <View style={styles.featuredSection}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle}>Featured Members</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContent}
        >
          {featuredUsersData.entries.map((user) => (
            <View key={user._id || user.user_id} style={styles.featuredUserCard}>
              <UserCard
                user={user}
                displayOptions={{small: true}}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabContent = () => {
    const config = getTabConfig(activeTab);
    const tab = tabs.find(t => t.key === activeTab);

    // Members tab - show user cards in grid layout
    if (activeTab === 'members') {
      return (
        <>
          <Listing
            key="members-tab"
            config={config}
            displayOptions={displayOptions}
            heading={tab?.heading || 'Society Members'}
            numColumns={2}
            customHeaderButtons={() => (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => setSearchModalVisible(true)}
              >
                <FAIcon name="search" size={16} color={colors.BLACK} />
              </TouchableOpacity>
            )}
            customHeaderSection={renderFeaturedUsers}
          />
          {renderSearchModal()}
        </>
      );
    }

    // Posts tab - show all member posts in chronological order
    if (activeTab === 'posts') {
      return (
        <Listing
          key="posts-tab"
          config={config}
          displayOptions={displayOptions}
          heading={tab?.heading || 'Community Posts'}
          showFilters={true}
          filterTypes={['postType']}
        />
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
  // Header button
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Search modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  searchModalContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  searchModalCloseButton: {
    padding: 4,
  },
  usernameSearchInModal: {
    // UsernameSearch component has its own styling
  },
  // Featured users section
  featuredSection: {
    backgroundColor: colors.OFF_BLACK,
    paddingVertical: 24,
    marginBottom: 12,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.WHITE,
    textTransform: 'uppercase',
  },
  featuredLoadingText: {
    fontSize: 14,
    color: colors.WHITE,
    textAlign: 'center',
    paddingVertical: 20,
  },
  featuredScrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  featuredUserCard: {
    width: 200,
  },
});

export default SocietyScreen;
