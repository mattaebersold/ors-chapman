import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import { useGetAllBrandsQuery, useGetBrandModelsQuery } from '../../services/apiService';
import FAIcon from '../ui/FAIcon';

const MakeModelPicker = ({ 
  initialMake = '', 
  initialModel = '', 
  onMakeChange,
  onModelChange,
  style 
}) => {
  const [selectedMake, setSelectedMake] = useState(initialMake);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [makeModalVisible, setMakeModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

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
    setMakeModalVisible(true);
  };

  const handleModelSelection = () => {
    if (!selectedMake || modelsLoading) return;
    setModelModalVisible(true);
  };

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    setSelectedModel(''); // Clear model when make changes
    onMakeChange?.(make);
    onModelChange?.(''); // Notify parent that model was cleared
    setMakeModalVisible(false);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    onModelChange?.(model);
    setModelModalVisible(false);
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

      {/* Make Selection Modal */}
      <Modal
        visible={makeModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMakeModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setMakeModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Make</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {brandsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load car makes. Please try again.</Text>
              </View>
            ) : brandsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.BRG} />
                <Text style={styles.loadingText}>Loading makes...</Text>
              </View>
            ) : (
              <>
                {/* Clear Selection Option */}
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    !selectedMake && styles.modalItemSelected
                  ]}
                  onPress={() => handleMakeChange('')}
                >
                  <Text style={[
                    styles.modalItemText,
                    !selectedMake && styles.modalItemTextSelected
                  ]}>
                    Clear Selection
                  </Text>
                  {!selectedMake && (
                    <FAIcon name="check" size={16} color={colors.BRG} />
                  )}
                </TouchableOpacity>

                {/* Make Options */}
                {(brandsData?.brands || []).map((make) => (
                  <TouchableOpacity
                    key={make}
                    style={[
                      styles.modalItem,
                      selectedMake === make && styles.modalItemSelected
                    ]}
                    onPress={() => handleMakeChange(make)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      selectedMake === make && styles.modalItemTextSelected
                    ]}>
                      {make}
                    </Text>
                    {selectedMake === make && (
                      <FAIcon name="check" size={16} color={colors.BRG} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Model Selection Modal */}
      <Modal
        visible={modelModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModelModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setModelModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Model</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {modelsError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load car models. Please try again.</Text>
              </View>
            ) : modelsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.BRG} />
                <Text style={styles.loadingText}>Loading models...</Text>
              </View>
            ) : (modelsData?.models || []).length === 0 ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>No models available for {selectedMake}.</Text>
              </View>
            ) : (
              <>
                {/* Clear Selection Option */}
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    !selectedModel && styles.modalItemSelected
                  ]}
                  onPress={() => handleModelChange('')}
                >
                  <Text style={[
                    styles.modalItemText,
                    !selectedModel && styles.modalItemTextSelected
                  ]}>
                    Clear Selection
                  </Text>
                  {!selectedModel && (
                    <FAIcon name="check" size={16} color={colors.BRG} />
                  )}
                </TouchableOpacity>

                {/* Model Options */}
                {(modelsData?.models || []).map((model) => (
                  <TouchableOpacity
                    key={model}
                    style={[
                      styles.modalItem,
                      selectedModel === model && styles.modalItemSelected
                    ]}
                    onPress={() => handleModelChange(model)}
                  >
                    <Text style={[
                      styles.modalItemText,
                      selectedModel === model && styles.modalItemTextSelected
                    ]}>
                      {model}
                    </Text>
                    {selectedModel === model && (
                      <FAIcon name="check" size={16} color={colors.BRG} />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalHeaderSpacer: {
    width: 36,
  },
  modalContent: {
    flex: 1,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  modalItemSelected: {
    backgroundColor: colors.LIGHT_GRAY,
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  modalItemTextSelected: {
    fontWeight: '600',
    color: colors.BRG,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.ERROR,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 12,
  },
});

export default MakeModelPicker;