import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';
import { useGetAllBrandsQuery, useGetBrandModelsQuery } from '../services/apiService';
import FAIcon from './FAIcon';

const MakeModelPicker = ({ 
  initialMake = '', 
  initialModel = '', 
  onMakeChange,
  onModelChange,
  style 
}) => {
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedModel, setSelectedModel] = useState(initialModel);

  // Fetch all brands/makes
  const { 
    data: brandsData, 
    isLoading: brandsLoading, 
    error: brandsError 
  } = useGetAllBrandsQuery();

  // Fetch models for selected make
  const { 
    data: modelsData, 
    isLoading: modelsLoading, 
    error: modelsError 
  } = useGetBrandModelsQuery(selectedMake, {
    skip: !selectedMake
  });

  // Update local state when initial values change
  useEffect(() => {
    setSelectedMake(initialMake);
    setSelectedModel(initialModel);
  }, [initialMake, initialModel]);

  const handleMakeSelection = () => {
    if (brandsLoading) return;
    
    if (brandsError) {
      Alert.alert('Error', 'Failed to load car makes. Please try again.');
      return;
    }

    const makes = brandsData?.brands || [];
    
    if (makes.length === 0) {
      Alert.alert('No Data', 'No car makes available at the moment.');
      return;
    }

    const options = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear Selection', onPress: () => handleMakeChange('') },
      ...makes.map((make) => ({
        text: make,
        onPress: () => handleMakeChange(make),
      })),
    ];

    Alert.alert('Select Make', 'Choose a car make', options);
  };

  const handleModelSelection = () => {
    if (!selectedMake) {
      Alert.alert('Select Make First', 'Please select a car make before choosing a model.');
      return;
    }

    if (modelsLoading) return;
    
    if (modelsError) {
      Alert.alert('Error', 'Failed to load car models. Please try again.');
      return;
    }

    const models = modelsData?.models || [];
    
    if (models.length === 0) {
      Alert.alert('No Models', `No models available for ${selectedMake}.`);
      return;
    }

    const options = [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear Selection', onPress: () => handleModelChange('') },
      ...models.map((model) => ({
        text: model,
        onPress: () => handleModelChange(model),
      })),
    ];

    Alert.alert('Select Model', 'Choose a car model', options);
  };

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    setSelectedModel(''); // Clear model when make changes
    onMakeChange?.(make);
    onModelChange?.(''); // Notify parent that model was cleared
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    onModelChange?.(model);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Make Picker */}
      <View style={styles.pickerGroup}>
        <Text style={styles.label}>Make</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            brandsLoading && styles.pickerButtonDisabled
          ]}
          onPress={handleMakeSelection}
          disabled={brandsLoading}
        >
          <View style={styles.pickerContent}>
            <Text style={[
              styles.pickerText,
              !selectedMake && styles.placeholderText
            ]}>
              {selectedMake || 'Select car make'}
            </Text>
            {brandsLoading ? (
              <ActivityIndicator size="small" color={colors.BRG} />
            ) : (
              <FAIcon name="chevron-down" size={14} color={colors.TEXT_SECONDARY} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Model Picker */}
      <View style={styles.pickerGroup}>
        <Text style={styles.label}>Model</Text>
        <TouchableOpacity
          style={[
            styles.pickerButton,
            (!selectedMake || modelsLoading) && styles.pickerButtonDisabled
          ]}
          onPress={handleModelSelection}
          disabled={!selectedMake || modelsLoading}
        >
          <View style={styles.pickerContent}>
            <Text style={[
              styles.pickerText,
              !selectedModel && styles.placeholderText
            ]}>
              {selectedModel || (selectedMake ? 'Select car model' : 'Select make first')}
            </Text>
            {modelsLoading ? (
              <ActivityIndicator size="small" color={colors.BRG} />
            ) : (
              <FAIcon 
                name="chevron-down" 
                size={14} 
                color={selectedMake ? colors.TEXT_SECONDARY : colors.LIGHT_GRAY} 
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Help Text */}
      <Text style={styles.helpText}>
        Optional: Select a make and model if this post is about a specific car but not one in your garage.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  pickerGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    padding: 16,
    minHeight: 50,
  },
  pickerButtonDisabled: {
    opacity: 0.6,
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  placeholderText: {
    color: colors.TEXT_SECONDARY,
  },
  helpText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 8,
    lineHeight: 16,
  },
});

export default MakeModelPicker;