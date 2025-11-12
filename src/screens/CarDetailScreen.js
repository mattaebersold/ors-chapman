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
  Alert,
  Modal,
} from 'react-native';
import { colors } from '../constants/colors';
import { useGetCarsQuery, useGetModsQuery, useGetCarGalleriesQuery, useGetCarGalleriesByInternalIdQuery, useGetCarModsByInternalIdQuery, useGetCarTasksQuery, useCreateCarTaskMutation, useUpdateCarTaskMutation, useToggleCarTaskCompletionMutation, useUpdateCarTaskPositionsMutation, useDeleteCarTaskMutation, useDeleteModMutation, useDeleteCarGalleryMutation, useDeleteGarageCarMutation, useGetUserDetailsQuery, useToggleGarageCarFeaturedMutation, useGetUserQuery } from '../services/apiService';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ErrorMessage from '../components/ui/ErrorMessage';
import EmptyState from '../components/ui/EmptyState';
import FAIcon from '../components/ui/FAIcon';
import CarCard from '../components/cards/CarCard';
import ImageGalleryModal from '../components/modals/ImageGalleryModal';
import CarFeedPanel from '../components/panels/CarFeedPanel';
import Likes from '../components/Likes';
import CarTaskModal from '../components/modals/CarTaskModal';
import CarTasksViewModal from '../components/modals/CarTasksViewModal';
import CarFormModal from '../components/modals/CarFormModal';
import ModFormModal from '../components/modals/ModFormModal';
import GalleryFormModal from '../components/modals/GalleryFormModal';
import GradientPlaceholder from '../components/ui/GradientPlaceholder';
import { LinearGradient } from 'expo-linear-gradient';
import UserRow from '../components/cards/UserRow';


const { width: screenWidth } = Dimensions.get('window');

