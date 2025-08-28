import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useGetBrandModelsQuery } from '../services/apiService';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';
import Listing from '../components/Listing';

const BrandDetailScreen = ({ route, navigation }) => {
  const { brand, brandName } = route.params;
  const [activeTab, setActiveTab] = useState('models');
  
  console.log('BrandDetailScreen - brand:', brand, 'brandName:', brandName);
  
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

  console.log('BrandDetailScreen - tabs with API URLs:', tabs.map(tab => ({
    key: tab.key,
    apiUrl: tab.config?.apiUrl
  })));

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
      <View style={styles.tabBar}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <FAIcon 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.key ? colors.SPEED : colors.WHITE} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.label}
              </Text>
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
  tabBar: {
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_BRG,
  },
  tabScrollContainer: {
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginHorizontal: 4,
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: colors.LIGHT_BRG,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.WHITE,
    marginLeft: 6,
  },
  activeTabText: {
    color: colors.SPEED,
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