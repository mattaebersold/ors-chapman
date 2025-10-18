import React, { useState } from 'react';
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
import { useGetFeaturedListingsQuery, useGetFeaturedWantAdsQuery } from '../services/apiService';
import PostCard from '../components/cards/PostCard';

const MarketplaceScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('listings');

  // Fetch featured listings and want ads
  const { data: featuredListingsData, isLoading: featuredListingsLoading } = useGetFeaturedListingsQuery({ limit: 10 });
  const { data: featuredWantAdsData, isLoading: featuredWantAdsLoading } = useGetFeaturedWantAdsQuery({ limit: 10 });

  const tabs = [
    {
      key: 'listings',
      label: 'For Sale',
      type: 'posts',
      postsParams: { type: 'listing' },
      heading: 'Items for Sale'
    },
    {
      key: 'wants',
      label: 'Want-Ads',
      type: 'posts',
      postsParams: { type: 'want' },
      heading: 'Want-Ads'
    },
  ];

  const getTabConfig = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    return {
      type: tab.type,
      postsParams: tab.postsParams,
      heading: tab.heading,
    };
  };

  const displayOptions = {
    badgeProfile: false,
    badgeCar: false,
  };

  // Render featured listings section
  const renderFeaturedListings = () => {
    if (!featuredListingsData?.entries || featuredListingsData.entries.length === 0) return null;

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
          {featuredListingsData.entries.map((post) => (
            <View key={post._id || post.internal_id} style={styles.featuredPostCard}>
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

  // Render featured want ads section
  const renderFeaturedWantAds = () => {
    if (!featuredWantAdsData?.entries || featuredWantAdsData.entries.length === 0) return null;

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
          {featuredWantAdsData.entries.map((post) => (
            <View key={post._id || post.internal_id} style={styles.featuredPostCard}>
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
    const config = getTabConfig(activeTab);
    const customHeaderSection = activeTab === 'listings' ? renderFeaturedListings : renderFeaturedWantAds;
    const label = activeTab === 'listings' ? 'Marketplace Listings' : 'Marketplace Want-Ads';

    return (
      <Listing
        key={activeTab}
        config={config}
        displayOptions={displayOptions}
        showFilters={true}
        customHeaderSection={customHeaderSection}
        heading={label}
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
    fontSize: 12,
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
  // Featured sections
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
  featuredPostCard: {
    width: 200,
  },
});

export default MarketplaceScreen;