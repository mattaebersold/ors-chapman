import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import CarCard from '../components/CarCard';
import BrandsScreen from './BrandsScreen';
import UsernameSearch from '../components/UsernameSearch';
import { useGetAllBrandsQuery, useGetUsersQuery } from '../services/apiService';
import FAIcon from '../components/FAIcon';

const CarsScreen = ({ navigation }) => {
  const { userInfo } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('member-cars');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Fetch brands for make filter
  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useGetAllBrandsQuery();
  
  // Debug brands data
  useEffect(() => {
    console.log('CarsScreen brandsData:', {
      brandsData,
      brandsLoading,
      brandsError,
      brandsCount: brandsData?.brands?.length
    });
  }, [brandsData, brandsLoading, brandsError]);

  const tabs = [
    { key: 'member-cars', label: 'Member Cars', type: 'cars', heading: 'Community Cars' },
    // { key: 'records', label: 'Car Records', type: 'posts', apiUrl: '/api/post?type=record', heading: 'Car Records' },
    { key: 'spots', label: 'Spotted', type: 'posts', apiUrl: '/api/post?type=spot', heading: 'Spotted Cars' },
    { key: 'brands', label: 'Brands', type: 'brands', heading: 'Car Brands' },
    // { key: 'models', label: 'Models', type: 'userEntries', apiUrl: '/api/cars/models', heading: 'Car Models' },
  ];

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    
    // Build API URL with filters for cars
    let apiUrl = tab.apiUrl;
    if (tabKey === 'member-cars') {
      const params = new URLSearchParams();
      
      // Add user filter if selected
      if (selectedUser?.user_id || selectedUser?._id || selectedUser?.id) {
        const userId = selectedUser.user_id || selectedUser._id || selectedUser.id;
        params.append('user_id', userId);
      }
      
      // Add make filter if selected (convert to lowercase for API)
      if (selectedMake) {
        params.append('make', selectedMake.toLowerCase());
      }
      
      // Build the final URL
      const queryString = params.toString();
      if (queryString) {
        apiUrl = `/api/garage?${queryString}`;
      }
      
      // Debug logging
      console.log('CarsScreen getTabConfig:', {
        selectedUser: selectedUser?.username,
        selectedMake,
        queryString,
        finalApiUrl: apiUrl
      });
    }
    
    return {
      type: tab.type,
      apiUrl: apiUrl,
      heading: tab.heading,
    };
  };

  const displayOptions = {
    badgeProfile: false,
    badgeCar: false,
  };

  // Handle user selection from username search
  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  // Handle make selection
  const handleMakeSelect = (make) => {
    setSelectedMake(selectedMake === make ? null : make);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedUser(null);
    setSelectedMake(null);
  };

  // Clear filters when switching away from member-cars tab
  const handleTabChange = (newTab) => {
    if (activeTab === 'member-cars' && newTab !== 'member-cars') {
      clearFilters();
      setShowFilters(false);
    }
    setActiveTab(newTab);
  };

  // Count active filters
  const activeFilterCount = (selectedUser ? 1 : 0) + (selectedMake ? 1 : 0);

  // Handle scroll to collapse filters
  const handleScroll = (event) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    
    // If scrolling down and filters are open, close them
    if (currentScrollY > lastScrollY && currentScrollY > 50 && showFilters) {
      setShowFilters(false);
    }
    
    setLastScrollY(currentScrollY);
  };

  // Render search and filters section
  const renderSearchAndFilters = () => {
    if (activeTab !== 'member-cars') return null;

    return (
      <View style={styles.searchAndFiltersContainer}>
        {/* Username Search */}
        <UsernameSearch 
          onUserSelect={handleUserSelect}
          style={styles.usernameSearch}
        />

        {/* Filter Toggle and Active Filters */}
        <View style={styles.filtersHeader}>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <FAIcon name="filter" size={16} color={colors.BRG} />
            <Text style={styles.filterToggleText}>
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Text>
            <FAIcon 
              name={showFilters ? "chevron-up" : "chevron-down"} 
              size={14} 
              color={colors.BRG} 
            />
          </TouchableOpacity>

          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
              <Text style={styles.clearFiltersText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Active Filters Display */}
        {(selectedUser || selectedMake) && (
          <View style={styles.activeFiltersContainer}>
            {selectedUser && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  User: {selectedUser.username || 'Unknown'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <FAIcon name="times" size={12} color={colors.WHITE} />
                </TouchableOpacity>
              </View>
            )}
            {selectedMake && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>Make: {selectedMake}</Text>
                <TouchableOpacity onPress={() => setSelectedMake(null)}>
                  <FAIcon name="times" size={12} color={colors.WHITE} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Expandable Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Make Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Filter by Make</Text>
              {brandsLoading ? (
                <View style={styles.makeFiltersLoadingContainer}>
                  <FAIcon name="spinner" size={16} color={colors.BRG} />
                  <Text style={styles.makeFiltersLoadingText}>Loading makes...</Text>
                </View>
              ) : brandsError ? (
                <Text style={styles.makeFiltersError}>Error loading makes</Text>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.makeFiltersContainer}
                >
                  {brandsData?.brands?.map((brand) => (
                    <TouchableOpacity
                      key={brand.make_handle || brand.make}
                      style={[
                        styles.makeFilterChip,
                        selectedMake === brand.make && styles.selectedMakeFilterChip
                      ]}
                      onPress={() => handleMakeSelect(brand.make)}
                    >
                      <Text style={[
                        styles.makeFilterText,
                        selectedMake === brand.make && styles.selectedMakeFilterText
                      ]}>
                        {brand.make}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'brands') {
      return <BrandsScreen navigation={navigation} />;
    }
    
    const config = getTabConfig(activeTab);
    
    // Use CarCard component for member-cars tab
    if (activeTab === 'member-cars') {
      return (
        <View style={styles.memberCarsContainer}>
          {renderSearchAndFilters()}
          <Listing 
            config={config} 
            displayOptions={displayOptions} 
            CustomComponent={CarCard}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            key={`${selectedUser?._id || 'no-user'}-${selectedMake || 'no-make'}`} // Force re-render when filters change
          />
        </View>
      );
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
            onPress={() => handleTabChange(tab.key)}
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
  memberCarsContainer: {
    flex: 1,
  },
  searchAndFiltersContainer: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  usernameSearch: {
    // UsernameSearch component has its own styling
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  filterToggleText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.BRG,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.ERROR,
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.WHITE,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.WHITE,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  filterSection: {
    marginTop: 12,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  makeFiltersContainer: {
    paddingRight: 16,
    gap: 8,
  },
  makeFiltersLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  makeFiltersLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  makeFiltersError: {
    fontSize: 14,
    color: colors.ERROR,
    paddingVertical: 16,
  },
  makeFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.BACKGROUND,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  selectedMakeFilterChip: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  makeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  selectedMakeFilterText: {
    color: colors.WHITE,
  },
});

export default CarsScreen;