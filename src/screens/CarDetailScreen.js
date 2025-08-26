import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { colors } from '../constants/colors';
import { useGetCarsQuery, useGetModsQuery, useGetCarGalleriesQuery } from '../services/apiService';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import FAIcon from '../components/FAIcon';
import UserBadge from '../components/UserBadge';
import ImageGalleryModal from '../components/ImageGalleryModal';

const { width: screenWidth } = Dimensions.get('window');

const CarDetailScreen = ({ route, navigation }) => {
  const { carId } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);

  if (!carId) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message="No car ID provided"
          icon="exclamation"
          fullScreen
        />
      </View>
    );
  }

  // Get cars from the list and find the specific one by ID
  const { data: carsList, isLoading, error } = useGetCarsQuery({ page: 1, limit: 200 });

  // Find the specific car in the list
  const carData = carsList?.entries?.find(c => c._id === carId || c.id === carId);

  // Fetch related content using existing getCars endpoint
  const { data: relatedByMake } = useGetCarsQuery(
    { make: carData?.make, limit: 10 },
    { skip: !carData?.make }
  );
  
  const { data: relatedByModel } = useGetCarsQuery(
    { make: carData?.make, model: carData?.model, limit: 10 },
    { skip: !carData?.make || !carData?.model }
  );

  // Fetch mods for this car
  const { data: modsData, isLoading: modsLoading, error: modsError } = useGetModsQuery(
    { car_id: carId },
    { skip: !carId }
  );

  // Fetch car galleries (separate collection) using internal_id
  const { data: carGalleriesData, isLoading: galleriesLoading, error: galleriesError } = useGetCarGalleriesQuery(
    { internal_id: carData?.internal_id },
    { skip: !carData?.internal_id }
  );

  // Memoize related cars and exclude current car
  const relatedMakeCars = useMemo(() => {
    const cars = relatedByMake?.entries || [];
    return cars.filter(c => c._id !== carId);
  }, [relatedByMake?.entries, carId]);
  
  const relatedModelCars = useMemo(() => {
    const cars = relatedByModel?.entries || [];
    return cars.filter(c => c._id !== carId);
  }, [relatedByModel?.entries, carId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingIndicator 
          text="Loading car details..." 
          size="large"
          variant="spinner"
          fullScreen
        />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message={`Error loading car details: ${JSON.stringify(error)}`}
          icon="exclamation"
          fullScreen
        />
      </View>
    );
  }

  if (!carData) {
    return (
      <View style={styles.container}>
        <ErrorMessage 
          message="Car not found"
          icon="exclamation"
          fullScreen
        />
      </View>
    );
  }

  const getCarImageSource = (imageIndex = 0) => {
    if (carData?.gallery?.[imageIndex]?.filename) {
      return { uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${carData.gallery[imageIndex].filename}` };
    }
    return null;
  };

  const renderCarHeaderImage = ({ item, index }) => (
    <View style={styles.headerImageContainer}>
      <Image
        source={{ uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${item.filename}` }}
        style={styles.carImage}
        resizeMode="cover"
      />
    </View>
  );

  const getDisplayName = () => {
    const parts = [carData.year, carData.make, carData.model].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (carData.title) return carData.title;
    return 'Car';
  };

  // Car stats configuration with icons
  const getCarStats = () => {
    const stats = [];
    
    if (carData.year) stats.push({ label: 'Year', value: carData.year, icon: 'calendar' });
    if (carData.make) stats.push({ label: 'Make', value: carData.make, icon: 'industry' });
    if (carData.model) stats.push({ label: 'Model', value: carData.model, icon: 'car' });
    if (carData.trim) stats.push({ label: 'Trim', value: carData.trim, icon: 'tag' });
    if (carData.color) stats.push({ label: 'Color', value: carData.color, icon: 'paint-brush' });
    if (carData.engine) stats.push({ label: 'Engine', value: carData.engine, icon: 'cog' });
    if (carData.transmission) stats.push({ label: 'Transmission', value: carData.transmission, icon: 'exchange-alt' });
    if (carData.horsepower) stats.push({ label: 'Horsepower', value: `${carData.horsepower} HP`, icon: 'tachometer-alt' });
    if (carData.torque) stats.push({ label: 'Torque', value: `${carData.torque} lb-ft`, icon: 'bolt' });
    if (carData.drivetrain) stats.push({ label: 'Drivetrain', value: carData.drivetrain, icon: 'road' });
    if (carData.fuelType) stats.push({ label: 'Fuel Type', value: carData.fuelType, icon: 'gas-pump' });
    if (carData.mileage) stats.push({ label: 'Mileage', value: `${carData.mileage} miles`, icon: 'route' });
    
    return stats;
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'info-circle' },
    { key: 'galleries', label: 'Galleries', icon: 'images', count: carGalleriesData?.entries?.length || 0 },
    { key: 'mods', label: 'Mods', icon: 'wrench', count: modsData?.entries?.length || 0 },
    { key: 'related', label: 'Related', icon: 'cars', count: relatedMakeCars.length + relatedModelCars.length },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'galleries':
        return renderGalleriesTab();
      case 'mods':
        return renderModsTab();
      case 'related':
        return renderRelatedTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    const stats = getCarStats();
    
    return (
      <View style={styles.tabContent}>
        {/* Car Stats Table */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.statsTable}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <View style={styles.statIcon}>
                  <FAIcon name={stat.icon} size={16} color={colors.BRG} />
                </View>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {carData.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{carData.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderGalleriesTab = () => {
    if (galleriesLoading) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.loadingContainer}>
            <FAIcon name="spinner" size={20} color={colors.BRG} />
            <Text style={styles.loadingText}>Loading galleries...</Text>
          </View>
        </View>
      );
    }

    if (galleriesError) {
      // If it's a 404 error (endpoint doesn't exist), show coming soon message
      const is404Error = galleriesError?.status === 404 || 
                         galleriesError?.data?.includes?.('Cannot GET') ||
                         galleriesError?.error?.includes?.('Not Found');
      
      if (is404Error) {
        return (
          <EmptyState
            title="Car Galleries"
            message="Car galleries coming soon. Backend endpoints are being implemented."
            icon="images"
          />
        );
      }

      return (
        <View style={styles.tabContent}>
          <View style={styles.errorContainer}>
            <FAIcon name="exclamation" size={24} color={colors.ERROR} />
            <Text style={styles.errorText}>Error loading galleries</Text>
            <Text style={styles.errorDetails}>
              {galleriesError?.data?.message || galleriesError?.message || 'Failed to load galleries'}
            </Text>
          </View>
        </View>
      );
    }

    const carGalleries = carGalleriesData?.entries || [];

    if (carGalleries.length === 0) {
      return (
        <EmptyState
          title="No Galleries"
          message="No galleries found for this car"
          icon="images"
        />
      );
    }

    // Flatten all images from all galleries for the modal
    const allGalleryImages = carGalleries.flatMap(gallery => 
      gallery.gallery?.map(img => img) || []
    );

    return (
      <View style={styles.tabContent}>
        <View style={styles.galleryHeader}>
          <Text style={styles.sectionTitle}>Car Galleries ({carGalleries.length})</Text>
          {allGalleryImages.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => setGalleryModalVisible(true)}
            >
              <FAIcon name="expand-arrows-alt" size={16} color={colors.BRG} />
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Render each gallery collection */}
        {carGalleries.map((gallery, galleryIndex) => (
          <View key={gallery._id || galleryIndex} style={styles.gallerySection}>
            <Text style={styles.galleryTitle}>
              {gallery.title || `Gallery ${galleryIndex + 1}`}
            </Text>
            {gallery.description && (
              <Text style={styles.galleryDescription}>{gallery.description}</Text>
            )}
            {gallery.gallery && gallery.gallery.length > 0 && (
              <View style={styles.galleryGrid}>
                {gallery.gallery.map((image, imageIndex) => (
                  <TouchableOpacity 
                    key={imageIndex} 
                    style={styles.galleryItem}
                    onPress={() => setGalleryModalVisible(true)}
                  >
                    <Image
                      source={{ uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${image.filename}` }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderModsTab = () => {
    if (modsLoading) {
      return (
        <View style={styles.tabContent}>
          <View style={styles.loadingContainer}>
            <FAIcon name="spinner" size={20} color={colors.BRG} />
            <Text style={styles.loadingText}>Loading modifications...</Text>
          </View>
        </View>
      );
    }

    if (modsError) {
      // If it's a 404 error (endpoint doesn't exist), show coming soon message
      const is404Error = modsError?.status === 404 || 
                         modsError?.data?.includes?.('Cannot GET') ||
                         modsError?.error?.includes?.('Not Found');
      
      if (is404Error) {
        return (
          <EmptyState
            title="Modifications"
            message="Modification tracking coming soon. Backend endpoints are being implemented."
            icon="wrench"
          />
        );
      }

      return (
        <View style={styles.tabContent}>
          <View style={styles.errorContainer}>
            <FAIcon name="exclamation" size={24} color={colors.ERROR} />
            <Text style={styles.errorText}>Error loading modifications</Text>
            <Text style={styles.errorDetails}>
              {modsError?.data?.message || modsError?.message || 'Failed to load modifications'}
            </Text>
          </View>
        </View>
      );
    }

    const mods = modsData?.entries || [];

    if (mods.length === 0) {
      return (
        <EmptyState
          title="No Modifications"
          message="No modifications found for this car"
          icon="wrench"
        />
      );
    }

    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Modifications ({mods.length})</Text>
        <View style={styles.modsList}>
          {mods.map((mod, index) => (
            <View key={mod._id || index} style={styles.modItem}>
              {/* Mod Header */}
              <View style={styles.modHeader}>
                <View style={styles.modIconContainer}>
                  <FAIcon name="wrench" size={16} color={colors.BRG} />
                </View>
                <View style={styles.modInfo}>
                  <Text style={styles.modTitle}>{mod.title || 'Modification'}</Text>
                  {mod.category && (
                    <Text style={styles.modCategory}>{mod.category}</Text>
                  )}
                </View>
                {mod.installation_date && (
                  <Text style={styles.modDate}>
                    {new Date(mod.installation_date).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {/* Mod Description */}
              {mod.description && (
                <Text style={styles.modDescription}>{mod.description}</Text>
              )}

              {/* Mod Costs */}
              {(mod.parts_cost || mod.labor_cost) && (
                <View style={styles.modCosts}>
                  {mod.parts_cost && (
                    <View style={styles.modCostItem}>
                      <FAIcon name="shopping-cart" size={12} color={colors.TEXT_SECONDARY} />
                      <Text style={styles.modCostText}>Parts: ${mod.parts_cost}</Text>
                    </View>
                  )}
                  {mod.labor_cost && (
                    <View style={styles.modCostItem}>
                      <FAIcon name="user" size={12} color={colors.TEXT_SECONDARY} />
                      <Text style={styles.modCostText}>Labor: ${mod.labor_cost}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Mod Images */}
              {mod.gallery && mod.gallery.length > 0 && (
                <View style={styles.modGallery}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {mod.gallery.map((image, imageIndex) => (
                      <TouchableOpacity key={imageIndex} style={styles.modImageContainer}>
                        <Image
                          source={{ uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${image.filename}` }}
                          style={styles.modImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRelatedTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* More from this Make */}
        {relatedMakeCars.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>
              More {carData.make} Cars ({relatedMakeCars.length})
            </Text>
            <FlatList
              data={relatedMakeCars}
              renderItem={renderRelatedCarItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedCarsList}
            />
          </View>
        )}

        {/* More from this Model */}
        {relatedModelCars.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>
              More {carData.make} {carData.model} Cars ({relatedModelCars.length})
            </Text>
            <FlatList
              data={relatedModelCars}
              renderItem={renderRelatedCarItem}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedCarsList}
            />
          </View>
        )}

        {relatedMakeCars.length === 0 && relatedModelCars.length === 0 && (
          <EmptyState
            title="No Related Cars"
            message="No other cars found with the same make or model"
            icon="cars"
          />
        )}
      </View>
    );
  };

  const renderRelatedCarItem = ({ item }) => (
    <TouchableOpacity
      style={styles.relatedCarItem}
      onPress={() => navigation.push('CarDetail', { carId: item._id })}
    >
      <View style={styles.relatedCarImageContainer}>
        {item.gallery?.[0]?.filename ? (
          <Image
            source={{ uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${item.gallery[0].filename}` }}
            style={styles.relatedCarImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.relatedCarPlaceholder}>
            <FAIcon name="car" size={20} color={colors.GRAY} />
          </View>
        )}
      </View>
      <Text style={styles.relatedCarText} numberOfLines={2}>
        {[item.year, item.make, item.model].filter(Boolean).join(' ') || item.title || 'Car'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Car Header */}
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          {carData?.gallery?.length > 0 ? (
            <FlatList
              data={carData.gallery}
              renderItem={renderCarHeaderImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.headerGallery}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <FAIcon name="car" size={60} color={colors.GRAY} />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        
        <View style={styles.carInfo}>
          <Text style={styles.carTitle}>{getDisplayName()}</Text>
          
          {/* User Badge */}
          {carData.user_id && (
            <View style={styles.userBadgeContainer}>
              <UserBadge userId={carData.user_id} />
            </View>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <View style={styles.tabButtonContent}>
                <FAIcon 
                  name={tab.icon} 
                  size={16} 
                  color={activeTab === tab.key ? colors.WHITE : colors.TEXT_SECONDARY} 
                  style={styles.tabIcon}
                />
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab.key && styles.activeTabButtonText
                ]}>
                  {tab.label}
                  {tab.count !== undefined && ` (${tab.count})`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={galleryModalVisible}
        images={carGalleriesData?.entries?.flatMap(gallery => 
          gallery.gallery?.map(img => img) || []
        ) || []}
        onClose={() => setGalleryModalVisible(false)}
        title={`${getDisplayName()} - Galleries`}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    backgroundColor: colors.WHITE,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  headerGallery: {
    width: '100%',
    height: 250,
  },
  headerImageContainer: {
    width: screenWidth,
    height: 250,
  },
  carImage: {
    width: '100%',
    height: 250,
  },
  placeholderContainer: {
    width: '100%',
    height: 250,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: colors.GRAY,
    marginTop: 8,
    fontWeight: '500',
  },
  carInfo: {
    padding: 16,
  },
  carTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  userBadgeContainer: {
    alignSelf: 'flex-start',
  },
  
  // Tabs
  tabsContainer: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.BACKGROUND,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  activeTabButton: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  tabButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  activeTabButtonText: {
    color: colors.WHITE,
    fontWeight: '600',
  },
  
  // Tab Content
  tabContent: {
    backgroundColor: colors.WHITE,
    margin: 8,
    borderRadius: 12,
    padding: 16,
  },
  
  // Overview Tab - Stats Table
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  statsTable: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  statIcon: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
  },
  descriptionSection: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    lineHeight: 24,
  },
  
  // Galleries Tab
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BRG,
  },
  viewAllText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: colors.BRG,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  galleryItem: {
    width: (screenWidth - 48) / 2, // 2 columns with padding
    marginHorizontal: 4,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: 120,
  },
  gallerySection: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    paddingBottom: 16,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  galleryDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 12,
    lineHeight: 20,
  },
  
  // Mods Tab
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    color: colors.ERROR,
  },
  errorDetails: {
    marginTop: 4,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  modsList: {
    // Container for all mods
  },
  modItem: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  modHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modInfo: {
    flex: 1,
  },
  modTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  modCategory: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  modDate: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  modDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  modCosts: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  modCostItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modCostText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  modGallery: {
    marginTop: 8,
  },
  modImageContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modImage: {
    width: 100,
    height: 80,
  },

  // Related Cars
  relatedSection: {
    marginBottom: 24,
  },
  relatedCarsList: {
    paddingRight: 16,
  },
  relatedCarItem: {
    width: 120,
    marginRight: 12,
  },
  relatedCarImageContainer: {
    width: 120,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  relatedCarImage: {
    width: '100%',
    height: '100%',
  },
  relatedCarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedCarText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CarDetailScreen;