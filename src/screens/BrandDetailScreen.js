import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetBrandModelsQuery } from '../services/apiService';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import Listing from '../components/Listing';

const BrandDetailScreen = ({ route, navigation }) => {
  const { brand, brandName } = route.params;
  const [activeTab, setActiveTab] = useState('models');

  const { data: modelsData, isLoading, error } = useGetBrandModelsQuery(brand);
  
  const models = modelsData?.models || [];

  const navigateToModel = (model) => {
    navigation.navigate('ModelDetail', {
      brand,
      brandName,
      model: model.model_handle,
      modelName: model.model
    });
  };

  const tabs = [
    {
      key: 'models',
      label: 'Models',
      icon: 'car'
    },
    {
      key: 'posts',
      label: 'Posts',
      icon: 'feed',
      config: {
        type: 'posts',
        heading: `${brandName} Posts`,
        postsParams: {
          make: brand.toLowerCase()
        }
      }
    },
    {
      key: 'cars',
      label: 'Cars',
      icon: 'car',
      config: {
        type: 'cars',
        apiUrl: `/api/garage?make=${brand}`,
        heading: `${brandName} Cars`
      }
    },
    {
      key: 'parts',
      label: 'Parts',
      icon: 'plus',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=listing&make=${brand}`,
        heading: `${brandName} Parts`
      }
    },
    {
      key: 'wanted',
      label: 'Wanted',
      icon: 'search',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=want&make=${brand}`,
        heading: `${brandName} Want-Ads`
      }
    },
    {
      key: 'spots',
      label: 'Spotted',
      icon: 'users',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=spot&make=${brand}`,
        heading: `Spotted ${brandName}s`
      }
    }
  ];

  const renderModelCard = ({ item: model }) => (
    <TouchableOpacity
      style={styles.modelCard}
      onPress={() => navigateToModel(model)}
      activeOpacity={0.7}
    >
      <View style={styles.modelIconContainer}>
        <FAIcon name="car" size={20} color={colors.WHITE} />
      </View>
      
      <View style={styles.modelInfo}>
        <Text style={styles.modelName}>{model.model}</Text>
        <Text style={styles.brandText}>{model.make}</Text>
      </View>
      
      <FAIcon name="chevron-right" size={14} color={colors.TEXT_SECONDARY} />
    </TouchableOpacity>
  );

  const renderModelsGrid = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BRG} />
          <Text style={styles.loadingText}>Loading models...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <FAIcon name="times" size={32} color={colors.ERROR} />
          <Text style={styles.errorTitle}>Error Loading Models</Text>
          <Text style={styles.errorText}>
            Unable to load models for {brandName}.
          </Text>
        </View>
      );
    }

    if (models.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <FAIcon name="car" size={32} color={colors.TEXT_SECONDARY} />
          <Text style={styles.emptyTitle}>No Models Found</Text>
          <Text style={styles.emptyText}>
            No models found for {brandName} yet.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={models}
        renderItem={renderModelCard}
        keyExtractor={(item) => `${item.make_handle}-${item.model_handle}` || item.model}
        contentContainerStyle={styles.modelsContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
      />
    );
  };

  const renderTabContent = () => {
    if (activeTab === 'models') {
      return renderModelsGrid();
    }

    const tab = tabs.find(t => t.key === activeTab);
    if (tab?.config) {
      return <Listing key={activeTab} config={tab.config} showFilters={false} />;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{brandName}</Text>
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
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
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
    marginRight: 6,
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
  tabContent: {
    flex: 1,
  },
  modelsContainer: {
    padding: 16,
  },
  modelCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modelIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 2,
  },
  brandText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ERROR,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default BrandDetailScreen;