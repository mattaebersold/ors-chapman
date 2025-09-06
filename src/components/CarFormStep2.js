import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import FormInput from './FormInput';
import FormTextArea from './FormTextArea';

const CarFormStep2 = ({ data, onUpdate }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Details</Text>
        <Text style={styles.sectionDescription}>
          Add more information about your car (all fields are optional)
        </Text>

        <FormTextArea
          label="Description"
          value={data.body}
          onChangeText={(value) => onUpdate('body', value)}
          placeholder="Tell us more about your car, its history, modifications, etc."
          numberOfLines={4}
        />

        <FormInput
          label="Condition"
          value={data.condition}
          onChangeText={(value) => onUpdate('condition', value)}
          placeholder="e.g., Excellent, Good, Fair, Needs Work"
          autoCapitalize="words"
        />

        <FormInput
          label="Trim Level"
          value={data.trim}
          onChangeText={(value) => onUpdate('trim', value)}
          placeholder="e.g., LX, EX, Sport, Base"
          autoCapitalize="words"
        />

        <FormInput
          label="Color"
          value={data.color}
          onChangeText={(value) => onUpdate('color', value)}
          placeholder="e.g., Red, Blue, White, Black"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance & Specs</Text>
        
        <FormInput
          label="Engine"
          value={data.engine}
          onChangeText={(value) => onUpdate('engine', value)}
          placeholder="e.g., 2.0L I4, 3.5L V6, 5.0L V8"
        />

        <FormInput
          label="Horsepower"
          value={data.horsepower}
          onChangeText={(value) => onUpdate('horsepower', value)}
          placeholder="e.g., 300"
          keyboardType="numeric"
        />

        <FormInput
          label="Torque"
          value={data.torque}
          onChangeText={(value) => onUpdate('torque', value)}
          placeholder="e.g., 280 lb-ft"
        />

        <FormInput
          label="Mileage"
          value={data.mileage}
          onChangeText={(value) => onUpdate('mileage', value)}
          placeholder="e.g., 45000"
          keyboardType="numeric"
        />

        <FormInput
          label="VIN"
          value={data.vin}
          onChangeText={(value) => onUpdate('vin', value)}
          placeholder="17-character Vehicle Identification Number"
          autoCapitalize="characters"
          maxLength={17}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Optional Information</Text>
          <Text style={styles.helpText}>
            These details help other enthusiasts learn more about your car. You can always come back and add more information later.
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

export default CarFormStep2;