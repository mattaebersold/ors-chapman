import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';

const CarFormStep5 = ({ data, onUpdate }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Step 5 - Advanced</Text>
        <Text style={styles.sectionDescription}>
          Additional advanced settings (coming soon)
        </Text>

        {/* Placeholder content - this step is not yet implemented */}
        <View style={styles.placeholderBox}>
          <Text style={styles.placeholderTitle}>Coming Soon</Text>
          <Text style={styles.placeholderText}>
            This step will include advanced car settings and features.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Future Features</Text>
          <Text style={styles.helpText}>
            We're working on additional features for advanced car configuration.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 20,
    lineHeight: 20,
  },
  placeholderBox: {
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpBox: {
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.BRG,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    color: colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
});

export default CarFormStep5;