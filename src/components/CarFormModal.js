import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';
import Button from './Button';
import LoadingIndicator from './LoadingIndicator';
import CarFormStep1 from './CarFormStep1';
import CarFormStep2 from './CarFormStep2';
import CarFormStep3 from './CarFormStep3';
import CarFormStep4 from './CarFormStep4';
import CarFormStep5 from './CarFormStep5';
import { useCreateGarageCarMutation, useUpdateGarageCarMutation } from '../services/apiService';

const CarFormModal = ({ 
  visible, 
  onClose, 
  editMode = false,
  existingCar = null,
  onSuccess
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [carData, setCarData] = useState({
    // Step 1 - Required
    type: 'personal',
    category: 'car',
    private: false,
    title: '',
    year: '',
    make: '',
    model: '',
    
    // Step 2 - Optional
    body: '',
    condition: '',
    trim: '',
    color: '',
    engine: '',
    mileage: '',
    vin: '',
    horsepower: '',
    torque: '',
    
    // Step 3 - Images
    gallery: [],
    
    // Step 4 - Associations (to be implemented)
    // project_id: '',
    // event_id: '',
    
    // Internal tracking
    internal_id: null,
  });

  const [createGarageCar] = useCreateGarageCarMutation();
  const [updateGarageCar] = useUpdateGarageCarMutation();

  const totalSteps = 3; // Start with 3 steps (Required, Optional, Images)

  // Load existing car data when editing
  useEffect(() => {
    if (editMode && existingCar) {
      setCarData(prev => ({
        ...prev,
        ...existingCar,
        gallery: existingCar.gallery || [],
        internal_id: existingCar.internal_id,
      }));
    }
  }, [editMode, existingCar]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setCurrentStep(1);
      if (!editMode) {
        setCarData({
          type: 'personal',
          category: 'car',
          private: false,
          title: '',
          year: '',
          make: '',
          model: '',
          body: '',
          condition: '',
          trim: '',
          color: '',
          engine: '',
          mileage: '',
          vin: '',
          horsepower: '',
          torque: '',
          gallery: [],
          internal_id: null,
        });
      }
    }
  }, [visible, editMode]);

  const updateCarData = (field, value) => {
    setCarData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!carData.title?.trim()) {
          Alert.alert('Error', 'Car title is required');
          return false;
        }
        if (!carData.year?.trim()) {
          Alert.alert('Error', 'Year is required');
          return false;
        }
        if (!carData.make?.trim()) {
          Alert.alert('Error', 'Make is required');
          return false;
        }
        if (!carData.model?.trim()) {
          Alert.alert('Error', 'Model is required');
          return false;
        }
        return true;
      case 2:
        // Optional step - no validation required
        return true;
      case 3:
        // Images step - no validation required
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 1) {
      // After step 1 (required info), create or update the car
      await handleSaveStep();
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - complete the form
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveStep = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add required fields for step 1
      formData.append('type', carData.type);
      formData.append('category', carData.category);
      formData.append('private', carData.private.toString());
      formData.append('title', carData.title);
      formData.append('year', carData.year);
      formData.append('make', carData.make);
      formData.append('model', carData.model);

      // Add optional fields if we're past step 1
      if (currentStep >= 2) {
        if (carData.body) formData.append('body', carData.body);
        if (carData.condition) formData.append('condition', carData.condition);
        if (carData.trim) formData.append('trim', carData.trim);
        if (carData.color) formData.append('color', carData.color);
        if (carData.engine) formData.append('engine', carData.engine);
        if (carData.mileage) formData.append('mileage', carData.mileage);
        if (carData.vin) formData.append('vin', carData.vin);
        if (carData.horsepower) formData.append('horsepower', carData.horsepower);
        if (carData.torque) formData.append('torque', carData.torque);
      }

      // Add images if we're on step 3
      if (currentStep >= 3 && carData.gallery?.length > 0) {
        carData.gallery.forEach((image, index) => {
          if (image.uri) {
            formData.append('gallery', {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `image_${index}.jpg`,
            });
          }
        });
      }

      let result;
      if (editMode && carData.internal_id) {
        formData.append('internal_id', carData.internal_id);
        result = await updateGarageCar(formData).unwrap();
      } else {
        result = await createGarageCar(formData).unwrap();
        // Update internal_id for subsequent steps
        setCarData(prev => ({
          ...prev,
          internal_id: result._id,
        }));
      }

    } catch (error) {
      console.error('Error saving car:', error);
      Alert.alert(
        'Error', 
        error.data?.message || error.message || 'Failed to save car. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    // Save final step and close
    await handleSaveStep();
    if (onSuccess) {
      onSuccess();
    }
    onClose();
    Alert.alert('Success', editMode ? 'Car updated successfully!' : 'Car created successfully!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CarFormStep1
            data={carData}
            onUpdate={updateCarData}
          />
        );
      case 2:
        return (
          <CarFormStep2
            data={carData}
            onUpdate={updateCarData}
          />
        );
      case 3:
        return (
          <CarFormStep3
            data={carData}
            onUpdate={updateCarData}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Required Information';
      case 2:
        return 'Optional Details';
      case 3:
        return 'Photos & Images';
      default:
        return 'Car Details';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {editMode ? 'Edit Car' : 'Add New Car'}
            </Text>
            <Text style={styles.subtitle}>{getStepTitle()}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.stepCounter}>
              {currentStep}/{totalSteps}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(currentStep / totalSteps) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep > 1 && (
            <Button
              variant="secondary"
              onPress={handlePrevious}
              style={styles.footerButton}
              disabled={loading}
            >
              <FAIcon name="chevron-left" size={14} color={colors.TEXT_PRIMARY} />
              <Text style={styles.buttonText}>Previous</Text>
            </Button>
          )}
          
          <View style={styles.footerSpacer} />
          
          <Button
            variant="primary"
            onPress={handleNext}
            style={styles.footerButton}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator size="small" color={colors.WHITE} />
            ) : (
              <>
                <Text style={[styles.buttonText, { color: colors.WHITE }]}>
                  {currentStep === totalSteps ? 'Complete' : 'Next'}
                </Text>
                {currentStep < totalSteps && (
                  <FAIcon name="chevron-right" size={14} color={colors.WHITE} />
                )}
              </>
            )}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  headerRight: {
    paddingHorizontal: 8,
  },
  stepCounter: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.BRG,
  },
  progressContainer: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.LIGHT_GRAY,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.BRG,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  footerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerSpacer: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CarFormModal;