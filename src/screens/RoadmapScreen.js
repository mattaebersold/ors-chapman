import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';

const RoadmapScreen = () => {
  const roadmapItems = [
    {
      title: 'Notifications',
      version: 'v1.2',
      targetDate: 'May 2025',
      status: 'development', // planning, design, development, testing, launched
      description: 'Site-wide notifications for liked content, comments, and new followers.',
      features: [
        'Real-time push notifications',
        'In-app notification center',
        'Customizable notification preferences',
        'Email digest options'
      ]
    },
    {
      title: 'Groups',
      version: 'v1.3',
      targetDate: 'May 2025',
      status: 'design',
      description: 'Creating and managing groups with admins and members for local car communities.',
      features: [
        'Create and join car groups',
        'Group admin controls',
        'Private group messaging',
        'Event planning within groups',
        'Member management tools'
      ]
    },
    {
      title: 'Advanced Search',
      version: 'v1.4',
      targetDate: 'June 2025',
      status: 'planning',
      description: 'Enhanced search capabilities with filters for cars, parts, and users.',
      features: [
        'Advanced filtering options',
        'Saved search preferences',
        'Location-based search',
        'Price range filters for marketplace'
      ]
    },
    {
      title: 'Mobile App',
      version: 'v2.0',
      targetDate: 'Summer 2025',
      status: 'development',
      description: 'Native mobile applications for iOS and Android platforms.',
      features: [
        'Full feature parity with web',
        'Offline content access',
        'Camera integration for posts',
        'Push notifications',
        'Location services for events'
      ]
    },
    {
      title: 'Followers System',
      version: 'v1.2',
      targetDate: 'LAUNCHED',
      status: 'launched',
      description: 'Following users and seeing relevant content in personalized feeds.',
      features: [
        'Follow/unfollow users',
        'Personalized content feeds',
        'Follower activity notifications',
        'Privacy controls for followers'
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return colors.GRAY;
      case 'design': return colors.YELLOW;
      case 'development': return colors.ORANGE;
      case 'testing': return colors.BLUE;
      case 'launched': return colors.GREEN;
      default: return colors.GRAY;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Planning';
      case 'design': return 'Design';
      case 'development': return 'Development';
      case 'testing': return 'Testing';
      case 'launched': return 'Launched';
      default: return 'Unknown';
    }
  };

  const ProgressBar = ({ status }) => {
    const steps = ['planning', 'design', 'development', 'testing', 'launched'];
    const currentStep = steps.indexOf(status);
    
    return (
      <View style={styles.progressBar}>
        {steps.map((step, index) => (
          <View key={step} style={styles.progressStep}>
            <View 
              style={[
                styles.progressDot,
                { backgroundColor: index <= currentStep ? getStatusColor(status) : colors.LIGHT_GRAY }
              ]}
            />
            <Text style={[
              styles.progressLabel,
              { color: index <= currentStep ? colors.TEXT_PRIMARY : colors.TEXT_SECONDARY }
            ]}>
              {getStatusText(step)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const RoadmapItem = ({ item }) => (
    <View style={styles.roadmapCard}>
      {/* Header */}
      <View style={styles.roadmapHeader}>
        <View style={styles.roadmapTitleContainer}>
          <Text style={styles.roadmapTitle}>{item.title}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>{item.version}</Text>
          </View>
        </View>
        <Text style={styles.targetDate}>{item.targetDate}</Text>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <ProgressBar status={item.status} />

      {/* Description */}
      <Text style={styles.roadmapDescription}>{item.description}</Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Planned Features:</Text>
        {item.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <FAIcon name="chevron-right" size={12} color={colors.BRG} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Development Roadmap</Text>
          <Text style={styles.subtitle}>
            See what's coming next for the Open Road Society platform and track our development progress.
          </Text>
        </View>

        {/* Roadmap Items */}
        <View style={styles.roadmapContainer}>
          {roadmapItems.map((item, index) => (
            <RoadmapItem key={index} item={item} />
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerTitle}>Development Notes</Text>
          <Text style={styles.footerText}>
            Our roadmap is constantly evolving based on user feedback and technical requirements. 
            Dates are estimates and may change as we prioritize the most impactful features 
            for our community.
          </Text>
          <Text style={styles.footerText}>
            Have suggestions for features you'd like to see? Reach out to us through our support page!
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
  roadmapContainer: {
    marginVertical: 10,
  },
  roadmapCard: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roadmapHeader: {
    marginBottom: 16,
  },
  roadmapTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  versionBadge: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.WHITE,
  },
  targetDate: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.WHITE,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  roadmapDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.TEXT_PRIMARY,
    marginLeft: 8,
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
    marginBottom: 12,
  },
});

export default RoadmapScreen;