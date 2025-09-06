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
import FormInput from './FormInput';
import FormPicker from './FormPicker';
import FormTextArea from './FormTextArea';
import ImageUploader from './ImageUploader';
import { useCreateModMutation, useUpdateModMutation } from '../services/apiService';

const ModFormModal = ({ 
  visible, 
  onClose, 
  editMode = false,
  existingMod = null,
  carId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [modData, setModData] = useState({
    title: '',
    type: 'engine',
    body: '',
    gallery: [],
  });

  const [createMod] = useCreateModMutation();
  const [updateMod] = useUpdateModMutation();

  const modTypes = [
    { label: 'Engine', value: 'engine' },
    { label: 'Exhaust', value: 'exhaust' },
    { label: 'Intake', value: 'intake' },
    { label: 'Suspension', value: 'suspension' },
    { label: 'Wheels', value: 'wheels' },
    { label: 'Brakes', value: 'brakes' },
    { label: 'Interior', value: 'interior' },
    { label: 'Exterior', value: 'exterior' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'Performance', value: 'performance' },
    { label: 'Cosmetic', value: 'cosmetic' },
    { label: 'Audio', value: 'audio' },
    { label: 'Other', value: 'other' },
  ];

  // Load existing mod data when editing
  useEffect(() => {
    if (editMode && existingMod) {
      setModData({
        title: existingMod.title || '',
        type: existingMod.type || 'engine',
        body: existingMod.body || '',
        gallery: existingMod.gallery || [],
      });
    }
  }, [editMode, existingMod]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      if (!editMode) {
        setModData({
          title: '',
          type: 'engine',
          body: '',
          gallery: [],
        });
      }
    }
  }, [visible, editMode]);

  const updateModData = (field, value) => {
    setModData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!modData.title?.trim()) {
      Alert.alert('Error', 'Mod title is required');
      return;
    }

    if (!carId) {
      Alert.alert('Error', 'Car ID is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('title', modData.title);
      formData.append('type', modData.type);
      formData.append('car_id', carId);
      if (modData.body) formData.append('body', modData.body);

      // Add images
      if (modData.gallery?.length > 0) {
        modData.gallery.forEach((image, index) => {
          if (image.uri) {
            formData.append('gallery', {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `image_${index}.jpg`,
            });
          }
        });
      }

      if (editMode && existingMod?.internal_id) {
        formData.append('internal_id', existingMod.internal_id);
        await updateMod(formData).unwrap();
      } else {
        await createMod(formData).unwrap();
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      Alert.alert('Success', editMode ? 'Mod updated successfully!' : 'Mod created successfully!');
    } catch (error) {
      console.error('Error saving mod:', error);
      Alert.alert(
        'Error', 
        error.data?.message || error.message || 'Failed to save mod. Please try again.'
      );
    } finally {
      setLoading(false);
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
              {editMode ? 'Edit Mod' : 'Add New Mod'}
            </Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <FormInput
              label="Mod Title *"
              value={modData.title}
              onChangeText={(value) => updateModData('title', value)}
              placeholder="Enter a descriptive title for your modification"
              required
            />

            <FormPicker
              label="Mod Type *"
              value={modData.type}
              onValueChange={(value) => updateModData('type', value)}
              items={modTypes}
              placeholder="Select modification type"
              required
            />

            <FormTextArea
              label="Description"
              value={modData.body}
              onChangeText={(value) => updateModData('body', value)}
              placeholder="Describe the modification, installation process, benefits, etc."
              numberOfLines={4}
            />

            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionDescription}>
              Add photos of your modification before, during, or after installation
            </Text>
            
            <ImageUploader
              images={modData.gallery || []}
              onImagesChange={(images) => updateModData('gallery', images)}
              maxImages={10}
              title="Upload Mod Photos"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            variant="secondary"
            onPress={onClose}
            style={styles.footerButton}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </Button>
          
          <View style={styles.footerSpacer} />
          
          <Button
            variant="primary"
            onPress={handleSubmit}
            style={styles.footerButton}
            disabled={loading}
          >
            {loading ? (
              <LoadingIndicator size="small" color={colors.WHITE} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.WHITE }]}>
                {editMode ? 'Update' : 'Create'}
              </Text>
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
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  section: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
    lineHeight: 20,
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

export default ModFormModal;