import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import Listing from '../components/Listing';
import BrandsScreen from './BrandsScreen';
import UsernameSearch from '../components/UsernameSearch';
import { useGetAllBrandsQuery, useGetFeaturedCarsQuery, useGetFeaturedSpottedCarsQuery } from '../services/apiService';
import FAIcon from '../components/ui/FAIcon';
import CarCard from '../components/cards/CarCard';
import PostCard from '../components/cards/PostCard';

const CarsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('member-cars');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [makeFilterModalVisible, setMakeFilterModalVisible] = useState(false);

  // Fetch brands for make filter
  const { data: brandsData, isLoading: brandsLoading, error: brandsError } = useGetAllBrandsQuery();

  // Fetch featured cars
  const { data: featuredCarsData, isLoading: featuredCarsLoading } = useGetFeaturedCarsQuery({ limit: 10 });

  // Fetch featured spotted cars
  const { data: featuredSpottedCarsData, isLoading: featuredSpottedCarsLoading } = useGetFeaturedSpottedCarsQuery({ limit: 10 });

  // Debug featured cars
  useEffect(() => {
    if (featuredCarsData) {
      console.log('Featured cars data:', {
        total: featuredCarsData.total,
        entries: featuredCarsData.entries?.length,
        firstCarFeatured: featuredCarsData.entries?.[0]?.featured,
        allFeatured: featuredCarsData.entries?.map(car => ({ id: car._id, featured: car.featured }))
      });
    }
  }, [featuredCarsData]);

  
  // Debug brands data
  // useEffect(() => {
  //   console.log('CarsScreen brandsData:', {
  //     brandsData,
  //     brandsLoading,
  //     brandsError,
  //     brandsCount: brandsData?.brands?.length
  //   });
  // }, [brandsData, brandsLoading, brandsError]);

  const tabs = [
    { key: 'member-cars', label: 'Member Cars', type: 'cars', heading: 'Member Cars', showFilters: true },
    { key: 'spots', label: 'Spotted', type: 'posts', apiUrl: '/api/post?type=spot', heading: 'Spotted Cars', showFilters: true },
    { key: 'brands', label: 'Brands', type: 'brands', heading: 'Car Brands', showFilters: false },
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
      // console.log('CarsScreen getTabConfig:', {
      //   selectedUser: selectedUser?.username,
      //   selectedMake,
      //   queryString,
      //   finalApiUrl: apiUrl
      // });
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

  // Handle user selection and close modal
  const handleUserSelectAndClose = (user) => {
    handleUserSelect(user);
    setSearchModalVisible(false);
  };

  // Handle make selection and close modal
  const handleMakeSelectAndClose = (make) => {
    handleMakeSelect(make);
    setMakeFilterModalVisible(false);
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
              <Text style={styles.searchModalTitle}>Search User</Text>
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

  // Render make filter modal
  const renderMakeFilterModal = () => {
    return (
      <Modal
        visible={makeFilterModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMakeFilterModalVisible(false)}
      >
        <View style={styles.makeModalContainer}>
          <View style={styles.makeModalHeader}>
            <Text></Text>
            <Text style={styles.makeModalTitle}>Filter by Make</Text>
            <TouchableOpacity
              onPress={() => setMakeFilterModalVisible(false)}
              style={styles.makeModalCloseButton}
            >
              <FAIcon name="times" size={18} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.makeModalContent} showsVerticalScrollIndicator={false}>
            {brandsLoading ? (
              <View style={styles.makeFiltersLoadingContainer}>
                <FAIcon name="spinner" size={16} color={colors.BRG} />
                <Text style={styles.makeFiltersLoadingText}>Loading makes...</Text>
              </View>
            ) : brandsError ? (
              <Text style={styles.makeFiltersError}>Error loading makes</Text>
            ) : (
              <View style={styles.makeModalGrid}>
                {brandsData?.brands?.map((brand) => (
                  <TouchableOpacity
                    key={brand.make_handle || brand.make}
                    style={[
                      styles.makeModalChip,
                      selectedMake === brand.make && styles.makeModalChipActive
                    ]}
                    onPress={() => handleMakeSelectAndClose(brand.make)}
                  >
                    <Text style={[
                      styles.makeModalChipText,
                      selectedMake === brand.make && styles.makeModalChipTextActive
                    ]}>
                      {brand.make}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {selectedMake && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMake(null);
                  setMakeFilterModalVisible(false);
                }}
                style={styles.clearMakeButton}
              >
                <Text style={styles.clearMakeButtonText}>Clear Make Filter</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // Render active filter bar for member cars
  const renderMemberCarsFilterBar = () => {
    if (activeTab !== 'member-cars') return null;
    if (!selectedUser && !selectedMake) return null;

    return (
      <View style={styles.memberCarsActiveFilters}>
        {selectedUser && (
          <View style={styles.memberCarsFilterChip}>
            <Text style={styles.memberCarsFilterText}>
              User: {selectedUser.username || 'Unknown'}
            </Text>
            <TouchableOpacity onPress={() => setSelectedUser(null)}>
              <FAIcon name="times" size={10} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        )}
        {selectedMake && (
          <View style={styles.memberCarsFilterChip}>
            <Text style={styles.memberCarsFilterText}>Make: {selectedMake}</Text>
            <TouchableOpacity onPress={() => setSelectedMake(null)}>
              <FAIcon name="times" size={10} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Render featured cars section
  const renderFeaturedCars = () => {
    if (!featuredCarsData?.entries || featuredCarsData.entries.length === 0) return null;

    return (
      <View style={styles.featuredSection}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle}>Featured</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContent}
        >
          {featuredCarsData.entries.map((car) => (
            <View key={car._id} style={styles.featuredMemberCarCard}>
              <CarCard
                post={{ ...car, entry_type: 'garagecar' }}
                displayOptions={{ badgeProfile: false, badgeCar: false }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render featured spotted cars section
  const renderFeaturedSpottedCars = () => {
    if (!featuredSpottedCarsData?.entries || featuredSpottedCarsData.entries.length === 0) return null;

    return (
      <View style={styles.featuredSection}>
        <View style={styles.featuredHeader}>
          <Text style={styles.featuredTitle}>Featured</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContent}
        >
          {featuredSpottedCarsData.entries.map((post) => (
            <View key={post._id || post.internal_id} style={styles.featuredCarCard}>
              <PostCard
                post={post}
                displayOptions={{ badgeProfile: false, badgeCar: false, small: true }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'brands') {
      return <BrandsScreen navigation={navigation} />;
    }

    const config = getTabConfig(activeTab);
    const tab = tabs.find(t => t.key === activeTab);

    // For member-cars tab, use custom header with search and make filter buttons
    if (activeTab === 'member-cars') {
      return (
        <>
          <Listing
            config={config}
            displayOptions={displayOptions}
            key={`${selectedUser?._id || 'no-user'}-${selectedMake || 'no-make'}`}
            heading={tab?.heading || ''}
            numColumns={1}
            customHeaderButtons={() => (
              <>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setSearchModalVisible(true)}
                >
                  <FAIcon name="search" size={16} color={colors.BLACK} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setMakeFilterModalVisible(true)}
                >
                  <FAIcon name="filter" size={16} color={colors.BLACK} />
                </TouchableOpacity>
              </>
            )}
            customFilterBar={renderMemberCarsFilterBar}
            customHeaderSection={renderFeaturedCars}
          />
          {renderSearchModal()}
          {renderMakeFilterModal()}
        </>
      );
    }

    // For spots tab, use the new filter UI with featured section
    return (
      <Listing
        config={config}
        displayOptions={displayOptions}
        showFilters={tab?.showFilters || false}
        filterTypes={['category']}
        heading={tab?.heading || ''}
        numColumns={2}
        customHeaderSection={renderFeaturedSpottedCars}
      />
    );
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
  // Header buttons
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
  // Make filter modal
  makeModalContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  makeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  makeModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  makeModalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.LIGHT_GRAY,
  },
  makeModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  makeModalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  makeModalChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    marginBottom: 8,
  },
  makeModalChipActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  makeModalChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  makeModalChipTextActive: {
    color: colors.WHITE,
    fontWeight: '600',
  },
  clearMakeButton: {
    marginTop: 24,
    marginBottom: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearMakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
  },
  // Member cars active filters
  memberCarsActiveFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  memberCarsFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.GRAY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  memberCarsFilterText: {
    fontSize: 12,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  // Featured cars section
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
  featuredScrollContent: {
    paddingHorizontal: 12,
    gap: 12,
  },
  featuredCarCard: {
    width: 200,
  },

  featuredMemberCarCard: {
    width: 300,
  },

});

export default CarsScreen;