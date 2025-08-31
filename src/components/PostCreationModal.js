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
import { 
  useGetUserGarageQuery, 
  useGetUserProjectsQuery, 
  useGetUserEventsQuery 
} from '../services/apiService';

const PostCreationModal = ({ visible, onClose, onSubmit, editMode = false, existingPost = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general', // default type
    category: 'show', // default category
    images: [],
    car_id: '',
    project_id: '',
    event_id: '',
  });
  const [loading, setLoading] = useState(false);

  // Load association data
  const { data: garageData } = useGetUserGarageQuery({ limit: 100 });
  const { data: projectsData } = useGetUserProjectsQuery({ limit: 100 });
  const { data: eventsData } = useGetUserEventsQuery({ limit: 100 });

  // Populate form data when editing
  useEffect(() => {
    if (editMode && existingPost) {
      setFormData({
        title: existingPost.title || '',
        body: existingPost.body || '',
        type: existingPost.type || 'general',
        category: existingPost.category || 'show',
        images: existingPost.gallery || [],
        car_id: existingPost.car_id || '',
        project_id: existingPost.project_id || '',
        event_id: existingPost.event_id || '',
      });
    } else if (!editMode) {
      // Reset form when creating new post
      setFormData({
        title: '',
        body: '',
        type: 'general',
        category: 'show',
        images: [],
        car_id: '',
        project_id: '',
        event_id: '',
      });
    }
  }, [editMode, existingPost, visible]);

  const postTypes = [
    { key: 'general', label: 'General' },
    { key: 'record', label: 'Car Record' },
    { key: 'listing', label: 'Listing (for sale)' },
    { key: 'want', label: 'Want-ad' },
    { key: 'spot', label: 'Spotted' },
  ];

  const categoryData = [
    {
      type: "general",
      items: [
        { key: "show", label: "Show" },
        { key: "misc", label: "Misc." },
      ],
    },
    {
      type: "listing",
      items: [
        { key: "new", label: "New Part" },
        { key: "used", label: "Used Part" },
        { key: "car", label: "Car" },
        { key: "accessories", label: "Accessories" },
        { key: "other", label: "Other" },
      ],
    },
    {
      type: "want",
      items: [
        { key: "part", label: "Part" },
        { key: "car", label: "Car" },
        { key: "other", label: "Other" },
      ],
    },
    {
      type: "spot",
      items: [
        { key: "show", label: "Show" },
        { key: "museum", label: "Museum" },
        { key: "wild", label: "In the wild" },
      ],
    },
    {
      type: "record",
      items: [
        { key: "general", label: "General" },
        { key: "mod", label: "Mod" },
        { key: "restoration", label: "Restoration" },
        { key: "maintenance", label: "Maintenance" },
        { key: "detailing", label: "Detailing" },
      ],
    },
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (newType) => {
    updateFormData('type', newType);
    // Reset category to first available for new type
    const categoryGroup = categoryData.find(cat => cat.type === newType);
    if (categoryGroup && categoryGroup.items.length > 0) {
      updateFormData('category', categoryGroup.items[0].key);
    }
  };

  const handleImagesChange = (images) => {
    updateFormData('images', images);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'general',
      category: 'show',
      images: [],
      car_id: '',
      project_id: '',
      event_id: '',
    });
  };

  const handleClose = () => {
    if (formData.title || formData.body || formData.images.length > 0) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to close?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const availableCategories = categoryData.find(cat => cat.type === formData.type)?.items || [];

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
          <Text style={styles.title}>{editMode ? 'Edit Post' : 'New Post'}</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.WHITE} />
            ) : (
              <Text style={styles.submitButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Post Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <View style={styles.typeGrid}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    formData.type === type.key && styles.typeButtonActive
                  ]}
                  onPress={() => handleTypeChange(type.key)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    formData.type === type.key && styles.typeButtonTextActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          {availableCategories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryGrid}>
                {availableCategories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      formData.category === category.key && styles.categoryButtonActive
                    ]}
                    onPress={() => updateFormData('category', category.key)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      formData.category === category.key && styles.categoryButtonTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's this about?"
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              maxLength={200}
            />
          </View>

          {/* Image Uploader */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Photos</Text>
            <ImageUploader
              images={formData.images}
              onImagesChange={handleImagesChange}
              maxImages={10}
            />
          </View>

          {/* Body Input */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.bodyInput}
              placeholder="Tell us more..."
              value={formData.body}
              onChangeText={(text) => updateFormData('body', text)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={5000}
            />
            <Text style={styles.characterCount}>
              {formData.body.length}/5000 characters
            </Text>
          </View>

          {/* Associations Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Associations (Optional)</Text>
            <Text style={styles.helpText}>
              Link this post to items you've created before
            </Text>

            {/* Car Association */}
            {garageData?.entries && garageData.entries.length > 0 && (
              <View style={styles.associationGroup}>
                <Text style={styles.inputLabel}>Associate with Car</Text>
                <TouchableOpacity
                  style={styles.associationSelector}
                  onPress={() => {
                    const options = ['Cancel', 'Clear Selection', ...garageData.entries.map(car => 
                      `${car.title} (${car.year} ${car.make} ${car.model})`
                    )];
                    const cancelButtonIndex = 0;
                    const destructiveButtonIndex = 1;
                    
                    Alert.alert(
                      'Select Car',
                      'Choose a car to associate with this post',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear Selection', onPress: () => updateFormData('car_id', '') },
                        ...garageData.entries.map((car) => ({
                          text: `${car.title} (${car.year} ${car.make} ${car.model})`,
                          onPress: () => updateFormData('car_id', car.internal_id),
                        })),
                      ]
                    );
                  }}
                >
                  <Text style={styles.associationText}>
                    {formData.car_id ? 
                      garageData.entries.find(car => car.internal_id === formData.car_id)?.title || 'Select a car...' :
                      'Select a car...'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Project Association */}
            {projectsData?.entries && projectsData.entries.length > 0 && (
              <View style={styles.associationGroup}>
                <Text style={styles.inputLabel}>Associate with Project</Text>
                <TouchableOpacity
                  style={styles.associationSelector}
                  onPress={() => {
                    Alert.alert(
                      'Select Project',
                      'Choose a project to associate with this post',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear Selection', onPress: () => updateFormData('project_id', '') },
                        ...projectsData.entries.map((project) => ({
                          text: project.title,
                          onPress: () => updateFormData('project_id', project.internal_id),
                        })),
                      ]
                    );
                  }}
                >
                  <Text style={styles.associationText}>
                    {formData.project_id ? 
                      projectsData.entries.find(project => project.internal_id === formData.project_id)?.title || 'Select a project...' :
                      'Select a project...'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Event Association */}
            {eventsData?.entries && eventsData.entries.length > 0 && (
              <View style={styles.associationGroup}>
                <Text style={styles.inputLabel}>Associate with Event</Text>
                <TouchableOpacity
                  style={styles.associationSelector}
                  onPress={() => {
                    Alert.alert(
                      'Select Event',
                      'Choose an event to associate with this post',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear Selection', onPress: () => updateFormData('event_id', '') },
                        ...eventsData.entries.map((event) => ({
                          text: event.title,
                          onPress: () => updateFormData('event_id', event.internal_id),
                        })),
                      ]
                    );
                  }}
                >
                  <Text style={styles.associationText}>
                    {formData.event_id ? 
                      eventsData.entries.find(event => event.internal_id === formData.event_id)?.title || 'Select an event...' :
                      'Select an event...'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Bottom Spacing for Keyboard */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  cancelButton: {
    fontSize: 16,
    color: colors.GRAY,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  submitButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding for keyboard
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: colors.GRAY,
    marginTop: 8,
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.BORDER,
    minWidth: 80,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  typeButtonText: {
    fontSize: 14,
    color: colors.GRAY,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: colors.WHITE,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  categoryButtonActive: {
    backgroundColor: colors.SPEED,
    borderColor: colors.SPEED,
  },
  categoryButtonText: {
    fontSize: 12,
    color: colors.GRAY,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: colors.WHITE,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.BRG,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  bodyInput: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: colors.GRAY,
    textAlign: 'right',
    marginTop: 4,
  },
  associationGroup: {
    marginBottom: 16,
  },
  associationSelector: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    padding: 16,
    minHeight: 50,
    justifyContent: 'center',
  },
  associationText: {
    fontSize: 16,
    color: colors.BLACK,
  },
  bottomSpacer: {
    height: 100, // Extra space for keyboard avoidance
  },
});

export default PostCreationModal;