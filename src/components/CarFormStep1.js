import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import FormInput from './FormInput';
import FormPicker from './FormPicker';
import FormSwitch from './FormSwitch';

const CarFormStep1 = ({ data, onUpdate }) => {
  const carTypes = [
    { label: 'Personal Car', value: 'personal' },
    { label: 'Project Car', value: 'project' },
    { label: 'Show Car', value: 'show' },
    { label: 'Track Car', value: 'track' },
    { label: 'Daily Driver', value: 'daily' },
    { label: 'Classic/Vintage', value: 'classic' },
  ];

  const carCategories = [
    { label: 'Car', value: 'car' },
    { label: 'Truck', value: 'truck' },
    { label: 'SUV', value: 'suv' },
    { label: 'Motorcycle', value: 'motorcycle' },
    { label: 'Van', value: 'van' },
    { label: 'Convertible', value: 'convertible' },
    { label: 'Coupe', value: 'coupe' },
    { label: 'Sedan', value: 'sedan' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'Wagon', value: 'wagon' },
  ];

  // Generate years from current year back to 1900
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear + 1; year >= 1900; year--) {
    years.push({ label: year.toString(), value: year.toString() });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Text style={styles.sectionDescription}>
          Enter the essential details about your car
        </Text>

        <FormPicker
          label="Car Type *"
          value={data.type}
          onValueChange={(value) => onUpdate('type', value)}
          items={carTypes}
          placeholder="Select car type"
        />

        <FormPicker
          label="Category *"
          value={data.category}
          onValueChange={(value) => onUpdate('category', value)}
          items={carCategories}
          placeholder="Select category"
        />

        <FormSwitch
          label="Mark as Private"
          description="Only you will see this car in your garage"
          value={data.private}
          onValueChange={(value) => onUpdate('private', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        
        <FormInput
          label="Car Title *"
          value={data.title}
          onChangeText={(value) => onUpdate('title', value)}
          placeholder="Enter a descriptive title for your car"
          required
        />

        <FormPicker
          label="Year *"
          value={data.year}
          onValueChange={(value) => onUpdate('year', value)}
          items={years}
          placeholder="Select year"
          required
        />

        <FormInput
          label="Make *"
          value={data.make}
          onChangeText={(value) => onUpdate('make', value)}
          placeholder="e.g., Toyota, Honda, Ford"
          autoCapitalize="words"
          required
        />

        <FormInput
          label="Model *"
          value={data.model}
          onChangeText={(value) => onUpdate('model', value)}
          placeholder="e.g., Camry, Civic, Mustang"
          autoCapitalize="words"
          required
        />
      </View>

      <View style={styles.section}>
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Required Fields</Text>
          <Text style={styles.helpText}>
            Fields marked with * are required to continue. You can add more details in the next steps.
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

export default CarFormStep1;