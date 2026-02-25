import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../constants/colors';
import ImageUploader from '../ImageUploader';
import MakeModelPicker from '../forms/MakeModelPicker';
import FAIcon from '../ui/FAIcon';
import {
  useGetUserGarageQuery,
  useGetUserProjectsQuery,
  useGetUserEventsQuery
} from '../../services/apiService';
import { useBanner } from '../../contexts/BannerContext';
import { postTypes, postCategories } from '../../constants/categories';
import TagScreen from '../../screens/TagScreen';

const PostCreationModal = ({ visible, onClose, onSubmit, editMode = false, existingPost = null }) => {
  // Try to use banner context, fallback to Alert if not available
  let showSuccess, showError;
  try {
    const banner = useBanner();
    showSuccess = banner.showSuccess;
    showError = banner.showError;
  } catch (error) {
    // Fallback to Alert if BannerProvider is not available
    showSuccess = (message) => Alert.alert('Success', message);
    showError = (message) => Alert.alert('Error', message);
  }
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'general', // default type
    category: 'show', // default category
    images: [],
    car_id: '',
    project_id: '',
    event_id: '',
    // Custom car info fields (alternative to garage car association)
    year: '',
    make: '',
    model: '',
    trim: '',
    color: '',
    // Listing fields
    price: '',
    condition: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCustomCarInfo, setShowCustomCarInfo] = useState(false);

  // Modal states for association dropdowns
  const [carModalVisible, setCarModalVisible] = useState(false);
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  // Load association data
  const { data: garageData } = useGetUserGarageQuery({ limit: 100 });
  const { data: projectsData } = useGetUserProjectsQuery({ limit: 100 });
  const { data: eventsData } = useGetUserEventsQuery({ limit: 100 });

  // Don't auto-create draft posts - let backend handle draft creation when needed
  // This avoids issues with backend not supporting draft field yet

  // Populate form data when editing
  useEffect(() => {
    if (editMode && existingPost) {
      const hasCustomCarInfo = existingPost.year || existingPost.make || existingPost.model || existingPost.trim || existingPost.color;

      setFormData({
        title: existingPost.title || '',
        body: existingPost.body || '',
        type: existingPost.type || 'general',
        category: existingPost.category || 'show',
        images: existingPost.gallery || [],
        car_id: existingPost.car_id || '',
        project_id: existingPost.project_id || '',
        event_id: existingPost.event_id || '',
        year: existingPost.year || '',
        make: existingPost.make || '',
        model: existingPost.model || '',
        trim: existingPost.trim || '',
        color: existingPost.color || '',
        price: existingPost.price || '',
        condition: existingPost.condition || '',
      });

      // Show custom car info section if post has custom car data
      setShowCustomCarInfo(hasCustomCarInfo);
    } else if (!editMode && !visible) {
      // Reset form when modal closes
      resetForm();
    }
  }, [editMode, existingPost, visible]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (newType) => {
    updateFormData('type', newType);
    // Reset category to first available for new type
    const categoryGroup = postCategories.find(cat => cat.type === newType);
    if (categoryGroup && categoryGroup.items.length > 0) {
      updateFormData('category', categoryGroup.items[0].key);
    }
  };

  const handleImagesChange = (images) => {
    updateFormData('images', images);
  };

  const handleMakeChange = (make) => {
    updateFormData('make', make);
  };

  const handleModelChange = (model) => {
    updateFormData('model', model);
  };

  // Association selection handlers
  const handleCarSelection = (carId) => {
    updateFormData('car_id', carId);
    setCarModalVisible(false);
  };

  const handleProjectSelection = (projectId) => {
    updateFormData('project_id', projectId);
    setProjectModalVisible(false);
  };

  const handleEventSelection = (eventId) => {
    updateFormData('event_id', eventId);
    setEventModalVisible(false);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Title is required');
      return false;
    }
    if (formData.type === 'listing' && !formData.price.trim()) {
      showError('Price is required for listings');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      showSuccess(editMode ? 'Post updated successfully!' : 'Post created successfully!');
      resetForm();
      onClose();
    } catch (error) {
      showError(error.message || `Failed to ${editMode ? 'update' : 'create'} post`);
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
      year: '',
      make: '',
      model: '',
      trim: '',
      color: '',
      price: '',
      condition: '',
    });
    setShowCustomCarInfo(false);
  };

  const handleClose = () => {
    // Just close the modal and reset form
    resetForm();
    onClose();
  };

  const availableCategories = postCategories.find(cat => cat.type === formData.type)?.items || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior='height'
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

          {/* Tag Button - only show in edit mode when we have a post ID */}
          {editMode && existingPost?.internal_id && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.tagButton}
                onPress={() => setTagModalVisible(true)}
              >
                <FAIcon name="tag" size={20} color={colors.BRG} />
                <Text style={styles.tagButtonText}>Tag users & cars</Text>
                <FAIcon name="chevron-right" size={16} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>
          )}

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

          {/* Listing Fields - Show only for listing and want types */}
          {(formData.type === 'listing' || formData.type === 'want') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listing Details</Text>
              
              {/* Price Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price {formData.type === 'listing' ? '*' : ''}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., $500, $50 OBO, Free"
                  value={formData.price}
                  onChangeText={(text) => updateFormData('price', text)}
                />
              </View>

              {/* Condition Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Condition</Text>
                <View style={styles.conditionGrid}>
                  {['New', 'Like New', 'Good', 'Fair', 'Poor', 'For Parts'].map((condition) => (
                    <TouchableOpacity
                      key={condition}
                      style={[
                        styles.conditionButton,
                        formData.condition === condition && styles.conditionButtonActive
                      ]}
                      onPress={() => updateFormData('condition', condition)}
                    >
                      <Text style={[
                        styles.conditionButtonText,
                        formData.condition === condition && styles.conditionButtonTextActive
                      ]}>
                        {condition}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

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
                  onPress={() => setCarModalVisible(true)}
                >
                  <Text style={styles.associationText}>
                    {formData.car_id ?
                      garageData?.entries?.find(car => car.internal_id === formData.car_id)?.title || 'Select a car...' :
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
                  onPress={() => setProjectModalVisible(true)}
                >
                  <Text style={styles.associationText}>
                    {formData.project_id ?
                      projectsData?.entries?.find(project => project.internal_id === formData.project_id)?.title || 'Select a project...' :
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
                  onPress={() => setEventModalVisible(true)}
                >
                  <Text style={styles.associationText}>
                    {formData.event_id ?
                      eventsData?.entries?.find(event => event.internal_id === formData.event_id)?.title || 'Select an event...' :
                      'Select an event...'
                    }
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Custom Car Info Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setShowCustomCarInfo(!showCustomCarInfo)}
            >
              <View style={styles.collapsibleHeaderContent}>
                <Text style={styles.sectionTitle}>Custom Car Info</Text>
                <FAIcon 
                  name={showCustomCarInfo ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={colors.BRG} 
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.helpText}>
              If you want to associate this post with a specific car that's not in your garage, you can set the make/model here instead.
            </Text>

            {showCustomCarInfo && (
              <View style={styles.collapsibleContent}>
                {/* Year Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Year</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 2023"
                    value={formData.year}
                    onChangeText={(text) => updateFormData('year', text)}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>

                {/* Make and Model Picker */}
                <MakeModelPicker
                  initialMake={formData.make}
                  initialModel={formData.model}
                  onMakeChange={handleMakeChange}
                  onModelChange={handleModelChange}
                />

                {/* Trim Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Trim</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Sport, LX, Base"
                    value={formData.trim}
                    onChangeText={(text) => updateFormData('trim', text)}
                    autoCapitalize="words"
                  />
                </View>

                {/* Color Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Red, Blue, White"
                    value={formData.color}
                    onChangeText={(text) => updateFormData('color', text)}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Bottom Spacing for Keyboard */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Car Selection Modal */}
      <Modal
        visible={carModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCarModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setCarModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Car</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Clear Selection Option */}
            <TouchableOpacity
              style={[
                styles.modalItem,
                !formData.car_id && styles.modalItemSelected
              ]}
              onPress={() => handleCarSelection('')}
            >
              <Text style={[
                styles.modalItemText,
                !formData.car_id && styles.modalItemTextSelected
              ]}>
                Clear Selection
              </Text>
              {!formData.car_id && (
                <FAIcon name="check" size={16} color={colors.BRG} />
              )}
            </TouchableOpacity>

            {/* Car Options */}
            {(garageData?.entries || []).map((car) => (
              <TouchableOpacity
                key={car.internal_id}
                style={[
                  styles.modalItem,
                  formData.car_id === car.internal_id && styles.modalItemSelected
                ]}
                onPress={() => handleCarSelection(car.internal_id)}
              >
                <Text style={[
                  styles.modalItemText,
                  formData.car_id === car.internal_id && styles.modalItemTextSelected
                ]}>
                  {car.title}
                </Text>
                {formData.car_id === car.internal_id && (
                  <FAIcon name="check" size={16} color={colors.BRG} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Project Selection Modal */}
      <Modal
        visible={projectModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProjectModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setProjectModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Project</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Clear Selection Option */}
            <TouchableOpacity
              style={[
                styles.modalItem,
                !formData.project_id && styles.modalItemSelected
              ]}
              onPress={() => handleProjectSelection('')}
            >
              <Text style={[
                styles.modalItemText,
                !formData.project_id && styles.modalItemTextSelected
              ]}>
                Clear Selection
              </Text>
              {!formData.project_id && (
                <FAIcon name="check" size={16} color={colors.BRG} />
              )}
            </TouchableOpacity>

            {/* Project Options */}
            {(projectsData?.entries || []).map((project) => (
              <TouchableOpacity
                key={project.internal_id}
                style={[
                  styles.modalItem,
                  formData.project_id === project.internal_id && styles.modalItemSelected
                ]}
                onPress={() => handleProjectSelection(project.internal_id)}
              >
                <Text style={[
                  styles.modalItemText,
                  formData.project_id === project.internal_id && styles.modalItemTextSelected
                ]}>
                  {project.title}
                </Text>
                {formData.project_id === project.internal_id && (
                  <FAIcon name="check" size={16} color={colors.BRG} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Event Selection Modal */}
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setEventModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Event</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Clear Selection Option */}
            <TouchableOpacity
              style={[
                styles.modalItem,
                !formData.event_id && styles.modalItemSelected
              ]}
              onPress={() => handleEventSelection('')}
            >
              <Text style={[
                styles.modalItemText,
                !formData.event_id && styles.modalItemTextSelected
              ]}>
                Clear Selection
              </Text>
              {!formData.event_id && (
                <FAIcon name="check" size={16} color={colors.BRG} />
              )}
            </TouchableOpacity>

            {/* Event Options */}
            {(eventsData?.entries || []).map((event) => (
              <TouchableOpacity
                key={event.internal_id}
                style={[
                  styles.modalItem,
                  formData.event_id === event.internal_id && styles.modalItemSelected
                ]}
                onPress={() => handleEventSelection(event.internal_id)}
              >
                <Text style={[
                  styles.modalItemText,
                  formData.event_id === event.internal_id && styles.modalItemTextSelected
                ]}>
                  {event.title}
                </Text>
                {formData.event_id === event.internal_id && (
                  <FAIcon name="check" size={16} color={colors.BRG} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tag Modal - only in edit mode */}
      {editMode && existingPost?.internal_id && (
        <Modal
          visible={tagModalVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <TagScreen
            postId={existingPost.internal_id}
            onClose={() => setTagModalVisible(false)}
          />
        </Modal>
      )}
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
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    gap: 12,
  },
  tagButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.LIGHT_GRAY,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
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
  // Collapsible section styles
  collapsibleHeader: {
    marginBottom: 8,
  },
  collapsibleHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsibleContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  // Input group styles
  inputGroup: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 50,
  },
  // Condition selection styles
  conditionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  conditionButtonActive: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  conditionButtonText: {
    fontSize: 12,
    color: colors.GRAY,
    fontWeight: '500',
  },
  conditionButtonTextActive: {
    color: colors.WHITE,
  },
  // Modal styles for association dropdowns
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
});

export default PostCreationModal;