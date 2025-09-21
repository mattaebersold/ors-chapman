import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import BaseModal from './BaseModal';
import FormInput from '../forms/FormInput';
import FormTextArea from '../forms/FormTextArea';
import FormOptionButtons from '../forms/FormOptionButtons';
import ImageUploader from '../ImageUploader';
import MakeModelPicker from '../forms/MakeModelPicker';
import FAIcon from '../ui/FAIcon';
import { 
  useGetUserGarageQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation
} from '../../services/apiService';
import { useBannerWithFallback } from '../../hooks/useBannerWithFallback';
import { createFormData } from '../../utils/formUtils';

const ProjectFormModal = ({ visible, onClose, onSubmit, editMode = false, existingProject = null }) => {
  const { showSuccess, showError } = useBannerWithFallback();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'project',
    category: 'modification',
    images: [],
    car_id: '',
    // Custom car info fields
    year: '',
    make: '',
    model: '',
    trim: '',
    color: '',
    // Project specific fields
    status: 'planning', // planning, in-progress, completed
    estimated_cost: '',
    actual_cost: '',
    start_date: '',
    completion_date: '',
  });
  
  const [showCustomCarInfo, setShowCustomCarInfo] = useState(false);

  // Load garage data for car association
  const { data: garageData } = useGetUserGarageQuery({ limit: 100 });

  // Populate form data when editing
  useEffect(() => {
    if (editMode && existingProject) {
      const hasCustomCarInfo = existingProject.year || existingProject.make || existingProject.model || existingProject.trim || existingProject.color;
      
      setFormData({
        title: existingProject.title || '',
        body: existingProject.body || '',
        type: existingProject.type || 'project',
        category: existingProject.category || 'modification',
        images: existingProject.gallery || [],
        car_id: existingProject.car_id || '',
        year: existingProject.year || '',
        make: existingProject.make || '',
        model: existingProject.model || '',
        trim: existingProject.trim || '',
        color: existingProject.color || '',
        status: existingProject.status || 'planning',
        estimated_cost: existingProject.estimated_cost || '',
        actual_cost: existingProject.actual_cost || '',
        start_date: existingProject.start_date || '',
        completion_date: existingProject.completion_date || '',
      });

      setShowCustomCarInfo(hasCustomCarInfo);
    } else if (!editMode) {
      // Reset form when creating new project
      resetForm();
    }
  }, [editMode, existingProject, visible]);

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'project',
      category: 'modification',
      images: [],
      car_id: '',
      year: '',
      make: '',
      model: '',
      trim: '',
      color: '',
      status: 'planning',
      estimated_cost: '',
      actual_cost: '',
      start_date: '',
      completion_date: '',
    });
    setShowCustomCarInfo(false);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return false;
    }
    return true;
  };

  const onFormSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        const apiFormData = createFormData(formData);
        if (editMode && existingProject?.internal_id) {
          apiFormData.append('internal_id', existingProject.internal_id);
          await updateProject(apiFormData).unwrap();
        } else {
          await createProject(apiFormData).unwrap();
        }
        showSuccess(editMode ? 'Project updated successfully!' : 'Project created successfully!');
      }
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
      showError(error.data?.message || error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelection = (carId) => {
    setFormData({ ...formData, car_id: carId });
    // If a garage car is selected, clear custom car info
    if (carId) {
      setFormData(prev => ({
        ...prev,
        car_id: carId,
        year: '',
        make: '',
        model: '',
        trim: '',
        color: '',
      }));
      setShowCustomCarInfo(false);
    }
  };

  const statusOptions = [
    { label: 'Planning', value: 'planning' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'On Hold', value: 'on-hold' },
  ];

  const categoryOptions = [
    { label: 'Modification', value: 'modification' },
    { label: 'Restoration', value: 'restoration' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Upgrade', value: 'upgrade' },
    { label: 'Repair', value: 'repair' },
  ];

  const renderSubmitButton = () => (
    <TouchableOpacity 
      onPress={onFormSubmit}
      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.WHITE} />
      ) : (
        <Text style={styles.submitButtonText}>
          {editMode ? 'Update' : 'Create'}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={editMode ? 'Edit Project' : 'New Project'}
      headerRightButton={renderSubmitButton()}
    >
      <FormInput
        label="Project Title"
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        placeholder="Enter project title"
        required
      />

      <FormTextArea
        label="Description"
        value={formData.body}
        onChangeText={(text) => setFormData({ ...formData, body: text })}
        placeholder="Describe your project..."
        numberOfLines={4}
      />

      <FormOptionButtons
        label="Category"
        options={categoryOptions}
        value={formData.category}
        onValueChange={(value) => setFormData({ ...formData, category: value })}
      />

      <FormOptionButtons
        label="Status"
        options={statusOptions}
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value })}
      />

      <View style={styles.rowInputs}>
        <FormInput
          label="Estimated Cost"
          value={formData.estimated_cost}
          onChangeText={(text) => setFormData({ ...formData, estimated_cost: text })}
          placeholder="$0"
          keyboardType="numeric"
          style={{ flex: 1, marginRight: 8 }}
        />
        <FormInput
          label="Actual Cost"
          value={formData.actual_cost}
          onChangeText={(text) => setFormData({ ...formData, actual_cost: text })}
          placeholder="$0"
          keyboardType="numeric"
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

          {/* Car Association */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Associated Car</Text>
            {garageData?.entries && garageData.entries.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carsScroll}>
                <TouchableOpacity
                  style={[
                    styles.carOption,
                    !formData.car_id && styles.carOptionActive
                  ]}
                  onPress={() => handleCarSelection('')}
                >
                  <Text style={[
                    styles.carOptionText,
                    !formData.car_id && styles.carOptionTextActive
                  ]}>
                    None
                  </Text>
                </TouchableOpacity>
                {garageData.entries.map((car) => (
                  <TouchableOpacity
                    key={car._id}
                    style={[
                      styles.carOption,
                      formData.car_id === car._id && styles.carOptionActive
                    ]}
                    onPress={() => handleCarSelection(car._id)}
                  >
                    <Text style={[
                      styles.carOptionText,
                      formData.car_id === car._id && styles.carOptionTextActive
                    ]}>
                      {`${car.year || ''} ${car.make || ''} ${car.model || ''}`.trim() || car.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noDataText}>No cars in garage</Text>
            )}
            
            <TouchableOpacity
              style={styles.customCarToggle}
              onPress={() => setShowCustomCarInfo(!showCustomCarInfo)}
            >
              <Text style={styles.customCarToggleText}>
                {showCustomCarInfo ? 'Hide' : 'Add'} Custom Car Info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Custom Car Info */}
          {showCustomCarInfo && (
            <MakeModelPicker
              selectedMake={formData.make}
              selectedModel={formData.model}
              selectedYear={formData.year}
              selectedTrim={formData.trim}
              selectedColor={formData.color}
              onMakeChange={(make) => setFormData({ ...formData, make })}
              onModelChange={(model) => setFormData({ ...formData, model })}
              onYearChange={(year) => setFormData({ ...formData, year })}
              onTrimChange={(trim) => setFormData({ ...formData, trim })}
              onColorChange={(color) => setFormData({ ...formData, color })}
            />
          )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Project Photos</Text>
        <ImageUploader
          images={formData.images}
          onImagesChange={(images) => setFormData({ ...formData, images })}
          maxImages={10}
        />
      </View>
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  submitButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  carsScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  carOption: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  carOptionActive: {
    backgroundColor: colors.BRG,
  },
  carOptionText: {
    fontSize: 14,
    color: colors.GRAY,
    fontWeight: '500',
  },
  carOptionTextActive: {
    color: colors.WHITE,
  },
  noDataText: {
    fontSize: 14,
    color: colors.GRAY,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  customCarToggle: {
    alignSelf: 'flex-start',
  },
  customCarToggleText: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '500',
  },
});

export default ProjectFormModal;