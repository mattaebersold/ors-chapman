import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import ImageUploader from './ImageUploader';

const CarTaskModal = ({ visible, onClose, onSubmit, carId, editMode = false, existingTask = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'maintenance', // default type for tasks
    category: 'maintenance', // default category for tasks
    images: [],
    car_id: carId || '', // Always set to the current car
  });
  const [loading, setLoading] = useState(false);

  // Task types specific to car tasks
  const taskTypes = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'upgrade', label: 'Upgrade' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'cleaning', label: 'Cleaning' },
    { value: 'modification', label: 'Modification' },
  ];

  // Categories specific to car tasks (similar to posts but focused on car-related tasks)
  const taskCategories = [
    { value: 'engine', label: 'Engine' },
    { value: 'transmission', label: 'Transmission' },
    { value: 'brakes', label: 'Brakes' },
    { value: 'suspension', label: 'Suspension' },
    { value: 'wheels', label: 'Wheels' },
    { value: 'interior', label: 'Interior' },
    { value: 'exterior', label: 'Exterior' },
    { value: 'electrical', label: 'Electrical' },
    { value: 'maintenance', label: 'General Maintenance' },
    { value: 'performance', label: 'Performance' },
    { value: 'restoration', label: 'Restoration' },
    { value: 'other', label: 'Other' },
  ];

  // Populate form data when editing
  useEffect(() => {
    if (editMode && existingTask) {
      setFormData({
        title: existingTask.title || '',
        body: existingTask.body || '',
        type: existingTask.type || 'maintenance',
        category: existingTask.category || 'maintenance',
        images: existingTask.gallery || [],
        car_id: existingTask.car_id || carId || '',
      });
    } else if (!editMode) {
      // Reset form for new task
      setFormData({
        title: '',
        body: '',
        type: 'maintenance',
        category: 'maintenance',
        images: [],
        car_id: carId || '',
      });
    }
  }, [editMode, existingTask, visible, carId]);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title.');
      return;
    }

    if (!formData.car_id) {
      Alert.alert('Error', 'Car ID is required.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Close modal and reset form
      handleClose();
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert('Error', error.message || 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!editMode) {
      setFormData({
        title: '',
        body: '',
        type: 'maintenance',
        category: 'maintenance',
        images: [],
        car_id: carId || '',
      });
    }
    onClose();
  };

  const handleImageUpload = (images) => {
    setFormData(prev => ({
      ...prev,
      images: images
    }));
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editMode ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.WHITE} />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? 'Update' : 'Create'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Enter task title..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.body}
              onChangeText={(text) => updateFormData('body', text)}
              placeholder="Describe the task..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Task Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.optionsContainer}>
                {taskTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionChip,
                      formData.type === type.value && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('type', type.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.type === type.value && styles.selectedOptionText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Category Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.optionsContainer}>
                {taskCategories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.optionChip,
                      formData.category === category.value && styles.selectedChip
                    ]}
                    onPress={() => updateFormData('category', category.value)}
                  >
                    <Text style={[
                      styles.optionText,
                      formData.category === category.value && styles.selectedOptionText
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images (Optional)</Text>
            <ImageUploader
              images={formData.images}
              onImageUpload={handleImageUpload}
              maxImages={5}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_GRAY,
  },
  cancelButton: {
    color: colors.WHITE,
    fontSize: 16,
  },
  title: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.SPEED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.GRAY,
  },
  submitButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.LIGHT_GRAY,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  selectedChip: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  selectedOptionText: {
    color: colors.WHITE,
  },
});

export default CarTaskModal;