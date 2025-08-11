import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';

const ChangelogScreen = () => {
  const [expandedVersions, setExpandedVersions] = useState({});

  const toggleVersion = (version) => {
    setExpandedVersions(prev => ({
      ...prev,
      [version]: !prev[version]
    }));
  };

  const changelogData = [
    {
      version: '1.44',
      date: 'July 14th, 2025',
      features: [
        'Massively upgraded search and search results',
        'Added social media share links site-wide',
        'Deep-linking into posts',
        'Password reset functionality',
        'Performance improvements',
        'Better mobile navigation'
      ]
    },
    {
      version: '1.43',
      date: 'June 20th, 2025',
      features: [
        'Enhanced user profiles with better image handling',
        'Improved marketplace filtering options',
        'Bug fixes for iOS push notifications',
        'Added car hub pages for popular models',
        'Performance optimizations for large garages'
      ]
    },
    {
      version: '1.42',
      date: 'May 15th, 2025',
      features: [
        'New digital garage project tracking',
        'Enhanced photo upload and management',
        'Improved comment threading',
        'Added user following system',
        'Better search functionality',
        'Mobile app performance improvements'
      ]
    },
    {
      version: '1.41',
      date: 'April 8th, 2025',
      features: [
        'Marketplace want-ads feature',
        'Enhanced event discovery',
        'Improved user onboarding flow',
        'Bug fixes for Android notifications',
        'Better error handling throughout the app'
      ]
    },
    {
      version: '1.40',
      date: 'March 22nd, 2025',
      features: [
        'Major UI refresh with improved navigation',
        'Enhanced digital garage features',
        'New community event system',
        'Improved photo gallery management',
        'Better performance on older devices'
      ]
    },
    {
      version: '1.39',
      date: 'February 14th, 2025',
      features: [
        'Valentine\'s Day themed updates',
        'Enhanced user matching for local events',
        'Improved marketplace search',
        'Bug fixes for profile image uploads',
        'Better offline content caching'
      ]
    }
  ];

  const VersionItem = ({ version, date, features, isExpanded, onToggle }) => (
    <View style={styles.versionContainer}>
      <TouchableOpacity style={styles.versionHeader} onPress={onToggle}>
        <View style={styles.versionInfo}>
          <Text style={styles.versionNumber}>v{version}</Text>
          <Text style={styles.versionDate}>{date}</Text>
        </View>
        <FAIcon 
          name={isExpanded ? "chevron-left" : "chevron-right"} 
          size={16} 
          color={colors.TEXT_SECONDARY} 
        />
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <FAIcon name="plus" size={12} color={colors.BRG} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Changelog</Text>
          <Text style={styles.subtitle}>
            Track our progress and see what's new in each release of the Open Road Society platform.
          </Text>
        </View>

        {/* Versions List */}
        <View style={styles.changelogContainer}>
          {changelogData.map((item, index) => (
            <VersionItem
              key={item.version}
              version={item.version}
              date={item.date}
              features={item.features}
              isExpanded={expandedVersions[item.version]}
              onToggle={() => toggleVersion(item.version)}
            />
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>Stay Updated</Text>
          <Text style={styles.footerText}>
            We're constantly improving the Open Road Society platform based on user feedback 
            and our vision for the ultimate car enthusiast community. Check back regularly 
            to see what's new!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  changelogContainer: {
    marginVertical: 10,
  },
  versionContainer: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  versionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  versionInfo: {
    flex: 1,
  },
  versionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 4,
  },
  versionDate: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  featuresContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.LIGHT_GRAY,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingTop: 8,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.TEXT_PRIMARY,
    marginLeft: 12,
    flex: 1,
  },
  footerInfo: {
    marginVertical: 20,
    padding: 20,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.TEXT_PRIMARY,
  },
});

export default ChangelogScreen;