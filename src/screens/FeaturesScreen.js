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

const FeaturesScreen = () => {
  const features = [
    {
      title: 'Digital Garage',
      icon: 'car',
      description: 'Create and manage your garage online, including mods, maintenance, and restorations. Create projects for future work and upgrades.',
      details: [
        'Track your car\'s history and modifications',
        'Document maintenance records',
        'Plan future projects and upgrades',
        'Share your builds with the community'
      ]
    },
    {
      title: 'Car Hubs',
      icon: 'users',
      description: 'Brand and model pages where you can see all content scoped to specific cars. Valuable for recurring updates.',
      details: [
        'Browse content by specific car models',
        'Connect with other owners of the same car',
        'Share model-specific knowledge',
        'Discover common modifications and issues'
      ]
    },
    {
      title: 'Marketplace',
      icon: 'store',
      description: 'Focused place for listing rare parts and cars for sale, plus want-ads for hard-to-find items.',
      details: [
        'Buy and sell rare automotive parts',
        'List vehicles for sale',
        'Post want-ads for hard-to-find items',
        'Connect with trusted sellers in the community'
      ]
    },
    {
      title: 'Society',
      icon: 'users',
      description: 'Showcases events, meetups, drives, car shows focused on the northwest region.',
      details: [
        'Discover local car events and meetups',
        'Organize group drives and shows',
        'Connect with enthusiasts in your area',
        'Share event photos and experiences'
      ]
    }
  ];

  const FeatureCard = ({ feature }) => (
    <View style={styles.featureCard}>
      <View style={styles.featureHeader}>
        <View style={styles.iconContainer}>
          <FAIcon name={feature.icon} size={24} color={colors.WHITE} />
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
      </View>
      
      <Text style={styles.featureDescription}>{feature.description}</Text>
      
      <View style={styles.detailsList}>
        {feature.details.map((detail, index) => (
          <View key={index} style={styles.detailItem}>
            <FAIcon name="chevron-right" size={12} color={colors.BRG} />
            <Text style={styles.detailText}>{detail}</Text>
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
          <Text style={styles.title}>Platform Features</Text>
          <Text style={styles.subtitle}>
            Everything you need to manage your automotive passion and connect with fellow enthusiasts.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>Why Choose Open Road Society?</Text>
          <Text style={styles.infoText}>
            We're not just another social platform. We're built specifically for car enthusiasts, 
            by car enthusiasts. Every feature is designed with automotive culture in mind, 
            from the digital garage concept to our focus on local community building.
          </Text>
          
          <Text style={styles.infoText}>
            Whether you're a weekend warrior, daily driver enthusiast, or hardcore builder, 
            our platform adapts to your level of involvement and helps you connect with 
            like-minded individuals in your area.
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  featuresContainer: {
    marginVertical: 10,
  },
  featureCard: {
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
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
  },
  detailsList: {
    marginLeft: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.TEXT_PRIMARY,
    marginLeft: 12,
    flex: 1,
  },
  additionalInfo: {
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
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
});

export default FeaturesScreen;