const CarDetailScreen = ({ route, navigation }) => {
  const { carId } = route.params;
  const [activeTab, setActiveTab] = useState('overview');
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [individualGalleryModalVisible, setIndividualGalleryModalVisible] = useState(false);
  const [carHeaderGalleryModalVisible, setCarHeaderGalleryModalVisible] = useState(false);
  const [carHeaderGalleryStartIndex, setCarHeaderGalleryStartIndex] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [modsModalVisible, setModsModalVisible] = useState(false);
  const [selectedMod, setSelectedMod] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [tasksViewModalVisible, setTasksViewModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editCarModalVisible, setEditCarModalVisible] = useState(false);
  const [modFormModalVisible, setModFormModalVisible] = useState(false);
  const [galleryFormModalVisible, setGalleryFormModalVisible] = useState(false);
  const [editingMod, setEditingMod] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [relatedMakeModalVisible, setRelatedMakeModalVisible] = useState(false);
  const [relatedModelModalVisible, setRelatedModelModalVisible] = useState(false);

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
  
  // Debug logging for car data

  // Fetch related content - try different strategies to get more results
  const makeParam = carData?.make_handle || carData?.make;
  const modelParam = carData?.model_handle || carData?.model;
  
  // Query 1: Get cars by make only (should return more results)
  const { data: relatedByMake } = useGetCarsQuery(
    carData?.make_handle 
      ? { make_handle: carData.make_handle, limit: 50 }  // Increased limit
      : { make: carData?.make, limit: 50 },  // Increased limit
    { skip: !makeParam }
  );
  
  // Query 2: Get cars by make + model (more specific)
  const { data: relatedByModel } = useGetCarsQuery(
    carData?.make_handle && carData?.model_handle
      ? { make_handle: carData.make_handle, model_handle: carData.model_handle, limit: 50 }  // Increased limit
      : carData?.make && carData?.model
        ? { make: carData?.make, model: carData?.model, limit: 50 }  // Increased limit
        : null,
    { skip: !makeParam || !modelParam }
  );
  
  // Query 3: Fallback - get all cars and filter client-side if backend filtering isn't working
  const { data: allCarsData } = useGetCarsQuery(
    { limit: 100, page: 1 },  // Get more cars to filter from
    { skip: (relatedByMake?.entries?.length || 0) > 2 }  // Only use as fallback
  );

  // Fetch mods for this car using internal_id URL path (Murray pattern)
  const { data: modsData, isLoading: modsLoading, error: modsError } = useGetCarModsByInternalIdQuery(
    carData?.internal_id,
    { skip: !carData?.internal_id }
  );

  // Fetch car galleries using internal_id URL path (Murray pattern)
  const { data: carGalleriesData, isLoading: galleriesLoading, error: galleriesError } = useGetCarGalleriesByInternalIdQuery(
    carData?.internal_id,
    { skip: !carData?.internal_id }
  );

  // Fetch car tasks using internal_id
  const { data: carTasksData, isLoading: tasksLoading, error: tasksError, refetch: refetchTasks } = useGetCarTasksQuery(
    { carId: carData?.internal_id },
    { skip: !carData?.internal_id }
  );

  // Get current user details for ownership check
  const { data: currentUser } = useGetUserDetailsQuery();

  // Fetch car owner user data
  const { data: carOwnerUser } = useGetUserQuery(carData?.user_id, {
    skip: !carData?.user_id
  });

  // CarTask mutations
  const [createCarTask] = useCreateCarTaskMutation();
  const [updateCarTask] = useUpdateCarTaskMutation();
  const [toggleCarTaskCompletion] = useToggleCarTaskCompletionMutation();
  const [updateCarTaskPositions] = useUpdateCarTaskPositionsMutation();
  const [deleteCarTask] = useDeleteCarTaskMutation();
  
  // Mod and Gallery mutations
  const [deleteMod] = useDeleteModMutation();
  const [deleteCarGallery] = useDeleteCarGalleryMutation();
  const [deleteGarageCar] = useDeleteGarageCarMutation();
  const [toggleGarageCarFeatured] = useToggleGarageCarFeaturedMutation();

  // Posts will be handled by the Listing component in renderFeedTab()

  // Process related cars data with client-side filtering and fallback logic
  const relatedMakeCars = useMemo(() => {
    const targetMake = carData?.make_handle || carData?.make;
    if (!targetMake) return [];
    
    // Use primary query results, or fallback to all cars
    const sourceData = relatedByMake?.entries?.length > 0 
      ? relatedByMake.entries 
      : allCarsData?.entries || [];
    
    // Filter for matching make and exclude current car
    const filtered = sourceData.filter(car => {
      if (car._id === carData?._id) return false;
      
      const carMake = car.make_handle || car.make;
      return carMake && carMake.toLowerCase() === targetMake.toLowerCase();
    });
    
    // Limit to reasonable number for display
    return filtered.slice(0, 20);
  }, [relatedByMake, allCarsData, carData]);

  const relatedModelCars = useMemo(() => {
    const targetMake = carData?.make_handle || carData?.make;
    const targetModel = carData?.model_handle || carData?.model;
    if (!targetMake || !targetModel) return [];
    
    // Use primary query results, or fallback to all cars
    const sourceData = relatedByModel?.entries?.length > 0 
      ? relatedByModel.entries 
      : allCarsData?.entries || [];
    
    // Filter for matching make+model, exclude current car and cars already in make list
    const filtered = sourceData.filter(car => {
      if (car._id === carData?._id) return false;
      
      // Don't include cars already in the make list
      if (relatedMakeCars.some(makeCar => makeCar._id === car._id)) return false;
      
      const carMake = car.make_handle || car.make;
      const carModel = car.model_handle || car.model;
      
      return carMake && carModel &&
             carMake.toLowerCase() === targetMake.toLowerCase() &&
             carModel.toLowerCase() === targetModel.toLowerCase();
    });
    
    // Limit to reasonable number for display
    return filtered.slice(0, 15);
  }, [relatedByModel, allCarsData, carData, relatedMakeCars]);

  // Debug logging for API responses
  // React.useEffect(() => {
  //   if (carData) {
  //     console.log('=== CarDetailScreen Related Cars Debug ===');
  //     console.log('Current Car:', {
  //       _id: carData._id,
  //       make: carData.make,
  //       model: carData.model,
  //       make_handle: carData.make_handle,
  //       model_handle: carData.model_handle
  //     });
      
  //     console.log('Query Parameters:', {
  //       makeQuery: carData?.make_handle 
  //         ? { make_handle: carData.make_handle, limit: 20 }
  //         : { make: carData?.make, limit: 20 },
  //       modelQuery: carData?.make_handle && carData?.model_handle
  //         ? { make_handle: carData.make_handle, model_handle: carData.model_handle, limit: 20 }
  //         : { make: carData?.make, model: carData?.model, limit: 20 }
  //     });
      
  //     console.log('Raw API Results:', {
  //       relatedByMakeCount: relatedByMake?.entries?.length || 0,
  //       relatedByMakeEntries: relatedByMake?.entries?.map(car => ({
  //         _id: car._id,
  //         make: car.make,
  //         model: car.model,
  //         make_handle: car.make_handle,
  //         model_handle: car.model_handle
  //       })) || [],
  //       relatedByModelCount: relatedByModel?.entries?.length || 0,
  //       allCarsCount: allCarsData?.entries?.length || 0,
  //       usingFallback: {
  //         makeQuery: (relatedByMake?.entries?.length || 0) <= 2,
  //         modelQuery: (relatedByModel?.entries?.length || 0) <= 2
  //       }
  //     });
      
  //     console.log('Filtered Results:', {
  //       relatedMakeCarsCount: relatedMakeCars.length,
  //       relatedMakeCars: relatedMakeCars.map(car => `${car.make} ${car.model}`),
  //       relatedModelCarsCount: relatedModelCars.length,
  //       relatedModelCars: relatedModelCars.map(car => `${car.make} ${car.model}`)
  //     });
  //     console.log('=== End Debug ===');
  //   }
  // }, [carData, relatedByMake, relatedByModel, relatedMakeCars, relatedModelCars]);


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
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${carData.gallery[imageIndex].filename}` };
    }
    return null;
  };

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
    if (carData.make) stats.push({ label: 'Make', value: carData.make, icon: 'tag' });
    if (carData.model) stats.push({ label: 'Model', value: carData.model, icon: 'car' });
    if (carData.trim) stats.push({ label: 'Trim', value: carData.trim, icon: 'tag' });
    if (carData.color) stats.push({ label: 'Color', value: carData.color, icon: 'palette' });
    if (carData.engine) stats.push({ label: 'Engine', value: carData.engine, icon: 'cogs' });
    if (carData.transmission) stats.push({ label: 'Transmission', value: carData.transmission, icon: 'exchange' });
    if (carData.horsepower) stats.push({ label: 'Horsepower', value: `${carData.horsepower}`, icon: 'tachometer' });
    if (carData.torque) stats.push({ label: 'Torque', value: `${carData.torque}`, icon: 'flash' });
    if (carData.drivetrain) stats.push({ label: 'Drivetrain', value: carData.drivetrain, icon: 'road' });
    if (carData.fuelType) stats.push({ label: 'Fuel Type', value: carData.fuelType, icon: 'tint' });
    if (carData.mileage) stats.push({ label: 'Mileage', value: `${carData.mileage} miles`, icon: 'road' });
    
    return stats;
  };

  // Check if current user owns this car
  const isCarOwner = currentUser && carData && (
    currentUser.user_id === carData.user_id
  );

  // Check if current user is admin
  const isAdmin = currentUser && currentUser.accountType === 'admin';

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'info-circle' },
    { key: 'feed', label: 'Feed', icon: 'rss' },
    { key: 'galleries', label: 'Galleries', icon: 'images', count: carGalleriesData?.entries?.length || 0 },
    { key: 'mods', label: 'Mods', icon: 'wrench', count: modsData?.entries?.length || 0 },
    { key: 'related', label: 'Related', icon: 'car', count: relatedMakeCars.length + relatedModelCars.length },
  ];

  const renderTabContent = () => {
    const content = (() => {
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
    })();

    // Return content directly since we now have a main ScrollView
    return content;
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
                  <FAIcon name={stat.icon} size={16} color={colors.WHITE} />
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
          <View style={styles.galleryHeaderButtons}>
            {allGalleryImages.length > 0 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setGalleryModalVisible(true)}
              >
                <FAIcon name="expand" size={16} color={colors.BRG} />
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
            {isCarOwner && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setGalleryFormModalVisible(true)}
              >
                <FAIcon name="plus" size={12} color={colors.BRG} />
                <Text style={styles.addButtonText}>Add Gallery</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Render each gallery collection */}
        {carGalleries.map((gallery, galleryIndex) => (
          <View key={gallery._id || galleryIndex} style={styles.gallerySection}>
            <View style={styles.galleryTitleRow}>
              <View style={styles.galleryTitleContainer}>
                <Text style={styles.galleryTitle}>
                  {gallery.title || `Gallery ${galleryIndex + 1}`}
                </Text>
                {gallery.description && (
                  <Text style={styles.galleryDescription}>{gallery.description}</Text>
                )}
              </View>
              {isCarOwner && (
                <View style={styles.galleryActionButtons}>
                  <TouchableOpacity 
                    style={styles.galleryActionButton}
                    onPress={() => {
                      setEditingGallery(gallery);
                      setGalleryFormModalVisible(true);
                    }}
                  >
                    <FAIcon name="edit" size={12} color={colors.TEXT_SECONDARY} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.galleryActionButton}
                    onPress={() => handleDeleteGallery(gallery)}
                  >
                    <FAIcon name="trash" size={12} color={colors.ERROR} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {gallery.gallery && gallery.gallery.length > 0 && (
              <TouchableOpacity 
                style={styles.galleryPreview}
                onPress={() => {
                  setSelectedGallery(gallery);
                  setIndividualGalleryModalVisible(true);
                }}
              >
                {/* Show only first image as preview */}
                <Image
                  source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${gallery.gallery[0].filename}` }}
                  style={styles.galleryPreviewImage}
                  resizeMode="cover"
                />
                
                {/* Image count overlay */}
                {gallery.gallery.length > 1 && (
                  <View style={styles.galleryImageCount}>
                    <FAIcon name="image" size={14} color={colors.WHITE} />
                    <Text style={styles.galleryImageCountText}>
                      {gallery.gallery.length}
                    </Text>
                  </View>
                )}
                
                {/* Tap to view overlay */}
                <View style={styles.galleryTapOverlay}>
                  <FAIcon name="expand" size={16} color={colors.WHITE} />
                  <Text style={styles.galleryTapText}>Tap to view</Text>
                </View>
              </TouchableOpacity>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Modifications ({mods.length})</Text>
          {isCarOwner && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModFormModalVisible(true)}
            >
              <FAIcon name="plus" size={12} color={colors.BRG} />
              <Text style={styles.addButtonText}>Add Mod</Text>
            </TouchableOpacity>
          )}
        </View>
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
                <View style={styles.modActions}>
                  {mod.installation_date && (
                    <Text style={styles.modDate}>
                      {new Date(mod.installation_date).toLocaleDateString()}
                    </Text>
                  )}
                  {isCarOwner && (
                    <View style={styles.modActionButtons}>
                      <TouchableOpacity 
                        style={styles.modActionButton}
                        onPress={() => {
                          setEditingMod(mod);
                          setModFormModalVisible(true);
                        }}
                      >
                        <FAIcon name="edit" size={12} color={colors.WHITE} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.modActionButton}
                        onPress={() => handleDeleteMod(mod)}
                      >
                        <FAIcon name="trash" size={12} color={colors.ERROR} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
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
                  <TouchableOpacity 
                    style={styles.modGalleryPreview}
                    onPress={() => {
                      setSelectedMod(mod);
                      setModsModalVisible(true);
                    }}
                  >
                    {/* Show only first image as preview */}
                    <Image
                      source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${mod.gallery[0].filename}` }}
                      style={styles.modPreviewImage}
                      resizeMode="cover"
                    />
                    
                    {/* Image count overlay */}
                    {mod.gallery.length > 1 && (
                      <View style={styles.modImageCount}>
                        <FAIcon name="image" size={14} color={colors.WHITE} />
                        <Text style={styles.modImageCountText}>
                          {mod.gallery.length}
                        </Text>
                      </View>
                    )}
                    
                    {/* Tap to view overlay */}
                    <View style={styles.modTapOverlay}>
                      <FAIcon name="expand" size={16} color={colors.WHITE} />
                      <Text style={styles.modTapText}>Tap to view</Text>
                    </View>
                  </TouchableOpacity>
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
        <View style={styles.relatedCategoriesContainer}>
          {/* More from this Make */}
          {relatedMakeCars.length > 0 && (
            <TouchableOpacity
              style={styles.relatedCategoryCard}
              onPress={() => setRelatedMakeModalVisible(true)}
            >
              <View style={styles.relatedCategoryHeader}>
                <FAIcon name="car" size={24} color={colors.BRG} />
                <Text style={styles.relatedCategoryTitle}>
                  More {carData.make} Cars
                </Text>
              </View>
              <Text style={styles.relatedCategoryCount}>
                {relatedMakeCars.length} cars found
              </Text>
              <View style={styles.relatedCategoryPreview}>
                {relatedMakeCars.slice(0, 3).map((car, index) => (
                  <View key={car._id} style={styles.previewCarItem}>
                    <Text style={styles.previewCarText}>
                      {car.year} {car.model}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.relatedCategoryAction}>
                <Text style={styles.relatedCategoryActionText}>View All</Text>
                <FAIcon name="chevron-right" size={16} color={colors.BRG} />
              </View>
            </TouchableOpacity>
          )}

          {/* More from this Model */}
          {relatedModelCars.length > 0 && (
            <TouchableOpacity
              style={styles.relatedCategoryCard}
              onPress={() => setRelatedModelModalVisible(true)}
            >
              <View style={styles.relatedCategoryHeader}>
                <FAIcon name="car" size={24} color={colors.BRG} />
                <Text style={styles.relatedCategoryTitle}>
                  More {carData.make} {carData.model} Cars
                </Text>
              </View>
              <Text style={styles.relatedCategoryCount}>
                {relatedModelCars.length} cars found
              </Text>
              <View style={styles.relatedCategoryPreview}>
                {relatedModelCars.slice(0, 3).map((car, index) => (
                  <View key={car._id} style={styles.previewCarItem}>
                    <Text style={styles.previewCarText}>
                      {car.year} {car.owner_username || 'Unknown Owner'}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.relatedCategoryAction}>
                <Text style={styles.relatedCategoryActionText}>View All</Text>
                <FAIcon name="chevron-right" size={16} color={colors.BRG} />
              </View>
            </TouchableOpacity>
          )}
        </View>

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
            source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${item.gallery[0].filename}` }}
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

  // CarTask handlers
  const handleCreateTask = async (formData) => {
    try {
      const form = new FormData();
      
      // Add basic fields
      form.append('title', formData.title);
      form.append('body', formData.body);
      form.append('type', formData.type);
      form.append('category', formData.category);
      form.append('car_id', formData.car_id);
      
      // Add images if any
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          form.append('gallery', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image_${index}.jpg`,
          });
        });
      }

      await createCarTask({ carId: carData.internal_id, formData: form }).unwrap();
      refetchTasks();
    } catch (error) {
      throw new Error(error.data?.message || error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      const form = new FormData();
      
      // Add basic fields
      form.append('title', formData.title);
      form.append('body', formData.body);
      form.append('type', formData.type);
      form.append('category', formData.category);
      form.append('car_id', formData.car_id);
      
      // Add images if any
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          form.append('gallery', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image_${index}.jpg`,
          });
        });
      }

      await updateCarTask({ 
        taskId: editingTask.internal_id || editingTask._id, 
        formData: form,
        carId: carData.internal_id 
      }).unwrap();
      
      setEditingTask(null);
      refetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error(error.data?.message || error.message || 'Failed to update task');
    }
  };

  const handleToggleTaskCompletion = async (task) => {
    try {
      await toggleCarTaskCompletion({
        internal_id: task.internal_id,
        completed: !task.completed,
        carId: carData.internal_id
      }).unwrap();
      
      refetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  const handleMoveTask = async (taskId, direction) => {
    const tasks = carTasksData?.entries || [];
    const taskIndex = tasks.findIndex(t => (t.internal_id || t._id) === taskId);
    
    if (taskIndex === -1) return;
    
    const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= tasks.length) return;
    
    // Create new tasks array with swapped positions
    const newTasks = [...tasks];
    [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];
    
    // Prepare position updates
    const positionUpdates = newTasks.map((task, index) => ({
      internal_id: task.internal_id || task._id,
      position: index
    }));
    
    try {
      await updateCarTaskPositions({
        tasks: positionUpdates,
        carId: carData.internal_id
      }).unwrap();
      
      refetchTasks();
    } catch (error) {
      console.error('Error reordering tasks:', error);
      Alert.alert('Error', 'Failed to reorder tasks. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCarTask(taskId).unwrap();
              refetchTasks();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete task. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleEditCarSuccess = () => {
    // The car data will be refetched automatically due to cache invalidation
    setEditCarModalVisible(false);
  };

  const handleModFormSuccess = () => {
    // The mods data will be refetched automatically due to cache invalidation
    setModFormModalVisible(false);
    setEditingMod(null);
  };

  const handleGalleryFormSuccess = () => {
    // The galleries data will be refetched automatically due to cache invalidation
    setGalleryFormModalVisible(false);
    setEditingGallery(null);
  };

  const handleDeleteCar = async () => {
    const carTitle = [carData.year, carData.make, carData.model].filter(Boolean).join(' ') || carData.title || 'this car';

    Alert.alert(
      'Delete Car',
      `Are you sure you want to delete "${carTitle}" from your garage? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGarageCar(carData.internal_id).unwrap();
              // Navigate back after successful deletion
              navigation.goBack();
              Alert.alert('Success', 'Car deleted successfully from your garage.');
            } catch (error) {
              console.error('Error deleting car:', error);
              Alert.alert('Error', 'Failed to delete car. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleToggleFeatured = async () => {
    try {
      const newFeaturedStatus = !carData.featured;
      await toggleGarageCarFeatured({
        internal_id: carData.internal_id,
        featured: newFeaturedStatus
      }).unwrap();
      Alert.alert('Success', `Car ${newFeaturedStatus ? 'featured' : 'unfeatured'} successfully.`);
    } catch (error) {
      console.error('Error toggling featured status:', error);
      Alert.alert('Error', 'Failed to update featured status. Please try again.');
    }
  };

  const handleDeleteMod = async (mod) => {
    Alert.alert(
      'Delete Modification',
      `Are you sure you want to delete "${mod.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMod(mod.internal_id || mod._id).unwrap();
              // The mods data will be refetched automatically
            } catch (error) {
              console.error('Error deleting mod:', error);
              Alert.alert('Error', 'Failed to delete modification. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteGallery = async (gallery) => {
    Alert.alert(
      'Delete Gallery',
      `Are you sure you want to delete "${gallery.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCarGallery(gallery.internal_id || gallery._id).unwrap();
              // The galleries data will be refetched automatically
            } catch (error) {
              console.error('Error deleting gallery:', error);
              Alert.alert('Error', 'Failed to delete gallery. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <>
      {/* Car Header */}
      <View>

        <View style={styles.imageContainer}>
          
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <FAIcon name="times" size={18} color={colors.WHITE} />
          </TouchableOpacity>

          {/* Main Header Image */}
          {carData?.gallery?.length > 0 ? (
            <Image
              source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${carData.gallery[0].filename}` }}
              style={styles.carImage}
              resizeMode="cover"
            />
          ) : (
            <GradientPlaceholder
              height={250}
              icon="car"
              iconSize={60}
              text=""
            />
          )}

          {/* Gallery Button */}
          {carData?.gallery?.length > 0 && (
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => {
                setCarHeaderGalleryStartIndex(0);
                setCarHeaderGalleryModalVisible(true);
              }}
            >
              <FAIcon name="images" size={20} color={colors.WHITE} />
              <Text style={styles.galleryButtonText}>{carData.gallery.length}</Text>
            </TouchableOpacity>
          )}

          {/* likes button */}
          <View style={styles.likesButton}>
            <Likes 
              document_id={carData.internal_id} 
              document_type="car"
            />
          </View>

          {/* gradient */}
          <LinearGradient
            colors={['rgba(40, 40, 40, 0)','rgba(40, 40, 40, 1)']}
            locations={[0, 1]}
            style={styles.gradient}
          />

          {/* title + icon */}
          <View style={styles.titleContainer}>

            <View style={styles.titleAndIcon}>
              <FAIcon
                size="20"
                name="car"
                color={colors.WHITE}
              />
              <Text style={styles.carTitle}>{getDisplayName()}</Text>
            </View>


            <Text style={styles.carTypeStyles} numberOfLines={1}>
              {carData.year} {carData.make} {carData.model} {carData.trim}
            </Text>

          </View>


        </View>

        <View style={styles.carInfo}>
          <View style={styles.carTitleRow}>

            <View style={styles.actionButtonsWrapper}>
              {/* Featured Toggle - only show for admins */}
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.featuredButton, carData.featured && styles.featuredButtonActive]}
                  onPress={handleToggleFeatured}
                >
                  <FAIcon name="star" size={16} color={carData.featured ? colors.GOLD : colors.TEXT_SECONDARY} />
                  <Text style={[styles.featuredButtonText, carData.featured && styles.featuredButtonTextActive]}>
                    {carData.featured ? 'Featured' : 'Feature'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Edit and Delete Buttons - only show for car owner */}
              {isCarOwner && (
                <View style={styles.carActionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditCarModalVisible(true)}
                  >
                    <FAIcon name="edit" size={16} color={colors.WHITE} />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeleteCar}
                  >
                    <FAIcon name="trash" size={16} color={colors.ERROR} />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* User Badge and Actions Row */}
          <View style={styles.carMetaRow}>
            {carOwnerUser && (
              <UserRow user={carOwnerUser} owner nostats />
            )}
          </View>
        </View>
      </View>

      {/* Tasks Section */}
      {isCarOwner && (
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <View style={styles.tasksSectionTitle}>
              <View>
                <Text style={styles.tasksSectionTitleText}>
                  To-Do List ({carTasksData?.entries?.length || 0})
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => setTaskModalVisible(true)}
            >
              <FAIcon name="plus" size={14} color={colors.BLACK} />
            </TouchableOpacity>
          </View>
          {tasksLoading ? (
            <View style={styles.tasksPreview}>
              <FAIcon name="spinner" size={16} color={colors.TEXT_SECONDARY} />
              <Text style={styles.tasksLoadingText}>Loading...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.tasksPreview}
              onPress={() => setTasksViewModalVisible(true)}
            >
              <Text style={styles.tasksPreviewText}>
                {carTasksData?.entries?.length > 0
                  ? 'View all'
                  : 'No to-dos yet'
                }
              </Text>
              <FAIcon name="chevron-right" size={14} color={colors.WHITE} />
            </TouchableOpacity>
          )}
        </View>
      )}

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
              onPress={() => {
                if (tab.key === 'feed') {
                  // Open feed modal directly instead of changing tab
                  setFeedModalVisible(true);
                } else {
                  setActiveTab(tab.key);
                }
              }}
            >
              <View style={styles.tabButtonContent}>
                <FAIcon
                  name={tab.icon}
                  size={16}
                  color={activeTab === tab.key ? colors.BLACK : colors.WHITE}
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
    </>
  );

  const renderContent = () => {
    // Use ScrollView with header included
    return (
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollableContent}
      >
        {renderHeader()}
        {renderTabContent()}
      </ScrollView>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={galleryModalVisible}
        images={carGalleriesData?.entries?.flatMap(gallery => 
          gallery.gallery?.map(img => img) || []
        ) || []}
        onClose={() => setGalleryModalVisible(false)}
        title={`${getDisplayName()} - Galleries`}
      />

      {/* Car Header Gallery Modal */}
      <ImageGalleryModal
        visible={carHeaderGalleryModalVisible}
        images={carData?.gallery || []}
        onClose={() => setCarHeaderGalleryModalVisible(false)}
        title={`${getDisplayName()}`}
        initialIndex={carHeaderGalleryStartIndex}
      />

      {/* Individual Gallery Modal */}
      <ImageGalleryModal
        visible={individualGalleryModalVisible}
        images={selectedGallery?.gallery || []}
        onClose={() => {
          setIndividualGalleryModalVisible(false);
          setSelectedGallery(null);
        }}
        title={selectedGallery?.title || 'Gallery'}
      />

      {/* Mods Gallery Modal */}
      <ImageGalleryModal
        visible={modsModalVisible}
        images={selectedMod?.gallery || []}
        onClose={() => {
          setModsModalVisible(false);
          setSelectedMod(null);
        }}
        title={selectedMod?.title || 'Modification'}
      />

      {/* Car Task Modal */}
      <CarTaskModal
        visible={taskModalVisible}
        onClose={() => {
          setTaskModalVisible(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        carId={carData?.internal_id}
        editMode={!!editingTask}
        existingTask={editingTask}
      />

      {/* Tasks View Modal */}
      <CarTasksViewModal
        visible={tasksViewModalVisible}
        onClose={() => setTasksViewModalVisible(false)}
        tasksData={carTasksData}
        tasksLoading={tasksLoading}
        tasksError={tasksError}
        onToggleTaskCompletion={handleToggleTaskCompletion}
        onMoveTask={handleMoveTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={(task) => {
          setEditingTask(task);
          setTasksViewModalVisible(false);
          setTaskModalVisible(true);
        }}
        onAddTask={() => {
          setTasksViewModalVisible(false);
          setTaskModalVisible(true);
        }}
      />

      {/* Car Edit Modal */}
      <CarFormModal
        visible={editCarModalVisible}
        onClose={() => setEditCarModalVisible(false)}
        editMode={true}
        existingCar={carData}
        onSuccess={handleEditCarSuccess}
      />

      {/* Mod Form Modal */}
      <ModFormModal
        visible={modFormModalVisible}
        onClose={() => {
          setModFormModalVisible(false);
          setEditingMod(null);
        }}
        editMode={!!editingMod}
        existingMod={editingMod}
        carId={carData?.internal_id}
        onSuccess={handleModFormSuccess}
      />

      {/* Gallery Form Modal */}
      <GalleryFormModal
        visible={galleryFormModalVisible}
        onClose={() => {
          setGalleryFormModalVisible(false);
          setEditingGallery(null);
        }}
        editMode={!!editingGallery}
        existingGallery={editingGallery}
        carId={carData?.internal_id}
        onSuccess={handleGalleryFormSuccess}
      />

      {/* Car Feed Modal */}
      <Modal
        visible={feedModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFeedModalVisible(false)}
      >
        <CarFeedPanel
          carData={carData}
          onClose={() => setFeedModalVisible(false)}
          onPostPress={(post) => {
            // Close the feed modal first
            setFeedModalVisible(false);
            // Then navigate to the post detail with a slight delay to allow modal to close
            setTimeout(() => {
              navigation.navigate('PostDetail', { post });
            }, 100);
          }}
          displayOptions={{
            badgeProfile: true,
            badgeCar: false,
          }}
          showFilters={true}
          title={`Posts - ${carData?.title}`}
        />
      </Modal>

      {/* Related Make Cars Modal */}
      <Modal
        visible={relatedMakeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRelatedMakeModalVisible(false)}
      >
        <View style={styles.relatedModalContainer}>
          <View style={styles.relatedModalHeader}>
            <TouchableOpacity onPress={() => setRelatedMakeModalVisible(false)}>
              <FAIcon name="times" size={24} color={colors.BRG} />
            </TouchableOpacity>
            <Text style={styles.relatedModalTitle}>
              More {carData?.make} Cars
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.relatedModalContent}>
            <FlatList
              data={relatedMakeCars}
              renderItem={({ item }) => (
                <CarCard
                  user={item}
                  displayOptions={{ hideUserBadge: false }}
                />
              )}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Related Model Cars Modal */}
      <Modal
        visible={relatedModelModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRelatedModelModalVisible(false)}
      >
        <View style={styles.relatedModalContainer}>
          <View style={styles.relatedModalHeader}>
            <TouchableOpacity onPress={() => setRelatedModelModalVisible(false)}>
              <FAIcon name="times" size={24} color={colors.BRG} />
            </TouchableOpacity>
            <Text style={styles.relatedModalTitle}>
              More {carData?.make} {carData?.model} Cars
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.relatedModalContent}>
            <FlatList
              data={relatedModelCars}
              renderItem={({ item }) => (
                <CarCard
                  user={item}
                  displayOptions={{ hideUserBadge: false }}
                />
              )}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND_DARK,
  },
  scrollableContent: {
    flexGrow: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollViewContent: {
    flexGrow: 1,
  },
  imageContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  galleryButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  carImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  titleContainer: {
    color: colors.WHITE,
    position: 'absolute',
    bottom: 10,
    left: 10,
    elevation: 5,
    width: '80%'
  },

  titleAndIcon: {
    flex: 1,
    flexDirection: 'row',
    width: '100%',
    gap: 8
  },

  carTypeStyles: {
    color: colors.WHITE,
    fontWeight: '800',
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 1,
    opacity: .4
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 150
  },

  likesButton: {
    position: 'absolute',
    bottom: 55,
    right: 10,
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
  carTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  carTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.WHITE,
    flex: 1,
    marginRight: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.WHITE,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.WHITE,
  },
  actionButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.TEXT_SECONDARY,
    gap: 6,
  },
  featuredButtonActive: {
    backgroundColor: colors.GOLD + '20',
    borderColor: colors.GOLD,
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  featuredButtonTextActive: {
    color: colors.GOLD,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.ERROR,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ERROR,
  },
  carMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  userBadgeContainer: {
    flex: 1,
    alignSelf: 'flex-start',
  },
  carActionsContainer: {
    marginLeft: 12,
  },
  
  // Tabs
  tabsContainer: {
    
  },

  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
  activeTabButton: {
    backgroundColor: colors.WHITE,
    borderColor: colors.WHITE,
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
    color: colors.WHITE,
  },
  activeTabButtonText: {
    color: colors.BLACK,
    fontWeight: '700',
  },
  
  // Tab Content
  tabContent: {
    margin: 8,
    borderRadius: 12,
    paddingVertical: 16,
  },
  
  // Overview Tab - Stats Table
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.WHITE,
    marginBottom: 16,
  },
  statsTable: {
    borderWidth: 1,
    borderColor: colors.BLACK,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BLACK,
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
    color: colors.WHITE,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.WHITE,
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
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  galleryHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.BRG,
    gap: 6,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.BRG,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BRG,
    gap: 6,
  },
  addButtonText: {
    fontSize: 13,
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
  galleryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  galleryTitleContainer: {
    flex: 1,
    marginRight: 12,
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
    lineHeight: 20,
  },
  galleryActionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  galleryActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.LIGHT_GRAY,
  },
  galleryPreview: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  galleryPreviewImage: {
    width: '100%',
    height: 200,
  },
  galleryImageCount: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryImageCountText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  galleryTapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  galleryTapText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
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
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  modInfo: {
    flex: 1,
  },
  modActions: {
    alignItems: 'flex-end',
  },
  modActionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modActionButton: {
    padding: 6,
    borderRadius: 6,
  },
  modTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.WHITE,
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
  modGalleryPreview: {
    position: 'relative',
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modPreviewImage: {
    width: '100%',
    height: '100%',
  },
  modImageCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modImageCountText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  modTapOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modTapText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
  },
  // Legacy styles (keeping for compatibility)
  modImageContainer: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modImage: {
    width: 100,
    height: 80,
  },

  // Tasks
  createTaskButton: {
    backgroundColor: colors.BRG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  createTaskButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  tasksContainer: {
    flex: 1,
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

  feedListingContainer: {
    height: 600, // Fixed height to prevent nested scroll issues
    marginTop: 8,
  },

  feedHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.BACKGROUND,
  },

  feedContainer: {
    flex: 1,
  },

  // Tasks Section (above tabs)
  tasksSection: {
    backgroundColor: '#161616',
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.BLACK,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: colors.BLACK,
    padding: 12,
  },
  tasksSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tasksSectionTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.WHITE,
  },
  tasksVisibilityText: {
    fontSize: 12,
    color: colors.WHITE,
    opacity: 0.7,
    fontStyle: 'italic',
    marginTop: 2,
  },
  addTaskButton: {
    backgroundColor: colors.WHITE,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingTop: 0,
  },
  tasksPreviewText: {
    fontSize: 14,
    color: colors.WHITE,
    flex: 1,
    marginRight: 8,
  },
  tasksLoadingText: {
    fontSize: 14,
    color: colors.WHITE,
    marginLeft: 8,
  },

  // Related Tab and Modal Styles
  relatedCategoriesContainer: {
    padding: 16,
  },
  relatedCategoryCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  relatedCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  relatedCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginLeft: 12,
    flex: 1,
  },
  relatedCategoryCount: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 12,
  },
  relatedCategoryPreview: {
    marginBottom: 12,
  },
  previewCarItem: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  previewCarText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  relatedCategoryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  relatedCategoryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BRG,
    marginRight: 6,
  },
  relatedModalContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  relatedModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  relatedModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    textAlign: 'center',
    flex: 1,
  },
  relatedModalContent: {
    flex: 1,
    padding: 16,
  },
  relatedCarCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  relatedCarInfo: {
    flex: 1,
  },
  relatedCarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  relatedCarOwner: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
});

export default CarDetailScreen;