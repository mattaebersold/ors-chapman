import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants/colors';

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Description */}
        <View style={styles.section}>
          <Text style={styles.title}>About The Open Road Society</Text>
          <Text style={styles.description}>
            The Open Road Society is an online home for car enthusiasts. We created a digital 
            garage and community based in the northwest that lets you access local groups, 
            meets, and drives.
          </Text>
          <Text style={styles.quote}>
            "If we don't drive together, then we're going to die alone."
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Digital Garage</Text>
            <Text style={styles.featureDescription}>
              Create historical records of your cars, modifications, and maintenance
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Marketplace</Text>
            <Text style={styles.featureDescription}>
              Find rare parts and cars for sale from fellow enthusiasts
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>Community</Text>
            <Text style={styles.featureDescription}>
              Connect with local car groups and attend meetups and drives
            </Text>
          </View>
        </View>

        {/* Founders Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet The Founders</Text>
          
          {/* Matt */}
          <View style={styles.founderCard}>
            <Text style={styles.founderName}>Matt - Founder</Text>
            <Text style={styles.founderBio}>
              "Obsessed ever since being a 6 year old in a theatre watching Back to the Future. 
              Porsche blood in my veins. Style over speed. Pop up headlights forever."
            </Text>
            <Text style={styles.founderCars}>
              Blank Check Cars: Porsche GT1, DeLorean
            </Text>
          </View>

          {/* Jessica */}
          <View style={styles.founderCard}>
            <Text style={styles.founderName}>Jessica - Founder</Text>
            <Text style={styles.founderBio}>
              "I am a girl born to a car dad, and who married a car guy. I've always liked 
              driving things that made me happy, and who wants to drive boring cars?"
            </Text>
            <Text style={styles.founderCars}>
              Blank Check Cars: Land Rover Defender 110 in Alpine White
            </Text>
          </View>
        </View>

        {/* Mission Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            We're building more than just a platform - we're creating a community where 
            car enthusiasts can connect, share their passion, and preserve the culture 
            of automotive enthusiasm for future generations.
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
  section: {
    marginVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
    textAlign: 'left',
  },
  quote: {
    fontSize: 18,
    fontStyle: 'italic',
    color: colors.BRG,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  featureItem: {
    marginBottom: 16,
    paddingLeft: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.TEXT_SECONDARY,
  },
  founderCard: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 12,
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
  founderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
    marginBottom: 8,
  },
  founderBio: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  founderCars: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
});

export default AboutScreen;