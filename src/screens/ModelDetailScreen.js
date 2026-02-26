import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import Listing from '../components/Listing';

const ModelDetailScreen = ({ route }) => {
  const { brand, brandName, model, modelName } = route.params;
  const [activeTab, setActiveTab] = useState('posts');

  const tabs = [
    {
      key: 'posts',
      label: 'Posts',
      icon: 'feed',
      config: {
        type: 'posts',
        heading: `${brandName} ${modelName} Posts`,
        postsParams: {
          make: brand.toLowerCase(),
          model: model.toLowerCase()
        }
      }
    },
    {
      key: 'cars',
      label: 'Cars',
      icon: 'car',
      config: {
        type: 'cars',
        apiUrl: `/api/garage?filter=related&make=${brand}&model=${model}`,
        heading: `${brandName} ${modelName} Cars`
      }
    },
    {
      key: 'parts',
      label: 'Parts',
      icon: 'plus',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=listing&make=${brand}&model=${model}`,
        heading: `${brandName} ${modelName} Parts`
      }
    },
    {
      key: 'wanted',
      label: 'Wanted',
      icon: 'search',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=want&make=${brand}&model=${model}`,
        heading: `${brandName} ${modelName} Want-Ads`
      }
    },
    {
      key: 'spotted',
      label: 'Spotted',
      icon: 'users',
      config: {
        type: 'posts',
        apiUrl: `/api/post?type=spot&make=${brand}&model=${model}`,
        heading: `Spotted ${brandName} ${modelName}s`
      }
    }
  ];

  const renderTabContent = () => {
    const tab = tabs.find(t => t.key === activeTab);
    if (tab?.config) {
      return <Listing config={tab.config} showFilters={false} />;
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.breadcrumb}>
          <Text style={styles.brandBreadcrumb}>{brandName}</Text>
          <FAIcon name="chevron-right" size={12} color={colors.TEXT_SECONDARY} />
          <Text style={styles.modelBreadcrumb}>{modelName}</Text>
        </View>
        
        <Text style={styles.title}>{brandName} {modelName}</Text>
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
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  brandBreadcrumb: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  modelBreadcrumb: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
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
});

export default ModelDetailScreen;