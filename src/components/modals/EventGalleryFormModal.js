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
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import Button from '../ui/Button';
import LoadingIndicator from '../ui/LoadingIndicator';
import FormInput from '../forms/FormInput';
import FormTextArea from '../forms/FormTextArea';
import ImageUploader from '../ImageUploader';
import { useCreateEventGalleryMutation, useUpdateEventGalleryMutation } from '../../services/apiService';

const EventGalleryFormModal = ({
  visible,
  onClose,
  editMode = false,
  existingGallery = null,
  eventId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [galleryData, setGalleryData] = useState({
    title: '',
    body: '',
    aws_bucket_id: '',
    gallery: [],
  });

  const [createEventGallery] = useCreateEventGalleryMutation();
  const [updateEventGallery] = useUpdateEventGalleryMutation();

  // Load existing gallery data when editing
  useEffect(() => {
    if (editMode && existingGallery) {
      setGalleryData({
        title: existingGallery.title || '',
        body: existingGallery.body || '',
        aws_bucket_id: existingGallery.aws_bucket_id || '',
        gallery: existingGallery.gallery || [],
      });
    }
  }, [editMode, existingGallery]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      if (!editMode) {
        setGalleryData({
          title: '',
          body: '',
          aws_bucket_id: '',
          gallery: [],
        });
      }
    }
  }, [visible, editMode]);

  const updateGalleryData = (field, value) => {
    setGalleryData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!galleryData.title?.trim()) {
      Alert.alert('Error', 'Gallery title is required');
      return;
    }

    if (!eventId) {
      Alert.alert('Error', 'Event ID is required');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append('title', galleryData.title);
      formData.append('event_id', eventId);
      if (galleryData.body) formData.append('body', galleryData.body);
      if (galleryData.aws_bucket_id) formData.append('aws_bucket_id', galleryData.aws_bucket_id);

      // Add images
      if (galleryData.gallery && galleryData.gallery.length > 0) {
        galleryData.gallery.forEach((image, index) => {
          if (image.uri) {
            formData.append('gallery', {
              uri: image.uri,
              type: image.type || 'image/jpeg',
              name: image.fileName || `image_${index}.jpg`,
            });
          }
        });
      }

      if (editMode && existingGallery?.internal_id) {
        formData.append('internal_id', existingGallery.internal_id);
        await updateEventGallery(formData).unwrap();
      } else {
        await createEventGallery(formData).unwrap();
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
      Alert.alert('Success', editMode ? 'Gallery updated successfully!' : 'Gallery created successfully!');
    } catch (error) {
      console.error('Error saving event gallery:', error);
      Alert.alert(
        'Error',
        error.data?.message || error.message || 'Failed to save gallery. Please try again.'
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
        behavior='height'
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              {editMode ? 'Edit Gallery' : 'Add Event Gallery'}
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
              label="Gallery Title *"
              value={galleryData.title}
              onChangeText={(value) => updateGalleryData('title', value)}
              placeholder="Enter a descriptive title for your gallery"
              required
            />

            <FormTextArea
              label="Description"
              value={galleryData.body}
              onChangeText={(value) => updateGalleryData('body', value)}
              placeholder="Describe this photo gallery, when it was taken, what it shows, etc."
              numberOfLines={3}
            />

            <FormInput
              label="AWS S3 Bucket ID (optional)"
              value={galleryData.aws_bucket_id}
              onChangeText={(value) => updateGalleryData('aws_bucket_id', value)}
              placeholder="e.g., my-event-bucket"
            />

            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionDescription}>
              Add photos to your gallery (optional). The first photo will be used as the gallery thumbnail.
            </Text>

            <ImageUploader
              images={galleryData.gallery || []}
              onImagesChange={(images) => updateGalleryData('gallery', images)}
              maxImages={20}
              title="Upload Gallery Photos"
              required={false}
            />
          </View>

          <View style={styles.helpSection}>
            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>Gallery Tips</Text>
              <Text style={styles.helpText}>
                • Add a clear title that describes what's in the gallery{'\n'}
                • Optionally link to an AWS S3 bucket to display all images{'\n'}
                • The first photo becomes the gallery thumbnail{'\n'}
                • You can upload up to 20 photos per gallery
              </Text>
            </View>
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
            <FAIcon name="times" size={16} color={colors.TEXT_SECONDARY} style={{ marginRight: 6 }} />
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
              <>
                <FAIcon
                  name={editMode ? "save" : "plus"}
                  size={16}
                  color={colors.WHITE}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.buttonText, { color: colors.WHITE }]}>
                  {editMode ? 'Update' : 'Create'}
                </Text>
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
    paddingTop: 20,
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
  helpSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
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
  helpBox: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.BRG,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: colors.TEXT_SECONDARY,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
    paddingBottom: 16,
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

export default EventGalleryFormModal;
