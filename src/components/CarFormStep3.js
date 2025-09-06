import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import ImageUploader from './ImageUploader';

const CarFormStep3 = ({ data, onUpdate }) => {
  const handleImagesChange = (images) => {
    onUpdate('gallery', images);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Car Photos</Text>
        <Text style={styles.sectionDescription}>
          Add photos of your car. The first photo will be used as the main image.
        </Text>

        <ImageUploader
          images={data.gallery || []}
          onImagesChange={handleImagesChange}
          maxImages={10}
          title="Upload Car Photos"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>Photo Tips</Text>
          <Text style={styles.helpText}>
            • Take photos in good lighting{'\n'}
            • Include different angles (front, rear, sides, interior){'\n'}
            • The first photo will be your car's main image{'\n'}
            • You can add more photos later by editing your car
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

export default CarFormStep3;